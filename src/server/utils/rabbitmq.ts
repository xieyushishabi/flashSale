import { connect as amqplibConnect, Channel, ChannelModel, Connection, ConsumeMessage, Options } from 'amqplib';
import logger from './logger';
import config from '../config';

// Define MessageHandler type for consumers
type MessageHandler = (msg: ConsumeMessage | null, channel: Channel) => void | Promise<void>;

class RabbitMQService {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private connectionString: string;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 5;
  private readonly reconnectDelay: number = 5000; // 5 seconds

  constructor() {
    this.connectionString = config.RABBITMQ_URL || 'amqp://localhost:5672';
    // Initialize connection when the service is instantiated
    // this.connect(); // Let's connect explicitly or on first use
  }

  public async connect(): Promise<void> {
    if (this.isConnected() || this.isConnecting) {
      logger.info('[RabbitMQ] Already connected or connecting.');
      return;
    }

    this.isConnecting = true;
    logger.info(`[RabbitMQ] Connecting to ${this.connectionString}...`);

    try {
      this.connection = await amqplibConnect(this.connectionString) as unknown as ChannelModel;
      logger.info('[RabbitMQ] Successfully connected.');

      this.connection.on('error', (err) => {
        logger.error('[RabbitMQ] Connection error:', err.message);
        this.handleReconnect();
      });

      this.connection.on('close', () => {
        logger.info('[RabbitMQ] Connection closed.');
        if (!this.isConnecting) { // Avoid reconnect if close was intentional or during initial connect fail
            this.handleReconnect();
        }
      });

      this.channel = await this.connection.createChannel();
      logger.info('[RabbitMQ] Channel created.');
      this.reconnectAttempts = 0; // Reset attempts on successful connection
      this.isConnecting = false;
    } catch (error) {
      logger.error('[RabbitMQ] Failed to connect:', error);
      this.isConnecting = false;
      this.handleReconnect();
      // Rethrow to allow caller to handle initial connection failure if necessary
      throw error;
    }
  }

  private async handleReconnect(): Promise<void> {
    if (this.isConnecting) return; // Already trying to reconnect or connect

    if (this.channel) {
        try { await this.channel.close(); } catch (e) { /* ignore */ }
        this.channel = null;
    }
    if (this.connection) {
        try { await this.connection.close(); } catch (e) { /* ignore */ }
        this.connection = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      logger.info(`[RabbitMQ] Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay / 1000}s...`);
      setTimeout(() => this.connect().catch(err => logger.error('[RabbitMQ] Reconnect attempt failed:', err)), this.reconnectDelay);
    } else {
      logger.error('[RabbitMQ] Max reconnect attempts reached. Giving up.');
    }
  }

  public isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected()) {
      logger.info('[RabbitMQ] Not connected. Attempting to connect...');
      await this.connect();
    }
  }

  public async assertQueue(queueName: string, options?: Options.AssertQueue): Promise<void> {
    await this.ensureConnected();
    if (this.channel) {
      await this.channel.assertQueue(queueName, { durable: true, ...options });
      logger.info(`[RabbitMQ] Queue asserted: ${queueName}`);
    } else {
      throw new Error('[RabbitMQ] Channel not available to assert queue.');
    }
  }

  public async publishMessage(queueName: string, message: any, options?: Options.Publish): Promise<boolean> {
    await this.ensureConnected();
    if (this.channel) {
      const messageString = JSON.stringify(message);
      const success = this.channel.sendToQueue(queueName, Buffer.from(messageString), { persistent: true, ...options });
      if (success) {
        logger.info(`[RabbitMQ] Message published to queue ${queueName}: ${messageString.substring(0,100)}...`);
      } else {
        logger.warn(`[RabbitMQ] Failed to publish message to queue ${queueName} (buffer full).`);
        // Implement retry or dead-lettering if necessary
      }
      return success;
    } else {
      logger.error('[RabbitMQ] Channel not available to publish message.');
      return false;
    }
  }

  public async consumeMessage(queueName: string, handler: MessageHandler, options?: Options.Consume): Promise<string | null> {
    await this.ensureConnected();
    if (this.channel) {
      logger.info(`[RabbitMQ] Attempting to consume from queue: ${queueName}`);
      const { consumerTag } = await this.channel.consume(queueName, (msg) => {
        if (msg) {
          try {
            // Pass the channel for manual ack/nack if needed by the handler
            handler(msg, this.channel!); 
          } catch (error) {
            logger.error(`[RabbitMQ] Error in message handler for queue ${queueName}:`, error);
            // Consider nack-ing the message if an error occurs in the handler
            // this.channel?.nack(msg, false, false); // Example: nack without requeue
          }
        } else {
            logger.warn(`[RabbitMQ] Received null message from queue ${queueName}`);
            handler(null, this.channel!); // Allow handler to be notified of null message (e.g. queue deleted)
        }
      }, { noAck: false, ...options }); // Default to manual acknowledgment (noAck: false)
      logger.info(`[RabbitMQ] Consumer registered for queue ${queueName} with tag ${consumerTag}`);
      return consumerTag;
    } else {
      logger.error('[RabbitMQ] Channel not available to consume messages.');
      return null;
    }
  }

  public ackMessage(message: ConsumeMessage): void {
    if (this.channel) {
        try {
            this.channel.ack(message);
            logger.debug(`[RabbitMQ] Message acknowledged: ${message.fields.deliveryTag}`);
        } catch (error) {
            logger.error(`[RabbitMQ] Failed to acknowledge message ${message.fields.deliveryTag}:`, error);
        }
    } else {
        logger.warn('[RabbitMQ] Cannot ack message, channel not available.');
    }
  }

  public nackMessage(message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean): void {
    if (this.channel) {
        try {
            this.channel.nack(message, allUpTo, requeue);
            logger.debug(`[RabbitMQ] Message nacked: ${message.fields.deliveryTag}, requeue: ${requeue}`);
        } catch (error) {
            logger.error(`[RabbitMQ] Failed to nack message ${message.fields.deliveryTag}:`, error);
        }
    } else {
        logger.warn('[RabbitMQ] Cannot nack message, channel not available.');
    }
  }

  public async close(): Promise<void> {
    this.isConnecting = false; // Prevent reconnect attempts during explicit close
    if (this.channel) {
      try {
        await this.channel.close();
        logger.info('[RabbitMQ] Channel closed.');
      } catch (error) {
        logger.error('[RabbitMQ] Error closing channel:', error);
      }
      this.channel = null;
    }
    if (this.connection) {
      try {
        await this.connection.close();
        logger.info('[RabbitMQ] Connection closed.');
      } catch (error) {
        logger.error('[RabbitMQ] Error closing connection:', error);
      }
      this.connection = null;
    }
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent further reconnects after explicit close
  }
}

// Export a single instance of the service
export const rabbitMQService = new RabbitMQService();
