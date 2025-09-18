---
title: Backend Development Standards & Microservices Architecture
version: 2.0
owner: Backend Architecture Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [Node.js, TypeScript, Microservices, Backend_Platform]
primary_stack: "Node.js + TypeScript + Express.js + MongoDB + Redis (see official technology versions)"
---

# Backend Development Standards & Microservices Architecture

> **Platform Memory**: Enterprise-grade backend development standards supporting billion-dollar scale microservices architecture

## Primary Backend Technology Stack

### **Core Backend Platform Stack**

> **Technology Versions**: For specific version requirements, see [`memory/core/00_official_technology_versions.md`](../../core/00_official_technology_versions.md)

```yaml
Runtime: Node.js LTS (with ES2023 support)
Language: TypeScript (Strict mode + Latest features)
Framework: Express.js (High-performance + Middleware ecosystem)
API Standards: REST (Primary) + GraphQL (Complex data) + gRPC (High-performance) - see official technology versions
Database Primary: MongoDB (Replica sets + Sharding)
Database Cache: Redis (Cluster mode + Persistence)
Database Analytics: ClickHouse (Time-series + OLAP)
Message Queue: Apache Kafka + Redis Streams
API Gateway: Kong Gateway + NGINX Ingress
Authentication: Auth0 + JWT + OAuth 2.1
Monitoring: Prometheus + Grafana + Jaeger + Sentry
Testing: Jest + Supertest + Artillery + k6
Deployment: Docker + Kubernetes + Helm
Cloud: AWS + Multi-region + Edge computing
```

### **Microservices Architecture Overview**
```typescript
// Core microservices structure
interface TanqoryBackendEcosystem {
  // Core Business Services
  userService: 'user-api' | 'auth-api' | 'profile-api';
  catalogService: 'product-api' | 'category-api' | 'inventory-api';
  orderService: 'order-api' | 'payment-api' | 'fulfillment-api';

  // Platform Services
  notificationService: 'notification-api' | 'email-api' | 'sms-api';
  analyticsService: 'analytics-api' | 'reporting-api' | 'metrics-api';
  searchService: 'search-api' | 'recommendation-api' | 'ai-api';

  // Infrastructure Services
  gatewayService: 'api-gateway' | 'rate-limiter' | 'load-balancer';
  storageService: 'file-api' | 'cdn-api' | 'media-api';
  integrationService: 'webhook-api' | 'sync-api' | 'external-api';

  // Supporting Services
  cacheService: 'redis-cluster' | 'memory-cache' | 'cdn-cache';
  queueService: 'kafka-cluster' | 'redis-streams' | 'task-queue';
  monitoringService: 'metrics-api' | 'logs-api' | 'traces-api';
}
```

### **Express.js Enterprise Configuration**
```typescript
// main.ts - Enterprise application bootstrap
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './config/swagger.config';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';

async function bootstrap() {
  const app = express();

  // Get configuration
  const config = {
    port: process.env.PORT || 3000,
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    nodeEnv: process.env.NODE_ENV || 'development'
  };

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS configuration
  app.use(cors({
    origin: config.allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID', 'X-Rate-Limit-*'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);

  // Setup middleware
  setupMiddleware(app);

  // Setup routes with versioning
  app.use('/api/v1', setupRoutes('v1'));
  app.use('/api/v2', setupRoutes('v2'));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  });

  // Setup Swagger documentation
  setupSwagger(app);

  // Error handling middleware (must be last)
  app.use(errorHandler);

  // Start server
  app.listen(config.port, () => {
    logger.info(`🚀 Tanqory Backend API is running on: http://localhost:${config.port}`);
    logger.info(`📚 API Documentation: http://localhost:${config.port}/api/docs`);
    logger.info(`🔍 Health Check: http://localhost:${config.port}/health`);
  });

  return app;
}

bootstrap();
```

### **Database Architecture & Standards**
```typescript
// MongoDB with Mongoose Enterprise Configuration
// config/database.config.ts
import mongoose from 'mongoose';

export const getDatabaseConfig = () => ({
  uri: process.env.MONGODB_URI,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 50, // Maximum number of connections
  minPoolSize: 5,  // Minimum number of connections
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  bufferMaxEntries: 0, // Disable mongoose buffering
  bufferCommands: false, // Disable mongoose buffering

  // Replica set configuration
  replicaSet: process.env.MONGODB_REPLICA_SET,
  readPreference: 'secondaryPreferred',
  readConcern: { level: 'majority' },
  writeConcern: { w: 'majority', j: true },

  // SSL/TLS configuration for production
  ssl: process.env.NODE_ENV === 'production',
  sslValidate: true,

  // Connection monitoring
  monitorCommands: true,
  heartbeatFrequencyMS: 10000,

  // Authentication
  authSource: 'admin',
  authMechanism: 'SCRAM-SHA-256',
});

