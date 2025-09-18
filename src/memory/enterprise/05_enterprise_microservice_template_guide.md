---
title: Enterprise Microservice Template Guide
version: 1.0
owner: Platform Team
last_reviewed: 2025-09-16
next_review: 2025-12-16
classification: CONFIDENTIAL
scope: [Microservice_Standards, Development_Templates, Service_Architecture]
---

# Enterprise Microservice Template Guide

> **Enterprise Memory**: กำหนดมาตรฐานและ templates สำหรับการพัฒนา microservices ระดับ enterprise ที่ครอบคลุม service architecture, API design, data management, และ operational practices เพื่อให้ทีมพัฒนาสามารถสร้าง services ที่มีคุณภาพและสอดคล้องกับมาตรฐานองค์กร

## Table of Contents
- [Microservice Architecture Standards](#microservice-architecture-standards)
- [Service Template Structure](#service-template-structure)
- [API Design Guidelines](#api-design-guidelines)
- [Data Management Patterns](#data-management-patterns)
- [Testing & Quality Standards](#testing--quality-standards)
- [Deployment & Operations](#deployment--operations)

---

## Microservice Architecture Standards

### **Architecture Decision Reference**
> **Important**: See `unified_architecture_decision_framework.md` for complete decision criteria on when to use microservices vs monolith vs modular monolith.

**Quick Decision Points:**
- **Use Microservices when**: Team size >10 developers, high business complexity, independent scaling needs, strong DevOps practices
- **Use Modular Monolith when**: Medium complexity, 10-20 developers, preparing for future microservices migration
- **Use Traditional Monolith when**: Small teams <10 developers, low-medium complexity, simple deployment needs

### **Service Design Principles**
```yaml
Microservice_Design_Principles:
  single_responsibility:
    principle: "Each service owns a single business capability"
    implementation:
      - "One service per bounded context"
      - "Clear service boundaries aligned with business domains"
      - "Independent data ownership and lifecycle management"
    validation: "Service can be developed, deployed, and scaled independently"

  decentralized_governance:
    principle: "Teams own their services end-to-end"
    implementation:
      - "Technology choice freedom within enterprise constraints"
      - "Independent deployment pipelines"
      - "Team accountability for service lifecycle"
    validation: "Team can make technology decisions without external dependencies"

  failure_isolation:
    principle: "Service failures should not cascade"
    implementation:
      - "Circuit breaker patterns for external dependencies"
      - "Bulkhead isolation for different concerns"
      - "Graceful degradation capabilities"
    validation: "Service continues operating when dependencies fail"

  design_for_failure:
    principle: "Assume failures will happen and design accordingly"
    implementation:
      - "Retry policies with exponential backoff"
      - "Timeout configurations for all external calls"
      - "Health checks and observability instrumentation"
    validation: "Service handles various failure scenarios gracefully"

  evolutionary_design:
    principle: "Services evolve independently without breaking consumers"
    implementation:
      - "API versioning strategies"
      - "Backward compatibility maintenance"
      - "Consumer-driven contract testing"
    validation: "API changes don't break existing consumers"

Service_Boundaries:
  domain_driven_design:
    bounded_contexts: "Clear boundaries around business domains"
    ubiquitous_language: "Consistent terminology within service boundaries"
    context_mapping: "Explicit relationships between bounded contexts"

  data_ownership:
    database_per_service: "Each service owns its data exclusively"
    no_shared_databases: "No direct database access across services"
    data_consistency: "Eventual consistency via events and sagas"

  team_topology:
    stream_aligned_teams: "Teams aligned to business value streams"
    platform_teams: "Platform teams provide infrastructure and tooling"
    complicated_subsystem_teams: "Specialized teams for complex technical domains"

Service_Communication:
  architecture_strategy_reference: "See unified_architecture_decision_framework.md for hybrid communication approach"

  synchronous_patterns:
    rest_apis: "RESTful APIs for request-response communication"
    graphql: "GraphQL for complex data fetching scenarios"
    grpc: "gRPC for high-performance inter-service communication"
    use_cases: ["User-facing operations", "Real-time queries", "Simple CRUD operations", "Financial transactions requiring strong consistency"]

  asynchronous_patterns:
    event_driven: "Events for loose coupling and eventual consistency"
    message_queues: "Queues for reliable async processing"
    publish_subscribe: "Pub/sub for broadcasting domain events"
    use_cases: ["Business event processing", "Background tasks", "Data synchronization", "System integrations"]

  communication_guidelines:
    hybrid_approach: "Use the right communication pattern for the right use case"
    sync_for_queries: "Use synchronous communication for real-time queries and immediate consistency"
    async_for_events: "Use asynchronous communication for business events and eventual consistency"
    avoid_chatty_interfaces: "Minimize network round-trips with coarse-grained APIs"
    integration_reference: "See integration/02_api_integration_patterns.md for detailed implementation patterns"
```

### **Technology Stack Standards**
```yaml
Enterprise_Technology_Stack:
  programming_languages:
    primary: "TypeScript/Node.js"
    rationale: "Team expertise, ecosystem maturity, async performance"
    alternatives: ["Python for ML/data processing", "Go for system services"]

  web_frameworks:
    nodejs: "Express.js with enterprise middleware"
    features: [security_middleware, logging, metrics, health_checks]
    alternatives: ["Fastify for high-performance scenarios"]

  data_persistence:
    primary_database: "PostgreSQL"
    document_store: "MongoDB for flexible schemas"
    caching: "Redis for session and application caching"
    message_broker: "Apache Kafka for event streaming"

  observability_stack:
    monitoring: "Prometheus + Grafana"
    logging: "ELK Stack (Elasticsearch, Logstash, Kibana)"
    tracing: "Jaeger for distributed tracing"
    apm: "New Relic for application performance monitoring"

  development_tools:
    containerization: "Docker with multi-stage builds"
    orchestration: "Kubernetes with Helm charts"
    ci_cd: "GitLab CI/CD with automated testing"
    code_quality: "SonarQube for static analysis"

Standard_Libraries:
  common_libraries:
    authentication: "@tanqory/auth-middleware"
    logging: "@tanqory/structured-logger"
    metrics: "@tanqory/metrics-collector"
    configuration: "@tanqory/config-manager"
    database: "@tanqory/db-connector"
    messaging: "@tanqory/event-bus"

  utility_libraries:
    validation: "joi for request validation"
    serialization: "class-transformer for data transformation"
    http_client: "axios with retry and circuit breaker"
    testing: "jest with supertest for API testing"

  security_libraries:
    encryption: "@tanqory/crypto-utils"
    rate_limiting: "@tanqory/rate-limiter"
    input_sanitization: "@tanqory/sanitizer"
    audit_logging: "@tanqory/audit-logger"
```

## Service Template Structure

### **Standard Project Structure**
```yaml
Microservice_Project_Structure:
  root_directory:
    - "src/"                    # Source code
    - "tests/"                  # Test files
    - "docs/"                   # Service documentation
    - "scripts/"                # Build and deployment scripts
    - "config/"                 # Configuration files
    - "migrations/"             # Database migrations
    - "Dockerfile"              # Container definition
    - "docker-compose.yml"      # Local development environment
    - "package.json"            # Node.js dependencies and scripts
    - "tsconfig.json"           # TypeScript configuration
    - "jest.config.js"          # Test configuration
    - ".gitlab-ci.yml"          # CI/CD pipeline
    - "README.md"               # Service documentation

  src_directory_structure:
    - "src/controllers/"        # HTTP request handlers
    - "src/services/"           # Business logic
    - "src/repositories/"       # Data access layer
    - "src/models/"             # Data models and types
    - "src/middleware/"         # Custom middleware
    - "src/utils/"              # Utility functions
    - "src/config/"             # Configuration management
    - "src/events/"             # Event handlers and publishers
    - "src/validators/"         # Request validation schemas
    - "src/app.ts"              # Application setup
    - "src/server.ts"           # Server entry point

  tests_directory_structure:
    - "tests/unit/"             # Unit tests
    - "tests/integration/"      # Integration tests
    - "tests/e2e/"              # End-to-end tests
    - "tests/fixtures/"         # Test data fixtures
    - "tests/helpers/"          # Test utility functions
    - "tests/mocks/"            # Mock implementations

Configuration_Management:
  environment_variables:
    required_vars: [NODE_ENV, PORT, LOG_LEVEL, DATABASE_URL, REDIS_URL]
    optional_vars: [METRICS_PORT, HEALTH_CHECK_TIMEOUT, JWT_SECRET]
    validation: "Validate all required environment variables on startup"

  configuration_schema:
    server_config:
      port: "Application port (default: 3000)"
      timeout: "Request timeout (default: 30s)"
      cors: "CORS configuration"

    database_config:
      url: "Database connection string"
      pool_size: "Connection pool size (default: 10)"
      ssl: "SSL configuration for production"

    logging_config:
      level: "Log level (debug, info, warn, error)"
      format: "Log format (json for production, pretty for development)"

    metrics_config:
      enabled: "Enable metrics collection (default: true)"
      port: "Metrics endpoint port (default: 9090)"
      path: "Metrics endpoint path (default: /metrics)"

Service_Metadata:
  service_definition:
    name: "Service name (kebab-case)"
    version: "Semantic version"
    description: "Service purpose and capabilities"
    owner: "Team responsible for the service"
    domain: "Business domain the service belongs to"

  api_specification:
    openapi_version: "3.0.3"
    api_documentation: "Complete OpenAPI specification"
    contract_testing: "Consumer-driven contract tests"

  dependencies:
    internal_dependencies: "List of internal services this service depends on"
    external_dependencies: "List of external services and APIs"
    database_dependencies: "Database and data store dependencies"
```

### **Service Template Implementation**
```typescript
// src/app.ts - Application Setup Template
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { authMiddleware } from '@tanqory/auth-middleware';
import { loggingMiddleware } from '@tanqory/structured-logger';
import { metricsMiddleware } from '@tanqory/metrics-collector';
import { errorHandler } from './middleware/error-handler';
import { healthCheck } from './middleware/health-check';
import { routes } from './routes';

export class Application {
  private app: express.Application;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // Performance middleware
    this.app.use(compression());

    // Request processing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Observability middleware
    this.app.use(loggingMiddleware());
    this.app.use(metricsMiddleware());

    // Authentication middleware (applied to protected routes)
    this.app.use('/api', authMiddleware({
      exemptPaths: ['/health', '/metrics', '/docs']
    }));
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', healthCheck);

    // API routes
    this.app.use('/api/v1', routes);

    // API documentation
    this.app.use('/docs', express.static('docs/api'));
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use(errorHandler);
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// src/services/base-service.ts - Base Service Template
export abstract class BaseService {
  protected logger: Logger;
  protected metrics: MetricsCollector;

  constructor() {
    this.logger = createLogger(this.constructor.name);
    this.metrics = createMetricsCollector(this.constructor.name);
  }

  protected async executeWithMetrics<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const timer = this.metrics.startTimer(`${operation}_duration`);

    try {
      this.logger.info(`Starting ${operation}`);
      const result = await fn();
      this.metrics.incrementCounter(`${operation}_success`);
      this.logger.info(`Completed ${operation}`);
      return result;
    } catch (error) {
      this.metrics.incrementCounter(`${operation}_error`);
      this.logger.error(`Failed ${operation}:`, error);
      throw error;
    } finally {
      timer.end();
    }
  }

  protected validateInput<T>(data: any, schema: Joi.Schema): T {
    const { error, value } = schema.validate(data);
    if (error) {
      throw new ValidationError(error.details);
    }
    return value;
  }
}

// src/repositories/base-repository.ts - Base Repository Template
export abstract class BaseRepository<T> {
  protected db: DatabaseConnection;
  protected logger: Logger;
  protected tableName: string;

  constructor(tableName: string) {
    this.db = getDatabaseConnection();
    this.logger = createLogger(`${this.constructor.name}`);
    this.tableName = tableName;
  }

  async findById(id: string): Promise<T | null> {
    try {
      const result = await this.db.query(
        `SELECT * FROM ${this.tableName} WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error(`Error finding ${this.tableName} by id ${id}:`, error);
      throw new DatabaseError(`Failed to find ${this.tableName}`, error);
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map((_, index) => `$${index + 1}`);

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')}, created_at, updated_at)
        VALUES (${placeholders.join(', ')}, NOW(), NOW())
        RETURNING *
      `;

      const result = await this.db.query(query, values);
      return result.rows[0];
    } catch (error) {
      this.logger.error(`Error creating ${this.tableName}:`, error);
      throw new DatabaseError(`Failed to create ${this.tableName}`, error);
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`);

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause.join(', ')}, updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [id, ...values]);
      return result.rows[0] || null;
    } catch (error) {
      this.logger.error(`Error updating ${this.tableName} ${id}:`, error);
      throw new DatabaseError(`Failed to update ${this.tableName}`, error);
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        `UPDATE ${this.tableName} SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      this.logger.error(`Error soft deleting ${this.tableName} ${id}:`, error);
      throw new DatabaseError(`Failed to delete ${this.tableName}`, error);
    }
  }
}
```

## API Design Guidelines

### **RESTful API Standards**
```yaml
REST_API_Design:
  resource_naming:
    conventions:
      - "Use nouns for resource names (not verbs)"
      - "Use plural nouns for collections (/users, /orders)"
      - "Use kebab-case for multi-word resources (/user-profiles)"
      - "Nest resources logically (/users/{id}/orders)"

    examples:
      correct: ["/api/v1/users", "/api/v1/orders/{id}/items"]
      incorrect: ["/api/v1/getUsers", "/api/v1/user", "/api/v1/Order"]

  http_methods:
    get: "Retrieve resource(s) - must be idempotent and safe"
    post: "Create new resource or execute non-idempotent operations"
    put: "Replace entire resource - must be idempotent"
    patch: "Partial update of resource - should be idempotent"
    delete: "Remove resource - must be idempotent"

  status_codes:
    success_codes:
      200: "OK - Successful GET, PUT, PATCH"
      201: "Created - Successful POST that creates a resource"
      202: "Accepted - Request accepted but processing not complete"
      204: "No Content - Successful DELETE or PUT with no response body"

    client_error_codes:
      400: "Bad Request - Invalid request syntax or data"
      401: "Unauthorized - Authentication required"
      403: "Forbidden - Authentication provided but insufficient permissions"
      404: "Not Found - Resource does not exist"
      409: "Conflict - Resource conflict (e.g., duplicate creation)"
      422: "Unprocessable Entity - Valid syntax but semantic errors"
      429: "Too Many Requests - Rate limit exceeded"

    server_error_codes:
      500: "Internal Server Error - Generic server error"
      502: "Bad Gateway - Invalid response from upstream server"
      503: "Service Unavailable - Service temporarily unavailable"
      504: "Gateway Timeout - Timeout from upstream server"

  response_formatting:
    success_response:
      structure: { data: "resource_data", meta: "pagination_info" }
      single_resource: { data: { id: "123", name: "example" } }
      collection: { data: [...], meta: { total: 100, page: 1, limit: 20 } }

    error_response:
      structure: { error: { code: "error_code", message: "description", details: {...} } }
      validation_errors: { error: { code: "validation_error", details: { field: ["error messages"] } } }

API_Versioning:
  versioning_strategy: "URL path versioning (/api/v1/, /api/v2/)"
  version_lifecycle:
    - "Support current version + 1 previous version"
    - "6-month deprecation notice for version sunset"
    - "Clear migration documentation for version transitions"

  backward_compatibility:
    - "Additive changes don't require version bump (new optional fields)"
    - "Breaking changes require new version (field removal, type changes)"
    - "Default values for new required fields in existing versions"

Pagination_Standards:
  offset_based:
    parameters: { limit: "page_size", offset: "items_to_skip" }
    response: { data: [...], meta: { total: 1000, limit: 20, offset: 40 } }
    max_limit: 100

  cursor_based:
    parameters: { limit: "page_size", after: "cursor_value" }
    response: { data: [...], meta: { has_next: true, next_cursor: "xyz" } }
    use_cases: "Large datasets, real-time data"

Filtering_Sorting:
  filtering:
    query_parameters: "?status=active&created_after=2025-01-01"
    complex_filters: "?filter[status]=active&filter[tags][in]=urgent,important"

  sorting:
    single_field: "?sort=created_at"
    multiple_fields: "?sort=priority,-created_at"
    default_sort: "Always provide default sorting for consistent results"

  searching:
    full_text_search: "?q=search_term"
    field_specific: "?search[name]=john&search[email]=example.com"
```

### **API Documentation Standards**
```yaml
OpenAPI_Specification:
  required_sections:
    info:
      title: "Service Name API"
      version: "1.0.0"
      description: "Comprehensive service description"
      contact: { name: "Team Name", email: "team@tanqory.com" }

    servers:
      - url: "https://api.tanqory.com/service-name/v1"
        description: "Production server"
      - url: "https://staging-api.tanqory.com/service-name/v1"
        description: "Staging server"

    paths: "Complete endpoint documentation with examples"
    components: "Reusable schemas, responses, parameters"
    security: "Authentication and authorization schemes"

  documentation_requirements:
    endpoint_documentation:
      - "Clear description of endpoint purpose"
      - "Request/response examples for all scenarios"
      - "Error response examples with status codes"
      - "Parameter descriptions and constraints"

    schema_documentation:
      - "Field descriptions and business rules"
      - "Data type specifications and formats"
      - "Required vs optional field indicators"
      - "Example values for complex types"

    authentication_documentation:
      - "Authentication method descriptions"
      - "Required headers and token formats"
      - "Authorization scope requirements"
      - "Error handling for auth failures"

Contract_Testing:
  consumer_driven_contracts:
    tools: "Pact for contract testing"
    workflow:
      1. "Consumer defines expected API behavior"
      2. "Provider validates against consumer expectations"
      3. "Automated contract verification in CI/CD"

  api_compatibility_testing:
    breaking_change_detection: "Automated detection of API breaking changes"
    regression_testing: "Automated testing of API behavior consistency"
    performance_testing: "API response time and throughput validation"
```

## Data Management Patterns

### **Database Patterns**
```yaml
Database_Design_Patterns:
  database_per_service:
    principle: "Each microservice owns its data exclusively"
    implementation:
      - "Dedicated database instance per service"
      - "No direct database access across services"
      - "Service APIs as the only data access interface"

    data_consistency:
      local_transactions: "ACID transactions within service boundaries"
      distributed_transactions: "Avoid distributed transactions, use saga pattern"
      eventual_consistency: "Accept eventual consistency for cross-service operations"

  data_access_patterns:
    repository_pattern:
      purpose: "Abstract data access logic from business logic"
      implementation: "Repository interface with concrete implementations"
      benefits: ["testability", "maintainability", "database_independence"]

    active_record_pattern:
      purpose: "Domain objects with data access methods"
      implementation: "Model classes with save/find/delete methods"
      use_cases: "Simple CRUD operations with minimal business logic"

    data_mapper_pattern:
      purpose: "Separate domain objects from database representation"
      implementation: "Mapper classes handle object-relational mapping"
      use_cases: "Complex domain logic with rich object models"

Event_Sourcing:
  principles:
    - "Store all changes as immutable events"
    - "Reconstruct current state by replaying events"
    - "Events as the source of truth"

  implementation:
    event_store: "Append-only storage for domain events"
    snapshots: "Periodic snapshots for performance optimization"
    projections: "Read models derived from event streams"

  benefits:
    - "Complete audit trail of all changes"
    - "Ability to replay and debug system state"
    - "Temporal queries and analytics"
    - "Natural integration with event-driven architecture"

CQRS_Pattern:
  command_query_separation:
    commands: "Operations that change state (writes)"
    queries: "Operations that read state (reads)"
    separation: "Different models and possibly different databases"

  implementation:
    command_side:
      - "Domain models optimized for business logic"
      - "Transactional consistency requirements"
      - "Event publishing for state changes"

    query_side:
      - "Read models optimized for specific queries"
      - "Eventual consistency acceptable"
      - "Denormalized views for performance"

  synchronization:
    event_handlers: "Update read models based on domain events"
    projection_rebuilding: "Ability to rebuild read models from events"
    consistency_monitoring: "Monitor synchronization lag between command and query sides"

Data_Migration_Strategies:
  zero_downtime_migrations:
    expand_contract_pattern:
      expand: "Add new fields/tables alongside existing ones"
      migrate: "Gradually migrate data and update application code"
      contract: "Remove old fields/tables after migration complete"

    dual_writing:
      approach: "Write to both old and new schema during transition"
      validation: "Compare data consistency between schemas"
      cutover: "Switch reads to new schema when ready"

  backward_compatibility:
    schema_evolution: "Additive changes that don't break existing code"
    default_values: "Provide defaults for new required fields"
    optional_fields: "Make new fields optional initially"

  rollback_strategies:
    reversible_migrations: "All migrations must be reversible"
    data_preservation: "Preserve data during rollbacks"
    validation_scripts: "Scripts to validate migration success"
```

### **Data Access Implementation**
```typescript
// Database Configuration and Connection Management
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  poolSize: number;
  connectionTimeout: number;
}

export class DatabaseManager {
  private pool: Pool;
  private config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.pool = new Pool({
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl,
      max: config.poolSize,
      connectionTimeoutMillis: config.connectionTimeout,
      idleTimeoutMillis: 30000,
      maxUses: 7500
    });

    this.pool.on('error', (err) => {
      logger.error('Database pool error:', err);
    });
  }

  async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const client = await this.pool.connect();
    try {
      const start = Date.now();
      const result = await client.query(text, params);
      const duration = Date.now() - start;

      logger.debug('Database query executed', {
        query: text,
        duration,
        rowCount: result.rowCount
      });

      return result;
    } finally {
      client.release();
    }
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

// Event Sourcing Implementation
export interface DomainEvent {
  eventId: string;
  aggregateId: string;
  eventType: string;
  eventData: any;
  eventVersion: number;
  timestamp: Date;
  metadata?: any;
}

export class EventStore {
  constructor(private db: DatabaseManager) {}

  async saveEvents(
    aggregateId: string,
    events: DomainEvent[],
    expectedVersion: number
  ): Promise<void> {
    await this.db.transaction(async (client) => {
      // Check current version
      const versionResult = await client.query(
        'SELECT version FROM aggregates WHERE id = $1 FOR UPDATE',
        [aggregateId]
      );

      const currentVersion = versionResult.rows[0]?.version || 0;

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(
          `Expected version ${expectedVersion}, but current version is ${currentVersion}`
        );
      }

      // Save events
      for (const event of events) {
        await client.query(
          `INSERT INTO events (event_id, aggregate_id, event_type, event_data, event_version, timestamp, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            event.eventId,
            event.aggregateId,
            event.eventType,
            JSON.stringify(event.eventData),
            event.eventVersion,
            event.timestamp,
            JSON.stringify(event.metadata)
          ]
        );
      }

      // Update aggregate version
      const newVersion = currentVersion + events.length;
      await client.query(
        `INSERT INTO aggregates (id, version) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET version = $2`,
        [aggregateId, newVersion]
      );
    });
  }

  async getEvents(aggregateId: string, fromVersion?: number): Promise<DomainEvent[]> {
    const query = fromVersion
      ? 'SELECT * FROM events WHERE aggregate_id = $1 AND event_version > $2 ORDER BY event_version'
      : 'SELECT * FROM events WHERE aggregate_id = $1 ORDER BY event_version';

    const params = fromVersion ? [aggregateId, fromVersion] : [aggregateId];
    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      eventId: row.event_id,
      aggregateId: row.aggregate_id,
      eventType: row.event_type,
      eventData: JSON.parse(row.event_data),
      eventVersion: row.event_version,
      timestamp: row.timestamp,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }

  async getEventsByType(
    eventType: string,
    fromTimestamp?: Date,
    limit: number = 100
  ): Promise<DomainEvent[]> {
    const query = fromTimestamp
      ? 'SELECT * FROM events WHERE event_type = $1 AND timestamp > $2 ORDER BY timestamp LIMIT $3'
      : 'SELECT * FROM events WHERE event_type = $1 ORDER BY timestamp LIMIT $2';

    const params = fromTimestamp ? [eventType, fromTimestamp, limit] : [eventType, limit];
    const result = await this.db.query(query, params);

    return result.rows.map(row => ({
      eventId: row.event_id,
      aggregateId: row.aggregate_id,
      eventType: row.event_type,
      eventData: JSON.parse(row.event_data),
      eventVersion: row.event_version,
      timestamp: row.timestamp,
      metadata: JSON.parse(row.metadata || '{}')
    }));
  }
}

