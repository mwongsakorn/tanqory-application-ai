---
title: Rate Limits, Quotas & Throttling
version: 1.0
owner: Platform Team
last_reviewed: 2025-09-16
next_review: 2025-12-16
classification: CONFIDENTIAL
scope: [API_Management, Performance_Protection, Resource_Management]
---

# Rate Limits, Quotas & Throttling

> **Enterprise Memory**: กำหนดระบบการจัดการ rate limiting, quota management, และ throttling strategies สำหรับการปกป้องระบบจากการใช้งานเกินขีดจำกัดและรับประกันประสิทธิภาพระดับ enterprise

## Table of Contents
- [Rate Limiting Strategy](#rate-limiting-strategy)
- [Quota Management](#quota-management)
- [Throttling Algorithms](#throttling-algorithms)
- [Client-Side Rate Limiting](#client-side-rate-limiting)
- [Burst Management](#burst-management)
- [Monitoring & Analytics](#monitoring--analytics)

---

## Rate Limiting Strategy

### **Multi-Tier Rate Limiting Architecture**
```yaml
Rate_Limiting_Tiers:
  gateway_level: # API Gateway (Kong/Nginx)
    purpose: "First line defense, DDoS protection"
    scope: "Global traffic shaping"
    limits:
      requests_per_second: 10000
      requests_per_minute: 500000
      concurrent_connections: 50000
    algorithms: ["sliding_window", "leaky_bucket"]

  service_level: # Individual microservices
    purpose: "Service-specific protection"
    scope: "Per-service resource protection"
    limits:
      requests_per_second: 1000
      requests_per_minute: 50000
      concurrent_requests: 5000
    algorithms: ["token_bucket", "fixed_window"]

  user_level: # Per authenticated user
    purpose: "Fair usage enforcement"
    scope: "Individual user quotas"
    limits:
      free_tier: "100_requests_per_hour"
      basic_tier: "1000_requests_per_hour"
      premium_tier: "10000_requests_per_hour"
      enterprise_tier: "unlimited_with_burst_protection"

  tenant_level: # Multi-tenant isolation
    purpose: "Tenant resource isolation"
    scope: "Per-tenant quotas"
    limits:
      small_tenant: "10000_requests_per_hour"
      medium_tenant: "100000_requests_per_hour"
      large_tenant: "1000000_requests_per_hour"
      enterprise_tenant: "custom_negotiated_limits"

  endpoint_level: # Specific API endpoints
    purpose: "Endpoint-specific protection"
    scope: "Resource-intensive operations"
    examples:
      authentication: "10_requests_per_minute_per_ip"
      password_reset: "5_requests_per_hour_per_email"
      file_upload: "10_uploads_per_hour_per_user"
      export_data: "1_request_per_hour_per_user"
      search_heavy: "100_requests_per_minute_per_user"

Rate_Limiting_Matrix:
  public_endpoints:
    unauthenticated: "1000_requests_per_hour_per_ip"
    rate_limit_headers: true
    burst_allowance: "50_requests_per_minute"

  authenticated_endpoints:
    by_user_tier: "tier_specific_limits"
    rate_limit_headers: true
    burst_allowance: "tier_specific_burst"

  admin_endpoints:
    admin_users: "10000_requests_per_hour"
    system_accounts: "unlimited_with_monitoring"
    burst_allowance: "200_requests_per_minute"

  internal_endpoints:
    service_to_service: "unlimited_with_circuit_breaker"
    health_checks: "unlimited"
    metrics_collection: "unlimited"
```

### **Rate Limiting Implementation**
```typescript
interface RateLimitRule {
  id: string;
  name: string;
  scope: 'global' | 'user' | 'tenant' | 'ip' | 'endpoint';
  algorithm: 'token_bucket' | 'leaky_bucket' | 'sliding_window' | 'fixed_window';
  limits: {
    requests: number;
    window: Duration; // e.g., '1h', '1m', '1s'
    burst?: number;
  };
  keys: string[]; // Keys to identify the rate limit scope
  actions: RateLimitAction[];
}

interface RateLimitAction {
  threshold: number; // percentage of limit
  action: 'log' | 'warn' | 'throttle' | 'reject' | 'queue';
  parameters?: any;
}

export class EnterpriseRateLimiter {
  private redis: RedisClient;
  private metrics: MetricsCollector;
  private alertManager: AlertManager;

  async checkRateLimit(
    request: RateLimitRequest
  ): Promise<RateLimitResult> {

    const applicableRules = await this.getApplicableRules(request);
    const results: RuleLimitResult[] = [];

    for (const rule of applicableRules) {
      const ruleResult = await this.evaluateRule(request, rule);
      results.push(ruleResult);

      // If any rule blocks the request, return immediately
      if (ruleResult.action === 'reject') {
        await this.recordRateLimitViolation(request, rule, ruleResult);
        return {
          allowed: false,
          blockedBy: rule,
          results,
          retryAfter: ruleResult.retryAfter
        };
      }
    }

    // Apply least restrictive successful result
    const allowedResult = this.aggregateResults(results);

    await this.recordRateLimitSuccess(request, results);

    return {
      allowed: true,
      results,
      remainingQuota: allowedResult.remainingQuota,
      resetTime: allowedResult.resetTime
    };
  }

  private async evaluateRule(
    request: RateLimitRequest,
    rule: RateLimitRule
  ): Promise<RuleLimitResult> {

    const limitKey = this.buildLimitKey(request, rule);

    switch (rule.algorithm) {
      case 'token_bucket':
        return await this.evaluateTokenBucket(limitKey, rule);

      case 'leaky_bucket':
        return await this.evaluateLeakyBucket(limitKey, rule);

      case 'sliding_window':
        return await this.evaluateSlidingWindow(limitKey, rule);

      case 'fixed_window':
        return await this.evaluateFixedWindow(limitKey, rule);

      default:
        throw new Error(`Unknown rate limiting algorithm: ${rule.algorithm}`);
    }
  }

  private async evaluateTokenBucket(
    limitKey: string,
    rule: RateLimitRule
  ): Promise<RuleLimitResult> {

    const now = Date.now();
    const windowMs = this.parseDuration(rule.limits.window);

    // Use Redis script for atomic token bucket operations
    const luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local window_ms = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])
      local tokens_requested = tonumber(ARGV[5])

      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now

      -- Calculate tokens to add based on time elapsed
      local time_elapsed = (now - last_refill) / 1000
      local tokens_to_add = math.floor(time_elapsed * refill_rate)
      tokens = math.min(capacity, tokens + tokens_to_add)

      -- Check if we have enough tokens
      if tokens >= tokens_requested then
        tokens = tokens - tokens_requested
        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
        return {1, tokens, capacity}
      else
        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, math.ceil(window_ms / 1000))
        return {0, tokens, capacity}
      end
    `;

    const refillRate = rule.limits.requests / (windowMs / 1000);
    const result = await this.redis.eval(
      luaScript,
      1,
      limitKey,
      rule.limits.requests, // capacity
      refillRate,
      windowMs,
      now,
      1 // tokens requested
    ) as [number, number, number];

    const [allowed, remainingTokens, capacity] = result;

    return {
      rule: rule.id,
      allowed: allowed === 1,
      remainingQuota: remainingTokens,
      totalQuota: capacity,
      resetTime: new Date(now + windowMs),
      retryAfter: allowed === 0 ? Math.ceil((1 - remainingTokens) / refillRate) : 0,
      action: allowed === 1 ? 'allow' : 'reject'
    };
  }

  private async evaluateSlidingWindow(
    limitKey: string,
    rule: RateLimitRule
  ): Promise<RuleLimitResult> {

    const now = Date.now();
    const windowMs = this.parseDuration(rule.limits.window);
    const windowStart = now - windowMs;

    // Redis sliding window implementation
    const luaScript = `
      local key = KEYS[1]
      local window_start = tonumber(ARGV[1])
      local now = tonumber(ARGV[2])
      local limit = tonumber(ARGV[3])

      -- Remove expired entries
      redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

      -- Count current requests in window
      local current_count = redis.call('ZCARD', key)

      if current_count < limit then
        -- Add current request
        redis.call('ZADD', key, now, now .. ':' .. math.random())
        redis.call('EXPIRE', key, math.ceil((now - window_start) / 1000))
        return {1, limit - current_count - 1, limit}
      else
        return {0, 0, limit}
      end
    `;

    const result = await this.redis.eval(
      luaScript,
      1,
      limitKey,
      windowStart,
      now,
      rule.limits.requests
    ) as [number, number, number];

    const [allowed, remaining, total] = result;

    return {
      rule: rule.id,
      allowed: allowed === 1,
      remainingQuota: remaining,
      totalQuota: total,
      resetTime: new Date(now + windowMs),
      retryAfter: allowed === 0 ? Math.ceil(windowMs / 1000) : 0,
      action: allowed === 1 ? 'allow' : 'reject'
    };
  }

  private buildLimitKey(request: RateLimitRequest, rule: RateLimitRule): string {
    const keyParts = rule.keys.map(key => {
      switch (key) {
        case 'ip':
          return request.clientIP;
        case 'user':
          return request.userId || 'anonymous';
        case 'tenant':
          return request.tenantId || 'default';
        case 'endpoint':
          return `${request.method}:${request.path}`;
        case 'api_key':
          return request.apiKey || 'no_key';
        default:
          return request.headers[key] || 'unknown';
      }
    });

    return `rate_limit:${rule.id}:${keyParts.join(':')}`;
  }
}
```

## Quota Management

### **User Tier & Quota System**
```yaml
User_Tiers:
  free_tier:
    api_calls: "1000_per_month"
    rate_limit: "10_per_minute"
    storage: "100mb"
    features: ["basic_api", "community_support"]
    burst_allowance: "20_requests_per_minute"
    overage_policy: "hard_limit_block_requests"

  basic_tier:
    api_calls: "10000_per_month"
    rate_limit: "100_per_minute"
    storage: "1gb"
    features: ["full_api", "email_support", "webhooks"]
    burst_allowance: "200_requests_per_minute"
    overage_policy: "soft_limit_throttle_to_free_tier"

  premium_tier:
    api_calls: "100000_per_month"
    rate_limit: "1000_per_minute"
    storage: "10gb"
    features: ["full_api", "priority_support", "webhooks", "analytics"]
    burst_allowance: "2000_requests_per_minute"
    overage_policy: "pay_per_use_with_notification"

  enterprise_tier:
    api_calls: "unlimited"
    rate_limit: "custom_negotiated"
    storage: "unlimited"
    features: ["full_api", "dedicated_support", "custom_integrations", "sla_guarantee"]
    burst_allowance: "custom_negotiated"
    overage_policy: "custom_agreement"

Quota_Tracking:
  monthly_quotas:
    reset_schedule: "first_day_of_month_00_00_utc"
    proration: "enabled_for_mid_month_upgrades"
    rollover: "disabled"
    warnings: ["50%", "75%", "90%", "95%"]

  daily_quotas:
    reset_schedule: "00_00_utc_daily"
    proration: "based_on_monthly_quota"
    warnings: ["80%", "95%"]

  burst_quotas:
    window: "1_minute"
    reset: "sliding_window"
    accumulation: "token_bucket_with_burst_capacity"

Quota_Enforcement:
  soft_limits:
    action: "throttle_requests"
    warning_notifications: true
    grace_period: "24_hours"

  hard_limits:
    action: "reject_requests"
    immediate_notification: true
    upgrade_suggestions: true

  overage_handling:
    free_tier: "block_until_reset"
    paid_tiers: "notify_and_continue_with_overage_charges"
    enterprise: "custom_policy"
```

### **Quota Management Implementation**
```typescript
interface UserQuota {
  userId: string;
  tier: UserTier;
  quotas: {
    monthly: QuotaAllocation;
    daily: QuotaAllocation;
    burst: QuotaAllocation;
  };
  usage: {
    monthly: QuotaUsage;
    daily: QuotaUsage;
    burst: QuotaUsage;
  };
  overagePolicy: OveragePolicy;
}

interface QuotaAllocation {
  requests: number;
  storage: number;
  bandwidth: number;
  features: string[];
}

export class QuotaManager {
  private redis: RedisClient;
  private database: DatabaseClient;
  private billingService: BillingService;
  private notificationService: NotificationService;

  async checkQuota(
    userId: string,
    requestType: string,
    resourceCost: ResourceCost
  ): Promise<QuotaCheckResult> {

    const userQuota = await this.getUserQuota(userId);

    // Check monthly quota
    const monthlyCheck = await this.checkMonthlyQuota(userQuota, resourceCost);
    if (!monthlyCheck.allowed) {
      return {
        allowed: false,
        reason: 'monthly_quota_exceeded',
        quota: userQuota,
        checkResults: { monthly: monthlyCheck }
      };
    }

    // Check daily quota
    const dailyCheck = await this.checkDailyQuota(userQuota, resourceCost);
    if (!dailyCheck.allowed) {
      return {
        allowed: false,
        reason: 'daily_quota_exceeded',
        quota: userQuota,
        checkResults: { monthly: monthlyCheck, daily: dailyCheck }
      };
    }

    // Check burst quota
    const burstCheck = await this.checkBurstQuota(userQuota, resourceCost);
    if (!burstCheck.allowed) {
      return {
        allowed: false,
        reason: 'burst_quota_exceeded',
        quota: userQuota,
        checkResults: { monthly: monthlyCheck, daily: dailyCheck, burst: burstCheck }
      };
    }

    return {
      allowed: true,
      quota: userQuota,
      checkResults: { monthly: monthlyCheck, daily: dailyCheck, burst: burstCheck }
    };
  }

  async consumeQuota(
    userId: string,
    resourceCost: ResourceCost
  ): Promise<QuotaConsumptionResult> {

    const luaScript = `
      local user_id = ARGV[1]
      local requests = tonumber(ARGV[2])
      local storage = tonumber(ARGV[3])
      local bandwidth = tonumber(ARGV[4])
      local timestamp = tonumber(ARGV[5])

      -- Update monthly usage
      local monthly_key = 'quota:monthly:' .. user_id
      local monthly_requests = redis.call('HINCRBY', monthly_key, 'requests', requests)
      local monthly_storage = redis.call('HINCRBY', monthly_key, 'storage', storage)
      local monthly_bandwidth = redis.call('HINCRBY', monthly_key, 'bandwidth', bandwidth)

      -- Update daily usage
      local daily_key = 'quota:daily:' .. user_id .. ':' .. os.date('%Y-%m-%d', timestamp)
      local daily_requests = redis.call('HINCRBY', daily_key, 'requests', requests)
      redis.call('EXPIRE', daily_key, 86400) -- 24 hours

      -- Update burst usage (1-minute window)
      local burst_key = 'quota:burst:' .. user_id .. ':' .. math.floor(timestamp / 60)
      local burst_requests = redis.call('HINCRBY', burst_key, 'requests', requests)
      redis.call('EXPIRE', burst_key, 60) -- 1 minute

      return {
        monthly_requests, monthly_storage, monthly_bandwidth,
        daily_requests, burst_requests
      }
    `;

    const result = await this.redis.eval(
      luaScript,
      0,
      userId,
      resourceCost.requests,
      resourceCost.storage,
      resourceCost.bandwidth,
      Date.now()
    ) as number[];

    const [
      monthlyRequests, monthlyStorage, monthlyBandwidth,
      dailyRequests, burstRequests
    ] = result;

    // Check if usage exceeds quotas and trigger notifications
    await this.checkQuotaWarnings(userId, {
      monthly: { requests: monthlyRequests, storage: monthlyStorage, bandwidth: monthlyBandwidth },
      daily: { requests: dailyRequests },
      burst: { requests: burstRequests }
    });

    return {
      success: true,
      newUsage: {
        monthly: { requests: monthlyRequests, storage: monthlyStorage, bandwidth: monthlyBandwidth },
        daily: { requests: dailyRequests },
        burst: { requests: burstRequests }
      },
      consumedAt: new Date()
    };
  }

  private async checkQuotaWarnings(
    userId: string,
    currentUsage: QuotaUsage
  ): Promise<void> {

    const userQuota = await this.getUserQuota(userId);
    const warningThresholds = [0.5, 0.75, 0.9, 0.95]; // 50%, 75%, 90%, 95%

    // Check monthly quota warnings
    const monthlyUsagePercentage = currentUsage.monthly.requests / userQuota.quotas.monthly.requests;

    for (const threshold of warningThresholds) {
      if (monthlyUsagePercentage >= threshold) {
        const warningKey = `quota_warning:monthly:${userId}:${threshold}`;
        const alreadySent = await this.redis.get(warningKey);

        if (!alreadySent) {
          await this.notificationService.sendQuotaWarning({
            userId,
            quotaType: 'monthly',
            usagePercentage: monthlyUsagePercentage,
            threshold,
            remainingQuota: userQuota.quotas.monthly.requests - currentUsage.monthly.requests
          });

          // Mark warning as sent (expires at end of month)
          await this.redis.setex(warningKey, this.getSecondsUntilEndOfMonth(), '1');
        }
      }
    }
  }

  async handleQuotaExceeded(
    userId: string,
    quotaType: 'monthly' | 'daily' | 'burst',
    overageAmount: number
  ): Promise<QuotaExceededResult> {

    const userQuota = await this.getUserQuota(userId);

    switch (userQuota.overagePolicy.type) {
      case 'hard_limit':
        await this.notificationService.sendQuotaExceededNotification({
          userId,
          quotaType,
          action: 'requests_blocked',
          upgradeOptions: await this.getUpgradeOptions(userId)
        });

        return {
          action: 'block_requests',
          message: `${quotaType} quota exceeded. Upgrade your plan to continue.`,
          upgradeOptions: await this.getUpgradeOptions(userId)
        };

      case 'soft_limit':
        await this.throttleUserRequests(userId, userQuota.tier);

        return {
          action: 'throttle_requests',
          message: `${quotaType} quota exceeded. Requests are being throttled.`,
          throttleRate: this.getThrottleRate(userQuota.tier)
        };

      case 'pay_per_use':
        const overageCharge = await this.calculateOverageCharge(userId, overageAmount);

        await this.billingService.createOverageCharge({
          userId,
          quotaType,
          overageAmount,
          charge: overageCharge
        });

        await this.notificationService.sendOverageChargeNotification({
          userId,
          charge: overageCharge,
          quotaType
        });

        return {
          action: 'allow_with_overage',
          message: `${quotaType} quota exceeded. Overage charges apply.`,
          overageCharge
        };

      default:
        throw new Error(`Unknown overage policy: ${userQuota.overagePolicy.type}`);
    }
  }
}
```

## Throttling Algorithms

### **Algorithm Comparison & Selection**
```yaml
Throttling_Algorithms:
  token_bucket:
    best_for: "Allowing burst traffic with sustained rate control"
    characteristics:
      - Permits bursts up to bucket capacity
      - Smooth rate limiting over time
      - Good for APIs with occasional spikes
    parameters:
      bucket_capacity: "Maximum burst size"
      refill_rate: "Tokens added per second"
      tokens_per_request: "Usually 1, but can be weighted"

    implementation_complexity: "medium"
    memory_usage: "low"
    precision: "high"

  leaky_bucket:
    best_for: "Smoothing bursty traffic into steady output"
    characteristics:
      - Enforces steady output rate regardless of input
      - Queues requests and processes at fixed rate
      - Good for protecting downstream services
    parameters:
      bucket_capacity: "Queue size for pending requests"
      leak_rate: "Requests processed per second"
      drop_policy: "How to handle overflow"

    implementation_complexity: "high"
    memory_usage: "medium"
    precision: "very_high"

  sliding_window:
    best_for: "Precise rate limiting with consistent behavior"
    characteristics:
      - Accurate rate limiting over exact time windows
      - No sudden resets at window boundaries
      - Memory intensive for high-precision tracking
    parameters:
      window_size: "Time window for rate calculation"
      limit: "Maximum requests per window"
      precision: "Window subdivision for accuracy"

    implementation_complexity: "high"
    memory_usage: "high"
    precision: "very_high"

  fixed_window:
    best_for: "Simple rate limiting with periodic resets"
    characteristics:
      - Easy to implement and understand
      - Potential for traffic spikes at window boundaries
      - Good for simple use cases
    parameters:
      window_size: "Fixed time window (1m, 1h, etc.)"
      limit: "Maximum requests per window"

    implementation_complexity: "low"
    memory_usage: "very_low"
    precision: "low"

Algorithm_Selection_Matrix:
  high_traffic_apis:
    primary: "token_bucket"
    fallback: "sliding_window"
    reasoning: "Need to handle bursts efficiently"

  backend_service_protection:
    primary: "leaky_bucket"
    fallback: "token_bucket"
    reasoning: "Steady output rate protects downstream"

  user_facing_quotas:
    primary: "sliding_window"
    fallback: "fixed_window"
    reasoning: "Precise quota enforcement expected"

  ddos_protection:
    primary: "token_bucket"
    fallback: "fixed_window"
    reasoning: "Fast decision making under load"
```

### **Advanced Throttling Implementation**
```typescript
interface ThrottlingStrategy {
  algorithm: 'token_bucket' | 'leaky_bucket' | 'sliding_window' | 'fixed_window';
  parameters: AlgorithmParameters;
  fallbackStrategy?: ThrottlingStrategy;
  adaptiveScaling?: AdaptiveScalingConfig;
}

export class AdaptiveThrottlingEngine {
  private redis: RedisClient;
  private metrics: MetricsCollector;
  private strategies: Map<string, ThrottlingStrategy>;

  async initializeThrottling(): Promise<void> {
    // Load throttling strategies from configuration
    this.strategies = await this.loadThrottlingStrategies();

    // Start adaptive scaling monitor
    this.startAdaptiveScaling();

    // Initialize algorithm implementations
    await this.initializeAlgorithms();
  }

  async throttleRequest(
    request: ThrottleRequest,
    strategyId: string
  ): Promise<ThrottleResult> {

    const strategy = this.strategies.get(strategyId);
    if (!strategy) {
      throw new Error(`Unknown throttling strategy: ${strategyId}`);
    }

    try {
      // Apply primary throttling algorithm
      const result = await this.applyThrottling(request, strategy);

      // Record metrics for adaptive scaling
      await this.recordThrottlingMetrics(strategyId, request, result);

      return result;

    } catch (error) {
      // Fallback to secondary strategy if available
      if (strategy.fallbackStrategy) {
        console.warn(`Primary throttling failed, using fallback: ${error.message}`);
        return await this.applyThrottling(request, strategy.fallbackStrategy);
      }

      throw error;
    }
  }

  private async applyTokenBucketThrottling(
    request: ThrottleRequest,
    params: TokenBucketParameters
  ): Promise<ThrottleResult> {

    const key = this.buildThrottleKey(request);
    const now = Date.now();

    const luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local refill_rate = tonumber(ARGV[2])
      local cost = tonumber(ARGV[3])
      local now = tonumber(ARGV[4])

      local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
      local tokens = tonumber(bucket[1]) or capacity
      local last_refill = tonumber(bucket[2]) or now

      -- Calculate tokens to add
      local elapsed = (now - last_refill) / 1000
      local tokens_to_add = elapsed * refill_rate
      tokens = math.min(capacity, tokens + tokens_to_add)

      if tokens >= cost then
        tokens = tokens - cost
        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, 3600) -- 1 hour expiry

        return {
          1, -- allowed
          tokens, -- remaining tokens
          capacity, -- total capacity
          0 -- retry after (not applicable)
        }
      else
        redis.call('HMSET', key, 'tokens', tokens, 'last_refill', now)
        redis.call('EXPIRE', key, 3600)

        local retry_after = math.ceil((cost - tokens) / refill_rate)
        return {
          0, -- not allowed
          tokens, -- remaining tokens
          capacity, -- total capacity
          retry_after -- seconds to wait
        }
      end
    `;

    const result = await this.redis.eval(
      luaScript,
      1,
      key,
      params.capacity,
      params.refillRate,
      request.cost || 1,
      now
    ) as [number, number, number, number];

    const [allowed, remainingTokens, totalCapacity, retryAfter] = result;

    return {
      allowed: allowed === 1,
      remainingQuota: remainingTokens,
      totalQuota: totalCapacity,
      retryAfter: retryAfter > 0 ? new Date(now + retryAfter * 1000) : null,
      algorithm: 'token_bucket',
      cost: request.cost || 1
    };
  }

  private async applyLeakyBucketThrottling(
    request: ThrottleRequest,
    params: LeakyBucketParameters
  ): Promise<ThrottleResult> {

    const key = this.buildThrottleKey(request);
    const now = Date.now();

    // Leaky bucket implementation with queue
    const luaScript = `
      local key = KEYS[1]
      local capacity = tonumber(ARGV[1])
      local leak_rate = tonumber(ARGV[2])
      local now = tonumber(ARGV[3])
      local request_id = ARGV[4]

      -- Get current queue and last leak time
      local queue_key = key .. ':queue'
      local meta_key = key .. ':meta'
      local meta = redis.call('HMGET', meta_key, 'last_leak', 'level')
      local last_leak = tonumber(meta[1]) or now
      local current_level = tonumber(meta[2]) or 0

      -- Calculate leakage since last check
      local elapsed = (now - last_leak) / 1000
      local leaked = elapsed * leak_rate
      current_level = math.max(0, current_level - leaked)

      -- Check if we can accept the request
      if current_level < capacity then
        -- Add request to queue
        redis.call('ZADD', queue_key, now, request_id)
        current_level = current_level + 1

        -- Update metadata
        redis.call('HMSET', meta_key, 'last_leak', now, 'level', current_level)
        redis.call('EXPIRE', meta_key, 3600)
        redis.call('EXPIRE', queue_key, 3600)

        local processing_delay = current_level / leak_rate
        return {1, current_level, capacity, processing_delay}
      else
        return {0, current_level, capacity, 0}
      end
    `;

    const result = await this.redis.eval(
      luaScript,
      1,
      key,
      params.capacity,
      params.leakRate,
      now,
      request.id
    ) as [number, number, number, number];

    const [allowed, currentLevel, totalCapacity, processingDelay] = result;

    return {
      allowed: allowed === 1,
      remainingQuota: totalCapacity - currentLevel,
      totalQuota: totalCapacity,
      estimatedProcessingTime: processingDelay > 0 ? new Date(now + processingDelay * 1000) : null,
      algorithm: 'leaky_bucket',
      queuePosition: currentLevel
    };
  }

  private startAdaptiveScaling(): void {
    setInterval(async () => {
      for (const [strategyId, strategy] of this.strategies) {
        if (strategy.adaptiveScaling) {
          await this.adjustThrottlingParameters(strategyId, strategy);
        }
      }
    }, 60000); // Check every minute
  }

  private async adjustThrottlingParameters(
    strategyId: string,
    strategy: ThrottlingStrategy
  ): Promise<void> {

    const metrics = await this.getThrottlingMetrics(strategyId);

    if (!strategy.adaptiveScaling) return;

    const config = strategy.adaptiveScaling;

    // Analyze traffic patterns
    const analysis = this.analyzeTrafficPatterns(metrics);

    // Adjust parameters based on load
    if (analysis.load > config.scaleUpThreshold) {
      await this.scaleUpThrottling(strategyId, strategy, analysis);
    } else if (analysis.load < config.scaleDownThreshold) {
      await this.scaleDownThrottling(strategyId, strategy, analysis);
    }
  }

  private async scaleUpThrottling(
    strategyId: string,
    strategy: ThrottlingStrategy,
    analysis: TrafficAnalysis
  ): Promise<void> {

    const scaleFactor = Math.min(2.0, 1 + (analysis.load - 0.8) * 2);

    switch (strategy.algorithm) {
      case 'token_bucket':
        const tbParams = strategy.parameters as TokenBucketParameters;
        tbParams.refillRate = Math.floor(tbParams.refillRate * scaleFactor);
        tbParams.capacity = Math.floor(tbParams.capacity * scaleFactor);
        break;

      case 'leaky_bucket':
        const lbParams = strategy.parameters as LeakyBucketParameters;
        lbParams.leakRate = Math.floor(lbParams.leakRate * scaleFactor);
        break;

      case 'sliding_window':
        const swParams = strategy.parameters as SlidingWindowParameters;
        swParams.limit = Math.floor(swParams.limit * scaleFactor);
        break;
    }

    await this.metrics.recordEvent('throttling_scaled_up', {
      strategy: strategyId,
      scaleFactor,
      load: analysis.load
    });
  }
}
```

## Client-Side Rate Limiting

### **Client Hints & Cooperative Throttling**
```yaml
Client_Side_Strategy:
  rate_limit_headers:
    standard_headers:
      - "X-RateLimit-Limit: 1000"      # Total limit per window
      - "X-RateLimit-Remaining: 750"   # Remaining requests
      - "X-RateLimit-Reset: 1640995200" # Unix timestamp of reset
      - "X-RateLimit-Window: 3600"     # Window size in seconds

    enhanced_headers:
      - "X-RateLimit-Burst-Limit: 100" # Burst allowance
      - "X-RateLimit-Burst-Remaining: 85" # Burst remaining
      - "X-RateLimit-Retry-After: 60"  # Seconds to wait before retry
      - "X-RateLimit-Policy: sliding-window" # Algorithm in use

  client_hints:
    request_priority:
      header: "X-Request-Priority"
      values: ["low", "normal", "high", "critical"]
      impact: "High priority requests get preferential rate limiting"

    request_cost:
      header: "X-Request-Cost"
      values: "1-100"
      impact: "Heavy operations consume more quota"

    client_capabilities:
      header: "X-Client-Capabilities"
      values: ["retry", "queue", "batch", "cache"]
      impact: "Influences throttling strategy selection"

  cooperative_throttling:
    client_backoff:
      implementation: "Exponential backoff with jitter"
      base_delay: "1_second"
      max_delay: "300_seconds"
      jitter: "±25%"

    request_batching:
      enabled: true
      max_batch_size: 100
      batch_timeout: "5_seconds"
      rate_limit_sharing: "Batch counted as single request"

    intelligent_retry:
      retry_budget: "10%_of_quota"
      retry_strategies: ["immediate", "delayed", "circuit_breaker"]
      failure_classification: "Transient vs permanent errors"
```

### **Client SDK Rate Limiting**
```typescript
export class ClientRateLimiter {
  private rateLimitState: RateLimitState;
  private backoffCalculator: BackoffCalculator;
  private retryBudget: RetryBudget;

  async makeRequest<T>(
    request: APIRequest,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {

    // Check client-side rate limit first
    const allowedLocally = await this.checkLocalRateLimit(request);
    if (!allowedLocally.allowed) {
      await this.waitForQuota(allowedLocally.retryAfter);
    }

    try {
      // Add client hints to request
      this.addClientHints(request, options);

      // Make the actual request
      const response = await this.executeRequest<T>(request);

      // Update rate limit state from response headers
      this.updateRateLimitState(response.headers);

      // Reset backoff on success
      this.backoffCalculator.reset();

      return response;

    } catch (error) {
      if (this.isRateLimitError(error)) {
        return await this.handleRateLimitError<T>(request, error, options);
      }

      throw error;
    }
  }

  private addClientHints(request: APIRequest, options?: RequestOptions): void {
    // Add request priority hint
    if (options?.priority) {
      request.headers['X-Request-Priority'] = options.priority;
    }

    // Add request cost hint
    const estimatedCost = this.estimateRequestCost(request);
    if (estimatedCost > 1) {
      request.headers['X-Request-Cost'] = estimatedCost.toString();
    }

    // Add client capabilities
    request.headers['X-Client-Capabilities'] = [
      'retry',
      'backoff',
      'batch',
      'queue'
    ].join(',');

    // Add request ID for correlation
    request.headers['X-Request-ID'] = this.generateRequestId();
  }

  private async handleRateLimitError<T>(
    originalRequest: APIRequest,
    error: RateLimitError,
    options?: RequestOptions
  ): Promise<APIResponse<T>> {

    const rateLimitInfo = this.parseRateLimitError(error);

    // Check retry budget
    if (!this.retryBudget.canRetry()) {
      throw new Error('Retry budget exhausted');
    }

    // Update rate limit state
    this.updateRateLimitStateFromError(rateLimitInfo);

    // Calculate backoff delay
    const backoffDelay = this.backoffCalculator.calculateDelay(
      rateLimitInfo.retryAfter || this.rateLimitState.resetTime
    );

    // Consume retry budget
    this.retryBudget.consumeRetry();

    // Wait for the calculated delay
    await this.sleep(backoffDelay);

    // Retry the request
    return await this.makeRequest<T>(originalRequest, {
      ...options,
      isRetry: true
    });
  }

  private updateRateLimitState(headers: Record<string, string>): void {
    const limit = parseInt(headers['x-ratelimit-limit'] || '0');
    const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');
    const reset = parseInt(headers['x-ratelimit-reset'] || '0');
    const window = parseInt(headers['x-ratelimit-window'] || '3600');

    this.rateLimitState = {
      limit,
      remaining,
      resetTime: new Date(reset * 1000),
      window: window * 1000,
      lastUpdated: new Date()
    };

    // Adjust local rate limiting based on server state
    this.adjustLocalRateLimit();
  }

  private adjustLocalRateLimit(): void {
    const { remaining, limit, resetTime } = this.rateLimitState;

    if (remaining < limit * 0.1) { // Less than 10% remaining
      // Implement aggressive local throttling
      this.localThrottler.setMode('conservative');
    } else if (remaining < limit * 0.3) { // Less than 30% remaining
      // Implement moderate local throttling
      this.localThrottler.setMode('moderate');
    } else {
      // Normal operation
      this.localThrottler.setMode('normal');
    }
  }

  async batchRequests<T>(
    requests: APIRequest[],
    batchOptions?: BatchOptions
  ): Promise<APIResponse<T>[]> {

    const batchSize = batchOptions?.maxBatchSize || 10;
    const batches = this.chunkRequests(requests, batchSize);
    const results: APIResponse<T>[] = [];

    for (const batch of batches) {
      // Check if we can make this batch without exceeding quotas
      const batchCost = batch.reduce((cost, req) => cost + this.estimateRequestCost(req), 0);

      if (!this.canMakeBatch(batchCost)) {
        await this.waitForQuotaRecovery(batchCost);
      }

      // Execute batch with parallel requests but respect rate limits
      const batchResults = await this.executeBatchWithRateLimit<T>(batch);
      results.push(...batchResults);

      // Small delay between batches to avoid overwhelming the server
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.sleep(this.calculateInterBatchDelay());
      }
    }

    return results;
  }
}

export class BackoffCalculator {
  private attempts: number = 0;
  private baseDelay: number = 1000; // 1 second
  private maxDelay: number = 300000; // 5 minutes
  private jitterFactor: number = 0.25; // ±25%

  calculateDelay(serverRetryAfter?: Date): number {
    this.attempts++;

    // Use server-provided retry-after if available
    if (serverRetryAfter) {
      const serverDelay = serverRetryAfter.getTime() - Date.now();
      if (serverDelay > 0) {
        return this.addJitter(serverDelay);
      }
    }

    // Exponential backoff: baseDelay * 2^attempts
    const exponentialDelay = this.baseDelay * Math.pow(2, this.attempts - 1);
    const cappedDelay = Math.min(exponentialDelay, this.maxDelay);

    return this.addJitter(cappedDelay);
  }

  private addJitter(delay: number): number {
    const jitter = delay * this.jitterFactor * (Math.random() * 2 - 1);
    return Math.max(0, delay + jitter);
  }

  reset(): void {
    this.attempts = 0;
  }
}
```

## Burst Management

### **Burst Traffic Handling**
```yaml
Burst_Management_Strategy:
  burst_detection:
    traffic_spike_thresholds:
      minor_spike: "150%_of_average_traffic"
      major_spike: "300%_of_average_traffic"
      extreme_spike: "500%_of_average_traffic"

    detection_window: "1_minute_sliding_window"
    baseline_calculation: "7_day_moving_average"
    confidence_interval: "95%"

  burst_response_tiers:
    tier_1_accommodate:
      trigger: "minor_spike_detected"
      actions:
        - "Increase_token_bucket_refill_rates_by_50%"
        - "Enable_request_queuing_with_5s_timeout"
        - "Scale_up_processing_capacity_automatically"
      duration: "15_minutes_or_until_spike_ends"

    tier_2_throttle:
      trigger: "major_spike_detected"
      actions:
        - "Implement_aggressive_rate_limiting"
        - "Prioritize_authenticated_users"
        - "Defer_non_critical_operations"
        - "Send_spike_notifications_to_ops_team"
      duration: "30_minutes_or_manual_intervention"

    tier_3_protect:
      trigger: "extreme_spike_or_attack_detected"
      actions:
        - "Enable_emergency_rate_limiting"
        - "Block_suspicious_IP_addresses"
        - "Activate_DDoS_protection_services"
        - "Failover_to_minimal_service_mode"
      duration: "Until_manually_resolved"

  adaptive_burst_handling:
    learning_algorithms:
      - "Traffic_pattern_recognition"
      - "Seasonal_adjustment_models"
      - "Anomaly_detection_machine_learning"
      - "Predictive_scaling_based_on_historical_data"

    auto_scaling_triggers:
      scale_up_threshold: "80%_capacity_utilization"
      scale_down_threshold: "30%_capacity_utilization"
      scaling_cooldown: "5_minutes_between_scale_events"
      max_scale_factor: "5x_baseline_capacity"

  legitimate_burst_scenarios:
    planned_events:
      - "Product_launches_or_marketing_campaigns"
      - "News_mentions_or_viral_content"
      - "Scheduled_batch_operations"
      - "Partner_integrations_or_bulk_imports"

    unplanned_events:
      - "Breaking_news_or_trending_topics"
      - "Service_recovery_after_outages"
      - "Sudden_user_behavior_changes"
      - "External_system_failures_causing_retries"
```

### **Burst Management Implementation**
```typescript
interface BurstDetectionConfig {
  detectionWindow: number; // milliseconds
  thresholds: {
    minor: number;
    major: number;
    extreme: number;
  };
  baselineWindow: number; // milliseconds for baseline calculation
}

export class BurstManager {
  private redis: RedisClient;
  private metrics: MetricsCollector;
  private autoscaler: AutoScaler;
  private alertManager: AlertManager;

  async detectAndHandleBurst(): Promise<BurstHandlingResult> {
    // Collect current traffic metrics
    const currentMetrics = await this.collectCurrentTrafficMetrics();

    // Calculate baseline from historical data
    const baseline = await this.calculateTrafficBaseline();

    // Detect burst level
    const burstLevel = this.detectBurstLevel(currentMetrics, baseline);

    if (burstLevel === 'none') {
      return { level: 'none', action: 'monitor' };
    }

    // Handle burst based on severity
    const handlingResult = await this.handleBurst(burstLevel, currentMetrics, baseline);

    // Record burst event for learning
    await this.recordBurstEvent(burstLevel, currentMetrics, handlingResult);

    return handlingResult;
  }

  private detectBurstLevel(
    current: TrafficMetrics,
    baseline: TrafficBaseline
  ): BurstLevel {

    const currentRPS = current.requestsPerSecond;
    const baselineRPS = baseline.averageRequestsPerSecond;
    const ratio = currentRPS / baselineRPS;

    // Check for sustained burst over detection window
    if (ratio >= 5.0 && this.isSustainedBurst(current, 300000)) { // 5 minutes
      return 'extreme';
    } else if (ratio >= 3.0 && this.isSustainedBurst(current, 180000)) { // 3 minutes
      return 'major';
    } else if (ratio >= 1.5 && this.isSustainedBurst(current, 60000)) { // 1 minute
      return 'minor';
    }

    return 'none';
  }

  private async handleBurst(
    level: BurstLevel,
    metrics: TrafficMetrics,
    baseline: TrafficBaseline
  ): Promise<BurstHandlingResult> {

    const startTime = Date.now();

    switch (level) {
      case 'minor':
        return await this.handleMinorBurst(metrics, baseline);

      case 'major':
        return await this.handleMajorBurst(metrics, baseline);

      case 'extreme':
        return await this.handleExtremeBurst(metrics, baseline);

      default:
        throw new Error(`Unknown burst level: ${level}`);
    }
  }

  private async handleMinorBurst(
    metrics: TrafficMetrics,
    baseline: TrafficBaseline
  ): Promise<BurstHandlingResult> {

    const actions: BurstAction[] = [];

    // Increase rate limit capacity
    const rateLimitAdjustment = await this.adjustRateLimits({
      capacityMultiplier: 1.5,
      refillRateMultiplier: 1.5,
      duration: 900000 // 15 minutes
    });
    actions.push(rateLimitAdjustment);

    // Enable request queuing
    const queueingResult = await this.enableRequestQueuing({
      maxQueueSize: 1000,
      queueTimeout: 5000,
      priorityQueuing: true
    });
    actions.push(queueingResult);

    // Auto-scale infrastructure
    const scalingResult = await this.autoscaler.scaleUp({
      targetCapacity: Math.ceil(metrics.requestsPerSecond / baseline.averageRequestsPerSecond),
      maxInstances: baseline.capacity * 2
    });
    actions.push(scalingResult);

    // Send notification
    await this.alertManager.sendBurstNotification({
      level: 'minor',
      metrics,
      actions,
      estimatedDuration: '15-30 minutes'
    });

    return {
      level: 'minor',
      action: 'accommodate',
      actions,
      estimatedDuration: 900000,
      autoRevert: true
    };
  }

  private async handleMajorBurst(
    metrics: TrafficMetrics,
    baseline: TrafficBaseline
  ): Promise<BurstHandlingResult> {

    const actions: BurstAction[] = [];

    // Implement more aggressive rate limiting
    const rateLimitAdjustment = await this.adjustRateLimits({
      capacityMultiplier: 0.8, // Reduce capacity
      refillRateMultiplier: 0.7, // Slower refill
      priorityMode: 'authenticated_users_first',
      duration: 1800000 // 30 minutes
    });
    actions.push(rateLimitAdjustment);

    // Defer non-critical operations
    const deferralResult = await this.deferNonCriticalOperations([
      'background_jobs',
      'analytics_processing',
      'cache_warming',
      'non_essential_notifications'
    ]);
    actions.push(deferralResult);

    // Aggressive auto-scaling
    const scalingResult = await this.autoscaler.scaleUp({
      targetCapacity: Math.ceil(metrics.requestsPerSecond / baseline.averageRequestsPerSecond),
      maxInstances: baseline.capacity * 3,
      priority: 'high'
    });
    actions.push(scalingResult);

    // Enhanced monitoring
    const monitoringResult = await this.enableEnhancedMonitoring({
      frequency: 'every_30_seconds',
      metrics: ['response_time', 'error_rate', 'queue_depth', 'capacity_utilization'],
      alertThresholds: 'aggressive'
    });
    actions.push(monitoringResult);

    return {
      level: 'major',
      action: 'throttle',
      actions,
      estimatedDuration: 1800000,
      autoRevert: false, // Requires manual intervention
      escalationRequired: true
    };
  }

  private async handleExtremeBurst(
    metrics: TrafficMetrics,
    baseline: TrafficBaseline
  ): Promise<BurstHandlingResult> {

    const actions: BurstAction[] = [];

    // Emergency rate limiting
    const emergencyLimiting = await this.enableEmergencyRateLimit({
      mode: 'minimal_service',
      allowedRPS: baseline.averageRequestsPerSecond * 1.2,
      priorityUsers: ['premium', 'enterprise'],
      gracePeriod: 60000 // 1 minute warning
    });
    actions.push(emergencyLimiting);

    // IP-based blocking for suspicious traffic
    const suspiciousIPs = await this.identifySuspiciousTraffic(metrics);
    const blockingResult = await this.blockSuspiciousIPs(suspiciousIPs);
    actions.push(blockingResult);

    // Activate DDoS protection
    const ddosProtection = await this.activateDDoSProtection({
      mode: 'aggressive',
      challengeEnabled: true,
      geoBlocking: true,
      behaviorAnalysis: true
    });
    actions.push(ddosProtection);

    // Failover to minimal service mode
    const failoverResult = await this.failoverToMinimalService({
      essentialEndpoints: [
        '/health',
        '/auth/login',
        '/api/core/*'
      ],
      disabledFeatures: [
        'file_uploads',
        'bulk_operations',
        'reporting',
        'analytics'
      ]
    });
    actions.push(failoverResult);

    // Immediate escalation
    await this.alertManager.sendCriticalAlert({
      level: 'extreme_burst_or_attack',
      metrics,
      actions,
      requiresImmediateAction: true,
      escalationList: ['oncall_engineer', 'security_team', 'cto']
    });

    return {
      level: 'extreme',
      action: 'protect',
      actions,
      estimatedDuration: -1, // Until manually resolved
      autoRevert: false,
      escalationRequired: true,
      manualInterventionRequired: true
    };
  }

  private async adjustRateLimits(config: RateLimitAdjustmentConfig): Promise<BurstAction> {
    const luaScript = `
      local pattern = KEYS[1]
      local multiplier = tonumber(ARGV[1])
      local duration = tonumber(ARGV[2])
      local mode = ARGV[3]

      local keys = redis.call('KEYS', pattern)
      local adjusted = 0

      for i = 1, #keys do
        local key = keys[i]
        local current = redis.call('HGET', key, 'capacity')

        if current then
          local new_capacity = math.floor(current * multiplier)
          redis.call('HSET', key, 'capacity', new_capacity)
          redis.call('HSET', key, 'original_capacity', current)
          redis.call('EXPIRE', key .. ':adjustment', duration / 1000)
          adjusted = adjusted + 1
        end
      end

      return adjusted
    `;

    const adjustedCount = await this.redis.eval(
      luaScript,
      1,
      'rate_limit:*',
      config.capacityMultiplier,
      config.duration,
      config.priorityMode || 'normal'
    ) as number;

    return {
      type: 'rate_limit_adjustment',
      status: 'completed',
      details: {
        adjustedRules: adjustedCount,
        multiplier: config.capacityMultiplier,
        duration: config.duration
      },
      revertAt: new Date(Date.now() + config.duration)
    };
  }

  private async identifySuspiciousTraffic(metrics: TrafficMetrics): Promise<string[]> {
    // Analyze traffic patterns to identify potential attack sources
    const suspiciousIPs: string[] = [];

    // High request rate from single IP
    const highVolumeIPs = await this.findHighVolumeIPs(metrics);
    suspiciousIPs.push(...highVolumeIPs);

    // Rapid sequential requests (bot-like behavior)
    const botLikeIPs = await this.findBotLikeTraffic(metrics);
    suspiciousIPs.push(...botLikeIPs);

    // Geographic anomalies
    const geoAnomalies = await this.findGeographicAnomalies(metrics);
    suspiciousIPs.push(...geoAnomalies);

    // Return unique IPs
    return [...new Set(suspiciousIPs)];
  }
}
```

## Monitoring & Analytics

### **Rate Limiting Observability**
```yaml
Monitoring_Strategy:
  real_time_metrics:
    rate_limit_decisions:
      - "requests_allowed_per_second"
      - "requests_blocked_per_second"
      - "rate_limit_violations_by_rule"
      - "quota_consumption_rates"

    performance_metrics:
      - "rate_limit_decision_latency_p95_p99"
      - "redis_operation_performance"
      - "algorithm_efficiency_metrics"
      - "memory_usage_by_rate_limiter"

    user_experience_metrics:
      - "user_tier_quota_utilization"
      - "retry_after_compliance_rates"
      - "client_backoff_effectiveness"
      - "burst_handling_success_rates"

  alerting_thresholds:
    critical_alerts:
      - "rate_limit_decision_latency > 10ms"
      - "redis_connection_failures > 5_per_minute"
      - "false_positive_rate > 0.1%"
      - "ddos_protection_triggered"

    warning_alerts:
      - "quota_warning_threshold_exceeded"
      - "burst_traffic_detected"
      - "client_retry_rate > 20%"
      - "algorithm_fallback_activated"

  analytics_dashboards:
    operations_dashboard:
      - "System_wide_rate_limiting_health"
      - "Algorithm_performance_comparison"
      - "Burst_handling_effectiveness"
      - "Resource_utilization_trends"

    business_dashboard:
      - "User_tier_quota_utilization"
      - "API_usage_growth_trends"
      - "Revenue_impact_of_rate_limiting"
      - "Customer_satisfaction_scores"

    security_dashboard:
      - "Attack_detection_and_mitigation"
      - "Suspicious_traffic_patterns"
      - "IP_blocking_effectiveness"
      - "DDoS_protection_metrics"
```

### **Analytics Implementation**
```typescript
interface RateLimitMetrics {
  timestamp: Date;
  allowed: number;
  blocked: number;
  byRule: Map<string, { allowed: number; blocked: number }>;
  byUserTier: Map<string, { allowed: number; blocked: number }>;
  latency: {
    p50: number;
    p95: number;
    p99: number;
  };
}

export class RateLimitAnalytics {
  private metricsCollector: MetricsCollector;
  private alertManager: AlertManager;
  private dashboardService: DashboardService;

  async collectMetrics(): Promise<RateLimitMetrics> {
    const now = new Date();

    // Collect from Redis metrics
    const redisMetrics = await this.collectRedisMetrics();

    // Collect application metrics
    const appMetrics = await this.collectApplicationMetrics();

    // Calculate latency percentiles
    const latencyMetrics = await this.calculateLatencyMetrics();

    const metrics: RateLimitMetrics = {
      timestamp: now,
      allowed: redisMetrics.totalAllowed,
      blocked: redisMetrics.totalBlocked,
      byRule: redisMetrics.ruleBreakdown,
      byUserTier: appMetrics.tierBreakdown,
      latency: latencyMetrics
    };

    // Store metrics for trending
    await this.storeMetrics(metrics);

    // Check alert thresholds
    await this.checkAlertThresholds(metrics);

    return metrics;
  }

  async generateUsageReport(
    timeRange: TimeRange,
    reportType: 'summary' | 'detailed' | 'executive'
  ): Promise<UsageReport> {

    const metrics = await this.getMetricsForTimeRange(timeRange);

    switch (reportType) {
      case 'summary':
        return this.generateSummaryReport(metrics, timeRange);

      case 'detailed':
        return this.generateDetailedReport(metrics, timeRange);

      case 'executive':
        return this.generateExecutiveReport(metrics, timeRange);

      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  private async generateExecutiveReport(
    metrics: RateLimitMetrics[],
    timeRange: TimeRange
  ): Promise<ExecutiveUsageReport> {

    // Calculate key business metrics
    const totalRequests = metrics.reduce((sum, m) => sum + m.allowed + m.blocked, 0);
    const blockedPercentage = metrics.reduce((sum, m) => sum + m.blocked, 0) / totalRequests * 100;

    // User tier analysis
    const tierAnalysis = this.analyzeTierUsage(metrics);

    // Revenue impact calculation
    const revenueImpact = await this.calculateRevenueImpact(metrics, timeRange);

    // Growth trends
    const growthTrends = this.calculateGrowthTrends(metrics, timeRange);

    return {
      reportType: 'executive',
      timeRange,
      generatedAt: new Date(),

      executiveSummary: {
        totalAPIRequests: totalRequests,
        blockedRequestsPercentage: blockedPercentage,
        systemAvailability: this.calculateAvailability(metrics),
        customerSatisfactionScore: await this.getCustomerSatisfactionScore(),
        revenueImpact: revenueImpact.totalImpact
      },

      keyInsights: [
        {
          title: 'API Usage Growth',
          insight: `API usage grew ${growthTrends.requestGrowth}% compared to previous period`,
          impact: 'positive',
          recommendation: 'Consider capacity planning for continued growth'
        },
        {
          title: 'Rate Limiting Effectiveness',
          insight: `Rate limiting blocked ${blockedPercentage.toFixed(2)}% of requests, protecting system resources`,
          impact: 'positive',
          recommendation: 'Current rate limiting configuration is effective'
        }
      ],

      tierAnalysis,
      revenueImpact,
      growthTrends,

      recommendations: this.generateExecutiveRecommendations(metrics, tierAnalysis, revenueImpact)
    };
  }

  private calculateRevenueImpact(
    metrics: RateLimitMetrics[],
    timeRange: TimeRange
  ): RevenueImpact {

    const tierRevenue = new Map<string, number>();
    const tierCosts = new Map<string, number>();

    // Calculate revenue by tier
    for (const metric of metrics) {
      for (const [tier, usage] of metric.byUserTier) {
        const tierInfo = this.getTierInfo(tier);
        const revenue = this.calculateTierRevenue(usage.allowed, tierInfo);
        const costs = this.calculateTierCosts(usage.allowed + usage.blocked, tierInfo);

        tierRevenue.set(tier, (tierRevenue.get(tier) || 0) + revenue);
        tierCosts.set(tier, (tierCosts.get(tier) || 0) + costs);
      }
    }

    const totalRevenue = Array.from(tierRevenue.values()).reduce((sum, val) => sum + val, 0);
    const totalCosts = Array.from(tierCosts.values()).reduce((sum, val) => sum + val, 0);

    return {
      totalRevenue,
      totalCosts,
      totalImpact: totalRevenue - totalCosts,
      byTier: Array.from(tierRevenue.keys()).map(tier => ({
        tier,
        revenue: tierRevenue.get(tier) || 0,
        costs: tierCosts.get(tier) || 0,
        impact: (tierRevenue.get(tier) || 0) - (tierCosts.get(tier) || 0)
      }))
    };
  }

  private generateExecutiveRecommendations(
    metrics: RateLimitMetrics[],
    tierAnalysis: TierAnalysis,
    revenueImpact: RevenueImpact
  ): ExecutiveRecommendation[] {

    const recommendations: ExecutiveRecommendation[] = [];

    // Analyze quota utilization
    const highUtilizationTiers = tierAnalysis.tiers
      .filter(t => t.quotaUtilization > 0.8)
      .sort((a, b) => b.quotaUtilization - a.quotaUtilization);

    if (highUtilizationTiers.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Tier Capacity Optimization',
        description: `${highUtilizationTiers.length} user tiers are approaching quota limits`,
        impact: 'revenue_and_satisfaction',
        actionItems: [
          'Review and potentially increase quotas for high-usage tiers',
          'Implement proactive notifications for near-limit users',
          'Consider automatic tier upgrades for consistent high usage'
        ],
        estimatedValue: this.estimateUpgradeRevenue(highUtilizationTiers)
      });
    }

    // Performance optimization recommendations
    const avgLatency = metrics.reduce((sum, m) => sum + m.latency.p95, 0) / metrics.length;
    if (avgLatency > 5) { // 5ms threshold
      recommendations.push({
        priority: 'medium',
        title: 'Rate Limiting Performance Optimization',
        description: 'Rate limiting decisions are taking longer than optimal',
        impact: 'user_experience',
        actionItems: [
          'Optimize Redis configuration and connection pooling',
          'Consider distributed rate limiting for better performance',
          'Review and optimize rate limiting algorithms'
        ],
        estimatedValue: 'Improved user experience and system efficiency'
      });
    }

    return recommendations;
  }

  async trackQuotaUsagePatterns(): Promise<UsagePatternAnalysis> {
    const patterns = await this.analyzeUsagePatterns();

    return {
      hourlyPatterns: patterns.hourly,
      dailyPatterns: patterns.daily,
      weeklyPatterns: patterns.weekly,
      seasonalTrends: patterns.seasonal,
      anomalies: patterns.anomalies,
      predictions: await this.generateUsagePredictions(patterns)
    };
  }

  private async analyzeUsagePatterns(): Promise<RawUsagePatterns> {
    // Analyze historical usage data to identify patterns
    const timeRanges = [
      { period: 'hour', duration: 24 * 60 * 60 * 1000 }, // Last 24 hours
      { period: 'day', duration: 7 * 24 * 60 * 60 * 1000 }, // Last 7 days
      { period: 'week', duration: 4 * 7 * 24 * 60 * 60 * 1000 }, // Last 4 weeks
      { period: 'month', duration: 12 * 30 * 24 * 60 * 60 * 1000 } // Last 12 months
    ];

    const patterns: RawUsagePatterns = {
      hourly: [],
      daily: [],
      weekly: [],
      seasonal: [],
      anomalies: []
    };

    for (const range of timeRanges) {
      const data = await this.getUsageDataForPeriod(range.period, range.duration);
      patterns[range.period] = this.identifyPatterns(data, range.period);
    }

    // Detect anomalies across all patterns
    patterns.anomalies = this.detectUsageAnomalies(patterns);

    return patterns;
  }
}
```

---

## Quality Gates

### **Rate Limiting Excellence**
- [ ] Multi-tier rate limiting with appropriate algorithms
- [ ] Adaptive throttling based on system load
- [ ] Client-side rate limiting integration
- [ ] Comprehensive quota management
- [ ] Real-time monitoring and alerting

### **Performance & Reliability**
- [ ] Sub-millisecond rate limit decisions
- [ ] High availability with Redis clustering
- [ ] Graceful degradation under extreme load
- [ ] Accurate burst handling and quota tracking
- [ ] Minimal impact on legitimate traffic

### **User Experience**
- [ ] Clear rate limit communication via headers
- [ ] Intelligent retry mechanisms
- [ ] Fair quota distribution across users
- [ ] Upgrade path guidance for quota exceeded
- [ ] Transparent overage handling

## Success Metrics
- Rate limiting accuracy: >99.9% correct decisions
- Response time impact: <1ms additional latency
- False positive rate: <0.01% legitimate requests blocked
- System protection: 100% effectiveness against DDoS
- User satisfaction: >4.5/5 rating for quota management