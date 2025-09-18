# Super App Architecture Standards

> **Platform Memory**: Super App host platform architecture for running Mini Apps

---

## Overview

This document defines comprehensive Super App architecture standards for React Native applications that serve as host platforms for Mini Apps. It establishes patterns for secure runtime environments, permission systems, and cross-platform integration.

## Super App Architecture

### Host Platform Architecture

#### Core Runtime System
```typescript
// Super App Runtime Manager
class SuperAppRuntime {
  private miniAppRegistry: Map<string, MiniAppInstance> = new Map();
  private permissionManager: PermissionManager;
  private bridgeManager: JSONRPCBridge;
  private rolloutManager: RolloutManager;

  constructor() {
    this.setupJSEngine();
    this.initializeBridge();
    this.setupPermissions();
    this.initializeRollout();
  }

  private setupJSEngine(): void {
    // Hermes/JSC engine configuration
    const engineConfig = {
      engine: 'hermes', // or 'jsc'
      enableDebugging: __DEV__,
      enableProfiling: false,
      memoryLimit: 512 * 1024 * 1024, // 512MB
      executionTimeLimit: 30000 // 30 seconds
    };

    this.configureJSEngine(engineConfig);
  }

  async loadMiniApp(appId: string, manifest: MiniAppManifest): Promise<MiniAppInstance> {
    // Validate manifest and permissions
    const validationResult = await this.validateMiniApp(appId, manifest);
    if (!validationResult.valid) {
      throw new Error(`Mini App validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Check rollout eligibility
    const rolloutEligible = await this.rolloutManager.isEligible(appId);
    if (!rolloutEligible) {
      throw new Error(`Mini App ${appId} is not available for this user`);
    }

    // Create sandbox environment
    const sandbox = await this.createSandbox(appId, manifest);

    // Initialize Mini App instance
    const instance = new MiniAppInstance(appId, manifest, sandbox);
    this.miniAppRegistry.set(appId, instance);

    // Load and execute Mini App code
    await instance.load();

    return instance;
  }

  private async createSandbox(appId: string, manifest: MiniAppManifest): Promise<Sandbox> {
    return new Sandbox({
      appId,
      permissions: manifest.permissions,
      apiWhitelist: manifest.apis || [],
      memoryLimit: manifest.resources?.memory || 64 * 1024 * 1024, // 64MB default
      networkAccess: manifest.permissions.includes('network'),
      storageAccess: manifest.permissions.includes('storage')
    });
  }
}
```

#### JSON-RPC Bridge System
```typescript
// JSON-RPC Bridge for Mini App communication
interface JSONRPCMessage {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: any;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

class JSONRPCBridge {
  private handlers: Map<string, RPCHandler> = new Map();
  private activeRequests: Map<string | number, RPCRequest> = new Map();

  constructor() {
    this.setupNativeHandlers();
    this.setupBridgeChannels();
  }

  private setupNativeHandlers(): void {
    // Native API handlers
    this.registerHandler('native.storage.get', async (params) => {
      return await AsyncStorage.getItem(params.key);
    });

    this.registerHandler('native.storage.set', async (params) => {
      await AsyncStorage.setItem(params.key, params.value);
      return { success: true };
    });

    this.registerHandler('native.navigation.navigate', async (params) => {
      const { screen, options } = params;
      return await this.handleNavigation(screen, options);
    });

    this.registerHandler('native.permissions.request', async (params) => {
      return await this.requestPermissions(params.permissions);
    });

    this.registerHandler('native.api.call', async (params) => {
      return await this.proxyAPICall(params);
    });
  }

  async sendMessage(message: JSONRPCMessage): Promise<any> {
    if (message.method) {
      // Handle method call
      return await this.handleMethodCall(message);
    } else if (message.id) {
      // Handle response
      this.handleResponse(message);
    }
  }

  private async handleMethodCall(message: JSONRPCMessage): Promise<any> {
    const handler = this.handlers.get(message.method!);
    if (!handler) {
      throw new Error(`Method ${message.method} not found`);
    }

    try {
      const result = await handler(message.params);
      return {
        jsonrpc: '2.0',
        id: message.id,
        result
      };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: message.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error.message
        }
      };
    }
  }

  registerHandler(method: string, handler: RPCHandler): void {
    this.handlers.set(method, handler);
  }
}
```

### Mini App Runtime Environment

#### Renderer System
```typescript
// IR to React Native Component Renderer
interface MiniAppIR {
  type: 'component';
  name: string;
  props: Record<string, any>;
  children?: MiniAppIR[];
}

