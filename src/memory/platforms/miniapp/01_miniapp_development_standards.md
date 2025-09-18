# Mini App Development Standards

> **Platform Memory**: Mini App development standards for modular applications running inside host environments

---

## Overview

This document defines comprehensive Mini App development standards for lightweight, modular applications that run within host environments (Super App, Web PWA, Wearable companion). It establishes patterns for manifest-first architecture, permission systems, and cross-platform compatibility.

## Mini App Architecture

### Manifest + Permission-First Architecture

#### Mini App Manifest Structure
```typescript
// app.json - Mini App manifest specification
interface MiniAppManifest {
  // Core identification
  appId: string;
  name: string;
  version: string;
  description: string;
  author: {
    name: string;
    email: string;
    organization?: string;
  };

  // Entry points for different platforms
  main: {
    default: string;
    web?: string;
    mobile?: string;
    desktop?: string;
    wearable?: string;
    tv?: string;
  };

  // Permission requirements
  permissions: Permission[];

  // API whitelist
  apis: string[];

  // Resource requirements
  resources: {
    memory: number; // bytes
    storage: number; // bytes
    network: boolean;
    background: boolean;
  };

  // Platform compatibility
  platforms: {
    web: PlatformConfig;
    mobile: PlatformConfig;
    desktop?: PlatformConfig;
    wearable?: PlatformConfig;
    tv?: PlatformConfig;
  };

  // Rollout configuration
  rollout?: {
    strategy: 'immediate' | 'phased';
    phases?: number[];
    criteria?: RolloutCriteria;
  };

  // Security settings
  security: {
    sandbox: 'strict' | 'moderate' | 'permissive';
    csp?: string;
    trustedDomains?: string[];
  };
}

interface Permission {
  name: string;
  description: string;
  required: boolean;
  platforms: string[];
}

interface PlatformConfig {
  supported: boolean;
  minVersion?: string;
  renderer: 'react-dom' | 'react-native' | 'swiftui' | 'compose';
  bundle: string;
}
```

#### Permission System
```typescript
// Permission management for Mini Apps
enum MiniAppPermission {
  STORAGE = 'storage',
  NETWORK = 'network',
  LOCATION = 'location',
  CAMERA = 'camera',
  MICROPHONE = 'microphone',
  NOTIFICATIONS = 'notifications',
  CONTACTS = 'contacts',
  CALENDAR = 'calendar',
  BIOMETRIC = 'biometric',
  PAYMENT = 'payment',
  ANALYTICS = 'analytics'
}

interface PermissionRequest {
  permission: MiniAppPermission;
  justification: string;
  required: boolean;
  platforms: string[];
  fallback?: () => void;
}

class MiniAppPermissionManager {
  private permissions: Map<string, Set<MiniAppPermission>> = new Map();

  async requestPermissions(
    appId: string,
    requests: PermissionRequest[]
  ): Promise<PermissionResult> {
    const results: Record<string, boolean> = {};
    const granted = new Set<MiniAppPermission>();

    for (const request of requests) {
      try {
        const isGranted = await this.requestSinglePermission(appId, request);
        results[request.permission] = isGranted;

        if (isGranted) {
          granted.add(request.permission);
        } else if (request.required) {
          throw new Error(`Required permission ${request.permission} was denied`);
        }
      } catch (error) {
        if (request.required) {
          throw error;
        }
        results[request.permission] = false;
      }
    }

    this.permissions.set(appId, granted);

    return {
      granted: results,
      allRequired: requests
        .filter(r => r.required)
        .every(r => results[r.permission])
    };
  }

  hasPermission(appId: string, permission: MiniAppPermission): boolean {
    const appPermissions = this.permissions.get(appId);
    return appPermissions?.has(permission) || false;
  }

  revokePermission(appId: string, permission: MiniAppPermission): void {
    const appPermissions = this.permissions.get(appId);
    if (appPermissions) {
      appPermissions.delete(permission);
    }
  }
}
```

### Build System & Packaging

