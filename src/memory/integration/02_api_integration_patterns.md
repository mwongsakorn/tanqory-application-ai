---
title: API Integration Patterns
version: 1.0
owner: Platform Engineering Team
last_reviewed: 2025-09-16
next_review: 2025-12-16
classification: CONFIDENTIAL
scope: [API_Integration, Service_Communication, Integration_Protocols]
---

# API Integration Patterns

> **Integration Memory**: กำหนดรูปแบบการเชื่อมต่อ API และการสื่อสารระหว่างบริการที่สอดคล้องกับ unified architecture framework โดยรองรับทั้ง synchronous และ asynchronous communication patterns

## Table of Contents
- [Unified API Integration Strategy](#unified-api-integration-strategy)
- [Service Communication Patterns](#service-communication-patterns)
- [API Gateway Architecture](#api-gateway-architecture)
- [Event-Driven Integration](#event-driven-integration)
- [Service Mesh Implementation](#service-mesh-implementation)
- [Integration Security & Monitoring](#integration-security--monitoring)

---

## Unified API Integration Strategy

### **Integration Decision Matrix**
```yaml
API_Integration_Strategy:
  decision_reference: "See unified_architecture_decision_framework.md for complete decision criteria"

  hybrid_communication_approach:
    principle: "Use the right communication pattern for the right use case"
    synchronous_for:
      - "User-facing operations requiring immediate response"
      - "Real-time queries and data lookups"
      - "Operations requiring immediate validation"
      - "Simple CRUD operations"
      - "Financial transactions requiring strong consistency"

    asynchronous_for:
      - "Business event processing"
      - "Background tasks and workflows"
      - "Data synchronization between services"
      - "System integrations with external services"
      - "Notification and alerting systems"

  api_design_principles:
    consistency:
      - "Unified API contract standards across all services"
      - "Consistent error handling and response formats"
      - "Standardized authentication and authorization"
      - "Common versioning strategy"

    performance:
      - "Optimized for platform-specific needs"
      - "Efficient caching strategies"
      - "Proper pagination and filtering"
      - "Bandwidth-aware response optimization"

    reliability:
      - "Circuit breaker patterns for fault tolerance"
      - "Retry mechanisms with exponential backoff"
      - "Graceful degradation capabilities"
      - "Health checks and monitoring"

Integration_Architecture_Overview:
  api_gateway_layer:
    technology: "Kong Enterprise"
    purpose: "Centralized API management and cross-cutting concerns"
    responsibilities:
      - "Request routing and load balancing"
      - "Authentication and authorization"
      - "Rate limiting and throttling"
      - "Request/response transformation"
      - "Caching and response optimization"
      - "Analytics and monitoring"

  service_mesh_layer:
    technology: "Istio"
    purpose: "Infrastructure-level service communication"
    responsibilities:
      - "Service discovery and load balancing"
      - "Mutual TLS for security"
      - "Traffic management and routing"
      - "Observability and tracing"
      - "Circuit breaking and retry policies"

  application_layer:
    rest_apis: "Primary interface for synchronous communication"
    graphql: "Flexible data querying for complex client needs"
    grpc: "High-performance internal service communication"
    websockets: "Real-time bidirectional communication"
    events: "Asynchronous business event processing"
```

### **Universal API Standards**
```typescript
// shared/api/types.ts
export interface UniversalApiRequest {
  headers: {
    'Content-Type': string;
    'Accept': string;
    'Authorization'?: string;
    'X-Request-ID': string;
    'X-Platform': PlatformType;
    'X-App-Version': string;
    'X-Client-ID': string;
  };
  body?: any;
  query?: Record<string, string | number | boolean>;
  params?: Record<string, string>;
}

export interface UniversalApiResponse<T = any> {
  data?: T;
  meta: {
    requestId: string;
    timestamp: string;
    version: string;
    platform: PlatformType;
    processingTime: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  errors?: ApiError[];
  warnings?: ApiWarning[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  details?: Record<string, any>;
}

// shared/api/client.ts
export class UniversalApiClient {
  private baseUrl: string;
  private platform: PlatformType;
  private defaultHeaders: Record<string, string>;
  private interceptors: {
    request: RequestInterceptor[];
    response: ResponseInterceptor[];
  };
  private circuitBreaker: CircuitBreaker;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.platform = config.platform;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Platform': this.platform,
      'X-App-Version': config.appVersion,
      'X-Client-ID': config.clientId,
    };

    this.interceptors = { request: [], response: [] };
    this.circuitBreaker = new CircuitBreaker(config.circuitBreakerOptions);
  }

  async request<T>(options: ApiRequestOptions): Promise<UniversalApiResponse<T>> {
    const requestId = this.generateRequestId();

    try {
      // Apply request interceptors
      const processedOptions = await this.applyRequestInterceptors({
        ...options,
        headers: {
          ...this.defaultHeaders,
          'X-Request-ID': requestId,
          ...options.headers,
        },
      });

      // Execute request through circuit breaker
      const response = await this.circuitBreaker.execute(() =>
        this.executeRequest<T>(processedOptions)
      );

      // Apply response interceptors
      return await this.applyResponseInterceptors(response);

    } catch (error) {
      throw this.handleApiError(error, requestId);
    }
  }

  private async executeRequest<T>(options: ApiRequestOptions): Promise<UniversalApiResponse<T>> {
    const startTime = Date.now();

    const response = await fetch(`${this.baseUrl}${options.endpoint}`, {
      method: options.method,
      headers: options.headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: this.createAbortSignal(options.timeout),
    });

    const responseData = await response.json();
    const processingTime = Date.now() - startTime;

    if (!response.ok) {
      throw new ApiError(response.status, responseData, options.headers['X-Request-ID']);
    }

    return {
      ...responseData,
      meta: {
        ...responseData.meta,
        processingTime,
      },
    };
  }

  // Specialized methods for different communication patterns
  async get<T>(endpoint: string, options?: Partial<ApiRequestOptions>): Promise<T> {
    const response = await this.request<T>({
      method: 'GET',
      endpoint,
      ...options,
    });
    return response.data!;
  }

  async post<T>(endpoint: string, body: any, options?: Partial<ApiRequestOptions>): Promise<T> {
    const response = await this.request<T>({
      method: 'POST',
      endpoint,
      body,
      ...options,
    });
    return response.data!;
  }

  async put<T>(endpoint: string, body: any, options?: Partial<ApiRequestOptions>): Promise<T> {
    const response = await this.request<T>({
      method: 'PUT',
      endpoint,
      body,
      ...options,
    });
    return response.data!;
  }

  async patch<T>(endpoint: string, body: any, options?: Partial<ApiRequestOptions>): Promise<T> {
    const response = await this.request<T>({
      method: 'PATCH',
      endpoint,
      body,
      ...options,
    });
    return response.data!;
  }

  async delete<T>(endpoint: string, options?: Partial<ApiRequestOptions>): Promise<T> {
    const response = await this.request<T>({
      method: 'DELETE',
      endpoint,
      ...options,
    });
    return response.data!;
  }

  // GraphQL support
  async graphql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await this.request<{ data: T }>({
      method: 'POST',
      endpoint: '/graphql',
      body: { query, variables },
    });

    if (response.errors?.length) {
      throw new GraphQLError(response.errors);
    }

    return response.data!.data;
  }

  // WebSocket connection management
  createWebSocketConnection(endpoint: string, protocols?: string[]): WebSocketManager {
    return new WebSocketManager(`${this.baseUrl}${endpoint}`, {
      protocols,
      headers: this.defaultHeaders,
      reconnect: true,
    });
  }
}
```

## Service Communication Patterns

### **Synchronous Communication Patterns**
```yaml
Synchronous_Communication_Patterns:
  rest_api_pattern:
    use_cases:
      - "User-facing CRUD operations"
      - "Real-time data queries"
      - "Form submissions and validations"
      - "Authentication and authorization flows"

    implementation_standards:
      http_methods:
        GET: "Safe and idempotent data retrieval"
        POST: "Resource creation and non-idempotent operations"
        PUT: "Complete resource replacement (idempotent)"
        PATCH: "Partial resource updates (preferably idempotent)"
        DELETE: "Resource removal (idempotent)"

      status_codes:
        success: [200, 201, 202, 204]
        client_errors: [400, 401, 403, 404, 409, 422, 429]
        server_errors: [500, 502, 503, 504]

      response_format:
        success: "{ data: T, meta: ResponseMetadata }"
        error: "{ errors: ApiError[], meta: ResponseMetadata }"
        pagination: "{ data: T[], meta: { pagination: PaginationInfo, ...ResponseMetadata } }"

  graphql_pattern:
    use_cases:
      - "Complex data fetching with specific field requirements"
      - "Mobile applications with bandwidth constraints"
      - "Client applications needing flexible data shapes"
      - "Aggregation of data from multiple services"

    implementation:
      schema_design: "Domain-driven schema with clear boundaries"
      resolvers: "Efficient data fetching with DataLoader pattern"
      security: "Query complexity analysis and depth limiting"
      caching: "Field-level caching with cache hints"

    federation_strategy:
      gateway: "Apollo Federation for schema composition"
      services: "Individual GraphQL schemas per domain service"
      cross_service_queries: "Federation directives for data joining"

  grpc_pattern:
    use_cases:
      - "High-performance internal service communication"
      - "Type-safe inter-service API contracts"
      - "Streaming data scenarios"
      - "Language-agnostic service interfaces"

    implementation:
      protocol_buffers: "Strongly typed message definitions"
      service_definition: "Clear service contracts with versioning"
      streaming: "Client, server, and bidirectional streaming"
      interceptors: "Cross-cutting concerns (auth, logging, metrics)"
```

### **Synchronous Communication Implementation**
```typescript
// services/user-service/api/rest-controller.ts
export class UserRestController {
  constructor(
    private userService: UserService,
    private validator: RequestValidator,
    private logger: Logger
  ) {}

  @Get('/users/:id')
  @RequireAuth()
  @ValidateParams(UserParamsSchema)
  async getUser(@Param('id') userId: string, @Req() req: AuthenticatedRequest): Promise<UniversalApiResponse<User>> {
    const startTime = Date.now();

    try {
      this.logger.info('Fetching user', { userId, requestId: req.requestId });

      const user = await this.userService.findById(userId);

      if (!user) {
        throw new NotFoundError('User not found', { userId });
      }

      // Apply field-level permissions
      const sanitizedUser = await this.applyFieldPermissions(user, req.user);

      return {
        data: sanitizedUser,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
          version: 'v1',
          platform: req.platform,
          processingTime: Date.now() - startTime,
        },
      };

    } catch (error) {
      this.logger.error('Error fetching user', { error, userId, requestId: req.requestId });
      throw error;
    }
  }

  @Post('/users')
  @RequireAuth()
  @ValidateBody(CreateUserSchema)
  @RateLimit('user-creation', { max: 10, window: '15m' })
  async createUser(@Body() userData: CreateUserRequest, @Req() req: AuthenticatedRequest): Promise<UniversalApiResponse<User>> {
    const startTime = Date.now();

    try {
      this.logger.info('Creating user', { userData: this.sanitizeLogData(userData), requestId: req.requestId });

      // Business validation
      await this.userService.validateUserCreation(userData);

      // Create user
      const user = await this.userService.create(userData);

      // Publish domain event
      await this.eventPublisher.publish(new UserCreatedEvent(user));

      return {
        data: user,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
          version: 'v1',
          platform: req.platform,
          processingTime: Date.now() - startTime,
        },
      };

    } catch (error) {
      this.logger.error('Error creating user', { error, requestId: req.requestId });
      throw error;
    }
  }

  @Patch('/users/:id')
  @RequireAuth()
  @ValidateParams(UserParamsSchema)
  @ValidateBody(UpdateUserSchema)
  async updateUser(
    @Param('id') userId: string,
    @Body() updates: UpdateUserRequest,
    @Req() req: AuthenticatedRequest
  ): Promise<UniversalApiResponse<User>> {
    const startTime = Date.now();

    try {
      // Authorization check
      await this.authService.ensureCanModifyUser(req.user, userId);

      // Optimistic locking check
      const currentUser = await this.userService.findById(userId);
      if (!currentUser) {
        throw new NotFoundError('User not found', { userId });
      }

      if (updates.version && updates.version !== currentUser.version) {
        throw new ConflictError('User was modified by another request', {
          expectedVersion: updates.version,
          currentVersion: currentUser.version,
        });
      }

      // Apply updates
      const updatedUser = await this.userService.update(userId, updates);

      // Publish domain event
      await this.eventPublisher.publish(new UserUpdatedEvent(updatedUser, currentUser));

      return {
        data: updatedUser,
        meta: {
          requestId: req.requestId,
          timestamp: new Date().toISOString(),
          version: 'v1',
          platform: req.platform,
          processingTime: Date.now() - startTime,
        },
      };

    } catch (error) {
      this.logger.error('Error updating user', { error, userId, requestId: req.requestId });
      throw error;
    }
  }
}

// services/catalog-service/api/graphql-resolver.ts
export class ProductResolver {
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private reviewService: ReviewService,
    private dataLoader: DataLoaderService
  ) {}

  @Query()
  async products(
    @Args() args: ProductsQueryArgs,
    @Context() context: GraphQLContext
  ): Promise<ProductConnection> {
    const { filter, sort, pagination } = args;

    // Apply business logic and authorization
    const enhancedFilter = await this.applyUserContextToFilter(filter, context.user);

    // Fetch products with pagination
    const result = await this.productService.findMany({
      filter: enhancedFilter,
      sort,
      pagination,
    });

    return {
      edges: result.items.map(product => ({
        node: product,
        cursor: this.encodeCursor(product.id),
      })),
      pageInfo: {
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        startCursor: result.items.length > 0 ? this.encodeCursor(result.items[0].id) : null,
        endCursor: result.items.length > 0 ? this.encodeCursor(result.items[result.items.length - 1].id) : null,
      },
      totalCount: result.totalCount,
    };
  }

  @ResolveField()
  async category(@Parent() product: Product, @Context() context: GraphQLContext): Promise<Category> {
    // Use DataLoader to batch and cache category requests
    return this.dataLoader.categoryById.load(product.categoryId);
  }

  @ResolveField()
  async reviews(
    @Parent() product: Product,
    @Args() args: ReviewsArgs,
    @Context() context: GraphQLContext
  ): Promise<ReviewConnection> {
    // Load reviews with pagination
    return this.reviewService.findByProductId(product.id, args);
  }

  @ResolveField()
  async averageRating(@Parent() product: Product): Promise<number> {
    // Use DataLoader for efficient aggregation
    return this.dataLoader.productAverageRating.load(product.id);
  }

  @Mutation()
  async createProduct(
    @Args() input: CreateProductInput,
    @Context() context: GraphQLContext
  ): Promise<CreateProductPayload> {
    // Authorization
    await this.authService.ensureCanCreateProduct(context.user);

    // Validation
    await this.validator.validate(input, CreateProductSchema);

    try {
      // Create product
      const product = await this.productService.create(input);

      // Publish event
      await this.eventPublisher.publish(new ProductCreatedEvent(product));

      return {
        product,
        errors: [],
      };

    } catch (error) {
      return {
        product: null,
        errors: this.formatGraphQLErrors(error),
      };
    }
  }
}
```

### **Asynchronous Communication Patterns**
```yaml
Asynchronous_Communication_Patterns:
  event_driven_architecture:
    domain_events:
      purpose: "Capture and communicate business-significant occurrences"
      examples: ["UserRegistered", "OrderPlaced", "PaymentProcessed", "ProductUpdated"]
      characteristics: ["Immutable", "Self-contained", "Business-focused"]

    integration_events:
      purpose: "Enable loose coupling between bounded contexts"
      examples: ["CustomerDataSynchronized", "InventoryLevelChanged", "PriceUpdated"]
      characteristics: ["Service-agnostic", "Eventual consistency", "Retry-safe"]

    system_events:
      purpose: "Infrastructure and operational events"
      examples: ["ServiceStarted", "HealthCheckFailed", "ConfigurationChanged"]
      characteristics: ["Technical focus", "Monitoring and alerting", "System state changes"]

  message_patterns:
    publish_subscribe:
      use_cases: ["Event notifications", "Data replication", "Fan-out scenarios"]
      implementation: "Apache Kafka with topic-based routing"
      guarantees: ["At-least-once delivery", "Ordering within partition"]

    request_reply:
      use_cases: ["Async service calls", "Command processing", "Long-running operations"]
      implementation: "Message queues with correlation IDs"
      guarantees: ["Exactly-once processing", "Response correlation"]

    saga_orchestration:
      use_cases: ["Distributed transactions", "Multi-step business processes"]
      implementation: "Event-driven saga pattern with compensation"
      guarantees: ["Eventual consistency", "Failure handling", "Compensation logic"]

  event_streaming_platform:
    apache_kafka:
      topics:
        business_events: "business-events-{service-name}-{version}"
        integration_events: "integration-events-{domain}-{version}"
        system_events: "system-events-{category}-{version}"

      partitioning:
        strategy: "Partition by aggregate ID for ordering guarantees"
        scaling: "Horizontal scaling through partition increase"
        routing: "Consistent hashing for even distribution"

      retention:
        business_events: "7 days (compliance and audit requirements)"
        integration_events: "24 hours (operational needs)"
        system_events: "3 days (troubleshooting and monitoring)"
```

### **Event-Driven Implementation**
```typescript
// shared/events/event-bus.ts
export interface DomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateVersion: number;
  eventData: any;
  metadata: {
    correlationId: string;
    causationId?: string;
    userId?: string;
    timestamp: string;
    source: string;
  };
}

export class EventBus {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private eventHandlers: Map<string, EventHandler[]> = new Map();

  constructor(private config: EventBusConfig) {
    this.kafka = new Kafka({
      clientId: config.clientId,
      brokers: config.brokers,
      ssl: config.ssl,
      sasl: config.sasl,
    });

    this.producer = this.kafka.producer({
      idempotent: true,
      maxInFlightRequests: 1,
      transactionTimeout: 30000,
    });
  }

  async publish(event: DomainEvent): Promise<void> {
    const topic = this.getTopicForEvent(event.eventType);
    const partition = this.getPartitionForEvent(event);

    try {
      await this.producer.send({
        topic,
        messages: [{
          key: event.aggregateId,
          value: JSON.stringify(event),
          partition,
          headers: {
            eventType: event.eventType,
            correlationId: event.metadata.correlationId,
            source: event.metadata.source,
          },
        }],
      });

      this.logger.debug('Event published', {
        eventId: event.eventId,
        eventType: event.eventType,
        topic,
        partition,
      });

    } catch (error) {
      this.logger.error('Failed to publish event', { error, event });
      throw new EventPublishError('Failed to publish event', error, event);
    }
  }

  async subscribe(
    eventType: string,
    handler: EventHandler,
    options: SubscriptionOptions = {}
  ): Promise<void> {
    // Register handler
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);

    // Create consumer if needed
    const consumerGroup = options.consumerGroup || `${this.config.serviceName}-${eventType}`;

    if (!this.consumers.has(consumerGroup)) {
      const consumer = this.kafka.consumer({
        groupId: consumerGroup,
        sessionTimeout: 30000,
        rebalanceTimeout: 60000,
        heartbeatInterval: 3000,
      });

      await consumer.subscribe({
        topics: [this.getTopicForEvent(eventType)],
        fromBeginning: options.fromBeginning || false,
      });

      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          await this.handleMessage(topic, partition, message, options);
        },
      });

      this.consumers.set(consumerGroup, consumer);
    }
  }

  private async handleMessage(
    topic: string,
    partition: number,
    message: KafkaMessage,
    options: SubscriptionOptions
  ): Promise<void> {
    const startTime = Date.now();
    let event: DomainEvent;

    try {
      event = JSON.parse(message.value!.toString());

      this.logger.debug('Processing event', {
        eventId: event.eventId,
        eventType: event.eventType,
        topic,
        partition,
      });

      // Get handlers for this event type
      const handlers = this.eventHandlers.get(event.eventType) || [];

      if (handlers.length === 0) {
        this.logger.warn('No handlers registered for event type', { eventType: event.eventType });
        return;
      }

      // Process handlers
      for (const handler of handlers) {
        await this.processEventHandler(handler, event, options);
      }

      // Record processing metrics
      this.metrics.recordEventProcessing(event.eventType, Date.now() - startTime, true);

    } catch (error) {
      this.logger.error('Error processing event', { error, topic, partition });
      this.metrics.recordEventProcessing(event?.eventType || 'unknown', Date.now() - startTime, false);

      // Handle poison messages
      if (options.deadLetterQueue) {
        await this.sendToDeadLetterQueue(message, error);
      }

      throw error;
    }
  }

  private async processEventHandler(
    handler: EventHandler,
    event: DomainEvent,
    options: SubscriptionOptions
  ): Promise<void> {
    const retryPolicy = options.retryPolicy || this.config.defaultRetryPolicy;
    let lastError: Error;

    for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt++) {
      try {
        await handler.handle(event);
        return; // Success

      } catch (error) {
        lastError = error;
        this.logger.warn(`Event handler failed (attempt ${attempt}/${retryPolicy.maxAttempts})`, {
          error,
          eventId: event.eventId,
          handlerName: handler.constructor.name,
        });

        if (attempt < retryPolicy.maxAttempts) {
          const delay = this.calculateRetryDelay(attempt, retryPolicy);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    this.logger.error('Event handler failed after all retries', {
      error: lastError,
      eventId: event.eventId,
      handlerName: handler.constructor.name,
    });

    throw new EventHandlingError('Handler failed after all retries', lastError, event);
  }
}

// Example event handlers
export class UserCreatedEventHandler implements EventHandler {
  constructor(
    private emailService: EmailService,
    private analyticsService: AnalyticsService,
    private logger: Logger
  ) {}

  async handle(event: DomainEvent): Promise<void> {
    if (event.eventType !== 'UserCreated') {
      throw new Error(`Unexpected event type: ${event.eventType}`);
    }

    const userData = event.eventData;

    try {
      // Send welcome email
      await this.emailService.sendWelcomeEmail(userData);

      // Track user registration in analytics
      await this.analyticsService.trackEvent('user_registered', {
        userId: userData.id,
        email: userData.email,
        registrationSource: userData.source,
        timestamp: event.metadata.timestamp,
      });

      this.logger.info('User created event processed successfully', {
        userId: userData.id,
        eventId: event.eventId,
      });

    } catch (error) {
      this.logger.error('Failed to process user created event', {
        error,
        userId: userData.id,
        eventId: event.eventId,
      });
      throw error;
    }
  }
}

// Saga orchestration example
export class OrderFulfillmentSaga implements SagaOrchestrator {
  private sagaData: Map<string, OrderFulfillmentData> = new Map();

  constructor(
    private eventBus: EventBus,
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private shippingService: ShippingService
  ) {
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    this.eventBus.subscribe('OrderPlaced', this.handleOrderPlaced.bind(this));
    this.eventBus.subscribe('PaymentProcessed', this.handlePaymentProcessed.bind(this));
    this.eventBus.subscribe('PaymentFailed', this.handlePaymentFailed.bind(this));
    this.eventBus.subscribe('InventoryReserved', this.handleInventoryReserved.bind(this));
    this.eventBus.subscribe('InventoryReservationFailed', this.handleInventoryReservationFailed.bind(this));
    this.eventBus.subscribe('ShippingArranged', this.handleShippingArranged.bind(this));
  }

  async handleOrderPlaced(event: DomainEvent): Promise<void> {
    const orderData = event.eventData;
    const sagaId = event.aggregateId;

    // Initialize saga data
    this.sagaData.set(sagaId, {
      orderId: orderData.id,
      customerId: orderData.customerId,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'payment_pending',
      compensationActions: [],
    });

    // Start the saga by processing payment
    try {
      await this.paymentService.processPayment({
        orderId: orderData.id,
        amount: orderData.totalAmount,
        paymentMethod: orderData.paymentMethod,
      });
    } catch (error) {
      await this.compensateSaga(sagaId);
      throw error;
    }
  }

  async handlePaymentProcessed(event: DomainEvent): Promise<void> {
    const sagaId = event.eventData.orderId;
    const sagaData = this.sagaData.get(sagaId);

    if (!sagaData) return;

    // Update saga state
    sagaData.status = 'inventory_pending';
    sagaData.paymentId = event.eventData.paymentId;
    sagaData.compensationActions.push({
      action: 'refund_payment',
      data: { paymentId: event.eventData.paymentId },
    });

    // Reserve inventory
    try {
      await this.inventoryService.reserveItems({
        orderId: sagaData.orderId,
        items: sagaData.items,
      });
    } catch (error) {
      await this.compensateSaga(sagaId);
      throw error;
    }
  }

  private async compensateSaga(sagaId: string): Promise<void> {
    const sagaData = this.sagaData.get(sagaId);
    if (!sagaData) return;

    // Execute compensation actions in reverse order
    for (const compensation of sagaData.compensationActions.reverse()) {
      try {
        await this.executeCompensation(compensation);
      } catch (error) {
        this.logger.error('Compensation action failed', { error, compensation, sagaId });
      }
    }

    // Mark saga as failed
    await this.eventBus.publish({
      eventId: generateUuid(),
      eventType: 'OrderFulfillmentFailed',
      aggregateId: sagaId,
      aggregateVersion: 1,
      eventData: { orderId: sagaData.orderId, reason: 'saga_compensation' },
      metadata: {
        correlationId: sagaId,
        timestamp: new Date().toISOString(),
        source: 'OrderFulfillmentSaga',
      },
    });

    this.sagaData.delete(sagaId);
  }
}
```

## API Gateway Architecture

### **Centralized API Management**
```yaml
API_Gateway_Architecture:
  kong_enterprise_setup:
    core_responsibilities:
      request_routing:
        - "Dynamic service discovery and load balancing"
        - "Path-based and header-based routing"
        - "Blue-green and canary deployment support"
        - "Circuit breaker and health check integration"

      security:
        - "Authentication and authorization enforcement"
        - "API key management and validation"
        - "OAuth 2.0 and JWT token validation"
        - "Rate limiting and DDoS protection"

      transformation:
        - "Request/response transformation"
        - "Protocol translation (REST to GraphQL)"
        - "Data format conversion and validation"
        - "Response aggregation and composition"

      observability:
        - "Request/response logging and metrics"
        - "Distributed tracing integration"
        - "API analytics and usage monitoring"
        - "Error tracking and alerting"

  plugin_ecosystem:
    authentication_plugins:
      - "OAuth 2.0 with multiple providers"
      - "JWT validation with RS256/HS256"
      - "API key authentication"
      - "LDAP and database authentication"

    security_plugins:
      - "Rate limiting (sliding window, fixed window)"
      - "IP restriction and whitelisting"
      - "CORS handling"
      - "Request size limiting"

    transformation_plugins:
      - "Request/response transformer"
      - "GraphQL proxy"
      - "Protocol buffers support"
      - "Custom Lua scripting"

    observability_plugins:
      - "Prometheus metrics export"
      - "Datadog APM integration"
      - "File and HTTP logging"
      - "Zipkin tracing"

  platform_specific_optimizations:
    web_platform:
      optimizations: ["CORS configuration", "Browser caching headers", "Compression"]
      security: ["CSP headers", "XSS protection", "CSRF tokens"]

    mobile_platforms:
      optimizations: ["Response compression", "Image optimization", "Batch requests"]
      security: ["Certificate pinning", "App attestation"]

    desktop_platform:
      optimizations: ["Bulk data operations", "File upload handling"]
      security: ["Client certificate authentication"]

    iot_platforms:
      optimizations: ["Minimal response payloads", "Connection pooling"]
      security: ["Device certificate validation", "Secure bootstrapping"]
```

### **API Gateway Implementation**
```typescript
// gateway/plugins/platform-optimizer.ts
export class PlatformOptimizerPlugin {
  constructor(private config: PlatformOptimizerConfig) {}

  async execute(context: KongPluginContext): Promise<void> {
    const request = context.request;
    const response = context.response;
    const platform = this.detectPlatform(request);

    // Apply platform-specific optimizations
    switch (platform) {
      case 'web':
        await this.optimizeForWeb(request, response);
        break;
      case 'mobile':
        await this.optimizeForMobile(request, response);
        break;
      case 'desktop':
        await this.optimizeForDesktop(request, response);
        break;
      case 'iot':
        await this.optimizeForIoT(request, response);
        break;
    }
  }

  private async optimizeForWeb(request: KongRequest, response: KongResponse): Promise<void> {
    // Enable compression for web requests
    response.headers['Content-Encoding'] = 'gzip';

    // Set appropriate caching headers
    if (this.isCacheableEndpoint(request.path)) {
      response.headers['Cache-Control'] = 'public, max-age=300';
      response.headers['ETag'] = this.generateETag(response.body);
    }

    // Add security headers
    response.headers['X-Content-Type-Options'] = 'nosniff';
    response.headers['X-Frame-Options'] = 'DENY';
    response.headers['X-XSS-Protection'] = '1; mode=block';
  }

  private async optimizeForMobile(request: KongRequest, response: KongResponse): Promise<void> {
    // Compress responses aggressively
    response.headers['Content-Encoding'] = 'br'; // Brotli compression

    // Add mobile-specific cache headers
    response.headers['Cache-Control'] = 'public, max-age=600';

    // Optimize images if present
    if (this.containsImages(response.body)) {
      response.body = await this.optimizeImagesForMobile(response.body);
    }

    // Add network hints for prefetching
    if (this.isListingEndpoint(request.path)) {
      response.headers['Link'] = '</api/v1/images>; rel=prefetch';
    }
  }

  private async optimizeForDesktop(request: KongRequest, response: KongResponse): Promise<void> {
    // Enable bulk operations indicator
    response.headers['X-Supports-Bulk'] = 'true';

    // Add desktop-specific features
    if (request.headers['X-Desktop-Client'] === 'electron') {
      response.headers['X-Auto-Update-Available'] = await this.checkForUpdates();
    }
  }

  private async optimizeForIoT(request: KongRequest, response: KongResponse): Promise<void> {
    // Minimize response payload
    response.body = this.minimizePayload(response.body);

    // Set aggressive caching for stable data
    response.headers['Cache-Control'] = 'public, max-age=3600';

    // Add connection optimization headers
    response.headers['Connection'] = 'keep-alive';
    response.headers['Keep-Alive'] = 'timeout=30, max=100';
  }
}

// gateway/plugins/unified-auth.ts
export class UnifiedAuthPlugin {
  constructor(
    private jwtValidator: JwtValidator,
    private apiKeyValidator: ApiKeyValidator,
    private biometricValidator: BiometricValidator
  ) {}

  async execute(context: KongPluginContext): Promise<void> {
    const request = context.request;
    const platform = this.detectPlatform(request);

    // Skip authentication for public endpoints
    if (this.isPublicEndpoint(request.path)) {
      return;
    }

    // Perform platform-appropriate authentication
    const authResult = await this.authenticateRequest(request, platform);

    if (!authResult.success) {
      throw new UnauthorizedError(authResult.error);
    }

    // Add user context to request
    request.headers['X-User-ID'] = authResult.user.id;
    request.headers['X-User-Roles'] = authResult.user.roles.join(',');
    request.headers['X-Platform'] = platform;

    // Apply platform-specific security measures
    await this.applyPlatformSecurity(request, platform, authResult.user);
  }

  private async authenticateRequest(request: KongRequest, platform: PlatformType): Promise<AuthResult> {
    const authHeader = request.headers['Authorization'];
    const apiKey = request.headers['X-API-Key'];
    const biometricToken = request.headers['X-Biometric-Token'];

    // Try different authentication methods based on platform and available credentials
    if (biometricToken && ['ios', 'android', 'desktop'].includes(platform)) {
      return await this.biometricValidator.validate(biometricToken);
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return await this.jwtValidator.validate(token);
    }

    if (apiKey) {
      return await this.apiKeyValidator.validate(apiKey);
    }

    return { success: false, error: 'No valid authentication credentials provided' };
  }

  private async applyPlatformSecurity(
    request: KongRequest,
    platform: PlatformType,
    user: AuthenticatedUser
  ): Promise<void> {
    switch (platform) {
      case 'mobile':
        // Verify app signature for mobile platforms
        await this.verifyAppSignature(request.headers['X-App-Signature']);
        break;

      case 'desktop':
        // Verify desktop application certificate
        await this.verifyDesktopCertificate(request.headers['X-Client-Cert']);
        break;

      case 'iot':
        // Verify device certificate and attestation
        await this.verifyDeviceCertificate(request.headers['X-Device-Cert']);
        await this.verifyDeviceAttestation(request.headers['X-Device-Attestation']);
        break;
    }

    // Apply user-specific rate limiting
    await this.applyUserRateLimit(user, platform);
  }
}

// gateway/configuration/kong.yaml
services:
  - name: user-service
    url: http://user-service:3000
    plugins:
      - name: unified-auth
        config:
          jwt_secret: "${JWT_SECRET}"
          api_key_header: "X-API-Key"
          biometric_validation_url: "http://auth-service:3000/biometric/validate"

      - name: platform-optimizer
        config:
          image_optimization: true
          compression_level: 6
          cache_ttl: 300

      - name: rate-limiting
        config:
          minute: 100
          hour: 1000
          policy: "redis"
          redis_host: "redis.cache.internal"

      - name: prometheus
        config:
          per_consumer: true
          status_code_metrics: true
          latency_metrics: true

  - name: catalog-service
    url: http://catalog-service:3000
    plugins:
      - name: graphql-proxy
        config:
          schema_endpoint: "/graphql/schema"
          introspection: false
          query_complexity_limit: 100

      - name: response-transformer
        config:
          add:
            headers:
              - "X-Service-Version:v1"
              - "X-Cache-Strategy:cache-first"

routes:
  - name: user-api
    service: user-service
    paths:
      - "/api/v1/users"
    methods:
      - GET
      - POST
      - PUT
      - PATCH
      - DELETE

  - name: catalog-graphql
    service: catalog-service
    paths:
      - "/graphql"
    methods:
      - POST
      - GET
```

## Event-Driven Integration

### **Event Architecture Patterns**
```yaml
Event_Architecture_Patterns:
  event_sourcing_integration:
    purpose: "Maintain complete audit trail and enable temporal queries"
    implementation:
      event_store: "Dedicated event storage with immutable append-only log"
      snapshots: "Periodic snapshots for performance optimization"
      projections: "Read model generation from event streams"

    use_cases:
      - "Financial transactions requiring complete audit trail"
      - "User behavior tracking and analytics"
      - "Regulatory compliance and reporting"
      - "System state reconstruction and debugging"

  cqrs_integration:
    purpose: "Separate read and write models for optimal performance"
    implementation:
      command_side: "Write-optimized models with business logic"
      query_side: "Read-optimized models with denormalized data"
      synchronization: "Event-driven updates from command to query side"

    benefits:
      - "Independent scaling of read and write operations"
      - "Optimized data models for different access patterns"
      - "Better performance for complex queries"
      - "Simplified caching strategies"

  saga_orchestration:
    purpose: "Coordinate distributed transactions across multiple services"
    implementation:
      choreography: "Decentralized coordination through event chains"
      orchestration: "Centralized coordination through saga managers"
      compensation: "Rollback mechanisms for partial failures"

    patterns:
      process_manager: "Long-running business processes"
      routing_slip: "Dynamic workflow routing"
      state_machine: "Explicit state transitions"

Event_Integration_Patterns:
  domain_event_publishing:
    triggers: ["Aggregate state changes", "Business rule violations", "External system updates"]
    naming_convention: "{Domain}{Action}Event (e.g., OrderCreatedEvent, PaymentFailedEvent)"
    payload_structure:
      aggregate_id: "Unique identifier of the affected aggregate"
      event_data: "Relevant business data for the event"
      metadata: "Correlation, causation, and tracing information"

  cross_service_integration:
    patterns:
      event_carried_state_transfer: "Include all necessary data in events"
      event_notification: "Minimal events with reference to source data"
      event_sourcing_collaboration: "Share event streams between services"

    consistency_strategies:
      eventual_consistency: "Accept temporary inconsistencies for better availability"
      causal_consistency: "Maintain ordering of causally related events"
      strong_consistency: "Use distributed transactions when absolutely necessary"
```

### **Event Integration Implementation**
```typescript
// shared/events/event-store.ts
export class EventStore {
  constructor(
    private database: DatabaseConnection,
    private serializer: EventSerializer,
    private logger: Logger
  ) {}

  async saveEvents(
    streamId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    const transaction = await this.database.beginTransaction();

    try {
      // Optimistic concurrency check
      const currentVersion = await this.getCurrentStreamVersion(streamId, transaction);

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(
          `Expected version ${expectedVersion}, but current version is ${currentVersion}`
        );
      }

      // Save events
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const version = expectedVersion + i + 1;

        await transaction.query(`
          INSERT INTO event_store (
            stream_id, event_id, event_type, event_data,
            event_version, correlation_id, causation_id, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          streamId,
          event.eventId,
          event.eventType,
          this.serializer.serialize(event.eventData),
          version,
          event.metadata.correlationId,
          event.metadata.causationId,
          event.metadata.timestamp
        ]);

        // Publish to event bus
        await this.publishEvent(event);
      }

      // Update stream version
      const newVersion = expectedVersion + events.length;
      await transaction.query(`
        INSERT INTO stream_versions (stream_id, version)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE version = ?
      `, [streamId, newVersion, newVersion]);

      await transaction.commit();

      this.logger.info('Events saved successfully', {
        streamId,
        eventCount: events.length,
        newVersion,
      });

    } catch (error) {
      await transaction.rollback();
      this.logger.error('Failed to save events', { error, streamId, expectedVersion });
      throw error;
    }
  }

  async getEvents(streamId: string, fromVersion?: number): Promise<DomainEvent[]> {
    const query = fromVersion
      ? 'SELECT * FROM event_store WHERE stream_id = ? AND event_version > ? ORDER BY event_version'
      : 'SELECT * FROM event_store WHERE stream_id = ? ORDER BY event_version';

    const params = fromVersion ? [streamId, fromVersion] : [streamId];
    const rows = await this.database.query(query, params);

    return rows.map(row => ({
      eventId: row.event_id,
      eventType: row.event_type,
      aggregateId: row.stream_id,
      aggregateVersion: row.event_version,
      eventData: this.serializer.deserialize(row.event_data),
      metadata: {
        correlationId: row.correlation_id,
        causationId: row.causation_id,
        timestamp: row.timestamp,
        source: 'event-store',
      },
    }));
  }

  async getEventsByType(
    eventType: string,
    fromTimestamp?: Date,
    limit: number = 1000
  ): Promise<DomainEvent[]> {
    const query = fromTimestamp
      ? 'SELECT * FROM event_store WHERE event_type = ? AND timestamp > ? ORDER BY timestamp LIMIT ?'
      : 'SELECT * FROM event_store WHERE event_type = ? ORDER BY timestamp LIMIT ?';

    const params = fromTimestamp ? [eventType, fromTimestamp, limit] : [eventType, limit];
    const rows = await this.database.query(query, params);

    return rows.map(row => this.mapRowToEvent(row));
  }

  // Snapshot management for performance
  async saveSnapshot(streamId: string, snapshot: AggregateSnapshot): Promise<void> {
    await this.database.query(`
      INSERT INTO snapshots (stream_id, snapshot_version, snapshot_data, created_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        snapshot_version = VALUES(snapshot_version),
        snapshot_data = VALUES(snapshot_data),
        created_at = NOW()
    `, [
      streamId,
      snapshot.version,
      this.serializer.serialize(snapshot.data)
    ]);
  }

  async getSnapshot(streamId: string): Promise<AggregateSnapshot | null> {
    const rows = await this.database.query(
      'SELECT * FROM snapshots WHERE stream_id = ? ORDER BY snapshot_version DESC LIMIT 1',
      [streamId]
    );

    if (rows.length === 0) {
      return null;
    }

    const row = rows[0];
    return {
      streamId: row.stream_id,
      version: row.snapshot_version,
      data: this.serializer.deserialize(row.snapshot_data),
      createdAt: row.created_at,
    };
  }
}

// services/order-service/events/order-saga.ts
export class OrderProcessingSaga {
  constructor(
    private eventBus: EventBus,
    private paymentService: PaymentService,
    private inventoryService: InventoryService,
    private shippingService: ShippingService,
    private eventStore: EventStore,
    private logger: Logger
  ) {
    this.registerEventHandlers();
  }

  private registerEventHandlers(): void {
    this.eventBus.subscribe('OrderPlaced', this);
    this.eventBus.subscribe('PaymentProcessed', this);
    this.eventBus.subscribe('PaymentFailed', this);
    this.eventBus.subscribe('InventoryReserved', this);
    this.eventBus.subscribe('InventoryReservationFailed', this);
    this.eventBus.subscribe('ShippingArranged', this);
    this.eventBus.subscribe('ShippingFailed', this);
  }

  async handle(event: DomainEvent): Promise<void> {
    const sagaId = this.getSagaId(event);
    const saga = await this.loadSaga(sagaId);

    try {
      // Apply event to saga state
      const newSaga = await this.applyEventToSaga(saga, event);

      // Generate commands based on new state
      const commands = await this.generateCommands(newSaga, event);

      // Execute commands
      for (const command of commands) {
        await this.executeCommand(command);
      }

      // Save saga state
      await this.saveSaga(newSaga);

      this.logger.info('Saga event processed', {
        sagaId,
        eventType: event.eventType,
        sagaStatus: newSaga.status,
      });

    } catch (error) {
      this.logger.error('Saga processing failed', { error, sagaId, eventType: event.eventType });

      // Trigger compensation
      await this.startCompensation(saga, error);
      throw error;
    }
  }

  private async applyEventToSaga(saga: OrderSaga, event: DomainEvent): Promise<OrderSaga> {
    const newSaga = { ...saga };

    switch (event.eventType) {
      case 'OrderPlaced':
        newSaga.status = 'payment_pending';
        newSaga.orderData = event.eventData;
        break;

      case 'PaymentProcessed':
        newSaga.status = 'inventory_pending';
        newSaga.paymentId = event.eventData.paymentId;
        newSaga.compensationActions.push({
          type: 'refund_payment',
          data: { paymentId: event.eventData.paymentId },
        });
        break;

      case 'PaymentFailed':
        newSaga.status = 'payment_failed';
        break;

      case 'InventoryReserved':
        newSaga.status = 'shipping_pending';
        newSaga.reservationId = event.eventData.reservationId;
        newSaga.compensationActions.push({
          type: 'release_inventory',
          data: { reservationId: event.eventData.reservationId },
        });
        break;

      case 'ShippingArranged':
        newSaga.status = 'completed';
        break;

      default:
        this.logger.warn('Unhandled event type in saga', {
          eventType: event.eventType,
          sagaId: saga.id,
        });
    }

    return newSaga;
  }

  private async generateCommands(saga: OrderSaga, triggerEvent: DomainEvent): Promise<SagaCommand[]> {
    const commands: SagaCommand[] = [];

    switch (saga.status) {
      case 'payment_pending':
        commands.push({
          type: 'process_payment',
          targetService: 'payment-service',
          data: {
            orderId: saga.orderData.id,
            amount: saga.orderData.totalAmount,
            paymentMethod: saga.orderData.paymentMethod,
          },
        });
        break;

      case 'inventory_pending':
        commands.push({
          type: 'reserve_inventory',
          targetService: 'inventory-service',
          data: {
            orderId: saga.orderData.id,
            items: saga.orderData.items,
          },
        });
        break;

      case 'shipping_pending':
        commands.push({
          type: 'arrange_shipping',
          targetService: 'shipping-service',
          data: {
            orderId: saga.orderData.id,
            shippingAddress: saga.orderData.shippingAddress,
            items: saga.orderData.items,
          },
        });
        break;
    }

    return commands;
  }

  private async startCompensation(saga: OrderSaga, error: Error): Promise<void> {
    this.logger.info('Starting saga compensation', {
      sagaId: saga.id,
      error: error.message,
    });

    // Execute compensation actions in reverse order
    for (const compensation of saga.compensationActions.reverse()) {
      try {
        await this.executeCompensation(compensation);
      } catch (compensationError) {
        this.logger.error('Compensation action failed', {
          error: compensationError,
          compensation,
          sagaId: saga.id,
        });
      }
    }

    // Mark saga as compensated
    const compensatedSaga = {
      ...saga,
      status: 'compensated',
      compensationReason: error.message,
      compensatedAt: new Date(),
    };

    await this.saveSaga(compensatedSaga);

    // Publish compensation event
    await this.eventBus.publish({
      eventId: generateUuid(),
      eventType: 'OrderProcessingCompensated',
      aggregateId: saga.orderData.id,
      aggregateVersion: 1,
      eventData: {
        orderId: saga.orderData.id,
        reason: error.message,
        compensationActions: saga.compensationActions,
      },
      metadata: {
        correlationId: saga.id,
        timestamp: new Date().toISOString(),
        source: 'OrderProcessingSaga',
      },
    });
  }
}
```

## Service Mesh Implementation

### **Istio Service Mesh Architecture**
```yaml
Service_Mesh_Architecture:
  istio_components:
    control_plane:
      istiod:
        responsibilities:
          - "Configuration management and distribution"
          - "Certificate authority and key management"
          - "Service discovery and endpoint management"
          - "Traffic policy enforcement"

        configuration:
          resources: { cpu: "1000m", memory: "2Gi" }
          replicas: 3
          high_availability: true

    data_plane:
      envoy_sidecars:
        responsibilities:
          - "Traffic interception and routing"
          - "Load balancing and failover"
          - "Circuit breaking and retry logic"
          - "Mutual TLS enforcement"
          - "Telemetry collection"

        configuration:
          resources: { cpu: "100m", memory: "128Mi" }
          injection_policy: "enabled"
          proxy_config:
            concurrency: 2
            stats_config: { stats_tags: [{ tag_name: "service_name" }] }

    gateways:
      ingress_gateway:
        purpose: "External traffic entry point"
        configuration:
          load_balancer_type: "LoadBalancer"
          ports: [80, 443, 8080, 9090]
          tls_termination: true

      egress_gateway:
        purpose: "Controlled external service access"
        configuration:
          outbound_traffic_policy: "ALLOW_ANY"
          external_services: ["payment-providers", "shipping-apis", "analytics-services"]

Traffic_Management:
  virtual_services:
    routing_rules:
      path_based: "Route based on URL paths and HTTP headers"
      version_based: "Route to specific service versions"
      canary_deployment: "Gradual traffic shifting to new versions"
      fault_injection: "Testing resilience with controlled failures"

    example_configurations:
      user_service_routing:
        http_routes:
          - match: { uri: { prefix: "/api/v1/users" } }
            route: { destination: { host: "user-service", subset: "v1" } }
          - match: { uri: { prefix: "/api/v2/users" } }
            route: { destination: { host: "user-service", subset: "v2" } }

      canary_deployment:
        http_routes:
          - match: { headers: { "x-canary": "true" } }
            route: { destination: { host: "product-service", subset: "canary" } }
          - match: {}
            route:
              - destination: { host: "product-service", subset: "stable" }
                weight: 90
              - destination: { host: "product-service", subset: "canary" }
                weight: 10

  destination_rules:
    load_balancing:
      algorithms: ["ROUND_ROBIN", "LEAST_CONN", "RANDOM", "PASSTHROUGH"]
      session_affinity: "Cookie-based and header-based sticky sessions"

    circuit_breaker:
      connection_pool:
        tcp: { max_connections: 100, connect_timeout: "30s" }
        http: { http1_max_pending_requests: 50, http2_max_requests: 100 }

      outlier_detection:
        consecutive_errors: 5
        interval: "30s"
        base_ejection_time: "30s"
        max_ejection_percent: 50

Security_Features:
  mutual_tls:
    policy: "STRICT"
    configuration:
      certificate_management: "Automatic with 24-hour rotation"
      trust_domain: "cluster.local"
      root_ca: "Self-signed with custom intermediate CAs"

    peer_authentication:
      default_policy: "STRICT mTLS required for all services"
      exceptions: ["health-check endpoints", "metrics endpoints"]

  authorization_policies:
    rbac_rules:
      service_to_service: "Explicit allow-list for inter-service communication"
      external_access: "Controlled ingress with authentication requirements"

    jwt_validation:
      providers: ["auth0", "okta", "custom-issuer"]
      verification: "Signature validation and claims checking"
      forwarding: "JWT claims forwarded to upstream services"
```

### **Service Mesh Implementation**
```yaml
# istio/virtual-service-user-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: user-service
  namespace: production
spec:
  hosts:
  - user-service
  http:
  - match:
    - headers:
        x-canary:
          exact: "true"
    route:
    - destination:
        host: user-service
        subset: canary
  - match:
    - uri:
        prefix: "/api/v1/users"
    route:
    - destination:
        host: user-service
        subset: stable
      weight: 95
    - destination:
        host: user-service
        subset: canary
      weight: 5
    fault:
      delay:
        percentage:
          value: 0.1
        fixedDelay: 5s
    retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: 5xx,reset,connect-failure,refused-stream
    timeout: 10s

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: user-service
  namespace: production
spec:
  host: user-service
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
        connectTimeout: 30s
      http:
        http1MaxPendingRequests: 50
        http2MaxRequests: 100
        maxRequestsPerConnection: 10
        maxRetries: 3
        consecutiveGatewayErrors: 5
        interval: 30s
        baseEjectionTime: 30s
        maxEjectionPercent: 50
    loadBalancer:
      simple: LEAST_CONN
    outlierDetection:
      consecutiveGatewayErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
      minHealthPercent: 70
  subsets:
  - name: stable
    labels:
      version: stable
  - name: canary
    labels:
      version: canary

---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: user-service-authz
  namespace: production
spec:
  selector:
    matchLabels:
      app: user-service
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/production/sa/api-gateway"]
    to:
    - operation:
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
        paths: ["/api/v1/users/*"]
    when:
    - key: request.headers[authorization]
      values: ["Bearer *"]

  - from:
    - source:
        principals: ["cluster.local/ns/monitoring/sa/prometheus"]
    to:
    - operation:
        methods: ["GET"]
        paths: ["/metrics", "/health"]

---
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT

---
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: tanqory-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway
  servers:
  - port:
      number: 443
      name: https
      protocol: HTTPS
    tls:
      mode: SIMPLE
      credentialName: tanqory-tls-cert
    hosts:
    - api.tanqory.com
  - port:
      number: 80
      name: http
      protocol: HTTP
    hosts:
    - api.tanqory.com
    tls:
      httpsRedirect: true
```

## Integration Security & Monitoring

### **Security Standards**
```yaml
API_Security_Standards:
  authentication_requirements:
    service_to_service:
      method: "Mutual TLS with service certificates"
      certificate_rotation: "Automatic 24-hour rotation"
      validation: "Certificate chain validation with OCSP checking"

    client_to_service:
      methods: ["JWT Bearer tokens", "API Keys", "OAuth 2.0"]
      validation: "Signature verification and claims validation"
      rate_limiting: "Per-client and per-endpoint rate limits"

    platform_specific:
      mobile: "App attestation + biometric authentication"
      web: "JWT + CSRF protection + SameSite cookies"
      desktop: "Client certificate + code signing verification"
      iot: "Device certificate + hardware security module"

  authorization_enforcement:
    rbac_model:
      roles: ["admin", "user", "service", "readonly"]
      permissions: ["read", "write", "delete", "admin"]
      scopes: ["users", "products", "orders", "analytics"]

    attribute_based_control:
      attributes: ["user.id", "user.department", "resource.owner", "request.platform"]
      policies: "ABAC policies with fine-grained access control"

    dynamic_permissions:
      context_aware: "Location, time, device, and behavior-based access"
      risk_assessment: "Adaptive authentication based on risk scoring"

  data_protection:
    encryption_standards:
      at_rest: "AES-256 encryption with customer-managed keys"
      in_transit: "TLS 1.3 with perfect forward secrecy"
      application_level: "Field-level encryption for sensitive data"

    data_masking:
      pii_protection: "Automatic PII detection and masking"
      test_data: "Production data anonymization for testing"
      logging: "Structured logging with sensitive data redaction"

Monitoring_and_Observability:
  distributed_tracing:
    implementation: "Jaeger with OpenTelemetry instrumentation"
    sampling_strategy: "Adaptive sampling based on service load"
    trace_correlation: "Request ID propagation across all services"

    custom_spans:
      business_operations: "Order processing, payment flows, user journeys"
      external_calls: "Third-party API calls and database queries"
      async_operations: "Event processing and background tasks"

  metrics_collection:
    application_metrics:
      red_metrics: "Rate, Errors, Duration for all API endpoints"
      business_metrics: "User registrations, orders, revenue, feature usage"
      custom_metrics: "Domain-specific metrics per service"

    infrastructure_metrics:
      system_resources: "CPU, memory, disk, network usage"
      container_metrics: "Pod restarts, resource limits, health checks"
      service_mesh: "Request latency, success rates, circuit breaker state"

  logging_standards:
    structured_logging:
      format: "JSON with consistent field naming"
      correlation: "Request ID and trace ID in all log entries"
      context: "User ID, session ID, platform, service version"

    log_levels:
      error: "System errors, failed operations, security violations"
      warn: "Performance degradation, fallback scenarios, deprecated usage"
      info: "Business events, successful operations, state changes"
      debug: "Detailed flow information for troubleshooting"

  alerting_strategy:
    alert_categories:
      critical: "Service outages, security breaches, data corruption"
      warning: "Performance degradation, elevated error rates, capacity issues"
      info: "Deployment notifications, configuration changes"

    notification_channels:
      immediate: "PagerDuty for critical alerts"
      batched: "Slack for warning and info alerts"
      dashboard: "Grafana for real-time monitoring"
```

### **Security and Monitoring Implementation**
```typescript
// shared/security/auth-middleware.ts
export class UniversalAuthMiddleware {
  constructor(
    private jwtValidator: JwtValidator,
    private rbacEngine: RbacEngine,
    private riskAssessment: RiskAssessmentService,
    private auditLogger: AuditLogger
  ) {}

  async authenticate(request: ApiRequest): Promise<AuthContext> {
    const startTime = Date.now();

    try {
      // Extract authentication credentials
      const credentials = this.extractCredentials(request);

      // Validate credentials
      const authResult = await this.validateCredentials(credentials, request.platform);

      if (!authResult.valid) {
        await this.auditLogger.logAuthFailure(request, authResult.reason);
        throw new UnauthorizedError(authResult.reason);
      }

      // Risk assessment
      const riskScore = await this.riskAssessment.assessRequest(request, authResult.user);

      if (riskScore > this.config.riskThreshold) {
        await this.auditLogger.logHighRiskAccess(request, authResult.user, riskScore);

        if (riskScore > this.config.blockThreshold) {
          throw new ForbiddenError('High risk access blocked');
        }
      }

      // Create auth context
      const authContext: AuthContext = {
        user: authResult.user,
        platform: request.platform,
        permissions: await this.rbacEngine.getUserPermissions(authResult.user),
        riskScore,
        authenticatedAt: new Date(),
      };

      // Log successful authentication
      await this.auditLogger.logAuthSuccess(request, authContext);

      return authContext;

    } catch (error) {
      const processingTime = Date.now() - startTime;

      // Record metrics
      this.metrics.recordAuthenticationAttempt(request.platform, false, processingTime);

      throw error;
    }
  }

  async authorize(authContext: AuthContext, resource: string, action: string): Promise<boolean> {
    try {
      // Check RBAC permissions
      const hasPermission = await this.rbacEngine.checkPermission(
        authContext.user,
        resource,
        action
      );

      if (!hasPermission) {
        await this.auditLogger.logAuthorizationFailure(authContext, resource, action);
        return false;
      }

      // Apply attribute-based access control
      const abacResult = await this.rbacEngine.evaluateABACPolicy(
        authContext,
        resource,
        action
      );

      if (!abacResult.allowed) {
        await this.auditLogger.logAuthorizationFailure(
          authContext,
          resource,
          action,
          abacResult.reason
        );
        return false;
      }

      return true;

    } catch (error) {
      this.logger.error('Authorization check failed', { error, authContext, resource, action });
      return false;
    }
  }
}

// shared/monitoring/tracing-middleware.ts
export class DistributedTracingMiddleware {
  constructor(
    private tracer: Tracer,
    private config: TracingConfig
  ) {}

  async trace<T>(
    operationName: string,
    operation: (span: Span) => Promise<T>,
    parentContext?: SpanContext
  ): Promise<T> {
    const span = this.tracer.startSpan(operationName, {
      childOf: parentContext,
      tags: {
        component: this.config.serviceName,
        version: this.config.serviceVersion,
      },
    });

    try {
      // Add business context to span
      span.setTag('platform', this.getCurrentPlatform());
      span.setTag('user.id', this.getCurrentUserId());

      // Execute operation
      const result = await operation(span);

      // Mark span as successful
      span.setTag('success', true);

      return result;

    } catch (error) {
      // Record error in span
      span.setTag('error', true);
      span.setTag('error.message', error.message);
      span.setTag('error.type', error.constructor.name);

      // Add error logs
      span.log({
        event: 'error',
        message: error.message,
        stack: error.stack,
      });

      throw error;

    } finally {
      span.finish();
    }
  }

  createChildSpan(parentSpan: Span, operationName: string): Span {
    return this.tracer.startSpan(operationName, {
      childOf: parentSpan,
      tags: {
        component: this.config.serviceName,
      },
    });
  }

  injectTraceContext(span: Span, headers: Record<string, string>): void {
    this.tracer.inject(span.context(), FORMAT_HTTP_HEADERS, headers);
  }

  extractTraceContext(headers: Record<string, string>): SpanContext | null {
    return this.tracer.extract(FORMAT_HTTP_HEADERS, headers);
  }
}

// shared/monitoring/metrics-collector.ts
export class MetricsCollector {
  private registry: Registry;
  private httpRequestDuration: Histogram<string>;
  private httpRequestsTotal: Counter<string>;
  private businessEventsTotal: Counter<string>;
  private errorRate: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code', 'platform'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'platform'],
      registers: [this.registry],
    });

    this.businessEventsTotal = new Counter({
      name: 'business_events_total',
      help: 'Total number of business events processed',
      labelNames: ['event_type', 'status'],
      registers: [this.registry],
    });

    this.errorRate = new Gauge({
      name: 'service_error_rate',
      help: 'Current error rate of the service',
      labelNames: ['time_window'],
      registers: [this.registry],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    platform: string
  ): void {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      platform,
    };

    this.httpRequestDuration.observe(labels, duration / 1000);
    this.httpRequestsTotal.inc(labels);
  }

  recordBusinessEvent(eventType: string, success: boolean): void {
    this.businessEventsTotal.inc({
      event_type: eventType,
      status: success ? 'success' : 'error',
    });
  }

  updateErrorRate(timeWindow: string, errorRate: number): void {
    this.errorRate.set({ time_window: timeWindow }, errorRate);
  }

  getMetrics(): string {
    return this.registry.metrics();
  }

  // Custom business metrics
  recordUserRegistration(platform: string, source: string): void {
    const userRegistrations = new Counter({
      name: 'user_registrations_total',
      help: 'Total number of user registrations',
      labelNames: ['platform', 'source'],
      registers: [this.registry],
    });

    userRegistrations.inc({ platform, source });
  }

  recordOrderPlaced(platform: string, orderValue: number): void {
    const ordersTotal = new Counter({
      name: 'orders_total',
      help: 'Total number of orders placed',
      labelNames: ['platform'],
      registers: [this.registry],
    });

    const orderValue = new Histogram({
      name: 'order_value_distribution',
      help: 'Distribution of order values',
      labelNames: ['platform'],
      buckets: [10, 50, 100, 500, 1000, 5000],
      registers: [this.registry],
    });

    ordersTotal.inc({ platform });
    orderValue.observe({ platform }, orderValue);
  }
}
```

---

## Quality Gates

### **API Integration Excellence**
- [ ] Unified API standards implemented across all services
- [ ] Comprehensive authentication and authorization framework
- [ ] Event-driven architecture with reliable message delivery
- [ ] Service mesh deployed with security and observability
- [ ] Platform-specific optimizations maintaining consistency

### **Technical Excellence**
- [ ] Circuit breaker and retry patterns implemented
- [ ] Distributed tracing across all integration points
- [ ] Comprehensive metrics collection and alerting
- [ ] Security scanning and vulnerability management
- [ ] Performance optimization for all communication patterns

## Success Metrics
- API reliability: >99.9% success rate across all endpoints
- Response time: <100ms p95 for synchronous APIs
- Event processing: <1s average processing time for business events
- Security: Zero critical vulnerabilities in production APIs
- Integration consistency: >95% compliance with unified standards

---

**Integration References:**
- `enterprise/unified_architecture_decision_framework.md` - Decision criteria for communication patterns
- `integration/01_cross_platform_integration.md` - Cross-platform integration strategies
- `enterprise/05_enterprise_microservice_template_guide.md` - Service implementation standards
- `enterprise/02_enterprise_architecture.md` - Enterprise architecture principles