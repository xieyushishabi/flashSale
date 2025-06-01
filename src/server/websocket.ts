/**
 * WebSocket实时通信服务 (using 'ws' library)
 * 提供库存更新、订单状态等实时推送功能
 */

import { WebSocketServer, WebSocket, type RawData } from 'ws'; // Added RawData import
import type { IncomingMessage } from 'http';
import type { Duplex } from 'stream';
import type { WebSocketMessage } from '../shared/types';

class WebSocketServiceClass {
  private connections: Map<string, WebSocket> = new Map();
  private wss: WebSocketServer;

  constructor() {
    this.wss = new WebSocketServer({ noServer: true });
    console.log('[WebSocketService] Initialized (using ws library). Ready for server upgrade handling.');
  }

  public handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer) {
    const requestUrl = request.url ? new URL(request.url, `http://${request.headers.host}`) : null;
    const pathname = requestUrl?.pathname;

    if (pathname === '/ws') {
      this.wss.handleUpgrade(request, socket, head, (wsClient, req) => {
        const userId = new URLSearchParams(req.url?.split('?')[1] || '').get('userId');

        if (!userId) {
          console.error('[WebSocketService] Upgrade failed: userId missing in query parameters.');
          wsClient.close(1008, 'User ID required'); // 1008: Policy Violation
          return;
        }

        this.connections.set(userId, wsClient);
        console.log(`[WebSocketService] Connection established for user: ${userId}`);

        wsClient.on('message', (rawMessage) => {
          this.handleIncomingMessage(wsClient, userId, rawMessage);
        });

        wsClient.on('close', () => {
          this.connections.delete(userId);
          console.log(`[WebSocketService] Connection closed for user: ${userId}`);
        });

        wsClient.on('error', (error) => {
          console.error(`[WebSocketService] Error for user ${userId}:`, error);
          this.connections.delete(userId); // Ensure cleanup on error
        });

        wsClient.send(JSON.stringify({ type: 'connection_ack', message: `Welcome ${userId}`, userId }));
      });
    } else {
      // This should ideally be caught by the server in index.ts before calling this method.
      // As a fallback, destroy the socket if the path is not '/ws'.
      console.warn(`[WebSocketService] handleUpgrade called for non-/ws path: ${pathname}. Destroying socket.`);
      socket.destroy();
    }
  }

  sendStockUpdate(productId: string, stockLeft: number) {
    const message: WebSocketMessage = {
      type: 'stock_update',
      productId,
      data: { stockLeft }
    };
    this.broadcast(message);
  }

  sendOrderStatus(userId: string, orderId: string, status: string) {
    const message: WebSocketMessage = {
      type: 'order_status',
      data: { orderId, status }
    };
    this.sendToUser(userId, message);
  }

  sendSeckillStatus(productId: string, status: string) {
    const message: WebSocketMessage = {
      type: 'seckill_status',
      productId,
      data: { status }
    };
    this.broadcast(message);
  }

  private sendToUser(userId: string, message: WebSocketMessage) {
    const ws = this.connections.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private broadcast(message: WebSocketMessage) {
    this.connections.forEach((ws, _userId) => { // userId in map key, not needed here
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  getStats() {
    return {
      activeConnections: this.connections.size
    };
  }

  public handleIncomingMessage(wsClient: WebSocket, userId: string, rawMessage: RawData) {
    try {
      const messageData = rawMessage.toString();
      const message = JSON.parse(messageData) as WebSocketMessage;
      console.log(`[WebSocketService] Received message from user ${userId}:`, message);

      switch (message.type) {
        case 'seckill_status':
          console.log(`[WebSocketService] Received seckill_status from ${userId}:`, message.data);
          // Further processing for 'seckill_status' can be added here if client sends it
          break;
        // Handle other incoming message types if necessary
        default:
          console.log(`[WebSocketService] Unknown message type from ${userId}: ${message.type}`);
      }
    } catch (error) {
      console.error(`[WebSocketService] Error processing message from user ${userId} (data: ${rawMessage.toString()}):`, error);
      wsClient.send(JSON.stringify({ type: 'error', message: 'Invalid message format or processing error' }));
    }
  }
}

export const WebSocketService = new WebSocketServiceClass();