#### Mini CLI Tool System
```typescript
// Tanqory Mini CLI implementation
class MiniCLI {
  private buildConfig: MiniBuildConfig;

  constructor() {
    this.buildConfig = this.loadBuildConfig();
  }

  async init(projectName: string, template: string): Promise<void> {
    console.log(`Initializing Mini App: ${projectName}`);

    // Create project structure
    await this.createProjectStructure(projectName, template);

    // Generate manifest
    await this.generateManifest(projectName, template);

    // Install dependencies
    await this.installDependencies(projectName);

    console.log(`✅ Mini App ${projectName} initialized successfully`);
  }

  async build(options: BuildOptions = {}): Promise<BuildResult> {
    console.log('Building Mini App...');

    const startTime = performance.now();

    try {
      // Validate manifest
      await this.validateManifest();

      // Build for each platform
      const buildResults = await Promise.all([
        this.buildForPlatform('web'),
        this.buildForPlatform('mobile'),
        options.desktop && this.buildForPlatform('desktop'),
        options.wearable && this.buildForPlatform('wearable'),
        options.tv && this.buildForPlatform('tv')
      ].filter(Boolean));

      // Generate intermediate representation
      const ir = await this.generateIR(buildResults);

      // Optimize bundle
      const optimizedBundle = await this.optimizeBundle(ir);

      const buildTime = performance.now() - startTime;

      return {
        success: true,
        buildTime,
        bundle: optimizedBundle,
        platforms: buildResults.map(r => r?.platform).filter(Boolean)
      };
    } catch (error) {
      console.error('Build failed:', error);
      return {
        success: false,
        error: error.message,
        buildTime: performance.now() - startTime
      };
    }
  }

  async pack(buildResult: BuildResult): Promise<PackageResult> {
    console.log('Packaging Mini App...');

    const packageData = {
      manifest: await this.readManifest(),
      bundle: buildResult.bundle,
      assets: await this.collectAssets(),
      checksums: await this.generateChecksums(buildResult.bundle)
    };

    // Create .mpkg file
    const mpkgPath = await this.createMPKG(packageData);

    return {
      success: true,
      packagePath: mpkgPath,
      size: await this.getFileSize(mpkgPath)
    };
  }

  async sign(packagePath: string, certificate: Certificate): Promise<SignResult> {
    console.log('Signing Mini App package...');

    try {
      // Load package
      const packageData = await this.loadPackage(packagePath);

      // Generate signature
      const signature = await this.generateSignature(packageData, certificate);

      // Add signature to package
      await this.addSignatureToPackage(packagePath, signature);

      return {
        success: true,
        signature: signature.hash,
        timestamp: signature.timestamp
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async publish(packagePath: string, credentials: PublishCredentials): Promise<PublishResult> {
    console.log('Publishing Mini App to Dev Portal...');

    try {
      // Verify package signature
      const isValid = await this.verifyPackage(packagePath);
      if (!isValid) {
        throw new Error('Package signature verification failed');
      }

      // Upload to Dev Portal
      const uploadResult = await this.uploadToDevPortal(packagePath, credentials);

      // Submit for review
      const reviewResult = await this.submitForReview(uploadResult.appId, uploadResult.version);

      return {
        success: true,
        appId: uploadResult.appId,
        version: uploadResult.version,
        reviewId: reviewResult.reviewId,
        status: 'pending_review'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async buildForPlatform(platform: string): Promise<PlatformBuildResult> {
    const config = this.buildConfig.platforms[platform];
    if (!config) {
      throw new Error(`Platform ${platform} not configured`);
    }

    // Use appropriate bundler based on platform
    const bundler = this.createBundler(platform, config);
    const result = await bundler.build();

    return {
      platform,
      bundle: result.bundle,
      assets: result.assets,
      size: result.size
    };
  }
}
```

