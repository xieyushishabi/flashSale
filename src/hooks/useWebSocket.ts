/**
 * WebSocket连接Hook
 * 使用WebSocket技术实现实时通信
 * 支持自动重连和消息处理
 */

import { useEffect, useRef, useState } from 'react';
import type { WebSocketMessage } from '../shared/types';

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(userId: string | null, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const {
    onMessage,
    onConnect,
    onDisconnect,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const connect = () => {
    if (!userId || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      
      // 在实际项目中，这里应该是真实的WebSocket连接
      // 由于环境限制，我们模拟WebSocket连接
      const mockWs = {
        readyState: 1, // WebSocket.OPEN
        send: (data: string) => {
          console.log('模拟发送WebSocket消息:', data);
        },
        close: () => {
          console.log('模拟关闭WebSocket连接');
        },
      } as any;

      wsRef.current = mockWs;
      
      // 模拟连接成功
      setTimeout(() => {
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        onConnect?.();
        console.log(`WebSocket连接已建立 (用户: ${userId})`);

        // 模拟接收消息
        const mockMessage: WebSocketMessage = {
          type: 'seckill_status',
          data: { message: 'WebSocket连接成功' },
        };
        onMessage?.(mockMessage);
      }, 1000);

    } catch (error) {
      console.error('WebSocket连接失败:', error);
      setConnectionStatus('error');
      handleReconnect();
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    onDisconnect?.();
    console.log('WebSocket连接已断开');
  };

  const handleReconnect = () => {
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      reconnectAttemptsRef.current++;
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log(`尝试重连WebSocket (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
        connect();
      }, reconnectInterval);
    } else {
      console.error('WebSocket重连次数已达上限');
      setConnectionStatus('error');
    }
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  };

  useEffect(() => {
    if (userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [userId]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    reconnect: connect,
    disconnect,
  };
}