class MiniAppRenderer {
  private componentRegistry: Map<string, React.ComponentType> = new Map();

  constructor() {
    this.registerNativeComponents();
  }

  private registerNativeComponents(): void {
    // Register React Native components for Mini App use
    this.componentRegistry.set('View', View);
    this.componentRegistry.set('Text', Text);
    this.componentRegistry.set('ScrollView', ScrollView);
    this.componentRegistry.set('TouchableOpacity', TouchableOpacity);
    this.componentRegistry.set('TextInput', TextInput);
    this.componentRegistry.set('Image', Image);
    this.componentRegistry.set('FlatList', FlatList);

    // Custom Super App components
    this.componentRegistry.set('SuperAppButton', SuperAppButton);
    this.componentRegistry.set('SuperAppCard', SuperAppCard);
    this.componentRegistry.set('SuperAppModal', SuperAppModal);
  }

  renderIR(ir: MiniAppIR): React.ReactElement {
    const Component = this.componentRegistry.get(ir.name);
    if (!Component) {
      console.warn(`Component ${ir.name} not found, using View fallback`);
      return React.createElement(View, ir.props,
        ir.children?.map(child => this.renderIR(child))
      );
    }

    return React.createElement(
      Component,
      ir.props,
      ir.children?.map(child => this.renderIR(child))
    );
  }
}
```

#### Permission System
```typescript
// Permission management for Mini Apps
interface MiniAppPermissions {
  storage: boolean;
  network: boolean;
  camera: boolean;
  location: boolean;
  notifications: boolean;
  contacts: boolean;
  calendar: boolean;
  microphone: boolean;
}

class PermissionManager {
  private grantedPermissions: Map<string, MiniAppPermissions> = new Map();
  private permissionCallbacks: Map<string, Function[]> = new Map();

  async requestPermissions(appId: string, permissions: (keyof MiniAppPermissions)[]): Promise<PermissionResult> {
    const results: Record<string, boolean> = {};

    for (const permission of permissions) {
      try {
        const granted = await this.requestSinglePermission(appId, permission);
        results[permission] = granted;
      } catch (error) {
        results[permission] = false;
      }
    }

    // Update granted permissions
    const currentPermissions = this.grantedPermissions.get(appId) || {} as MiniAppPermissions;
    const updatedPermissions = { ...currentPermissions, ...results };
    this.grantedPermissions.set(appId, updatedPermissions);

    return {
      granted: results,
      allGranted: Object.values(results).every(Boolean)
    };
  }

  private async requestSinglePermission(appId: string, permission: keyof MiniAppPermissions): Promise<boolean> {
    switch (permission) {
      case 'camera':
        const cameraResult = await request(PERMISSIONS.IOS.CAMERA);
        return cameraResult === RESULTS.GRANTED;

      case 'location':
        const locationResult = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        return locationResult === RESULTS.GRANTED;

      case 'notifications':
        const notificationResult = await requestNotifications(['alert', 'sound', 'badge']);
        return notificationResult.status === 'granted';

      case 'storage':
      case 'network':
        // These are automatically granted for Mini Apps
        return true;

      default:
        return false;
    }
  }

  hasPermission(appId: string, permission: keyof MiniAppPermissions): boolean {
    const permissions = this.grantedPermissions.get(appId);
    return permissions?.[permission] || false;
  }

  revokePermission(appId: string, permission: keyof MiniAppPermissions): void {
    const permissions = this.grantedPermissions.get(appId);
    if (permissions) {
      permissions[permission] = false;
      this.grantedPermissions.set(appId, permissions);
    }
  }
}
```

### Rollout System

#### Phased Rollout Manager
```typescript
// Phased rollout system (5% → 25% → 100%)
interface RolloutConfig {
  appId: string;
  version: string;
  phases: RolloutPhase[];
  criteria: RolloutCriteria;
}

interface RolloutPhase {
  percentage: number;
  duration: number; // hours
  criteria?: RolloutCriteria;
}

interface RolloutCriteria {
  regions?: string[];
  deviceTypes?: string[];
  osVersions?: string[];
  userSegments?: string[];
  customRules?: ((user: User) => boolean)[];
}

class RolloutManager {
  private rolloutConfigs: Map<string, RolloutConfig> = new Map();
  private userEligibility: Map<string, Set<string>> = new Map();

  async isEligible(appId: string, userId?: string): Promise<boolean> {
    const config = this.rolloutConfigs.get(appId);
    if (!config) return false;

    const currentPhase = this.getCurrentPhase(config);
    if (!currentPhase) return false;

    // Check if user is in rollout percentage
    const userHash = this.getUserHash(userId || 'anonymous', appId);
    const isInPercentage = (userHash % 100) < currentPhase.percentage;

    if (!isInPercentage) return false;

    // Check additional criteria
    if (currentPhase.criteria) {
      return await this.checkCriteria(currentPhase.criteria, userId);
    }

    return true;
  }