#### .mpkg Package Format
```typescript
// Mini App package format specification
interface MPKGPackage {
  // Package metadata
  metadata: {
    version: '1.0';
    created: string;
    creator: string;
    compression: 'gzip' | 'brotli';
  };

  // Manifest file
  manifest: MiniAppManifest;

  // Compiled bundles for each platform
  bundles: {
    [platform: string]: {
      main: Uint8Array;      // Main bundle
      assets: Uint8Array[];  // Asset files
      sourcemap?: Uint8Array; // Source map for debugging
    };
  };

  // Digital signature
  signature: {
    algorithm: 'RSA-SHA256' | 'ECDSA-SHA256';
    value: string;
    certificate: string;
    timestamp: string;
  };

  // File integrity checksums
  checksums: {
    [filename: string]: {
      sha256: string;
      size: number;
    };
  };
}

class MPKGPackager {
  async createPackage(
    manifest: MiniAppManifest,
    bundles: PlatformBundles,
    certificate: Certificate
  ): Promise<MPKGPackage> {

    // Compress bundles
    const compressedBundles = await this.compressBundles(bundles);

    // Generate checksums
    const checksums = await this.generateChecksums({
      manifest,
      bundles: compressedBundles
    });

    // Create package structure
    const packageData = {
      metadata: {
        version: '1.0',
        created: new Date().toISOString(),
        creator: 'Tanqory Mini CLI',
        compression: 'gzip'
      },
      manifest,
      bundles: compressedBundles,
      checksums,
      signature: null // Will be added during signing
    };

    // Sign the package
    const signature = await this.signPackage(packageData, certificate);
    packageData.signature = signature;

    return packageData;
  }

  async verifyPackage(mpkgData: MPKGPackage): Promise<boolean> {
    try {
      // Verify signature
      const isSignatureValid = await this.verifySignature(
        mpkgData,
        mpkgData.signature
      );

      if (!isSignatureValid) return false;

      // Verify checksums
      const areChecksumsValid = await this.verifyChecksums(mpkgData);

      if (!areChecksumsValid) return false;

      // Validate manifest
      const isManifestValid = await this.validateManifest(mpkgData.manifest);

      return isManifestValid;
    } catch (error) {
      console.error('Package verification failed:', error);
      return false;
    }
  }
}
```

### Cross-Platform Renderer System

#### IR (Intermediate Representation) Generation
```typescript
// Intermediate Representation for cross-platform rendering
interface MiniAppIR {
  type: 'component' | 'text' | 'container';
  id: string;
  component: string;
  props: Record<string, any>;
  children?: MiniAppIR[];
  platform?: string;
  conditionals?: RenderConditional[];
}

interface RenderConditional {
  condition: string;
  platform?: string;
  render: MiniAppIR;
}

class IRGenerator {
  generateFromJSX(jsxString: string): MiniAppIR {
    // Parse JSX to AST
    const ast = this.parseJSX(jsxString);

    // Convert AST to IR
    const ir = this.convertASTToIR(ast);

    // Optimize IR
    const optimizedIR = this.optimizeIR(ir);

    return optimizedIR;
  }

  private convertASTToIR(node: JSXNode): MiniAppIR {
    if (node.type === 'JSXElement') {
      return {
        type: 'component',
        id: this.generateId(),
        component: node.openingElement.name.name,
        props: this.extractProps(node.openingElement.attributes),
        children: node.children?.map(child => this.convertASTToIR(child))
      };
    }

    if (node.type === 'JSXText') {
      return {
        type: 'text',
        id: this.generateId(),
        component: 'Text',
        props: { children: node.value }
      };
    }

    throw new Error(`Unsupported node type: ${node.type}`);
  }

  private optimizeIR(ir: MiniAppIR): MiniAppIR {
    // Remove unnecessary wrappers
    ir = this.removeUnnecessaryWrappers(ir);

    // Flatten nested components
    ir = this.flattenComponents(ir);

    // Merge adjacent text nodes
    ir = this.mergeTextNodes(ir);

    return ir;
  }
}
```