// CQRS Read Model Implementation
export abstract class ReadModelProjection {
  constructor(
    protected db: DatabaseManager,
    protected eventStore: EventStore
  ) {}

  abstract getHandledEventTypes(): string[];
  abstract handle(event: DomainEvent): Promise<void>;

  async project(fromTimestamp?: Date): Promise<void> {
    const eventTypes = this.getHandledEventTypes();

    for (const eventType of eventTypes) {
      const events = await this.eventStore.getEventsByType(eventType, fromTimestamp);

      for (const event of events) {
        await this.handle(event);
      }
    }
  }

  async rebuild(): Promise<void> {
    // Clear existing read model data
    await this.clearReadModel();

    // Rebuild from all events
    await this.project();
  }

  protected abstract clearReadModel(): Promise<void>;
}

// Example: User Profile Read Model
export class UserProfileProjection extends ReadModelProjection {
  getHandledEventTypes(): string[] {
    return ['UserRegistered', 'UserProfileUpdated', 'UserDeactivated'];
  }

  async handle(event: DomainEvent): Promise<void> {
    switch (event.eventType) {
      case 'UserRegistered':
        await this.handleUserRegistered(event);
        break;
      case 'UserProfileUpdated':
        await this.handleUserProfileUpdated(event);
        break;
      case 'UserDeactivated':
        await this.handleUserDeactivated(event);
        break;
    }
  }

