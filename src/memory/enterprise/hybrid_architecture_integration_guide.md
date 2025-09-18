---
title: Hybrid Architecture Integration Guide
version: 1.0
owner: Architecture Team
last_reviewed: 2025-09-16
next_review: 2025-12-16
classification: CONFIDENTIAL
scope: [Hybrid_Architecture, Integration_Guidelines, Implementation_Patterns]
---

# Hybrid Architecture Integration Guide

> **Integration Memory**: Practical implementation guidelines for integrating different architecture patterns (microservices, modular monoliths, and traditional monoliths) within a unified system, ensuring seamless communication and consistent user experiences across all components.

## Table of Contents
- [Hybrid Integration Strategy](#hybrid-integration-strategy)
- [Service Boundary Management](#service-boundary-management)
- [Communication Patterns](#communication-patterns)
- [Data Consistency Strategies](#data-consistency-strategies)
- [Cross-Architecture Workflows](#cross-architecture-workflows)
- [Implementation Guidelines](#implementation-guidelines)

---

## Hybrid Integration Strategy

### **Integration Architecture Principles**
```yaml
Hybrid_Integration_Principles:
  architectural_coexistence:
    principle: "Different architecture patterns can coexist and integrate seamlessly"
    implementation:
      - "Clear service boundaries regardless of internal architecture"
      - "Consistent API contracts across all service types"
      - "Unified monitoring and observability standards"
      - "Common security and authentication mechanisms"

  gradual_evolution:
    principle: "Architecture evolution should be incremental and risk-managed"
    implementation:
      - "Strangler fig pattern for migrating monolith components"
      - "Feature toggles for testing new service boundaries"
      - "Parallel run strategies for validation"
      - "Rollback mechanisms for failed migrations"

  technology_agnostic_integration:
    principle: "Integration should not depend on specific technology choices"
    implementation:
      - "Standard communication protocols (HTTP, gRPC, messaging)"
      - "Language-agnostic data formats (JSON, Protocol Buffers)"
      - "Platform-independent deployment patterns"
      - "Universal monitoring and logging formats"

  business_value_optimization:
    principle: "Architecture decisions should optimize for business outcomes"
    implementation:
      - "Performance requirements drive architecture choices"
      - "Team structure influences service boundaries"
      - "Market demands influence integration patterns"
      - "Operational costs guide technology selection"

Tanqory_Hybrid_Architecture_Map:
  core_business_services: # Microservices Architecture
    user_management:
      architecture: "Microservice"
      rationale: "Independent scaling, complex domain logic, multiple consumers"
      integration_patterns: ["REST APIs", "Event publishing", "GraphQL federation"]
      team_ownership: "Identity Team (8 developers)"

    product_catalog:
      architecture: "Microservice"
      rationale: "High read/write volume, search optimization, multiple platform needs"
      integration_patterns: ["GraphQL primary", "REST APIs", "Search events"]
      team_ownership: "Catalog Team (12 developers)"

    order_processing:
      architecture: "Microservice"
      rationale: "Complex workflows, payment integration, regulatory requirements"
      integration_patterns: ["Event-driven workflows", "Saga orchestration", "REST APIs"]
      team_ownership: "Commerce Team (15 developers)"

  supporting_services: # Modular Monolith Architecture
    content_management:
      architecture: "Modular Monolith"
      rationale: "Shared infrastructure, simple CRUD, low change frequency"
      integration_patterns: ["REST APIs", "Bulk data operations", "Cache invalidation events"]
      team_ownership: "Content Team (6 developers)"

    notification_services:
      architecture: "Modular Monolith"
      rationale: "Shared delivery infrastructure, template management, simple logic"
      integration_patterns: ["Event consumption", "REST APIs", "WebSocket publishing"]
      team_ownership: "Platform Team (8 developers)"

    analytics_reporting:
      architecture: "Modular Monolith"
      rationale: "Batch processing, shared computation resources, complex aggregations"
      integration_patterns: ["Event stream consumption", "Batch APIs", "Data exports"]
      team_ownership: "Data Team (10 developers)"

  legacy_systems: # Traditional Monolith (Migration in Progress)
    legacy_erp:
      architecture: "Traditional Monolith"
      rationale: "Legacy system with planned decomposition"
      integration_patterns: ["API gateway proxy", "Database synchronization", "Event bridge"]
      migration_strategy: "Strangler fig pattern with 18-month timeline"

  integration_services: # Serverless Functions
    data_transformations:
      architecture: "Serverless Functions"
      rationale: "Event-driven, stateless, cost-effective scaling"
      integration_patterns: ["Event triggers", "API transformations", "Scheduled tasks"]
      use_cases: ["Data format conversion", "External API integration", "Cleanup tasks"]
```

### **Service Interaction Matrix**
```typescript
// shared/integration/service-registry.ts
export interface ServiceDefinition {
  name: string;
  architecture: 'microservice' | 'modular-monolith' | 'traditional-monolith' | 'serverless';
  baseUrl: string;
  version: string;
  capabilities: {
    synchronous: boolean;
    asynchronous: boolean;
    graphql: boolean;
    websocket: boolean;
    bulk_operations: boolean;
  };
  integration_patterns: IntegrationPattern[];
  dependencies: ServiceDependency[];
  consumers: ServiceConsumer[];
}

export interface IntegrationPattern {
  type: 'rest' | 'graphql' | 'events' | 'websocket' | 'batch';
  description: string;
  use_cases: string[];
  implementation: any;
}

export class HybridServiceRegistry {
  private services: Map<string, ServiceDefinition> = new Map();
  private integrationMatrix: IntegrationMatrix;

  constructor() {
    this.initializeServiceDefinitions();
    this.buildIntegrationMatrix();
  }

  private initializeServiceDefinitions(): void {
    // Core microservices
    this.register({
      name: 'user-service',
      architecture: 'microservice',
      baseUrl: 'https://api.tanqory.com/users',
      version: 'v2',
      capabilities: {
        synchronous: true,
        asynchronous: true,
        graphql: true,
        websocket: true,
        bulk_operations: false,
      },
      integration_patterns: [
        {
          type: 'rest',
          description: 'User CRUD operations and authentication',
          use_cases: ['User profile management', 'Authentication', 'Authorization'],
          implementation: {
            endpoints: ['/users', '/auth', '/profile'],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            authentication: 'JWT Bearer Token',
          },
        },
        {
          type: 'events',
          description: 'User lifecycle events',
          use_cases: ['User registration notifications', 'Profile updates', 'Account deactivation'],
          implementation: {
            topics: ['user.registered', 'user.updated', 'user.deactivated'],
            schema: 'CloudEvents format with User schema',
          },
        },
        {
          type: 'graphql',
          description: 'Flexible user data queries',
          use_cases: ['Mobile app user data', 'Admin dashboard queries'],
          implementation: {
            schema: '/graphql/schema',
            federation: 'Apollo Federation compatible',
          },
        },
      ],
      dependencies: [
        { service: 'notification-services', type: 'async', purpose: 'Send welcome emails' },
        { service: 'analytics-reporting', type: 'async', purpose: 'User behavior tracking' },
      ],
      consumers: [
        { service: 'order-processing', type: 'sync', purpose: 'User validation' },
        { service: 'content-management', type: 'sync', purpose: 'Author information' },
      ],
    });

    // Modular monoliths
    this.register({
      name: 'notification-services',
      architecture: 'modular-monolith',
      baseUrl: 'https://api.tanqory.com/notifications',
      version: 'v1',
      capabilities: {
        synchronous: false,
        asynchronous: true,
        graphql: false,
        websocket: true,
        bulk_operations: true,
      },
      integration_patterns: [
        {
          type: 'events',
          description: 'Event-driven notification processing',
          use_cases: ['Email notifications', 'Push notifications', 'SMS alerts'],
          implementation: {
            consumes: ['user.*', 'order.*', 'system.*'],
            produces: ['notification.sent', 'notification.failed'],
            delivery_channels: ['email', 'push', 'sms', 'websocket'],
          },
        },
        {
          type: 'websocket',
          description: 'Real-time notifications',
          use_cases: ['Live updates', 'System alerts', 'User notifications'],
          implementation: {
            endpoint: '/ws/notifications',
            authentication: 'WebSocket token',
            rooms: 'User-specific and broadcast',
          },
        },
        {
          type: 'batch',
          description: 'Bulk notification operations',
          use_cases: ['Marketing campaigns', 'System maintenance alerts'],
          implementation: {
            endpoints: ['/bulk/email', '/bulk/push'],
            limits: '10,000 recipients per batch',
          },
        },
      ],
      dependencies: [
        { service: 'user-service', type: 'sync', purpose: 'User preferences and contact info' },
      ],
      consumers: [
        { service: 'all-services', type: 'async', purpose: 'Universal notification delivery' },
      ],
    });

    // Legacy systems
    this.register({
      name: 'legacy-erp',
      architecture: 'traditional-monolith',
      baseUrl: 'https://internal.tanqory.com/erp',
      version: 'v1',
      capabilities: {
        synchronous: true,
        asynchronous: false,
        graphql: false,
        websocket: false,
        bulk_operations: true,
      },
      integration_patterns: [
        {
          type: 'rest',
          description: 'Legacy system integration via API gateway',
          use_cases: ['Financial data sync', 'Inventory management'],
          implementation: {
            proxy: 'API Gateway with transformation middleware',
            authentication: 'API Key + IP whitelist',
            rate_limiting: 'Conservative limits for legacy system protection',
          },
        },
        {
          type: 'batch',
          description: 'Scheduled data synchronization',
          use_cases: ['Nightly financial reports', 'Inventory updates'],
          implementation: {
            schedule: 'Cron-based batch jobs',
            format: 'CSV/XML file exchange',
            error_handling: 'Manual review queue',
          },
        },
      ],
      dependencies: [],
      consumers: [
        { service: 'order-processing', type: 'sync', purpose: 'Payment reconciliation' },
        { service: 'analytics-reporting', type: 'batch', purpose: 'Financial reporting' },
      ],
    });
  }

  getIntegrationPattern(sourceService: string, targetService: string): IntegrationPattern | null {
    return this.integrationMatrix.getPattern(sourceService, targetService);
  }

  recommendIntegrationStrategy(
    sourceArchitecture: string,
    targetArchitecture: string,
    useCase: string
  ): IntegrationRecommendation {
    // Integration strategy recommendations based on architecture combinations
    const strategies = {
      'microservice->microservice': {
        preferred: ['events', 'rest', 'graphql'],
        rationale: 'Loose coupling through events, direct sync calls when needed',
      },
      'microservice->modular-monolith': {
        preferred: ['events', 'rest'],
        rationale: 'Events for notifications, REST for queries',
      },
      'modular-monolith->microservice': {
        preferred: ['rest', 'events'],
        rationale: 'REST for simple operations, events for complex workflows',
      },
      'modular-monolith->modular-monolith': {
        preferred: ['events', 'batch', 'rest'],
        rationale: 'Events for decoupling, batch for efficiency',
      },
      'traditional-monolith->*': {
        preferred: ['rest', 'batch'],
        rationale: 'Conservative integration to protect legacy system',
      },
      '*->traditional-monolith': {
        preferred: ['rest', 'batch'],
        rationale: 'API gateway proxy with rate limiting',
      },
    };

    const key = `${sourceArchitecture}->${targetArchitecture}`;
    return strategies[key] || strategies['*->traditional-monolith'];
  }
}
```

## Service Boundary Management

### **Boundary Definition Strategies**
```yaml
Service_Boundary_Strategies:
  domain_driven_boundaries:
    principle: "Align service boundaries with business domain boundaries"
    implementation:
      aggregate_identification: "Identify business aggregates and their invariants"
      bounded_context_mapping: "Map relationships between bounded contexts"
      data_ownership: "Each service owns its data exclusively"
      business_capability_alignment: "Services represent complete business capabilities"

  team_topology_boundaries:
    principle: "Service boundaries should match team communication patterns"
    implementation:
      conways_law_application: "Align service architecture with team structure"
      team_autonomy: "Teams should own their services end-to-end"
      communication_minimization: "Reduce inter-team coordination needs"
      ownership_clarity: "Clear accountability for service outcomes"

  technical_boundaries:
    principle: "Consider technical constraints and opportunities"
    implementation:
      scaling_requirements: "Independent scaling needs drive service extraction"
      technology_diversity: "Different technology stacks justify separation"
      performance_requirements: "Latency and throughput needs influence boundaries"
      deployment_independence: "Services with different release cycles should be separate"

  evolutionary_boundaries:
    principle: "Boundaries should evolve with changing requirements"
    implementation:
      gradual_extraction: "Extract services incrementally from existing systems"
      boundary_experimentation: "Test boundaries before committing to them"
      merge_and_split_strategies: "Ability to merge or split services as needed"
      migration_safety: "Safe migration paths between boundary strategies"

Boundary_Implementation_Patterns:
  strangler_fig_pattern:
    description: "Gradually replace parts of a monolith with microservices"
    use_cases: ["Legacy system modernization", "Risk-managed decomposition"]
    implementation:
      routing_layer: "API gateway routes traffic to old and new systems"
      feature_toggles: "Control traffic distribution between old and new"
      parallel_run: "Run old and new systems in parallel for validation"
      incremental_migration: "Move functionality piece by piece"

  branch_by_abstraction:
    description: "Create abstractions to enable independent evolution"
    use_cases: ["Technology migration", "Architecture refactoring"]
    implementation:
      abstraction_layer: "Common interface hiding implementation details"
      feature_flags: "Toggle between different implementations"
      gradual_rollout: "Incrementally move to new implementation"
      fallback_mechanisms: "Ability to roll back to original implementation"

  database_decomposition:
    description: "Split shared databases across service boundaries"
    use_cases: ["Data ownership isolation", "Independent scaling"]
    implementation:
      shared_to_separate: "Move from shared database to database per service"
      data_synchronization: "Event-driven data replication where needed"
      transactional_boundaries: "Saga pattern for distributed transactions"
      consistency_trade_offs: "Accept eventual consistency for independence"
```

### **Boundary Migration Implementation**
```typescript
// tools/boundary-migration/migration-orchestrator.ts
export interface MigrationStep {
  id: string;
  description: string;
  type: 'routing' | 'data' | 'functionality' | 'validation';
  source: string;
  target: string;
  rollback: () => Promise<void>;
  validate: () => Promise<boolean>;
  execute: () => Promise<void>;
}

export interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  source_service: ServiceDefinition;
  target_services: ServiceDefinition[];
  steps: MigrationStep[];
  validation_criteria: ValidationCriteria[];
  rollback_strategy: RollbackStrategy;
}

export class BoundaryMigrationOrchestrator {
  private migrationPlans: Map<string, MigrationPlan> = new Map();
  private activeExperiments: Map<string, Experiment> = new Map();

  constructor(
    private serviceRegistry: HybridServiceRegistry,
    private trafficManager: TrafficManager,
    private dataReplicationManager: DataReplicationManager,
    private monitoringService: MonitoringService
  ) {}

  async createMigrationPlan(
    sourceService: string,
    targetBoundaries: BoundaryDefinition[],
    migrationStrategy: 'strangler_fig' | 'branch_by_abstraction' | 'database_decomposition'
  ): Promise<MigrationPlan> {
    const plan: MigrationPlan = {
      id: generateUuid(),
      name: `Migration: ${sourceService} decomposition`,
      description: `Decompose ${sourceService} using ${migrationStrategy} pattern`,
      source_service: this.serviceRegistry.getService(sourceService),
      target_services: targetBoundaries.map(b => this.createServiceDefinition(b)),
      steps: [],
      validation_criteria: this.generateValidationCriteria(sourceService, targetBoundaries),
      rollback_strategy: this.generateRollbackStrategy(migrationStrategy),
    };

    // Generate migration steps based on strategy
    switch (migrationStrategy) {
      case 'strangler_fig':
        plan.steps = await this.generateStranglerFigSteps(plan);
        break;
      case 'branch_by_abstraction':
        plan.steps = await this.generateAbstractionSteps(plan);
        break;
      case 'database_decomposition':
        plan.steps = await this.generateDatabaseSteps(plan);
        break;
    }

    this.migrationPlans.set(plan.id, plan);
    return plan;
  }

  async executeMigrationStep(planId: string, stepId: string): Promise<boolean> {
    const plan = this.migrationPlans.get(planId);
    if (!plan) {
      throw new Error(`Migration plan ${planId} not found`);
    }

    const step = plan.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Migration step ${stepId} not found`);
    }

    try {
      // Pre-execution validation
      const preValidation = await this.validatePreConditions(step);
      if (!preValidation.valid) {
        throw new Error(`Pre-conditions not met: ${preValidation.reasons.join(', ')}`);
      }

      // Execute the migration step
      await step.execute();

      // Post-execution validation
      const postValidation = await step.validate();
      if (!postValidation) {
        // Rollback on validation failure
        await step.rollback();
        throw new Error(`Step validation failed, rolled back changes`);
      }

      // Monitor for issues
      const monitoringResults = await this.monitorStepExecution(step, 5 * 60 * 1000); // 5 minutes
      if (!monitoringResults.healthy) {
        await step.rollback();
        throw new Error(`Step monitoring detected issues: ${monitoringResults.issues.join(', ')}`);
      }

      return true;

    } catch (error) {
      // Log error and attempt rollback
      await this.handleMigrationFailure(plan, step, error);
      throw error;
    }
  }

  private async generateStranglerFigSteps(plan: MigrationPlan): Promise<MigrationStep[]> {
    const steps: MigrationStep[] = [];

    // Step 1: Set up routing infrastructure
    steps.push({
      id: 'routing-setup',
      description: 'Set up API gateway routing for strangler fig pattern',
      type: 'routing',
      source: plan.source_service.name,
      target: 'api-gateway',
      execute: async () => {
        await this.trafficManager.setupStranglerFigRouting(
          plan.source_service.name,
          plan.target_services.map(s => s.name)
        );
      },
      validate: async () => {
        return await this.trafficManager.validateRouting(plan.source_service.name);
      },
      rollback: async () => {
        await this.trafficManager.removeStranglerFigRouting(plan.source_service.name);
      },
    });

    // Step 2-N: Migrate functionality piece by piece
    for (const targetService of plan.target_services) {
      steps.push({
        id: `migrate-${targetService.name}`,
        description: `Migrate functionality to ${targetService.name}`,
        type: 'functionality',
        source: plan.source_service.name,
        target: targetService.name,
        execute: async () => {
          // Deploy new service
          await this.deployService(targetService);

          // Set up data replication
          await this.dataReplicationManager.setupReplication(
            plan.source_service.name,
            targetService.name
          );

          // Route a small percentage of traffic to new service
          await this.trafficManager.routeTraffic(targetService.name, 1);
        },
        validate: async () => {
          // Validate service health and functionality
          const healthCheck = await this.monitoringService.checkServiceHealth(targetService.name);
          const functionalityCheck = await this.validateFunctionality(targetService.name);
          return healthCheck && functionalityCheck;
        },
        rollback: async () => {
          // Route all traffic back to original service
          await this.trafficManager.routeTraffic(targetService.name, 0);

          // Stop data replication
          await this.dataReplicationManager.stopReplication(
            plan.source_service.name,
            targetService.name
          );

          // Undeploy new service if needed
          await this.undeployService(targetService);
        },
      });

      // Gradual traffic increase steps
      for (const percentage of [5, 10, 25, 50, 75, 100]) {
        steps.push({
          id: `traffic-${targetService.name}-${percentage}`,
          description: `Route ${percentage}% traffic to ${targetService.name}`,
          type: 'routing',
          source: plan.source_service.name,
          target: targetService.name,
          execute: async () => {
            await this.trafficManager.routeTraffic(targetService.name, percentage);
          },
          validate: async () => {
            // Monitor error rates and performance
            const metrics = await this.monitoringService.getServiceMetrics(targetService.name);
            return metrics.errorRate < 0.01 && metrics.responseTime < 500;
          },
          rollback: async () => {
            // Reduce traffic percentage
            const previousPercentage = percentage === 5 ? 0 : Math.max(0, percentage - 25);
            await this.trafficManager.routeTraffic(targetService.name, previousPercentage);
          },
        });
      }
    }

    return steps;
  }

  async runBoundaryExperiment(
    experimentId: string,
    hypothesis: string,
    newBoundaries: BoundaryDefinition[],
    duration: number
  ): Promise<ExperimentResults> {
    const experiment: Experiment = {
      id: experimentId,
      hypothesis,
      boundaries: newBoundaries,
      startTime: new Date(),
      duration,
      metrics: [],
    };

    this.activeExperiments.set(experimentId, experiment);

    try {
      // Set up experiment infrastructure
      await this.setupExperimentInfrastructure(experiment);

      // Run experiment for specified duration
      await this.wait(duration);

      // Collect results
      const results = await this.collectExperimentResults(experiment);

      // Clean up experiment infrastructure
      await this.cleanupExperimentInfrastructure(experiment);

      return results;

    } catch (error) {
      await this.cleanupExperimentInfrastructure(experiment);
      throw error;
    } finally {
      this.activeExperiments.delete(experimentId);
    }
  }
}

// Example usage
const migrationOrchestrator = new BoundaryMigrationOrchestrator(
  serviceRegistry,
  trafficManager,
  dataReplicationManager,
  monitoringService
);

// Create a migration plan to decompose content management
const migrationPlan = await migrationOrchestrator.createMigrationPlan(
  'content-management',
  [
    { name: 'content-creation', domain: 'Content authoring and editing' },
    { name: 'content-delivery', domain: 'Content serving and caching' },
    { name: 'content-workflow', domain: 'Content approval and publishing' },
  ],
  'strangler_fig'
);

// Execute migration steps one by one
for (const step of migrationPlan.steps) {
  const success = await migrationOrchestrator.executeMigrationStep(migrationPlan.id, step.id);
  if (!success) {
    console.error(`Migration step ${step.id} failed`);
    break;
  }

  // Wait between steps for system stabilization
  await new Promise(resolve => setTimeout(resolve, 30000)); // 30 seconds
}
```

## Communication Patterns

### **Cross-Architecture Communication Matrix**
```yaml
Communication_Patterns_Matrix:
  microservice_to_microservice:
    preferred_patterns:
      - pattern: "Event-driven communication"
        use_cases: ["Business event notifications", "Data synchronization", "Workflow triggers"]
        benefits: ["Loose coupling", "Scalability", "Resilience"]
        implementation: "Apache Kafka with CloudEvents format"

      - pattern: "Synchronous REST APIs"
        use_cases: ["Real-time queries", "User-facing operations", "Validation"]
        benefits: ["Immediate consistency", "Simple debugging", "Direct response"]
        implementation: "OpenAPI-documented REST endpoints with circuit breakers"

      - pattern: "GraphQL federation"
        use_cases: ["Complex data fetching", "Mobile optimization", "API aggregation"]
        benefits: ["Flexible queries", "Bandwidth optimization", "Type safety"]
        implementation: "Apollo Federation with schema composition"

  microservice_to_modular_monolith:
    preferred_patterns:
      - pattern: "Event publishing to monolith"
        use_cases: ["Notify monolith of microservice changes", "Analytics data"]
        benefits: ["Decoupling", "Async processing", "Multiple consumers"]
        implementation: "Microservice publishes events, monolith consumes"

      - pattern: "REST API calls to monolith"
        use_cases: ["Query monolith data", "Trigger batch operations"]
        benefits: ["Simple integration", "Immediate response", "Standard tooling"]
        implementation: "Direct API calls with retry and circuit breaker"

  modular_monolith_to_microservice:
    preferred_patterns:
      - pattern: "REST API consumption"
        use_cases: ["Fetch microservice data", "Trigger microservice operations"]
        benefits: ["Synchronous flow", "Error handling", "Simple implementation"]
        implementation: "HTTP client with connection pooling and retries"

      - pattern: "Event consumption from microservices"
        use_cases: ["React to microservice events", "Update local caches"]
        benefits: ["Loose coupling", "Eventual consistency", "Resilience"]
        implementation: "Event consumers with message queuing"

  traditional_monolith_integration:
    preferred_patterns:
      - pattern: "API Gateway proxy"
        use_cases: ["Protect legacy system", "Add modern features", "Rate limiting"]
        benefits: ["Legacy protection", "Feature enhancement", "Monitoring"]
        implementation: "Kong API Gateway with transformation plugins"

      - pattern: "Database synchronization"
        use_cases: ["Keep data in sync", "Gradual migration", "Reporting"]
        benefits: ["Data consistency", "Incremental migration", "Backup strategy"]
        implementation: "Change data capture with Debezium"

      - pattern: "Batch integration"
        use_cases: ["Bulk data exchange", "Scheduled operations", "ETL processes"]
        benefits: ["Efficiency", "Legacy compatibility", "Error recovery"]
        implementation: "Scheduled jobs with file-based exchange"

  serverless_integration:
    preferred_patterns:
      - pattern: "Event-triggered functions"
        use_cases: ["Data transformation", "API integration", "Cleanup tasks"]
        benefits: ["Cost efficiency", "Auto-scaling", "Stateless processing"]
        implementation: "AWS Lambda or Azure Functions with event triggers"

      - pattern: "API proxy functions"
        use_cases: ["Protocol translation", "Authentication", "Response transformation"]
        benefits: ["Lightweight integration", "Quick deployment", "Cost effective"]
        implementation: "Serverless HTTP functions with API Gateway"
```

### **Communication Implementation Examples**
```typescript
// shared/communication/hybrid-client.ts
export interface CommunicationStrategy {
  name: string;
  patterns: CommunicationPattern[];
  fallback?: CommunicationStrategy;
}

export interface CommunicationPattern {
  type: 'rest' | 'graphql' | 'events' | 'websocket' | 'batch';
  config: any;
  validate: () => Promise<boolean>;
  execute: (request: any) => Promise<any>;
}

export class HybridCommunicationClient {
  private strategies: Map<string, CommunicationStrategy> = new Map();
  private serviceRegistry: HybridServiceRegistry;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor(serviceRegistry: HybridServiceRegistry) {
    this.serviceRegistry = serviceRegistry;
    this.initializeStrategies();
  }

  async communicate(
    sourceService: string,
    targetService: string,
    request: CommunicationRequest
  ): Promise<CommunicationResponse> {
    // Get recommended integration strategy
    const strategy = this.getOptimalStrategy(sourceService, targetService, request.type);

    // Apply circuit breaker pattern
    const circuitBreaker = this.getCircuitBreaker(targetService);

    try {
      const response = await circuitBreaker.execute(async () => {
        return await this.executeWithStrategy(strategy, request);
      });

      return response;

    } catch (error) {
      // Try fallback strategy if available
      if (strategy.fallback) {
        return await this.executeWithStrategy(strategy.fallback, request);
      }
      throw error;
    }
  }

  private getOptimalStrategy(
    sourceService: string,
    targetService: string,
    communicationType: string
  ): CommunicationStrategy {
    const sourceArch = this.serviceRegistry.getService(sourceService)?.architecture;
    const targetArch = this.serviceRegistry.getService(targetService)?.architecture;
    const key = `${sourceArch}->${targetArch}`;

    const strategies = {
      'microservice->microservice': this.getMicroToMicroStrategy(communicationType),
      'microservice->modular-monolith': this.getMicroToMonolithStrategy(communicationType),
      'modular-monolith->microservice': this.getMonolithToMicroStrategy(communicationType),
      'modular-monolith->modular-monolith': this.getMonolithToMonolithStrategy(communicationType),
      'traditional-monolith->microservice': this.getLegacyToMicroStrategy(communicationType),
      'microservice->traditional-monolith': this.getMicroToLegacyStrategy(communicationType),
    };

    return strategies[key] || this.getDefaultStrategy(communicationType);
  }

  private getMicroToMicroStrategy(type: string): CommunicationStrategy {
    if (type === 'query') {
      return {
        name: 'micro-to-micro-query',
        patterns: [
          {
            type: 'rest',
            config: { timeout: 5000, retries: 3 },
            validate: async () => true,
            execute: async (request) => this.executeRestCall(request),
          },
          {
            type: 'graphql',
            config: { timeout: 10000, complexity_limit: 100 },
            validate: async () => this.validateGraphQLEndpoint(request.endpoint),
            execute: async (request) => this.executeGraphQLQuery(request),
          },
        ],
        fallback: {
          name: 'cached-response',
          patterns: [
            {
              type: 'rest',
              config: { use_cache: true },
              validate: async () => true,
              execute: async (request) => this.getCachedResponse(request),
            },
          ],
        },
      };
    } else if (type === 'command') {
      return {
        name: 'micro-to-micro-command',
        patterns: [
          {
            type: 'events',
            config: { delivery_guarantee: 'at-least-once', timeout: 30000 },
            validate: async () => this.validateEventBroker(),
            execute: async (request) => this.publishEvent(request),
          },
        ],
        fallback: {
          name: 'direct-api-call',
          patterns: [
            {
              type: 'rest',
              config: { timeout: 15000, retries: 1 },
              validate: async () => true,
              execute: async (request) => this.executeRestCall(request),
            },
          ],
        },
      };
    }

    return this.getDefaultStrategy(type);
  }

  private getMicroToMonolithStrategy(type: string): CommunicationStrategy {
    return {
      name: 'micro-to-monolith',
      patterns: [
        {
          type: 'rest',
          config: {
            timeout: 10000, // Longer timeout for monolith
            retries: 2,
            connection_pool: true,
          },
          validate: async () => true,
          execute: async (request) => this.executeRestCall(request),
        },
      ],
      fallback: {
        name: 'batch-operation',
        patterns: [
          {
            type: 'batch',
            config: { batch_size: 100, schedule: 'hourly' },
            validate: async () => true,
            execute: async (request) => this.enqueueBatchOperation(request),
          },
        ],
      },
    };
  }

  private async executeRestCall(request: CommunicationRequest): Promise<any> {
    const httpClient = this.getHttpClient(request.config);

    const response = await httpClient.request({
      method: request.method,
      url: request.endpoint,
      data: request.payload,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': request.requestId,
        'X-Source-Service': request.sourceService,
        ...request.headers,
      },
    });

    return response.data;
  }

  private async publishEvent(request: CommunicationRequest): Promise<any> {
    const eventBus = this.getEventBus();

    const event = {
      eventType: request.eventType,
      data: request.payload,
      metadata: {
        requestId: request.requestId,
        sourceService: request.sourceService,
        timestamp: new Date().toISOString(),
      },
    };

    await eventBus.publish(event);
    return { status: 'published', eventId: event.metadata.requestId };
  }

  private async executeGraphQLQuery(request: CommunicationRequest): Promise<any> {
    const graphqlClient = this.getGraphQLClient(request.endpoint);

    const response = await graphqlClient.query({
      query: request.query,
      variables: request.variables,
      context: {
        headers: {
          'X-Request-ID': request.requestId,
          'X-Source-Service': request.sourceService,
        },
      },
    });

    return response.data;
  }
}

// Example usage in a service
export class OrderProcessingService {
  constructor(
    private communicationClient: HybridCommunicationClient,
    private logger: Logger
  ) {}

  async processOrder(orderData: OrderData): Promise<Order> {
    try {
      // 1. Validate user (microservice to microservice - REST)
      const user = await this.communicationClient.communicate(
        'order-processing',
        'user-service',
        {
          type: 'query',
          method: 'GET',
          endpoint: `/users/${orderData.userId}`,
          requestId: generateRequestId(),
          sourceService: 'order-processing',
        }
      );

      // 2. Check inventory (microservice to modular monolith - REST)
      const inventoryCheck = await this.communicationClient.communicate(
        'order-processing',
        'inventory-management',
        {
          type: 'query',
          method: 'POST',
          endpoint: '/inventory/check',
          payload: { items: orderData.items },
          requestId: generateRequestId(),
          sourceService: 'order-processing',
        }
      );

      if (!inventoryCheck.available) {
        throw new Error('Insufficient inventory');
      }

      // 3. Process payment (microservice to microservice - events)
      await this.communicationClient.communicate(
        'order-processing',
        'payment-service',
        {
          type: 'command',
          eventType: 'payment.process',
          payload: {
            orderId: orderData.id,
            amount: orderData.total,
            paymentMethod: orderData.paymentMethod,
          },
          requestId: generateRequestId(),
          sourceService: 'order-processing',
        }
      );

      // 4. Update legacy ERP (microservice to legacy - batch)
      await this.communicationClient.communicate(
        'order-processing',
        'legacy-erp',
        {
          type: 'batch',
          operation: 'order-export',
          payload: { order: orderData },
          requestId: generateRequestId(),
          sourceService: 'order-processing',
        }
      );

      // 5. Send notifications (microservice to modular monolith - events)
      await this.communicationClient.communicate(
        'order-processing',
        'notification-services',
        {
          type: 'command',
          eventType: 'order.created',
          payload: {
            orderId: orderData.id,
            userId: orderData.userId,
            orderDetails: orderData,
          },
          requestId: generateRequestId(),
          sourceService: 'order-processing',
        }
      );

      return orderData;

    } catch (error) {
      this.logger.error('Order processing failed', { error, orderData });
      throw error;
    }
  }
}
```

## Data Consistency Strategies

### **Consistency Patterns Across Architectures**
```yaml
Data_Consistency_Strategies:
  strong_consistency:
    scope: "Within service boundaries"
    implementation: "ACID transactions in PostgreSQL"
    use_cases: ["Financial transactions", "User authentication", "Inventory updates"]
    architecture_support:
      - "Microservices: Within aggregate boundaries"
      - "Modular Monolith: Across modules using database transactions"
      - "Traditional Monolith: Full system consistency"

  eventual_consistency:
    scope: "Across service boundaries"
    implementation: "Event-driven synchronization with saga patterns"
    use_cases: ["Data replication", "Search indexes", "Analytics data", "Cache updates"]
    architecture_support:
      - "Microservices: Event-driven data synchronization"
      - "Cross-architecture: Events bridge consistency gaps"
      - "Legacy integration: Change data capture patterns"

  causal_consistency:
    scope: "Related operations across services"
    implementation: "Vector clocks or logical timestamps"
    use_cases: ["User activity streams", "Distributed workflows", "Related data updates"]
    architecture_support:
      - "Event ordering across microservices"
      - "Workflow state consistency in hybrid systems"

Consistency_Implementation_Patterns:
  saga_orchestration:
    description: "Centralized coordination of distributed transactions"
    use_cases: ["Complex business workflows", "Cross-service transactions"]
    implementation:
      orchestrator_service: "Dedicated service managing saga state"
      compensation_actions: "Rollback operations for failed steps"
      state_persistence: "Saga state stored in event store"
      timeout_handling: "Automatic retry and failure handling"

  saga_choreography:
    description: "Decentralized coordination through events"
    use_cases: ["Simple workflows", "Loose coupling requirements"]
    implementation:
      event_chain: "Services react to events and publish new events"
      local_transactions: "Each service manages its own consistency"
      error_handling: "Compensating events for rollback"
      monitoring: "Distributed tracing for workflow visibility"

  event_sourcing:
    description: "Store all changes as immutable events"
    use_cases: ["Audit requirements", "Complex business logic", "Temporal queries"]
    implementation:
      event_store: "Immutable append-only event log"
      projections: "Materialized views derived from events"
      snapshots: "Performance optimization for aggregate reconstruction"
      replay_capability: "Ability to replay events for debugging or migration"

  cqrs_pattern:
    description: "Separate read and write models"
    use_cases: ["Different read/write performance requirements", "Complex queries"]
    implementation:
      command_model: "Write-optimized model for business operations"
      query_model: "Read-optimized denormalized views"
      synchronization: "Events synchronize command and query models"
      scaling: "Independent scaling of read and write sides"
```

### **Cross-Service Transaction Management**
```typescript
// shared/transactions/saga-orchestrator.ts
export interface SagaStep {
  stepId: string;
  serviceName: string;
  operation: string;
  payload: any;
  compensationOperation?: string;
  compensationPayload?: any;
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface SagaDefinition {
  sagaId: string;
  sagaType: string;
  steps: SagaStep[];
  metadata: any;
}

export interface SagaExecution {
  sagaId: string;
  definition: SagaDefinition;
  currentStep: number;
  status: 'running' | 'completed' | 'failed' | 'compensating' | 'compensated';
  executedSteps: ExecutedStep[];
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

export class SagaOrchestrator {
  private activeSagas: Map<string, SagaExecution> = new Map();
  private sagaRepository: SagaRepository;
  private communicationClient: HybridCommunicationClient;
  private eventBus: EventBus;

  constructor(
    sagaRepository: SagaRepository,
    communicationClient: HybridCommunicationClient,
    eventBus: EventBus
  ) {
    this.sagaRepository = sagaRepository;
    this.communicationClient = communicationClient;
    this.eventBus = eventBus;
    this.setupEventHandlers();
  }

  async startSaga(definition: SagaDefinition): Promise<string> {
    const execution: SagaExecution = {
      sagaId: definition.sagaId,
      definition,
      currentStep: 0,
      status: 'running',
      executedSteps: [],
      startedAt: new Date(),
    };

    this.activeSagas.set(definition.sagaId, execution);
    await this.sagaRepository.save(execution);

    // Start executing the first step
    await this.executeNextStep(execution);

    return definition.sagaId;
  }

  private async executeNextStep(execution: SagaExecution): Promise<void> {
    if (execution.currentStep >= execution.definition.steps.length) {
      await this.completeSaga(execution);
      return;
    }

    const step = execution.definition.steps[execution.currentStep];

    try {
      const result = await this.executeStep(step, execution);

      // Record successful step execution
      execution.executedSteps.push({
        stepId: step.stepId,
        status: 'completed',
        result,
        executedAt: new Date(),
      });

      execution.currentStep++;
      await this.sagaRepository.save(execution);

      // Continue with next step
      await this.executeNextStep(execution);

    } catch (error) {
      // Step failed, start compensation
      await this.startCompensation(execution, error);
    }
  }

  private async executeStep(step: SagaStep, execution: SagaExecution): Promise<any> {
    const sourceService = 'saga-orchestrator';
    const targetService = step.serviceName;

    // Create retry wrapper for step execution
    const retryWrapper = new RetryWrapper(step.retryPolicy);

    return await retryWrapper.execute(async () => {
      const response = await this.communicationClient.communicate(
        sourceService,
        targetService,
        {
          type: 'command',
          method: 'POST',
          endpoint: `/operations/${step.operation}`,
          payload: {
            ...step.payload,
            sagaId: execution.sagaId,
            stepId: step.stepId,
          },
          requestId: generateRequestId(),
          sourceService,
          timeout: step.timeout,
        }
      );

      return response;
    });
  }

  private async startCompensation(execution: SagaExecution, error: Error): Promise<void> {
    execution.status = 'compensating';
    execution.error = error.message;
    await this.sagaRepository.save(execution);

    // Execute compensation actions in reverse order
    const completedSteps = execution.executedSteps
      .filter(step => step.status === 'completed')
      .reverse();

    for (const executedStep of completedSteps) {
      const stepDefinition = execution.definition.steps.find(s => s.stepId === executedStep.stepId);

      if (stepDefinition?.compensationOperation) {
        try {
          await this.executeCompensation(stepDefinition, execution);

          executedStep.compensated = true;
          executedStep.compensatedAt = new Date();

        } catch (compensationError) {
          // Log compensation failure but continue with other compensations
          console.error(`Compensation failed for step ${executedStep.stepId}`, compensationError);
        }
      }
    }

    execution.status = 'compensated';
    execution.completedAt = new Date();
    await this.sagaRepository.save(execution);

    // Publish saga compensated event
    await this.eventBus.publish({
      eventType: 'saga.compensated',
      data: {
        sagaId: execution.sagaId,
        sagaType: execution.definition.sagaType,
        error: execution.error,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'saga-orchestrator',
      },
    });

    this.activeSagas.delete(execution.sagaId);
  }

  private async executeCompensation(step: SagaStep, execution: SagaExecution): Promise<any> {
    if (!step.compensationOperation) {
      return;
    }

    return await this.communicationClient.communicate(
      'saga-orchestrator',
      step.serviceName,
      {
        type: 'command',
        method: 'POST',
        endpoint: `/operations/${step.compensationOperation}`,
        payload: {
          ...step.compensationPayload,
          sagaId: execution.sagaId,
          stepId: step.stepId,
        },
        requestId: generateRequestId(),
        sourceService: 'saga-orchestrator',
        timeout: step.timeout,
      }
    );
  }

  private async completeSaga(execution: SagaExecution): Promise<void> {
    execution.status = 'completed';
    execution.completedAt = new Date();
    await this.sagaRepository.save(execution);

    // Publish saga completed event
    await this.eventBus.publish({
      eventType: 'saga.completed',
      data: {
        sagaId: execution.sagaId,
        sagaType: execution.definition.sagaType,
        duration: execution.completedAt.getTime() - execution.startedAt.getTime(),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'saga-orchestrator',
      },
    });

    this.activeSagas.delete(execution.sagaId);
  }

  private setupEventHandlers(): void {
    // Handle step completion events from services
    this.eventBus.subscribe('saga.step.completed', async (event) => {
      const { sagaId, stepId, result } = event.data;
      await this.handleStepCompleted(sagaId, stepId, result);
    });

    // Handle step failure events from services
    this.eventBus.subscribe('saga.step.failed', async (event) => {
      const { sagaId, stepId, error } = event.data;
      await this.handleStepFailed(sagaId, stepId, error);
    });
  }
}

// Example: Order Processing Saga
export class OrderProcessingSaga {
  constructor(private sagaOrchestrator: SagaOrchestrator) {}

  async processOrder(orderData: OrderData): Promise<string> {
    const sagaDefinition: SagaDefinition = {
      sagaId: generateUuid(),
      sagaType: 'order-processing',
      metadata: { orderId: orderData.id, customerId: orderData.customerId },
      steps: [
        {
          stepId: 'validate-user',
          serviceName: 'user-service',
          operation: 'validate-user',
          payload: { userId: orderData.customerId },
          timeout: 5000,
          retryPolicy: { maxAttempts: 3, backoffMs: 1000 },
        },
        {
          stepId: 'reserve-inventory',
          serviceName: 'inventory-management',
          operation: 'reserve-items',
          payload: { items: orderData.items },
          compensationOperation: 'release-items',
          compensationPayload: { items: orderData.items },
          timeout: 10000,
          retryPolicy: { maxAttempts: 3, backoffMs: 2000 },
        },
        {
          stepId: 'process-payment',
          serviceName: 'payment-service',
          operation: 'charge-payment',
          payload: {
            customerId: orderData.customerId,
            amount: orderData.total,
            paymentMethod: orderData.paymentMethod,
          },
          compensationOperation: 'refund-payment',
          compensationPayload: {
            customerId: orderData.customerId,
            amount: orderData.total,
          },
          timeout: 30000,
          retryPolicy: { maxAttempts: 2, backoffMs: 5000 },
        },
        {
          stepId: 'create-shipment',
          serviceName: 'shipping-service',
          operation: 'create-shipment',
          payload: {
            orderId: orderData.id,
            items: orderData.items,
            shippingAddress: orderData.shippingAddress,
          },
          compensationOperation: 'cancel-shipment',
          compensationPayload: { orderId: orderData.id },
          timeout: 15000,
          retryPolicy: { maxAttempts: 3, backoffMs: 3000 },
        },
        {
          stepId: 'send-confirmation',
          serviceName: 'notification-services',
          operation: 'send-order-confirmation',
          payload: {
            customerId: orderData.customerId,
            orderId: orderData.id,
            orderDetails: orderData,
          },
          timeout: 10000,
          retryPolicy: { maxAttempts: 2, backoffMs: 2000 },
        },
      ],
    };

    return await this.sagaOrchestrator.startSaga(sagaDefinition);
  }
}
```

## Cross-Architecture Workflows

### **Workflow Integration Patterns**
```yaml
Cross_Architecture_Workflows:
  user_onboarding_workflow:
    description: "Complete user registration and setup workflow"
    participants:
      - service: "user-service"
        architecture: "microservice"
        role: "User registration and profile creation"
      - service: "notification-services"
        architecture: "modular-monolith"
        role: "Welcome email and setup instructions"
      - service: "analytics-reporting"
        architecture: "modular-monolith"
        role: "User registration tracking and cohort analysis"
      - service: "legacy-erp"
        architecture: "traditional-monolith"
        role: "Customer record creation for billing"

    workflow_steps:
      1. "User submits registration form (Web/Mobile → user-service)"
      2. "User-service validates and creates user account"
      3. "User-service publishes UserRegistered event"
      4. "Notification-services consumes event and sends welcome email"
      5. "Analytics-reporting consumes event and updates user metrics"
      6. "Batch job syncs user data to legacy-erp nightly"

    consistency_strategy: "Eventual consistency with compensation"
    error_handling: "Retry with exponential backoff + manual review queue"

  order_fulfillment_workflow:
    description: "End-to-end order processing and fulfillment"
    participants:
      - service: "order-processing"
        architecture: "microservice"
        role: "Order validation and orchestration"
      - service: "inventory-management"
        architecture: "modular-monolith"
        role: "Inventory checking and reservation"
      - service: "payment-service"
        architecture: "microservice"
        role: "Payment processing and validation"
      - service: "shipping-service"
        architecture: "microservice"
        role: "Shipment creation and tracking"
      - service: "legacy-erp"
        architecture: "traditional-monolith"
        role: "Financial recording and compliance"

    workflow_steps:
      1. "Customer places order (Mobile/Web → order-processing)"
      2. "Order-processing validates order and starts saga"
      3. "Saga orchestrates inventory reservation"
      4. "Saga orchestrates payment processing"
      5. "Saga orchestrates shipment creation"
      6. "Order completion event triggers ERP synchronization"
      7. "Customer receives order confirmation and tracking info"

    consistency_strategy: "Saga orchestration with compensation"
    error_handling: "Automatic rollback with customer notification"

  data_analytics_pipeline:
    description: "Cross-system data collection and analysis workflow"
    participants:
      - service: "all-microservices"
        architecture: "microservice"
        role: "Business event publishing"
      - service: "analytics-reporting"
        architecture: "modular-monolith"
        role: "Event aggregation and analysis"
      - service: "legacy-erp"
        architecture: "traditional-monolith"
        role: "Financial and operational data source"
      - service: "data-transformation"
        architecture: "serverless"
        role: "Data cleaning and transformation"

    workflow_steps:
      1. "All services publish business events to event stream"
      2. "Serverless functions transform events into analytics format"
      3. "Analytics-reporting consumes transformed events"
      4. "Batch job extracts data from legacy-erp"
      5. "Analytics-reporting correlates data across sources"
      6. "Reports and dashboards updated with aggregated insights"

    consistency_strategy: "Eventual consistency with reconciliation"
    error_handling: "Dead letter queue + retry + monitoring alerts"
```

### **Workflow Implementation Framework**
```typescript
// shared/workflows/workflow-orchestrator.ts
export interface WorkflowStep {
  stepId: string;
  stepName: string;
  serviceInfo: {
    serviceName: string;
    architecture: 'microservice' | 'modular-monolith' | 'traditional-monolith' | 'serverless';
  };
  operation: WorkflowOperation;
  dependencies: string[]; // stepIds this step depends on
  parallel?: boolean; // can run in parallel with other steps
  optional?: boolean; // workflow can continue if this step fails
  timeout: number;
  retryPolicy: RetryPolicy;
}

export interface WorkflowDefinition {
  workflowId: string;
  workflowType: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  consistencyStrategy: 'strong' | 'eventual' | 'saga';
  errorHandling: 'fail-fast' | 'continue-on-error' | 'compensation';
  timeoutMs: number;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  definition: WorkflowDefinition;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensating';
  currentSteps: Set<string>;
  completedSteps: Map<string, StepResult>;
  failedSteps: Map<string, StepError>;
  startedAt: Date;
  completedAt?: Date;
  context: Map<string, any>; // Data passed between steps
}

export class WorkflowOrchestrator {
  private activeWorkflows: Map<string, WorkflowExecution> = new Map();
  private workflowRepository: WorkflowRepository;
  private communicationClient: HybridCommunicationClient;
  private eventBus: EventBus;

  constructor(
    workflowRepository: WorkflowRepository,
    communicationClient: HybridCommunicationClient,
    eventBus: EventBus
  ) {
    this.workflowRepository = workflowRepository;
    this.communicationClient = communicationClient;
    this.eventBus = eventBus;
  }

  async startWorkflow(
    definition: WorkflowDefinition,
    initialContext: Map<string, any> = new Map()
  ): Promise<string> {
    const execution: WorkflowExecution = {
      executionId: generateUuid(),
      workflowId: definition.workflowId,
      definition,
      status: 'running',
      currentSteps: new Set(),
      completedSteps: new Map(),
      failedSteps: new Map(),
      startedAt: new Date(),
      context: initialContext,
    };

    this.activeWorkflows.set(execution.executionId, execution);
    await this.workflowRepository.save(execution);

    // Publish workflow started event
    await this.eventBus.publish({
      eventType: 'workflow.started',
      data: {
        executionId: execution.executionId,
        workflowType: definition.workflowType,
        workflowId: definition.workflowId,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        source: 'workflow-orchestrator',
      },
    });

    // Start executing available steps
    await this.continueWorkflowExecution(execution);

    return execution.executionId;
  }

  private async continueWorkflowExecution(execution: WorkflowExecution): Promise<void> {
    // Find steps that can be executed (dependencies met, not yet started)
    const availableSteps = this.findAvailableSteps(execution);

    if (availableSteps.length === 0) {
      // Check if workflow is complete
      if (this.isWorkflowComplete(execution)) {
        await this.completeWorkflow(execution);
      } else if (this.isWorkflowBlocked(execution)) {
        await this.handleBlockedWorkflow(execution);
      }
      return;
    }

    // Execute available steps
    for (const step of availableSteps) {
      if (step.parallel) {
        // Execute in parallel (don't await)
        this.executeWorkflowStep(execution, step);
      } else {
        // Execute sequentially (await)
        await this.executeWorkflowStep(execution, step);
      }
    }
  }

  private findAvailableSteps(execution: WorkflowExecution): WorkflowStep[] {
    return execution.definition.steps.filter(step => {
      // Step not already running or completed
      if (execution.currentSteps.has(step.stepId) ||
          execution.completedSteps.has(step.stepId)) {
        return false;
      }

      // All dependencies completed
      const dependenciesMet = step.dependencies.every(depId =>
        execution.completedSteps.has(depId)
      );

      return dependenciesMet;
    });
  }

  private async executeWorkflowStep(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<void> {
    execution.currentSteps.add(step.stepId);
    await this.workflowRepository.save(execution);

    try {
      // Execute step based on service architecture
      const result = await this.executeStepByArchitecture(execution, step);

      // Step completed successfully
      execution.completedSteps.set(step.stepId, {
        stepId: step.stepId,
        status: 'completed',
        result,
        completedAt: new Date(),
      });
      execution.currentSteps.delete(step.stepId);

      // Update workflow context with step results
      if (result?.contextUpdates) {
        for (const [key, value] of Object.entries(result.contextUpdates)) {
          execution.context.set(key, value);
        }
      }

      await this.workflowRepository.save(execution);

      // Continue with next available steps
      await this.continueWorkflowExecution(execution);

    } catch (error) {
      // Step failed
      execution.failedSteps.set(step.stepId, {
        stepId: step.stepId,
        error: error.message,
        failedAt: new Date(),
      });
      execution.currentSteps.delete(step.stepId);

      await this.handleStepFailure(execution, step, error);
    }
  }

  private async executeStepByArchitecture(
    execution: WorkflowExecution,
    step: WorkflowStep
  ): Promise<any> {
    const { serviceName, architecture } = step.serviceInfo;
    const context = Object.fromEntries(execution.context);

    switch (architecture) {
      case 'microservice':
        return await this.executeMicroserviceStep(serviceName, step, context);

      case 'modular-monolith':
        return await this.executeModularMonolithStep(serviceName, step, context);

      case 'traditional-monolith':
        return await this.executeLegacyMonolithStep(serviceName, step, context);

      case 'serverless':
        return await this.executeServerlessStep(step, context);

      default:
        throw new Error(`Unknown architecture: ${architecture}`);
    }
  }

  private async executeMicroserviceStep(
    serviceName: string,
    step: WorkflowStep,
    context: any
  ): Promise<any> {
    // Use optimal communication pattern for microservices
    return await this.communicationClient.communicate(
      'workflow-orchestrator',
      serviceName,
      {
        type: step.operation.type,
        method: step.operation.method,
        endpoint: step.operation.endpoint,
        payload: {
          ...step.operation.payload,
          context,
          workflowExecutionId: execution.executionId,
          stepId: step.stepId,
        },
        requestId: generateRequestId(),
        sourceService: 'workflow-orchestrator',
        timeout: step.timeout,
      }
    );
  }

  private async executeModularMonolithStep(
    serviceName: string,
    step: WorkflowStep,
    context: any
  ): Promise<any> {
    // Modular monoliths may prefer batch operations or longer timeouts
    return await this.communicationClient.communicate(
      'workflow-orchestrator',
      serviceName,
      {
        type: 'rest',
        method: step.operation.method,
        endpoint: step.operation.endpoint,
        payload: {
          ...step.operation.payload,
          context,
          workflowExecutionId: execution.executionId,
          stepId: step.stepId,
        },
        requestId: generateRequestId(),
        sourceService: 'workflow-orchestrator',
        timeout: Math.max(step.timeout, 30000), // Minimum 30s for monoliths
      }
    );
  }

  private async executeLegacyMonolithStep(
    serviceName: string,
    step: WorkflowStep,
    context: any
  ): Promise<any> {
    // Legacy systems often require special handling
    if (step.operation.type === 'batch') {
      // Queue batch operation
      return await this.queueLegacyBatchOperation(serviceName, step, context);
    } else {
      // Direct API call with conservative settings
      return await this.communicationClient.communicate(
        'workflow-orchestrator',
        serviceName,
        {
          type: 'rest',
          method: step.operation.method,
          endpoint: step.operation.endpoint,
          payload: {
            ...step.operation.payload,
            context,
          },
          requestId: generateRequestId(),
          sourceService: 'workflow-orchestrator',
          timeout: Math.min(step.timeout, 60000), // Max 60s for legacy
          retries: 1, // Conservative retry policy
        }
      );
    }
  }

  private async executeServerlessStep(step: WorkflowStep, context: any): Promise<any> {
    // Trigger serverless function execution
    const functionName = step.operation.functionName;
    const payload = {
      ...step.operation.payload,
      context,
      stepId: step.stepId,
    };

    // This would integrate with your serverless platform (AWS Lambda, Azure Functions, etc.)
    return await this.triggerServerlessFunction(functionName, payload);
  }
}

// Example: User Onboarding Workflow
export const USER_ONBOARDING_WORKFLOW: WorkflowDefinition = {
  workflowId: 'user-onboarding',
  workflowType: 'user-lifecycle',
  name: 'User Onboarding',
  description: 'Complete user registration and setup workflow',
  consistencyStrategy: 'eventual',
  errorHandling: 'continue-on-error',
  timeoutMs: 300000, // 5 minutes
  steps: [
    {
      stepId: 'create-user-account',
      stepName: 'Create User Account',
      serviceInfo: {
        serviceName: 'user-service',
        architecture: 'microservice',
      },
      operation: {
        type: 'command',
        method: 'POST',
        endpoint: '/users',
        payload: {}, // Will be populated from context
      },
      dependencies: [],
      timeout: 10000,
      retryPolicy: { maxAttempts: 3, backoffMs: 1000 },
    },
    {
      stepId: 'send-welcome-email',
      stepName: 'Send Welcome Email',
      serviceInfo: {
        serviceName: 'notification-services',
        architecture: 'modular-monolith',
      },
      operation: {
        type: 'command',
        method: 'POST',
        endpoint: '/notifications/email',
        payload: {
          template: 'welcome',
          channel: 'email',
        },
      },
      dependencies: ['create-user-account'],
      optional: true,
      timeout: 15000,
      retryPolicy: { maxAttempts: 2, backoffMs: 2000 },
    },
    {
      stepId: 'track-user-registration',
      stepName: 'Track User Registration',
      serviceInfo: {
        serviceName: 'analytics-reporting',
        architecture: 'modular-monolith',
      },
      operation: {
        type: 'command',
        method: 'POST',
        endpoint: '/analytics/events',
        payload: {
          eventType: 'user.registered',
        },
      },
      dependencies: ['create-user-account'],
      parallel: true,
      optional: true,
      timeout: 10000,
      retryPolicy: { maxAttempts: 2, backoffMs: 1000 },
    },
    {
      stepId: 'sync-to-erp',
      stepName: 'Sync User to ERP',
      serviceInfo: {
        serviceName: 'legacy-erp',
        architecture: 'traditional-monolith',
      },
      operation: {
        type: 'batch',
        method: 'POST',
        endpoint: '/batch/customer-sync',
        payload: {},
      },
      dependencies: ['create-user-account'],
      optional: true,
      timeout: 60000,
      retryPolicy: { maxAttempts: 1, backoffMs: 5000 },
    },
  ],
};
```

## Implementation Guidelines

### **Practical Implementation Steps**
```yaml
Implementation_Roadmap:
  phase_1_foundation:
    duration: "4-6 weeks"
    objectives:
      - "Establish unified architecture decision framework"
      - "Set up service registry for hybrid architecture mapping"
      - "Implement basic communication patterns"
      - "Create monitoring and observability standards"

    deliverables:
      - service_registry: "Hybrid service registry with architecture classification"
      - communication_client: "Universal communication client supporting all patterns"
      - monitoring_setup: "Unified monitoring across all architecture types"
      - decision_framework: "Architecture decision process and tooling"

    success_criteria:
      - "All services classified and registered"
      - "Basic inter-service communication working"
      - "Monitoring provides visibility across architectures"
      - "Team can make architecture decisions using framework"

  phase_2_integration:
    duration: "6-8 weeks"
    objectives:
      - "Implement saga orchestration for cross-service transactions"
      - "Set up event-driven communication patterns"
      - "Create workflow orchestration capabilities"
      - "Establish data consistency strategies"

    deliverables:
      - saga_orchestrator: "Distributed transaction management"
      - event_infrastructure: "Kafka-based event streaming platform"
      - workflow_engine: "Cross-architecture workflow orchestration"
      - consistency_patterns: "Data consistency implementation patterns"

    success_criteria:
      - "Complex workflows span multiple architecture types"
      - "Data consistency maintained across service boundaries"
      - "Event-driven patterns reduce coupling"
      - "Transactions handle failure scenarios gracefully"

  phase_3_optimization:
    duration: "4-6 weeks"
    objectives:
      - "Optimize performance across architecture boundaries"
      - "Implement advanced error handling and recovery"
      - "Add automated testing for hybrid scenarios"
      - "Create migration tooling for architecture evolution"

    deliverables:
      - performance_optimization: "Caching and optimization strategies"
      - error_handling: "Advanced error recovery and compensation"
      - testing_framework: "Hybrid architecture testing capabilities"
      - migration_tools: "Automated boundary migration tooling"

    success_criteria:
      - "System performance meets SLA requirements"
      - "Error recovery is automatic and reliable"
      - "Testing covers all integration scenarios"
      - "Architecture can evolve safely and incrementally"

  phase_4_governance:
    duration: "2-4 weeks"
    objectives:
      - "Establish architecture governance processes"
      - "Create documentation and training materials"
      - "Set up continuous improvement processes"
      - "Define success metrics and monitoring"

    deliverables:
      - governance_process: "Architecture review and approval workflows"
      - documentation: "Comprehensive implementation guides"
      - training_program: "Team training on hybrid architecture patterns"
      - metrics_dashboard: "Architecture health and performance metrics"

    success_criteria:
      - "Architecture decisions follow consistent process"
      - "Teams are trained on hybrid patterns"
      - "System health is continuously monitored"
      - "Architecture evolves based on measurable outcomes"
```

### **Implementation Checklist**
```yaml
Implementation_Checklist:
  architecture_foundation:
    - [ ] "Service registry implemented and populated"
    - [ ] "Architecture decision framework documented and adopted"
    - [ ] "Service boundaries clearly defined and documented"
    - [ ] "Team ownership and responsibilities established"

  communication_infrastructure:
    - [ ] "Hybrid communication client implemented"
    - [ ] "Event streaming platform (Kafka) deployed and configured"
    - [ ] "API gateway configured for all service types"
    - [ ] "Circuit breakers and retry policies implemented"

  data_consistency:
    - [ ] "Saga orchestration framework implemented"
    - [ ] "Event sourcing patterns established where needed"
    - [ ] "Data replication strategies implemented"
    - [ ] "Conflict resolution mechanisms in place"

  workflow_management:
    - [ ] "Workflow orchestrator implemented and deployed"
    - [ ] "Cross-architecture workflow definitions created"
    - [ ] "Error handling and compensation logic implemented"
    - [ ] "Workflow monitoring and alerting configured"

  observability:
    - [ ] "Distributed tracing across all architectures"
    - [ ] "Centralized logging with correlation IDs"
    - [ ] "Metrics collection from all service types"
    - [ ] "Alerting rules for hybrid scenarios"

  testing_strategies:
    - [ ] "Contract testing between services"
    - [ ] "Integration testing across architectures"
    - [ ] "Chaos engineering for failure scenarios"
    - [ ] "Performance testing for hybrid workflows"

  operational_readiness:
    - [ ] "Deployment pipelines support all architecture types"
    - [ ] "Rollback procedures tested and documented"
    - [ ] "Incident response procedures updated"
    - [ ] "Performance benchmarks established"

  governance_and_evolution:
    - [ ] "Architecture review process established"
    - [ ] "Migration tooling and procedures documented"
    - [ ] "Success metrics defined and monitored"
    - [ ] "Team training completed"
```

---

## Quality Gates

### **Hybrid Integration Excellence**
- [ ] All services classified and properly integrated using appropriate patterns
- [ ] Cross-architecture workflows execute reliably with proper error handling
- [ ] Data consistency maintained across different architecture boundaries
- [ ] Performance requirements met for all integration scenarios
- [ ] Migration paths defined and tested for architecture evolution

### **Technical Excellence**
- [ ] Comprehensive observability across all architecture types
- [ ] Automated testing covers all hybrid integration scenarios
- [ ] Error recovery and compensation mechanisms work reliably
- [ ] Security standards maintained across architectural boundaries
- [ ] Documentation and training enable team success

## Success Metrics
- Integration reliability: >99.9% successful cross-architecture communications
- Workflow completion rate: >99.5% successful complex workflow executions
- System performance: <100ms p95 latency for synchronous cross-architecture calls
- Data consistency: <1% inconsistency rate with automatic reconciliation
- Team productivity: 50% reduction in integration development time

---

**Integration References:**
- `enterprise/unified_architecture_decision_framework.md` - Core decision framework and hybrid strategy
- `integration/01_cross_platform_integration.md` - Platform integration patterns
- `integration/02_api_integration_patterns.md` - Communication protocols and patterns
- `enterprise/05_enterprise_microservice_template_guide.md` - Service implementation standards
- `multi-platform/03_multiplatform_cross_platform_deployment.md` - Deployment coordination across architectures