  private getCurrentPhase(config: RolloutConfig): RolloutPhase | null {
    const now = Date.now();
    const rolloutStart = this.getRolloutStartTime(config.appId);
    const elapsed = now - rolloutStart;

    let cumulativeTime = 0;
    for (const phase of config.phases) {
      cumulativeTime += phase.duration * 60 * 60 * 1000; // hours to ms
      if (elapsed <= cumulativeTime) {
        return phase;
      }
    }

    // Return final phase if rollout is complete
    return config.phases[config.phases.length - 1] || null;
  }

  private getUserHash(userId: string, appId: string): number {
    const combined = userId + appId;
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  async updateRollout(appId: string, config: RolloutConfig): Promise<void> {
    this.rolloutConfigs.set(appId, config);

    // Notify monitoring system
    await this.notifyRolloutUpdate(appId, config);
  }

  async killSwitch(appId: string, reason: string): Promise<void> {
    // Emergency kill switch - immediately disable Mini App
    this.rolloutConfigs.delete(appId);

    // Notify all instances to shutdown
    await this.notifyKillSwitch(appId, reason);

    // Log incident
    console.error(`Kill switch activated for ${appId}: ${reason}`);
  }
}
```

## Security Architecture

### Sandbox Environment
```typescript
// Secure sandbox for Mini App execution
class Sandbox {
  private appId: string;
  private permissions: string[];
  private context: SandboxContext;
  private resourceLimits: ResourceLimits;

  constructor(config: SandboxConfig) {
    this.appId = config.appId;
    this.permissions = config.permissions;
    this.resourceLimits = config.resourceLimits || this.getDefaultLimits();
    this.context = this.createSandboxContext();
  }

  private createSandboxContext(): SandboxContext {
    return {
      // Restricted global objects
      console: this.createRestrictedConsole(),
      setTimeout: this.createRestrictedTimer(),
      setInterval: this.createRestrictedTimer(),
      fetch: this.createRestrictedFetch(),

      // Super App APIs
      SuperApp: {
        storage: this.createStorageAPI(),
        navigation: this.createNavigationAPI(),
        permissions: this.createPermissionsAPI(),
        analytics: this.createAnalyticsAPI()
      }
    };
  }

  private createRestrictedFetch(): typeof fetch {
    return async (url: string, options?: RequestInit) => {
      // Check network permission
      if (!this.permissions.includes('network')) {
        throw new Error('Network access denied');
      }

      // Validate URL against whitelist
      if (!this.isURLAllowed(url)) {
        throw new Error(`URL not allowed: ${url}`);
      }

      // Apply request limits
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        return response;
      } finally {
        clearTimeout(timeout);
      }
    };
  }

  execute(code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        // Execute in sandbox with resource limits
        const result = this.executeInSandbox(code, this.context);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }

  private executeInSandbox(code: string, context: SandboxContext): any {
    // Create isolated execution environment
    const vm = require('vm');
    const sandbox = vm.createContext(context);

    // Set resource limits
    const options = {
      timeout: this.resourceLimits.executionTimeout,
      microtaskMode: 'afterEvaluate'
    };

    return vm.runInContext(code, sandbox, options);
  }
}
```

### OTA Updates System
```typescript
// Over-the-Air updates for Mini Apps
class OTAUpdateManager {
  private updateCache: Map<string, UpdateBundle> = new Map();
  private updateQueue: UpdateQueue = new UpdateQueue();