// Redis Configuration for Caching
export const getRedisConfig = () => ({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,

  // Cluster configuration
  enableReadyCheck: true,
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  enableOfflineQueue: false,

  // Connection pool
  lazyConnect: true,
  keepAlive: 30000,

  // Key expiration
  keyPrefix: 'tanqory:',

  // Cluster nodes (for Redis Cluster)
  ...(process.env.REDIS_CLUSTER === 'true' && {
    cluster: {
      nodes: process.env.REDIS_CLUSTER_NODES?.split(',') || [],
      options: {
        redisOptions: {
          password: process.env.REDIS_PASSWORD
        }
      }
    }
  })
});
```

### **API Design Standards**
```typescript
// API Router Pattern
// routes/product.routes.ts
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rate-limit.middleware';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductFilterDto
} from '../dto/product.dto';

const router = Router();
const productController = new ProductController();

// Apply rate limiting to all product routes
router.use(rateLimitMiddleware({ windowMs: 60 * 1000, max: 100 }));

// GET /products - Get paginated products with filtering
router.get('/',
  cacheMiddleware({ ttl: 300 }), // 5 minute cache
  validationMiddleware('query', ProductFilterDto),
  productController.getProducts
);

// GET /products/:id - Get product by ID
router.get('/:id',
  cacheMiddleware({ ttl: 600 }), // 10 minute cache
  productController.getProduct
);

// POST /products - Create new product
router.post('/',
  authMiddleware,
  roleMiddleware(['admin', 'product_manager']),
  validationMiddleware('body', CreateProductDto),
  productController.createProduct
);

// PUT /products/:id - Update product
router.put('/:id',
  authMiddleware,
  roleMiddleware(['admin', 'product_manager']),
  validationMiddleware('body', UpdateProductDto),
  productController.updateProduct
);

// DELETE /products/:id - Delete product
router.delete('/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  productController.deleteProduct
);

export default router;
```

### **Service Layer Architecture**
```typescript
// services/product.service.ts
import { Model, Types } from 'mongoose';
import { Redis } from 'ioredis';
import { EventEmitter } from 'events';
import { Product, ProductDocument } from '../models/product.model';
import { CreateProductDto, UpdateProductDto, ProductFilterDto } from '../dto/product.dto';
import { SearchService } from './search.service';
import { CacheService } from './cache.service';
import { logger } from '../utils/logger';
import { NotFoundError, ConflictError, BadRequestError } from '../utils/errors';

export class ProductService {
  private productModel: Model<ProductDocument>;
  private redis: Redis;
  private searchService: SearchService;
  private cacheService: CacheService;
  private eventEmitter: EventEmitter;

  constructor(
    productModel: Model<ProductDocument>,
    redis: Redis,
    searchService: SearchService,
    cacheService: CacheService,
    eventEmitter: EventEmitter
  ) {
    this.productModel = productModel;
    this.redis = redis;
    this.searchService = searchService;
    this.cacheService = cacheService;
    this.eventEmitter = eventEmitter;
  }