  private async handleUserRegistered(event: DomainEvent): Promise<void> {
    const { userId, email, name, registeredAt } = event.eventData;

    await this.db.query(
      `INSERT INTO user_profiles (user_id, email, name, status, created_at, updated_at)
       VALUES ($1, $2, $3, 'active', $4, $4)`,
      [userId, email, name, registeredAt]
    );
  }

  private async handleUserProfileUpdated(event: DomainEvent): Promise<void> {
    const { userId, updates } = event.eventData;
    const updateFields = Object.keys(updates);
    const updateValues = Object.values(updates);

    if (updateFields.length === 0) return;

    const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`);
    const query = `
      UPDATE user_profiles
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE user_id = $1
    `;

    await this.db.query(query, [userId, ...updateValues]);
  }

  private async handleUserDeactivated(event: DomainEvent): Promise<void> {
    const { userId } = event.eventData;

    await this.db.query(
      'UPDATE user_profiles SET status = $1, updated_at = NOW() WHERE user_id = $2',
      ['inactive', userId]
    );
  }

  protected async clearReadModel(): Promise<void> {
    await this.db.query('TRUNCATE TABLE user_profiles');
  }
}
```

## Testing & Quality Standards

### **Testing Strategy**
```yaml
Testing_Pyramid:
  unit_tests:
    coverage_target: ">= 80%"
    scope: "Individual functions and classes"
    characteristics: [fast_execution, isolated, deterministic]
    tools: [jest, sinon_for_mocking, nyc_for_coverage]

  integration_tests:
    coverage_target: ">= 70%"
    scope: "Service integration points and external dependencies"
    characteristics: [realistic_environment, actual_dependencies, longer_execution]
    tools: [jest, testcontainers, supertest]

  contract_tests:
    coverage_target: "100% of external API integrations"
    scope: "API contracts between services"
    characteristics: [consumer_driven, provider_verification, contract_evolution]
    tools: [pact, postman_contract_tests]

  end_to_end_tests:
    coverage_target: "Critical user journeys"
    scope: "Complete workflows across multiple services"
    characteristics: [production_like_environment, real_integrations, comprehensive_scenarios]
    tools: [cypress, playwright, api_testing_tools]

Test_Organization:
  test_file_structure:
    unit_tests: "tests/unit/**/*.test.ts"
    integration_tests: "tests/integration/**/*.test.ts"
    e2e_tests: "tests/e2e/**/*.test.ts"
    fixtures: "tests/fixtures/**/*.ts"
    helpers: "tests/helpers/**/*.ts"

  test_naming_conventions:
    describe_blocks: "Feature or class being tested"
    test_cases: "Should do something when condition"
    file_names: "ComponentName.test.ts"

Quality_Gates:
  automated_quality_checks:
    - "Unit test coverage >= 80%"
    - "Integration test coverage >= 70%"
    - "All tests passing"
    - "No critical security vulnerabilities"
    - "Code quality score >= 8.0"
    - "Performance benchmarks met"

  code_quality_metrics:
    complexity: "Cyclomatic complexity < 10 per function"
    duplication: "Code duplication < 3%"
    maintainability: "Maintainability index > 70"
    security: "Zero high/critical security issues"

Performance_Testing:
  load_testing:
    tools: [artillery, k6, jmeter]
    scenarios: [normal_load, peak_load, stress_testing, spike_testing]
    metrics: [response_time, throughput, error_rate, resource_utilization]

  benchmarking:
    baseline_performance: "Establish baseline metrics for all endpoints"
    regression_detection: "Detect performance regressions in CI/CD"
    performance_budgets: "Define acceptable performance thresholds"

Security_Testing:
  static_analysis:
    tools: [sonarqube, eslint_security, npm_audit]
    scope: "Code vulnerabilities, dependency scanning, secret detection"

  dynamic_analysis:
    tools: [owasp_zap, burp_suite, nmap]
    scope: "Runtime vulnerabilities, penetration testing"

  dependency_scanning:
    tools: [snyk, npm_audit, dependabot]
    frequency: "Daily automated scans"
    action: "Automatic PR creation for vulnerability fixes"
```

### **Testing Implementation Examples**
```typescript
// tests/unit/services/UserService.test.ts
import { UserService } from '../../../src/services/UserService';
import { UserRepository } from '../../../src/repositories/UserRepository';
import { EventBus } from '../../../src/events/EventBus';
import { ValidationError, NotFoundError } from '../../../src/errors';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn()
    } as any;

    mockEventBus = {
      publish: jest.fn()
    } as any;

    userService = new UserService(mockUserRepository, mockEventBus);
  });

  describe('createUser', () => {
    it('should create user when valid data provided', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };
      const createdUser = { id: '123', ...userData };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toEqual(createdUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
      expect(mockEventBus.publish).toHaveBeenCalledWith('UserCreated', {
        userId: '123',
        email: userData.email,
        name: userData.name
      });
    });

    it('should throw ValidationError when user already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        name: 'Existing User'
      };
      const existingUser = { id: '456', ...userData };

      mockUserRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow(ValidationError);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockEventBus.publish).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      // Arrange
      const userId = '123';
      const user = { id: userId, email: 'test@example.com', name: 'Test User' };

      mockUserRepository.findById.mockResolvedValue(user);

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toEqual(user);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundError when user not found', async () => {
      // Arrange
      const userId = '999';
      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById(userId))
        .rejects.toThrow(NotFoundError);
    });
  });
});

// tests/integration/api/users.test.ts
import request from 'supertest';
import { Application } from '../../../src/app';
import { setupTestDatabase, cleanupTestDatabase } from '../../helpers/database';
import { createTestUser, getAuthToken } from '../../helpers/auth';

describe('Users API', () => {
  let app: express.Application;
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    app = new Application().getApp();
    authToken = await getAuthToken();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/v1/users', () => {
    it('should create new user with valid data', async () => {
      // Arrange
      const userData = {
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      // Assert
      expect(response.body.data).toMatchObject({
        email: userData.email,
        name: userData.name,
        role: userData.role
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.createdAt).toBeDefined();
    });

    it('should return validation error for invalid email', async () => {
      // Arrange
      const invalidUserData = {
        email: 'invalid-email',
        name: 'Test User'
      };

      // Act
      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUserData)
        .expect(422);

      // Assert
      expect(response.body.error.code).toBe('validation_error');
      expect(response.body.error.details.email).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User'
      };

      // Act & Assert
      await request(app)
        .post('/api/v1/users')
        .send(userData)
        .expect(401);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('should return user when found', async () => {
      // Arrange
      const testUser = await createTestUser({
        email: 'gettest@example.com',
        name: 'Get Test User'
      });

      // Act
      const response = await request(app)
        .get(`/api/v1/users/${testUser.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Assert
      expect(response.body.data).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        name: testUser.name
      });
    });

    it('should return 404 when user not found', async () => {
      // Act & Assert
      await request(app)
        .get('/api/v1/users/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

// tests/e2e/user-lifecycle.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Lifecycle', () => {
  test('complete user registration and profile management flow', async ({ page }) => {
    // Navigate to registration page
    await page.goto('/register');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'e2etest@example.com');
    await page.fill('[data-testid="name-input"]', 'E2E Test User');
    await page.fill('[data-testid="password-input"]', 'SecurePassword123!');
    await page.click('[data-testid="register-button"]');

    // Verify successful registration
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');

    // Navigate to profile page
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL('/profile');

    // Verify profile information
    await expect(page.locator('[data-testid="user-email"]')).toHaveText('e2etest@example.com');
    await expect(page.locator('[data-testid="user-name"]')).toHaveText('E2E Test User');

    // Update profile
    await page.click('[data-testid="edit-profile-button"]');
    await page.fill('[data-testid="name-input"]', 'Updated E2E User');
    await page.click('[data-testid="save-button"]');

    // Verify update
    await expect(page.locator('[data-testid="user-name"]')).toHaveText('Updated E2E User');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

## Deployment & Operations

### **Containerization Standards**
```yaml
Docker_Standards:
  dockerfile_structure:
    multi_stage_builds: "Use multi-stage builds for optimization"
    base_images: "Use official, minimal base images (node:18-alpine)"
    security: "Run as non-root user, scan for vulnerabilities"
    caching: "Optimize layer caching for faster builds"

  dockerfile_template: |
    # Build stage
    FROM node:18-alpine AS builder
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --only=production && npm cache clean --force
    COPY . .
    RUN npm run build

    # Production stage
    FROM node:18-alpine AS production
    RUN addgroup -g 1001 -S nodejs && adduser -S nodeuser -u 1001
    WORKDIR /app
    COPY --from=builder --chown=nodeuser:nodejs /app/dist ./dist
    COPY --from=builder --chown=nodeuser:nodejs /app/node_modules ./node_modules
    COPY --chown=nodeuser:nodejs package*.json ./

    USER nodeuser
    EXPOSE 3000
    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
      CMD curl -f http://localhost:3000/health || exit 1

    CMD ["node", "dist/server.js"]

  image_optimization:
    size_targets: "< 100MB for typical Node.js services"
    layer_optimization: "Minimize layers and use .dockerignore"
    security_scanning: "Automated vulnerability scanning in CI/CD"

Kubernetes_Deployment:
  resource_specifications:
    cpu_requests: "100m (0.1 CPU cores) minimum"
    cpu_limits: "500m (0.5 CPU cores) default"
    memory_requests: "128Mi minimum"
    memory_limits: "512Mi default"
    scaling: "Horizontal Pod Autoscaler (HPA) configuration"

  deployment_template: |
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: {{ .Values.serviceName }}
      labels:
        app: {{ .Values.serviceName }}
        version: {{ .Values.version }}
    spec:
      replicas: {{ .Values.replicaCount }}
      selector:
        matchLabels:
          app: {{ .Values.serviceName }}
      template:
        metadata:
          labels:
            app: {{ .Values.serviceName }}
            version: {{ .Values.version }}
        spec:
          containers:
          - name: {{ .Values.serviceName }}
            image: {{ .Values.image.repository }}:{{ .Values.image.tag }}
            ports:
            - containerPort: 3000
              name: http
            - containerPort: 9090
              name: metrics
            env:
            - name: NODE_ENV
              value: "production"
            - name: LOG_LEVEL
              value: {{ .Values.logLevel }}
            resources:
              requests:
                cpu: {{ .Values.resources.requests.cpu }}
                memory: {{ .Values.resources.requests.memory }}
              limits:
                cpu: {{ .Values.resources.limits.cpu }}
                memory: {{ .Values.resources.limits.memory }}
            livenessProbe:
              httpGet:
                path: /health
                port: 3000
              initialDelaySeconds: 30
              periodSeconds: 10
            readinessProbe:
              httpGet:
                path: /health/ready
                port: 3000
              initialDelaySeconds: 5
              periodSeconds: 5

  service_mesh:
    istio_integration: "Automatic sidecar injection for observability"
    traffic_management: "Canary deployments and traffic splitting"
    security: "mTLS for service-to-service communication"

Observability_Requirements:
  logging:
    structured_logging: "JSON format with correlation IDs"
    log_levels: "Configurable log levels (debug, info, warn, error)"
    centralized_logging: "ELK stack integration"

  metrics:
    prometheus_metrics: "Custom business and technical metrics"
    standard_metrics: "RED metrics (Rate, Errors, Duration)"
    alerting: "Prometheus AlertManager integration"

  tracing:
    distributed_tracing: "Jaeger integration for request tracing"
    trace_sampling: "Configurable sampling rates"
    correlation: "Trace and log correlation"

  health_checks:
    liveness_probe: "Basic application health endpoint"
    readiness_probe: "Ready to receive traffic check"
    startup_probe: "Slower startup applications support"
```

### **CI/CD Pipeline Standards**
```yaml
Pipeline_Stages:
  source_control:
    branching_strategy: "GitFlow with feature branches"
    commit_conventions: "Conventional commits for automated versioning"
    pull_request_requirements: [code_review, tests_passing, security_scan]

  continuous_integration:
    trigger: "On every commit to feature branches and main"
    stages:
      1. "Code checkout and dependency installation"
      2. "Linting and code quality checks"
      3. "Unit tests with coverage reporting"
      4. "Security vulnerability scanning"
      5. "Docker image build and registry push"
      6. "Integration tests with test environment"

  continuous_deployment:
    environments: [development, staging, production]
    deployment_strategy:
      development: "Automatic deployment on successful CI"
      staging: "Automatic deployment from main branch"
      production: "Manual approval with automated deployment"

    deployment_patterns:
      blue_green: "Zero-downtime deployments with traffic switching"
      canary: "Gradual traffic shifting to new version"
      rolling: "Sequential pod replacement"

Pipeline_Configuration:
  gitlab_ci_template: |
    stages:
      - lint
      - test
      - build
      - security
      - deploy-dev
      - deploy-staging
      - deploy-prod

    variables:
      DOCKER_DRIVER: overlay2
      DOCKER_TLS_CERTDIR: "/certs"

    lint:
      stage: lint
      image: node:18-alpine
      script:
        - npm ci
        - npm run lint
        - npm run type-check
      rules:
        - if: $CI_PIPELINE_SOURCE == "merge_request_event"
        - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

    test:
      stage: test
      image: node:18-alpine
      services:
        - postgres:13-alpine
        - redis:6-alpine
      script:
        - npm ci
        - npm run test:unit
        - npm run test:integration
      coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
      artifacts:
        reports:
          coverage_report:
            coverage_format: cobertura
            path: coverage/cobertura-coverage.xml

    build:
      stage: build
      image: docker:latest
      services:
        - docker:dind
      script:
        - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
        - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
      rules:
        - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

    security:
      stage: security
      image: aquasec/trivy:latest
      script:
        - trivy image --exit-code 0 --severity HIGH,CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

Quality_Gates:
  automated_gates:
    - "Code coverage >= 80%"
    - "All tests passing"
    - "Security scan passing"
    - "Performance benchmarks met"
    - "Docker image size < 100MB"

  manual_gates:
    - "Code review approval (2 reviewers)"
    - "Architecture review for significant changes"
    - "Product owner approval for feature changes"
    - "Operations team approval for infrastructure changes"

Monitoring_Integration:
  deployment_tracking: "Automatic deployment notifications to monitoring systems"
  rollback_automation: "Automatic rollback on health check failures"
  performance_monitoring: "Deployment impact analysis"
  alerting_integration: "Integration with incident management systems"
```

---

## Quality Gates

### **Development Excellence**
- [ ] Service follows single responsibility principle with clear boundaries
- [ ] API design follows RESTful standards with comprehensive OpenAPI documentation
- [ ] Comprehensive test coverage (>80% unit, >70% integration)
- [ ] Security scanning with zero critical vulnerabilities
- [ ] Code quality metrics meet enterprise standards

### **Operational Excellence**
- [ ] Containerized deployment with health checks and resource limits
- [ ] Comprehensive observability (logging, metrics, tracing)
- [ ] Automated CI/CD pipeline with quality gates
- [ ] Database migrations are reversible and zero-downtime
- [ ] Disaster recovery and backup procedures implemented

### **Architecture Compliance**
- [ ] Service implements enterprise architecture patterns correctly
- [ ] Data access follows repository or data mapper patterns
- [ ] Event-driven communication for cross-service integration
- [ ] Proper error handling and circuit breaker patterns
- [ ] Configuration management and secrets handling

## Success Metrics
- Development velocity: <2 days average time to implement standard microservice
- Service reliability: >99.9% uptime with automated recovery
- Code quality: >8.0 maintainability index, <10 cyclomatic complexity
- Security: Zero critical vulnerabilities in production
- Performance: <100ms p95 response time for standard operations

---

**Integration References:**
- `enterprise/unified_architecture_decision_framework.md` - Decision criteria for microservices vs monolith architecture choices
- `integration/02_api_integration_patterns.md` - Service communication patterns and API design standards
- `integration/01_cross_platform_integration.md` - Cross-platform integration strategies
- `enterprise/02_enterprise_architecture.md` - Overall architecture standards and patterns
- `enterprise/01_enterprise_governance.md` - Service governance and approval processes
- `enterprise/03_enterprise_financial_audit_controls.md` - Audit controls for financial services
- `enterprise/07_enterprise_sla_slo_error_budgets.md` - Service level objectives and monitoring