  async checkForUpdates(appId: string, currentVersion: string): Promise<UpdateInfo | null> {
    try {
      const response = await fetch(`/api/miniapps/${appId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentVersion })
      });

      if (response.status === 204) {
        return null; // No updates available
      }

      const updateInfo: UpdateInfo = await response.json();
      return updateInfo;
    } catch (error) {
      console.error(`Failed to check updates for ${appId}:`, error);
      return null;
    }
  }

  async downloadUpdate(updateInfo: UpdateInfo): Promise<UpdateBundle> {
    const { appId, version, downloadUrl, checksum } = updateInfo;

    // Download update bundle
    const response = await fetch(downloadUrl);
    const bundleData = await response.arrayBuffer();

    // Verify checksum
    const actualChecksum = await this.calculateChecksum(bundleData);
    if (actualChecksum !== checksum) {
      throw new Error(`Checksum mismatch for ${appId}@${version}`);
    }

    // Parse bundle
    const bundle: UpdateBundle = {
      appId,
      version,
      data: bundleData,
      manifest: updateInfo.manifest,
      timestamp: Date.now()
    };

    // Cache for later installation
    this.updateCache.set(`${appId}@${version}`, bundle);

    return bundle;
  }

  async applyUpdate(appId: string, version: string): Promise<void> {
    const bundleKey = `${appId}@${version}`;
    const bundle = this.updateCache.get(bundleKey);

    if (!bundle) {
      throw new Error(`Update bundle not found: ${bundleKey}`);
    }

    // Stop current Mini App instance
    const runtime = SuperAppRuntime.getInstance();
    await runtime.stopMiniApp(appId);

    // Apply update
    await this.installBundle(bundle);

    // Restart with new version
    await runtime.loadMiniApp(appId, bundle.manifest);

    // Clean up cache
    this.updateCache.delete(bundleKey);
  }

  private async installBundle(bundle: UpdateBundle): Promise<void> {
    const installPath = `${RNFS.DocumentDirectoryPath}/miniapps/${bundle.appId}`;

    // Extract bundle to installation directory
    await this.extractBundle(bundle.data, installPath);

    // Update manifest
    await RNFS.writeFile(
      `${installPath}/manifest.json`,
      JSON.stringify(bundle.manifest),
      'utf8'
    );
  }
}
```

## Performance Standards

### Performance Monitoring
```typescript
// Performance monitoring for Super App and Mini Apps
class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private thresholds = {
    miniAppLoad: 3000, // 3 seconds
    bridgeCall: 100,   // 100ms
    memoryUsage: 256 * 1024 * 1024, // 256MB
    frameRate: 60
  };

  startMiniAppLoad(appId: string): string {
    const loadId = this.generateLoadId();
    const metric: PerformanceMetric = {
      type: 'miniapp_load',
      appId,
      loadId,
      startTime: performance.now(),
      endTime: 0,
      duration: 0
    };

    this.addMetric(appId, metric);
    return loadId;
  }

  endMiniAppLoad(appId: string, loadId: string): void {
    const metrics = this.metrics.get(appId) || [];
    const metric = metrics.find(m => m.loadId === loadId);

    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;

      // Check performance threshold
      if (metric.duration > this.thresholds.miniAppLoad) {
        console.warn(`Slow Mini App load: ${appId} took ${metric.duration}ms`);
      }

      // Report to analytics
      this.reportMetric(metric);
    }
  }

  measureBridgeCall<T>(method: string, call: () => Promise<T>): Promise<T> {
    const startTime = performance.now();

    return call().finally(() => {
      const duration = performance.now() - startTime;

      if (duration > this.thresholds.bridgeCall) {
        console.warn(`Slow bridge call: ${method} took ${duration}ms`);
      }

      this.reportMetric({
        type: 'bridge_call',
        method,
        startTime,
        endTime: performance.now(),
        duration
      });
    });
  }

  private reportMetric(metric: PerformanceMetric): void {
    // Report to analytics service
    // This would integrate with your observability stack
  }
}
```

## Implementation Timeline

### Phase 1: Core Runtime (Weeks 1-2)
- ✅ JSON-RPC bridge implementation
- ✅ Basic sandbox environment
- ✅ Permission system foundation
- ✅ Mini App loader

### Phase 2: Advanced Features (Weeks 3-4)
- ✅ IR renderer system
- ✅ OTA update mechanism
- ✅ Rollout management
- ✅ Performance monitoring

### Phase 3: Security & Optimization (Weeks 5-6)
- ✅ Enhanced sandbox security
- ✅ Resource limit enforcement
- ✅ Kill switch implementation
- ✅ Memory optimization

### Phase 4: Integration & Testing (Weeks 7-8)
- ✅ Platform integration testing
- ✅ Performance optimization
- ✅ Security audit
- ✅ Documentation and deployment

## Success Metrics

- **Mini App Load Time**: < 3 seconds from tap to interactive
- **Memory Usage**: < 256MB total for Super App + active Mini Apps
- **Bridge Latency**: < 100ms for native API calls
- **Rollout Success Rate**: > 95% successful Mini App deployments
- **Security Score**: 100% sandbox compliance
- **Performance**: 60 FPS UI rendering, < 100ms response times
- **Crash Rate**: < 0.1% for Super App, < 1% for Mini Apps
- **Update Success Rate**: > 98% successful OTA updates

This comprehensive Super App architecture document provides enterprise-grade patterns for building secure, performant host platforms that can safely execute Mini Apps with proper isolation and resource management.