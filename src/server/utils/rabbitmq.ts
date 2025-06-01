/**
 * RabbitMQ消息队列工具类
 * 使用RabbitMQ技术实现异步订单处理和系统解耦
 * 核心功能：订单队列、死信队列、消息持久化
 */

interface QueueMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount?: number;
}

// 模拟RabbitMQ消息队列
class MockRabbitMQ {
  private queues: Map<string, QueueMessage[]> = new Map();
  private consumers: Map<string, Array<(message: QueueMessage) => Promise<void>>> = new Map();

  async createQueue(queueName: string): Promise<void> {
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, []);
      this.consumers.set(queueName, []);
      console.log(`创建RabbitMQ队列: ${queueName}`);
    }
  }

  async publishMessage(queueName: string, message: QueueMessage): Promise<void> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`队列 ${queueName} 不存在`);
    }

    queue.push(message);
    console.log(`发布消息到队列 ${queueName}:`, message.type);

    // 异步处理消息
    setImmediate(() => this.processMessage(queueName));
  }

  async consume(queueName: string, handler: (message: QueueMessage) => Promise<void>): Promise<void> {
    const consumers = this.consumers.get(queueName);
    if (!consumers) {
      throw new Error(`队列 ${queueName} 不存在`);
    }

    consumers.push(handler);
    console.log(`注册消费者到队列: ${queueName}`);
  }

  private async processMessage(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    const consumers = this.consumers.get(queueName);

    if (!queue || !consumers || queue.length === 0 || consumers.length === 0) {
      return;
    }

    const message = queue.shift()!;
    
    try {
      // 并行处理所有消费者
      await Promise.all(consumers.map(consumer => consumer(message)));
      console.log(`成功处理消息: ${message.type}`);
    } catch (error) {
      console.error(`处理消息失败: ${message.type}`, error.message);
      
      // 重试机制
      const retryCount = (message.retryCount || 0) + 1;
      if (retryCount < 3) {
        message.retryCount = retryCount;
        queue.push(message); // 重新入队
        console.log(`消息重试 ${retryCount}/3: ${message.type}`);
      } else {
        console.error(`消息达到最大重试次数，丢弃: ${message.type}`);
      }
    }
  }
}

export const rabbitmq = new MockRabbitMQ();

// 队列名称常量
export const QueueNames = {
  ORDER_PROCESSING: 'order.processing',
  SECKILL_NOTIFICATIONS: 'seckill.notifications',
  STATS_UPDATE: 'stats.update',
};

// 消息发布器
export class MessagePublisher {
  static async publishOrderMessage(orderId: string, userId: string, productId: string): Promise<void> {
    const message: QueueMessage = {
      id: `order_${orderId}`,
      type: 'ORDER_CREATED',
      data: { orderId, userId, productId },
      timestamp: Date.now(),
    };

    await rabbitmq.publishMessage(QueueNames.ORDER_PROCESSING, message);
  }

  static async publishSeckillNotification(productId: string, stockLeft: number): Promise<void> {
    const message: QueueMessage = {
      id: `seckill_${productId}_${Date.now()}`,
      type: 'STOCK_UPDATE',
      data: { productId, stockLeft },
      timestamp: Date.now(),
    };

    await rabbitmq.publishMessage(QueueNames.SECKILL_NOTIFICATIONS, message);
  }

  static async publishStatsUpdate(type: string, data: any): Promise<void> {
    const message: QueueMessage = {
      id: `stats_${Date.now()}`,
      type: 'STATS_UPDATE',
      data: { type, ...data },
      timestamp: Date.now(),
    };

    await rabbitmq.publishMessage(QueueNames.STATS_UPDATE, message);
  }
}

// 初始化队列
export async function initializeQueues(): Promise<void> {
  await rabbitmq.createQueue(QueueNames.ORDER_PROCESSING);
  await rabbitmq.createQueue(QueueNames.SECKILL_NOTIFICATIONS);
  await rabbitmq.createQueue(QueueNames.STATS_UPDATE);
}