#### Platform-Specific Renderers
```typescript
// React Native renderer for mobile platforms
class ReactNativeRenderer {
  private componentMap = new Map<string, React.ComponentType>([
    ['View', View],
    ['Text', Text],
    ['ScrollView', ScrollView],
    ['TouchableOpacity', TouchableOpacity],
    ['TextInput', TextInput],
    ['Image', Image],
    ['FlatList', FlatList]
  ]);

  render(ir: MiniAppIR): React.ReactElement {
    const Component = this.componentMap.get(ir.component) || View;

    // Apply platform-specific styling
    const platformProps = this.applyPlatformStyling(ir.props);

    // Handle children
    const children = ir.children?.map(child => this.render(child));

    return React.createElement(Component, platformProps, children);
  }

  private applyPlatformStyling(props: Record<string, any>): Record<string, any> {
    const style = props.style || {};

    // Convert web-specific styles to React Native equivalents
    if (style.display === 'flex') {
      style.flexDirection = style.flexDirection || 'column';
    }

    // Handle web-specific properties
    if (style.boxShadow) {
      const shadow = this.parseBoxShadow(style.boxShadow);
      style.shadowColor = shadow.color;
      style.shadowOffset = { width: shadow.x, height: shadow.y };
      style.shadowOpacity = shadow.opacity;
      style.shadowRadius = shadow.blur;
      delete style.boxShadow;
    }

    return { ...props, style };
  }
}

// React DOM renderer for web platforms
class ReactDOMRenderer {
  render(ir: MiniAppIR): React.ReactElement {
    const tagName = this.mapComponentToHTMLTag(ir.component);

    // Apply web-specific styling
    const webProps = this.applyWebStyling(ir.props);

    // Handle children
    const children = ir.children?.map(child => this.render(child));

    return React.createElement(tagName, webProps, children);
  }

  private mapComponentToHTMLTag(component: string): string {
    const mapping: Record<string, string> = {
      'View': 'div',
      'Text': 'span',
      'ScrollView': 'div',
      'TouchableOpacity': 'button',
      'TextInput': 'input',
      'Image': 'img'
    };

    return mapping[component] || 'div';
  }
}

// SwiftUI renderer for wearable platforms
class SwiftUIRenderer {
  render(ir: MiniAppIR): string {
    // Generate SwiftUI code from IR
    return this.generateSwiftUICode(ir);
  }

  private generateSwiftUICode(ir: MiniAppIR): string {
    const component = this.mapComponentToSwiftUI(ir.component);
    const props = this.convertPropsToSwiftUI(ir.props);

    let code = `${component}(${props})`;

    if (ir.children) {
      const childrenCode = ir.children
        .map(child => this.generateSwiftUICode(child))
        .join('\n');

      code = `${component} {\n${childrenCode}\n}`;
    }

    return code;
  }
}
```

### Rollout System

#### Phased Rollout Implementation
```typescript
// Phased rollout system for Mini Apps (5% → 25% → 100%)
class MiniAppRolloutManager {
  private rolloutConfigs = new Map<string, RolloutConfig>();
  private userBuckets = new Map<string, number>();

  async createRollout(appId: string, config: RolloutConfig): Promise<void> {
    // Validate rollout configuration
    this.validateRolloutConfig(config);

    // Store configuration
    this.rolloutConfigs.set(appId, {
      ...config,
      startTime: Date.now(),
      status: 'active'
    });

    // Initialize phase tracking
    await this.initializePhaseTracking(appId, config);

    console.log(`Rollout started for ${appId}: ${config.phases.join('% → ')}%`);
  }

  async isUserEligible(appId: string, userId: string): Promise<boolean> {
    const config = this.rolloutConfigs.get(appId);
    if (!config || config.status !== 'active') {
      return false;
    }

    // Get current phase
    const currentPhase = this.getCurrentPhase(config);
    if (!currentPhase) {
      return false;
    }

    // Check user bucket
    const userBucket = this.getUserBucket(userId, appId);
    const isInPhase = userBucket <= currentPhase.percentage;

    if (!isInPhase) {
      return false;
    }

    // Apply additional criteria
    return await this.checkRolloutCriteria(config.criteria, userId);
  }

  private getCurrentPhase(config: RolloutConfig): RolloutPhase | null {
    const elapsed = Date.now() - config.startTime;
    let cumulativeTime = 0;

    for (let i = 0; i < config.phases.length; i++) {
      const phaseDuration = config.phaseDurations[i] || 24 * 60 * 60 * 1000; // 24h default
      cumulativeTime += phaseDuration;

      if (elapsed <= cumulativeTime) {
        return {
          index: i,
          percentage: config.phases[i],
          duration: phaseDuration,
          startTime: config.startTime + (cumulativeTime - phaseDuration)
        };
      }
    }

    // Return final phase if rollout is complete
    return {
      index: config.phases.length - 1,
      percentage: config.phases[config.phases.length - 1],
      duration: 0,
      startTime: config.startTime
    };
  }

  private getUserBucket(userId: string, appId: string): number {
    const key = `${userId}:${appId}`;

    if (!this.userBuckets.has(key)) {
      // Generate consistent hash-based bucket (0-99)
      const hash = this.hashString(key);
      const bucket = hash % 100;
      this.userBuckets.set(key, bucket);
    }

    return this.userBuckets.get(key)!;
  }

  async pauseRollout(appId: string, reason: string): Promise<void> {
    const config = this.rolloutConfigs.get(appId);
    if (config) {
      config.status = 'paused';
      config.pauseReason = reason;
      config.pauseTime = Date.now();

      console.log(`Rollout paused for ${appId}: ${reason}`);

      // Notify monitoring systems
      await this.notifyRolloutEvent(appId, 'paused', { reason });
    }
  }

  async emergencyStop(appId: string, reason: string): Promise<void> {
    const config = this.rolloutConfigs.get(appId);
    if (config) {
      config.status = 'stopped';
      config.stopReason = reason;
      config.stopTime = Date.now();

      console.error(`Emergency stop for ${appId}: ${reason}`);

      // Immediately revoke access for all users
      await this.revokeAllAccess(appId);

      // Notify monitoring systems
      await this.notifyRolloutEvent(appId, 'emergency_stop', { reason });
    }
  }
}
```

