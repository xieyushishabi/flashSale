/**
 * Elasticsearch搜索引擎工具类
 * 使用Elasticsearch技术实现高性能商品搜索
 * 支持全文搜索、过滤、排序和分页功能
 */

import { Product } from '../../shared/types';

// 模拟Elasticsearch客户端 - 在实际环境中应使用真实Elasticsearch
class MockElasticsearch {
  private products: Product[] = [];

  async indexProduct(product: Product): Promise<void> {
    const existingIndex = this.products.findIndex(p => p._id === product._id);
    if (existingIndex >= 0) {
      this.products[existingIndex] = product;
    } else {
      this.products.push(product);
    }
    console.log(`索引商品到Elasticsearch: ${product.name}`);
  }

  async search(query: {
    text?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    offset?: number;
    limit?: number;
  }): Promise<{ hits: Product[]; total: number }> {
    let results = [...this.products];

    // 文本搜索
    if (query.text) {
      const searchText = query.text.toLowerCase();
      results = results.filter(product => 
        product.name.toLowerCase().includes(searchText) ||
        product.description.toLowerCase().includes(searchText)
      );
    }

    // 状态过滤
    if (query.status) {
      results = results.filter(product => product.status === query.status);
    }

    // 价格范围过滤
    if (query.minPrice !== undefined) {
      results = results.filter(product => product.seckillPrice >= query.minPrice!);
    }
    if (query.maxPrice !== undefined) {
      results = results.filter(product => product.seckillPrice <= query.maxPrice!);
    }

    // 排序（按秒杀价格升序）
    results.sort((a, b) => a.seckillPrice - b.seckillPrice);

    const total = results.length;
    const offset = query.offset || 0;
    const limit = query.limit || 10;
    const hits = results.slice(offset, offset + limit);

    console.log(`Elasticsearch搜索返回 ${hits.length}/${total} 个结果`);
    return { hits, total };
  }

  async deleteProduct(productId: string): Promise<void> {
    this.products = this.products.filter(p => p._id !== productId);
    console.log(`从Elasticsearch删除商品: ${productId}`);
  }
}

export const elasticsearch = new MockElasticsearch();

export class ProductSearchService {
  static async indexProduct(product: Product): Promise<void> {
    await elasticsearch.indexProduct(product);
  }

  static async searchProducts(query: {
    text?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    pageSize?: number;
  }): Promise<{ products: Product[]; total: number; page: number; pageSize: number }> {
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const offset = (page - 1) * pageSize;

    const result = await elasticsearch.search({
      ...query,
      offset,
      limit: pageSize,
    });

    return {
      products: result.hits,
      total: result.total,
      page,
      pageSize,
    };
  }

  static async deleteProduct(productId: string): Promise<void> {
    await elasticsearch.deleteProduct(productId);
  }
}
