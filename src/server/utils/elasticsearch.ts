import { Client } from '@elastic/elasticsearch';
import { Product } from '../../shared/types';
import logger from './logger'; // 假设您有logger工具

// 1. 创建 Elasticsearch 客户端实例
// 默认连接到 http://localhost:9200
// TODO: 考虑将节点地址配置化，例如通过环境变量
const client = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

const INDEX_NAME = 'products'; // 定义索引名称

// 辅助函数：检查索引是否存在，如果不存在则创建
async function ensureIndexExists() {
  const indexExists = await client.indices.exists({ index: INDEX_NAME });
  if (!indexExists) {
    try {
      await client.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              name: { type: 'text', analyzer: 'standard' }, // 'standard' or a custom Chinese analyzer
              description: { type: 'text', analyzer: 'standard' },
              status: { type: 'keyword' },
              seckillPrice: { type: 'double' },
              // 根据Product类型添加其他需要索引的字段
            },
          },
        },
      });
      logger.info(`[Elasticsearch] Index '${INDEX_NAME}' created.`);
    } catch (error) {
      logger.error('[Elasticsearch] Error creating index:', error);
      // 如果索引创建失败，后续操作可能会失败，这里可以抛出错误或进行其他处理
      throw error; 
    }
  }
}

// 调用一次以确保索引存在 (或者在服务启动时调用)
ensureIndexExists().catch(error => {
  logger.error('[Elasticsearch] Failed to ensure index exists on startup:', error);
  // 根据需要处理启动时索引检查失败的情况，例如退出应用或标记服务不可用
});


export class ProductSearchService {
  static async indexProduct(product: Product): Promise<void> {
    try {
      await client.index({
        index: INDEX_NAME,
        id: product._id, // 使用商品ID作为ES文档ID
        document: {
          name: product.name,
          description: product.description,
          seckillPrice: product.seckillPrice,
          status: product.status,
          // 根据Product类型映射其他字段
          // 例如: category: product.category, tags: product.tags, imageUrl: product.imageUrl
        },
      });
      logger.info(`[Elasticsearch] Indexed product: ${product.name} (ID: ${product._id})`);
    } catch (error) {
      logger.error(`[Elasticsearch] Error indexing product ${product._id}:`, error);
      throw error; // 重新抛出错误，让调用者处理
    }
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

    const esQueryBody: any = {
      from: offset,
      size: pageSize,
      query: {
        bool: {
          must: [],
          filter: [],
        },
      },
      sort: [ // 默认按秒杀价格升序排序
        { seckillPrice: { order: 'asc' } }
      ]
    };

    if (query.text) {
      esQueryBody.query.bool.must.push({
        multi_match: { // 在名称和描述中搜索
          query: query.text,
          fields: ['name', 'description'],
          fuzziness: "AUTO" // 允许一定的模糊匹配
        },
      });
    }

    if (query.status) {
      esQueryBody.query.bool.filter.push({
        term: { status: query.status },
      });
    }

    const priceRangeFilter: any = {};
    if (query.minPrice !== undefined) {
      priceRangeFilter.gte = query.minPrice;
    }
    if (query.maxPrice !== undefined) {
      priceRangeFilter.lte = query.maxPrice;
    }
    if (Object.keys(priceRangeFilter).length > 0) {
      esQueryBody.query.bool.filter.push({
        range: { seckillPrice: priceRangeFilter },
      });
    }
    
    // 如果没有文本搜索，则匹配所有文档 (结合过滤器)
    if (esQueryBody.query.bool.must.length === 0) {
        esQueryBody.query.bool.must.push({ match_all: {} });
    }


    try {
      const response = await client.search({
        index: INDEX_NAME,
        body: esQueryBody,
      });

      const hits = response.hits.hits;
      const total = typeof response.hits.total === 'number' ? response.hits.total : response.hits.total?.value || 0;
      
      // 将ES的_source映射回Product类型
      // 注意：这里的 product._id 应该从 ES 的 _id 字段获取
      // _source 中不一定包含 _id，除非你在索引时也把它放进去了
      const products: Product[] = hits.map((hit: any) => ({
        _id: hit._id, // 从 hit._id 获取
        ...(hit._source as Omit<Product, '_id'>), // 其余字段从 _source 获取
      }));

      logger.info(`[Elasticsearch] Search returned ${products.length}/${total} results for query: ${JSON.stringify(query)}`);
      return {
        products,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      logger.error('[Elasticsearch] Error searching products:', error);
      // 对于搜索失败，可以返回空结果或抛出错误
      return { products: [], total: 0, page, pageSize };
    }
  }

  static async deleteProduct(productId: string): Promise<void> {
    try {
      await client.delete({
        index: INDEX_NAME,
        id: productId,
      });
      logger.info(`[Elasticsearch] Deleted product: ${productId}`);
    } catch (error: any) {
      // 如果文档不存在，delete会抛出404错误，这通常不是一个需要中断操作的严重错误
      if (error.meta && error.meta.statusCode === 404) {
        logger.warn(`[Elasticsearch] Product ${productId} not found for deletion.`);
      } else {
        logger.error(`[Elasticsearch] Error deleting product ${productId}:`, error);
        throw error; // 其他错误则重新抛出
      }
    }
  }

  // 可选：添加一个方法用于删除所有商品（例如用于测试或重置）
  static async deleteAllProducts(): Promise<void> {
    try {
      await client.deleteByQuery({
        index: INDEX_NAME,
        body: {
          query: {
            match_all: {},
          },
        },
      });
      logger.info(`[Elasticsearch] All products deleted from index '${INDEX_NAME}'.`);
    } catch (error) {
      logger.error(`[Elasticsearch] Error deleting all products from index '${INDEX_NAME}':`, error);
      throw error;
    }
  }
}