  async findAll(filterDto: ProductFilterDto): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20, category, search, sort = 'created_at', order = 'desc' } = filterDto;

    // Calculate pagination
    const offset = (page - 1) * Math.min(limit, 100); // Max 100 items per page

    // Build query
    const query: any = { deleted_at: null };

    if (category) {
      query.category_id = new Types.ObjectId(category);
    }

    if (search) {
      // Use MongoDB text search or Elasticsearch for production
      query.$text = { $search: search };
    }

    // Build sort object
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj: any = {};
    sortObj[sort] = sortOrder;

    try {
      // Execute query with aggregation for better performance
      const [products, total] = await Promise.all([
        this.productModel
          .aggregate([
            { $match: query },
            { $sort: sortObj },
            { $skip: offset },
            { $limit: Math.min(limit, 100) },
            {
              $lookup: {
                from: 'categories',
                localField: 'category_id',
                foreignField: '_id',
                as: 'category',
                pipeline: [
                  { $project: { name: 1, slug: 1 } }
                ]
              }
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
              $addFields: {
                id: '$_id',
                average_rating: {
                  $cond: {
                    if: { $gt: ['$review_count', 0] },
                    then: { $divide: ['$rating_total', '$review_count'] },
                    else: 0
                  }
                }
              }
            },
            { $project: { _id: 0, __v: 0, rating_total: 0, deleted_at: 0 } }
          ]),
        this.productModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: products,
        pagination: {
          current_page: page,
          per_page: limit,
          total_items: total,
          total_pages: totalPages,
          has_next_page: page < totalPages,
          has_prev_page: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to fetch products', {
        error: error.message,
        filterDto,
        stack: error.stack
      });
      throw error;
    }
  }

  async findById(id: string): Promise<Product> {
    // Validate ObjectId format
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid product ID format');
    }

    // Check cache first
    const cached = await this.cacheService.get(`product:${id}`);
    if (cached) {
      return cached;
    }

    const product = await this.productModel
      .findOne({ _id: id, deleted_at: null })
      .populate('category_id', 'name slug')
      .lean()
      .exec();

    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }

    // Transform and cache result
    const transformedProduct = this.transformProduct(product);
    await this.cacheService.set(`product:${id}`, transformedProduct, 600); // Cache for 10 minutes

    return transformedProduct;
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      // Check for duplicate SKU
      const existingProduct = await this.productModel
        .findOne({ sku: createProductDto.sku, deleted_at: null })
        .lean();

      if (existingProduct) {
        throw new ConflictError(`Product with SKU ${createProductDto.sku} already exists`);
      }

      // Create product with audit fields
      const product = new this.productModel({
        ...createProductDto,
        created_at: new Date(),
        updated_at: new Date()
      });

      const savedProduct = await product.save();

      // Index in search engine
      await this.searchService.indexProduct(savedProduct);

      // Emit event for other services
      this.eventEmitter.emit('product.created', {
        productId: savedProduct._id.toString(),
        sku: savedProduct.sku,
        name: savedProduct.name,
        category: savedProduct.category_id
      });

      logger.info('Product created successfully', {
        productId: savedProduct._id.toString(),
        sku: savedProduct.sku,
        name: savedProduct.name
      });

      return this.transformProduct(savedProduct.toObject());
    } catch (error) {
      logger.error('Failed to create product', {
        error: error.message,
        createProductDto,
        stack: error.stack
      });
      throw error;
    }
  }

  private transformProduct(product: any): Product {
    return {
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      sku: product.sku,
      price: product.price,
      sale_price: product.sale_price,
      category: product.category_id,
      images: product.images || [],
      attributes: product.attributes || {},
      stock_quantity: product.stock_quantity,
      is_active: product.is_active,
      average_rating: product.review_count > 0
        ? product.rating_total / product.review_count
        : 0,
      review_count: product.review_count || 0,
      created_at: product.created_at,
      updated_at: product.updated_at
    };
  }
}
```

### **Microservices Communication Patterns**
```typescript
// Event-driven communication with Kafka
// events/product.events.ts
import { EventEmitter } from 'events';
import { KafkaProducer } from '../services/kafka.service';
import { RedisClient } from '../services/redis.service';
import { logger } from '../utils/logger';

export class ProductEventHandler {
  private eventEmitter: EventEmitter;
  private kafkaProducer: KafkaProducer;
  private redisClient: RedisClient;

  constructor(
    eventEmitter: EventEmitter,
    kafkaProducer: KafkaProducer,
    redisClient: RedisClient
  ) {
    this.eventEmitter = eventEmitter;
    this.kafkaProducer = kafkaProducer;
    this.redisClient = redisClient;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.eventEmitter.on('product.created', this.handleProductCreated.bind(this));
    this.eventEmitter.on('product.updated', this.handleProductUpdated.bind(this));
  }

  async handleProductCreated(payload: ProductCreatedEvent) {
    try {
      // Update inventory service
      await this.kafkaProducer.send('inventory.initialize', {
        productId: payload.productId,
        sku: payload.sku,
        initialQuantity: payload.stockQuantity || 0
      });

      // Update analytics service
      await this.kafkaProducer.send('analytics.product.created', {
        productId: payload.productId,
        category: payload.category,
        timestamp: new Date().toISOString()
      });

      // Update search index
      await this.kafkaProducer.send('search.index.product', {
        productId: payload.productId,
        action: 'create',
        data: payload
      });

      logger.info('Product created events published', { productId: payload.productId });
    } catch (error) {
      logger.error('Failed to publish product created events', {
        error: error.message,
        productId: payload.productId
      });
    }
  }

  async handleProductUpdated(payload: ProductUpdatedEvent) {
    try {
      // Invalidate cache
      await this.redisClient.del(`product:${payload.productId}`);

      // Update search index
      await this.kafkaProducer.send('search.index.product', {
        productId: payload.productId,
        action: 'update',
        data: payload.changes
      });

      logger.info('Product updated events published', { productId: payload.productId });
    } catch (error) {
      logger.error('Failed to publish product updated events', {
        error: error.message,
        productId: payload.productId
      });
    }
  }
}
```

### **Integration with Platform Ecosystem**
- **Web Platform**: RESTful APIs + GraphQL subscriptions for real-time updates
- **Mobile Platform**: Optimized mobile APIs with data compression
- **Desktop Platform**: Native APIs with desktop-specific features
- **Specialized Platforms**: Platform-specific API adaptations
- **Authentication**: Unified JWT-based authentication across platforms
- **Real-time Communication**: WebSocket + Server-Sent Events
- **File Storage**: AWS S3 + CloudFront CDN
- **Monitoring**: Comprehensive logging and metrics collection

---

**Document Classification**: CONFIDENTIAL
**Technical Scope**: Node.js, TypeScript, Microservices, Backend Platform
**Platform Priority**: Core Infrastructure (Critical)
**Review Cycle**: Monthly
**Last Updated**: September 16, 2025
**Version**: 2.0.0