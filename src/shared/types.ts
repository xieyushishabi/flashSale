/**
 * 系统共享类型定义
 * 定义前端和后端通用的数据类型，确保类型一致性
 */

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  originalPrice: number;
  seckillPrice: number;
  stock: number;
  image: string;
  startTime: Date;
  endTime: Date;
  status: 'pending' | 'active' | 'ended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SeckillLog {
  _id: string;
  userId: string;
  productId: string;
  action: string;
  result: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// 新增：商品搜索响应类型
export interface ProductsResponse {
  products: (Product & { currentStock: number })[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface SeckillStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  successfulOrders: number;
  hourlyStats: Array<{
    hour: string;
    orders: number;
    revenue: number;
  }>;
}

export interface WebSocketMessage {
  type: 'stock_update' | 'seckill_status' | 'order_status';
  productId?: string;
  data: any;
}