## Testing Strategy

### Multi-Platform Testing
```typescript
// Testing framework for Mini Apps across platforms
class MiniAppTestRunner {
  private testConfigs = new Map<string, TestConfig>();

  async runTests(appId: string, platforms: string[]): Promise<TestResults> {
    const results: TestResults = {
      appId,
      platforms: {},
      overall: { passed: 0, failed: 0, total: 0 }
    };

    for (const platform of platforms) {
      console.log(`Running tests for ${appId} on ${platform}`);

      const platformResults = await this.runPlatformTests(appId, platform);
      results.platforms[platform] = platformResults;

      results.overall.passed += platformResults.passed;
      results.overall.failed += platformResults.failed;
      results.overall.total += platformResults.total;
    }

    return results;
  }

  private async runPlatformTests(appId: string, platform: string): Promise<PlatformTestResults> {
    const config = this.testConfigs.get(`${appId}:${platform}`);
    if (!config) {
      throw new Error(`No test configuration found for ${appId}:${platform}`);
    }

    const results: PlatformTestResults = {
      platform,
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
    };

    // Unit tests
    if (config.unit) {
      const unitResults = await this.runUnitTests(appId, platform);
      results.tests.push(unitResults);
      results.passed += unitResults.passed;
      results.failed += unitResults.failed;
      results.total += unitResults.total;
    }

    // Integration tests
    if (config.integration) {
      const integrationResults = await this.runIntegrationTests(appId, platform);
      results.tests.push(integrationResults);
      results.passed += integrationResults.passed;
      results.failed += integrationResults.failed;
      results.total += integrationResults.total;
    }

    // E2E tests
    if (config.e2e) {
      const e2eResults = await this.runE2ETests(appId, platform);
      results.tests.push(e2eResults);
      results.passed += e2eResults.passed;
      results.failed += e2eResults.failed;
      results.total += e2eResults.total;
    }

    return results;
  }
}
```

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- ✅ Manifest specification and validation
- ✅ Permission system implementation
- ✅ Basic CLI tool (init, build)
- ✅ IR generation system

### Phase 2: Build & Package (Weeks 3-4)
- ✅ Cross-platform build system
- ✅ .mpkg packaging format
- ✅ Digital signing system
- ✅ Dev Portal integration

### Phase 3: Runtime & Rollout (Weeks 5-6)
- ✅ Platform-specific renderers
- ✅ Phased rollout system
- ✅ Performance monitoring
- ✅ Security sandbox

### Phase 4: Testing & Optimization (Weeks 7-8)
- ✅ Multi-platform testing
- ✅ Performance optimization
- ✅ Security audit
- ✅ Documentation and tooling

## Success Metrics

- **Code Reuse**: 60-75% code reuse across platforms
- **Load Time**: < 2 seconds from tap to interactive
- **Bundle Size**: < 5MB for typical Mini App
- **Memory Usage**: < 64MB per Mini App instance
- **Permission Grant Rate**: > 80% for essential permissions
- **Rollout Success**: > 95% successful phased rollouts
- **Platform Coverage**: Support for 5+ host platforms
- **Developer Experience**: < 5 minutes from init to first run

This comprehensive Mini App development standards document provides enterprise-grade patterns for building secure, performant, and highly reusable modular applications that can run across multiple host platforms.