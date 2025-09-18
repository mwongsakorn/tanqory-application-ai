---
title: Cross-Platform Integration Patterns
version: 1.0
owner: Platform Engineering Team
last_reviewed: 2025-09-16
next_review: 2025-12-16
classification: CONFIDENTIAL
scope: [Cross_Platform_Integration, Shared_Services, Universal_Components]
---

# Cross-Platform Integration Patterns

> **Integration Memory**: กำหนดรูปแบบการเชื่อมต่อระหว่างแพลตฟอร์มและบริการร่วมที่สอดคล้องกับ unified architecture framework เพื่อให้ระบบทำงานร่วมกันได้อย่างมีประสิทธิภาพทั่วทั้ง 8 แพลตฟอร์ม

## Table of Contents
- [Cross-Platform Architecture Overview](#cross-platform-architecture-overview)
- [Shared Services Strategy](#shared-services-strategy)
- [Universal Component Library](#universal-component-library)
- [Platform-Specific Adapters](#platform-specific-adapters)
- [Data Synchronization Patterns](#data-synchronization-patterns)
- [Authentication & Authorization](#authentication--authorization)

---

## Cross-Platform Architecture Overview

### **Integration Architecture Principles**
```yaml
Cross_Platform_Integration_Principles:
  consistency_across_platforms:
    principle: "Consistent user experience and business logic across all 8 platforms"
    implementation:
      - "Shared business logic in backend services"
      - "Consistent API contracts across platforms"
      - "Universal design system and component library"
    platforms: [web, mobile_ios, mobile_android, desktop, vision_os, tv_platforms, watch_os, car_platforms]

  platform_optimization:
    principle: "Optimize for each platform's strengths while maintaining consistency"
    implementation:
      - "Platform-specific UI/UX adaptations"
      - "Performance optimizations per platform"
      - "Native platform feature integration"
    considerations: [screen_sizes, input_methods, platform_conventions, performance_constraints]

  centralized_business_logic:
    principle: "Business logic centralized in backend services, UI logic distributed"
    implementation:
      - "RESTful APIs for synchronous operations"
      - "Event-driven architecture for business processes"
      - "GraphQL for flexible data fetching"
    benefits: [consistency, maintainability, testability, scalability]

  offline_first_design:
    principle: "Design for offline capability with data synchronization"
    implementation:
      - "Local data storage with sync mechanisms"
      - "Conflict resolution strategies"
      - "Progressive sync capabilities"
    patterns: [optimistic_updates, delta_sync, last_write_wins, operational_transform]

Platform_Integration_Matrix:
  web_platform:
    technology: "React/Next.js with PWA capabilities"
    integration_patterns:
      - "REST API consumption"
      - "WebSocket for real-time updates"
      - "Service worker for offline capability"
      - "Web push notifications"
    deployment: "Vercel with global CDN"

  mobile_platforms:
    ios_technology: "React Native with native modules"
    android_technology: "React Native with native modules"
    integration_patterns:
      - "Shared React Native codebase (95%+)"
      - "Platform-specific native modules"
      - "Push notification services (APNs/FCM)"
      - "Biometric authentication integration"
    deployment: "App Store and Google Play Store"

  desktop_platform:
    technology: "Electron with shared web components"
    integration_patterns:
      - "Shared React components from web platform"
      - "Native OS integration (file system, notifications)"
      - "Auto-update mechanisms"
      - "Offline-first data storage"
    deployment: "Auto-updater with GitHub releases"

  emerging_platforms:
    visionos: "SwiftUI with AR/VR specific adaptations"
    tv_platforms: "React-based TV apps with remote navigation"
    watchos: "SwiftUI with health and fitness integration"
    car_platforms: "CarPlay/Android Auto integration"
```

### **Shared Architecture Components**
```typescript
// shared/types/core-types.ts
export interface PlatformCapabilities {
  platform: 'web' | 'ios' | 'android' | 'desktop' | 'tv' | 'watch' | 'car' | 'vision';
  features: {
    offline: boolean;
    pushNotifications: boolean;
    biometrics: boolean;
    camera: boolean;
    location: boolean;
    fileSystem: boolean;
    backgroundProcessing: boolean;
  };
  constraints: {
    screenSize: { width: number; height: number };
    inputMethod: 'touch' | 'mouse' | 'remote' | 'voice' | 'gesture';
    storageLimit: number;
    networkOptimization: 'wifi' | 'cellular' | 'mixed';
  };
}

export interface UniversalApiResponse<T = any> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    };
    version: string;
    timestamp: string;
    platform: string;
  };
  errors?: Array<{
    code: string;
    message: string;
    field?: string;
  }>;
}

export interface CrossPlatformEvent {
  eventId: string;
  eventType: string;
  source: PlatformCapabilities['platform'];
  target?: PlatformCapabilities['platform'][];
  payload: any;
  timestamp: string;
  metadata: {
    userId?: string;
    sessionId: string;
    deviceId: string;
  };
}

// shared/services/api-client.ts
export class UniversalApiClient {
  private baseUrl: string;
  private platform: PlatformCapabilities['platform'];
  private authToken?: string;

  constructor(config: {
    baseUrl: string;
    platform: PlatformCapabilities['platform'];
    authToken?: string;
  }) {
    this.baseUrl = config.baseUrl;
    this.platform = config.platform;
    this.authToken = config.authToken;
  }

  async request<T>(
    endpoint: string,
    options: {
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      body?: any;
      headers?: Record<string, string>;
      timeout?: number;
    }
  ): Promise<UniversalApiResponse<T>> {
    const headers = {
      'Content-Type': 'application/json',
      'X-Platform': this.platform,
      'X-App-Version': process.env.APP_VERSION || '1.0.0',
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: options.method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Platform-aware API methods
  async getUserProfile(): Promise<UniversalApiResponse<UserProfile>> {
    return this.request<UserProfile>('/api/v1/user/profile', {
      method: 'GET',
    });
  }

  async updateUserPreferences(
    preferences: Partial<UserPreferences>
  ): Promise<UniversalApiResponse<UserPreferences>> {
    return this.request<UserPreferences>('/api/v1/user/preferences', {
      method: 'PATCH',
      body: preferences,
    });
  }
}
```

## Shared Services Strategy

### **Backend Services Architecture**
```yaml
Shared_Services_Architecture:
  api_gateway:
    technology: "Kong Enterprise"
    responsibilities:
      - "Request routing and load balancing"
      - "Authentication and authorization"
      - "Rate limiting and throttling"
      - "Request/response transformation"
      - "Analytics and monitoring"
    platform_adaptations:
      web: "Full API access with CORS support"
      mobile: "Optimized responses for mobile bandwidth"
      desktop: "Bulk operations for offline sync"
      tv: "Simplified responses for TV interfaces"
      watch: "Minimal data for watch displays"

  core_business_services:
    user_management:
      service_type: "Microservice"
      responsibilities: ["Authentication", "Profile management", "Preferences", "Security"]
      integration_pattern: "REST APIs + Event notifications"
      platforms_served: "All 8 platforms"

    product_catalog:
      service_type: "Microservice"
      responsibilities: ["Product data", "Search", "Categories", "Recommendations"]
      integration_pattern: "GraphQL for flexible querying + REST for mutations"
      platforms_served: "All platforms with platform-specific optimizations"

    order_management:
      service_type: "Microservice"
      responsibilities: ["Order processing", "Payment handling", "Fulfillment tracking"]
      integration_pattern: "Event-driven workflows + REST APIs"
      platforms_served: "Transactional platforms (web, mobile, desktop)"

    notification_service:
      service_type: "Shared service"
      responsibilities: ["Push notifications", "Email", "SMS", "In-app notifications"]
      integration_pattern: "Event-driven with platform-specific delivery"
      platform_adaptations:
        web: "Browser push notifications + in-app toasts"
        mobile: "Native push notifications (APNs/FCM)"
        desktop: "System notifications"
        tv: "On-screen notifications"
        watch: "Haptic feedback + brief messages"

  supporting_services:
    analytics_service:
      service_type: "Shared service"
      responsibilities: ["Event tracking", "User behavior analysis", "Performance metrics"]
      integration_pattern: "Event streaming with batch processing"
      data_collection: "Cross-platform user journey tracking"

    content_management:
      service_type: "Modular monolith"
      responsibilities: ["Content creation", "Localization", "Asset management"]
      integration_pattern: "REST APIs with CDN delivery"
      content_adaptation: "Platform-specific content formatting"
```

### **Service Integration Patterns**
```typescript
// shared/services/service-registry.ts
export interface ServiceEndpoint {
  name: string;
  baseUrl: string;
  version: string;
  capabilities: {
    sync: boolean;
    async: boolean;
    graphql: boolean;
    websocket: boolean;
  };
  platformSupport: PlatformCapabilities['platform'][];
}

export class ServiceRegistry {
  private services: Map<string, ServiceEndpoint> = new Map();

  constructor() {
    this.initializeServices();
  }

  private initializeServices(): void {
    // Core business services
    this.register({
      name: 'user-service',
      baseUrl: process.env.USER_SERVICE_URL || 'https://api.tanqory.com/user',
      version: 'v1',
      capabilities: {
        sync: true,
        async: true,
        graphql: false,
        websocket: true,
      },
      platformSupport: ['web', 'ios', 'android', 'desktop', 'tv', 'watch', 'car', 'vision'],
    });

    this.register({
      name: 'catalog-service',
      baseUrl: process.env.CATALOG_SERVICE_URL || 'https://api.tanqory.com/catalog',
      version: 'v1',
      capabilities: {
        sync: true,
        async: false,
        graphql: true,
        websocket: false,
      },
      platformSupport: ['web', 'ios', 'android', 'desktop', 'tv', 'vision'],
    });

    this.register({
      name: 'notification-service',
      baseUrl: process.env.NOTIFICATION_SERVICE_URL || 'https://api.tanqory.com/notifications',
      version: 'v1',
      capabilities: {
        sync: false,
        async: true,
        graphql: false,
        websocket: true,
      },
      platformSupport: ['web', 'ios', 'android', 'desktop', 'tv', 'watch'],
    });
  }

  register(service: ServiceEndpoint): void {
    this.services.set(service.name, service);
  }

  getService(name: string): ServiceEndpoint | undefined {
    return this.services.get(name);
  }

  getServicesForPlatform(platform: PlatformCapabilities['platform']): ServiceEndpoint[] {
    return Array.from(this.services.values()).filter(service =>
      service.platformSupport.includes(platform)
    );
  }
}

// shared/services/cross-platform-sync.ts
export class CrossPlatformSyncManager {
  private syncQueue: Array<SyncOperation> = [];
  private conflictResolver: ConflictResolver;

  constructor(private platform: PlatformCapabilities['platform']) {
    this.conflictResolver = new ConflictResolver();
  }

  async sync(): Promise<SyncResult> {
    const operations = await this.prepareSyncOperations();
    const conflicts = await this.detectConflicts(operations);

    if (conflicts.length > 0) {
      const resolutions = await this.conflictResolver.resolve(conflicts);
      operations.push(...resolutions);
    }

    return this.executeSyncOperations(operations);
  }

  private async prepareSyncOperations(): Promise<SyncOperation[]> {
    // Get pending changes from local storage
    const pendingChanges = await this.getLocalChanges();

    // Get server state
    const serverState = await this.getServerState();

    // Calculate delta
    return this.calculateDelta(pendingChanges, serverState);
  }

  private async detectConflicts(operations: SyncOperation[]): Promise<Conflict[]> {
    // Implement conflict detection logic
    // Check for concurrent modifications, version mismatches, etc.
    return [];
  }
}
```

## Universal Component Library

### **Design System Integration**
```yaml
Universal_Design_System:
  component_hierarchy:
    atomic_components:
      description: "Basic UI elements that work across all platforms"
      examples: ["Button", "Input", "Text", "Icon", "Image"]
      implementation: "Platform-specific renderers with unified API"

    molecular_components:
      description: "Complex components built from atomic elements"
      examples: ["Form", "Card", "Modal", "Navigation", "SearchBar"]
      implementation: "Shared logic with platform-specific styling"

    organism_components:
      description: "Complete UI sections with business logic"
      examples: ["ProductList", "UserProfile", "ShoppingCart", "Dashboard"]
      implementation: "Business logic in shared layer, UI adaptation per platform"

    template_components:
      description: "Full-page layouts and structures"
      examples: ["HomePage", "ProductPage", "CheckoutFlow", "UserSettings"]
      implementation: "Platform-specific layouts with shared content components"

  platform_adaptations:
    responsive_design:
      breakpoints:
        mobile: "< 768px"
        tablet: "768px - 1024px"
        desktop: "> 1024px"
        tv: "1920x1080 with 10-foot UI"
        watch: "< 200px with large touch targets"

    interaction_patterns:
      touch_platforms: ["mobile", "tablet", "watch"]
      mouse_platforms: ["desktop", "web"]
      remote_platforms: ["tv", "car"]
      gesture_platforms: ["vision"]

    accessibility_standards:
      wcag_compliance: "WCAG 2.1 AA compliance across all platforms"
      platform_specific: ["VoiceOver (iOS)", "TalkBack (Android)", "NVDA (Desktop)"]
      universal_features: ["High contrast", "Large text", "Reduced motion"]
```

### **Component Implementation Strategy**
```typescript
// shared/components/Button/Button.types.ts
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  children: React.ReactNode;
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
  // Platform-specific props
  hapticFeedback?: boolean; // iOS/Android
  soundFeedback?: boolean;  // TV/Car
}

// shared/components/Button/Button.tsx
import React from 'react';
import { ButtonProps } from './Button.types';
import { PlatformAdapter } from '../PlatformAdapter';

export const Button: React.FC<ButtonProps> = (props) => {
  const adapter = PlatformAdapter.getInstance();

  return adapter.renderButton({
    ...props,
    onPress: () => {
      // Universal feedback
      if (props.hapticFeedback && adapter.supportsHapticFeedback()) {
        adapter.triggerHapticFeedback();
      }

      if (props.soundFeedback && adapter.supportsSoundFeedback()) {
        adapter.triggerSoundFeedback();
      }

      props.onPress();
    }
  });
};

// platform-specific implementations
// web/components/Button.web.tsx
export const WebButton: React.FC<ButtonProps> = ({
  variant, size, disabled, loading, children, onPress, ...props
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${disabled ? 'disabled' : ''}`}
      disabled={disabled || loading}
      onClick={onPress}
      {...props}
    >
      {loading && <Spinner size="small" />}
      {children}
    </button>
  );
};

// mobile/components/Button.native.tsx
import { TouchableOpacity, Text, View } from 'react-native';
import { Haptics } from 'expo-haptics';

export const NativeButton: React.FC<ButtonProps> = ({
  variant, size, disabled, loading, children, onPress, hapticFeedback, ...props
}) => {
  const handlePress = () => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress();
  };

  return (
    <TouchableOpacity
      style={[styles.button, styles[variant], styles[size]]}
      onPress={handlePress}
      disabled={disabled || loading}
      {...props}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator size="small" />}
        <Text style={styles.text}>{children}</Text>
      </View>
    </TouchableOpacity>
  );
};

// shared/components/PlatformAdapter.ts
export class PlatformAdapter {
  private static instance: PlatformAdapter;
  private platform: PlatformCapabilities['platform'];

  private constructor() {
    this.platform = this.detectPlatform();
  }

  static getInstance(): PlatformAdapter {
    if (!PlatformAdapter.instance) {
      PlatformAdapter.instance = new PlatformAdapter();
    }
    return PlatformAdapter.instance;
  }

  renderButton(props: ButtonProps): React.ReactElement {
    switch (this.platform) {
      case 'web':
        return <WebButton {...props} />;
      case 'ios':
      case 'android':
        return <NativeButton {...props} />;
      case 'desktop':
        return <DesktopButton {...props} />;
      case 'tv':
        return <TVButton {...props} />;
      default:
        return <WebButton {...props} />; // Fallback
    }
  }

  supportsHapticFeedback(): boolean {
    return ['ios', 'android', 'watch'].includes(this.platform);
  }

  supportsSoundFeedback(): boolean {
    return ['tv', 'car', 'vision'].includes(this.platform);
  }

  triggerHapticFeedback(): void {
    // Platform-specific haptic feedback implementation
  }

  triggerSoundFeedback(): void {
    // Platform-specific sound feedback implementation
  }

  private detectPlatform(): PlatformCapabilities['platform'] {
    // Platform detection logic
    if (typeof window !== 'undefined') {
      if (window.navigator.userAgent.includes('Electron')) return 'desktop';
      return 'web';
    }
    // React Native detection logic
    return 'ios'; // or 'android'
  }
}
```

## Platform-Specific Adapters

### **Adapter Pattern Implementation**
```yaml
Platform_Adapter_Strategy:
  adapter_pattern:
    purpose: "Abstract platform differences while providing native experiences"
    implementation: "Interface-based adapters with platform-specific implementations"
    benefits: ["Code reuse", "Platform optimization", "Maintainability"]

  core_adapters:
    storage_adapter:
      interface: "Universal key-value storage with sync capabilities"
      implementations:
        web: "IndexedDB with sync worker"
        mobile: "AsyncStorage with SQLite backing"
        desktop: "Electron-store with file system"
        tv: "TV platform storage APIs"

    navigation_adapter:
      interface: "Universal navigation with platform-specific animations"
      implementations:
        web: "React Router with browser history"
        mobile: "React Navigation with native gestures"
        desktop: "React Router with window management"
        tv: "Focus-based navigation with remote control"

    notification_adapter:
      interface: "Universal notification API"
      implementations:
        web: "Browser Push API + Service Worker"
        mobile: "React Native Push Notifications"
        desktop: "Electron native notifications"
        tv: "On-screen notification overlays"

    authentication_adapter:
      interface: "Universal authentication with biometric support"
      implementations:
        web: "WebAuthn + OAuth flows"
        mobile: "Biometric authentication + OAuth"
        desktop: "System authentication + OAuth"
        tv: "Device-based authentication"
```

### **Implementation Examples**
```typescript
// shared/adapters/StorageAdapter.ts
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  sync(): Promise<SyncResult>;
}

// web/adapters/WebStorageAdapter.ts
export class WebStorageAdapter implements StorageAdapter {
  private db: IDBDatabase;
  private syncWorker: ServiceWorker;

  async get<T>(key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data'], 'readonly');
      const store = transaction.objectStore('data');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value || null);
      request.onerror = () => reject(request.error);
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      const request = store.put({ key, value, timestamp: Date.now() });

      request.onsuccess = () => {
        this.queueForSync(key, value);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async sync(): Promise<SyncResult> {
    // Delegate to sync worker
    return this.syncWorker.postMessage({ type: 'SYNC_DATA' });
  }

  private queueForSync<T>(key: string, value: T): void {
    // Queue data for background sync
  }
}

// mobile/adapters/MobileStorageAdapter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export class MobileStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      this.queueForSync(key, value);
    } catch (error) {
      console.error('Storage set error:', error);
      throw error;
    }
  }

  async sync(): Promise<SyncResult> {
    // Implement mobile-specific sync logic
    const pendingChanges = await this.getPendingChanges();
    return this.syncWithServer(pendingChanges);
  }
}
```

## Data Synchronization Patterns

### **Offline-First Synchronization**
```yaml
Data_Synchronization_Strategy:
  offline_first_principles:
    local_storage_priority: "All data operations happen locally first"
    background_sync: "Sync with server in background when connectivity available"
    conflict_resolution: "Automatic conflict resolution with manual override options"
    progressive_sync: "Sync critical data first, then non-critical data"

  synchronization_patterns:
    optimistic_updates:
      description: "Apply changes locally immediately, sync in background"
      use_cases: ["User interactions", "Form submissions", "Settings changes"]
      rollback_strategy: "Revert local changes if server sync fails"

    delta_sync:
      description: "Only sync changed data since last synchronization"
      use_cases: ["Large datasets", "Bandwidth-constrained environments"]
      implementation: "Change tracking with timestamps and version vectors"

    operational_transform:
      description: "Handle concurrent edits from multiple platforms"
      use_cases: ["Collaborative editing", "Real-time data updates"]
      implementation: "Transform operations to maintain consistency"

    last_write_wins:
      description: "Simple conflict resolution based on timestamps"
      use_cases: ["User preferences", "Simple configuration data"]
      implementation: "Server timestamp determines winning version"

  platform_sync_strategies:
    web_platform:
      storage: "IndexedDB for large data, localStorage for quick access"
      sync_trigger: "Service worker background sync"
      connectivity: "Online/offline event listeners"

    mobile_platforms:
      storage: "SQLite with AsyncStorage"
      sync_trigger: "Background app refresh + foreground app resume"
      connectivity: "Network state monitoring"

    desktop_platform:
      storage: "Local SQLite database"
      sync_trigger: "Periodic sync + user action triggers"
      connectivity: "OS network change events"

    limited_platforms:
      tv: "Minimal local storage, frequent server queries"
      watch: "Essential data only, immediate sync"
      car: "Safety-critical data cached, non-critical data fetched on demand"
```

### **Sync Implementation**
```typescript
// shared/sync/SyncManager.ts
export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  platform: PlatformCapabilities['platform'];
  userId: string;
  version: number;
}

export interface SyncConflict {
  operationId: string;
  localOperation: SyncOperation;
  serverOperation: SyncOperation;
  conflictType: 'concurrent_modification' | 'version_mismatch' | 'delete_conflict';
}

export class SyncManager {
  private pendingOperations: SyncOperation[] = [];
  private conflictResolver: ConflictResolver;
  private storageAdapter: StorageAdapter;

  constructor(
    private platform: PlatformCapabilities['platform'],
    private apiClient: UniversalApiClient
  ) {
    this.conflictResolver = new ConflictResolver();
    this.storageAdapter = StorageAdapterFactory.create(platform);
  }

  async queueOperation(operation: Omit<SyncOperation, 'id' | 'timestamp'>): Promise<void> {
    const syncOperation: SyncOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      platform: this.platform,
    };

    this.pendingOperations.push(syncOperation);
    await this.storageAdapter.set(`sync_operation_${syncOperation.id}`, syncOperation);

    // Trigger immediate sync if online
    if (await this.isOnline()) {
      this.sync();
    }
  }

  async sync(): Promise<SyncResult> {
    if (!await this.isOnline()) {
      return { success: false, reason: 'offline' };
    }

    const operations = await this.getPendingOperations();
    if (operations.length === 0) {
      return { success: true, synced: 0 };
    }

    // Step 1: Send local changes to server
    const serverResponse = await this.apiClient.request<SyncResponse>('/api/v1/sync', {
      method: 'POST',
      body: {
        operations,
        lastSyncTimestamp: await this.getLastSyncTimestamp(),
      },
    });

    // Step 2: Handle conflicts
    const conflicts = serverResponse.data.conflicts || [];
    if (conflicts.length > 0) {
      const resolutions = await this.resolveConflicts(conflicts);
      // Apply conflict resolutions locally
      await this.applyConflictResolutions(resolutions);
    }

    // Step 3: Apply server changes locally
    const serverChanges = serverResponse.data.changes || [];
    await this.applyServerChanges(serverChanges);

    // Step 4: Clean up successfully synced operations
    await this.cleanupSyncedOperations(serverResponse.data.processedOperations || []);

    // Step 5: Update last sync timestamp
    await this.setLastSyncTimestamp(serverResponse.data.timestamp);

    return {
      success: true,
      synced: operations.length,
      conflicts: conflicts.length,
      serverChanges: serverChanges.length,
    };
  }

  private async resolveConflicts(conflicts: SyncConflict[]): Promise<ConflictResolution[]> {
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      const resolution = await this.conflictResolver.resolve(conflict);
      resolutions.push(resolution);
    }

    return resolutions;
  }

  private async isOnline(): Promise<boolean> {
    // Platform-specific online detection
    switch (this.platform) {
      case 'web':
        return navigator.onLine;
      case 'ios':
      case 'android':
        // Use React Native NetInfo
        return true; // Implementation depends on NetInfo library
      default:
        return true;
    }
  }
}

// shared/sync/ConflictResolver.ts
export class ConflictResolver {
  async resolve(conflict: SyncConflict): Promise<ConflictResolution> {
    switch (conflict.conflictType) {
      case 'concurrent_modification':
        return this.resolveConcurrentModification(conflict);
      case 'version_mismatch':
        return this.resolveVersionMismatch(conflict);
      case 'delete_conflict':
        return this.resolveDeleteConflict(conflict);
      default:
        throw new Error(`Unknown conflict type: ${conflict.conflictType}`);
    }
  }

  private async resolveConcurrentModification(conflict: SyncConflict): Promise<ConflictResolution> {
    // Strategy: Server wins for critical data, user prompt for user data
    if (this.isCriticalBusinessData(conflict.localOperation.entity)) {
      return {
        strategy: 'server_wins',
        result: conflict.serverOperation,
      };
    }

    // For user data, we might want to prompt the user
    return {
      strategy: 'user_prompt_required',
      options: {
        local: conflict.localOperation,
        server: conflict.serverOperation,
      },
    };
  }

  private async resolveVersionMismatch(conflict: SyncConflict): Promise<ConflictResolution> {
    // Strategy: Always use the latest version
    const latestVersion = Math.max(
      conflict.localOperation.version,
      conflict.serverOperation.version
    );

    return {
      strategy: 'latest_version_wins',
      result: latestVersion === conflict.localOperation.version
        ? conflict.localOperation
        : conflict.serverOperation,
    };
  }
}
```

## Authentication & Authorization

### **Cross-Platform Authentication Strategy**
```yaml
Authentication_Strategy:
  unified_identity:
    principle: "Single sign-on across all 8 platforms"
    implementation:
      - "OAuth 2.0 + OpenID Connect"
      - "JWT tokens with refresh mechanism"
      - "Biometric authentication where supported"
      - "Device registration and trust"

  platform_specific_auth:
    web_platform:
      methods: ["Email/password", "Social login", "WebAuthn", "Magic links"]
      session_management: "Secure httpOnly cookies + JWT"
      security: ["CSRF protection", "Content Security Policy"]

    mobile_platforms:
      methods: ["Biometric", "PIN", "Social login", "Email/password"]
      session_management: "Secure keychain storage"
      security: ["Certificate pinning", "Jailbreak/root detection"]

    desktop_platform:
      methods: ["System authentication", "Biometric", "Email/password"]
      session_management: "Encrypted local storage"
      security: ["Code signing verification", "Secure storage APIs"]

    limited_platforms:
      tv: ["Device code flow", "QR code authentication", "Voice authentication"]
      watch: ["Biometric", "Device pairing", "Quick PIN"]
      car: ["Bluetooth pairing", "Voice recognition", "Phone proximity"]
      vision: ["Biometric", "Gesture authentication", "Voice commands"]

  token_management:
    access_tokens:
      lifetime: "15 minutes"
      storage: "Memory only (never persisted)"
      scope: "Platform-specific scopes based on capabilities"

    refresh_tokens:
      lifetime: "30 days"
      storage: "Secure platform-specific storage"
      rotation: "Automatic rotation on use"

    device_tokens:
      lifetime: "90 days"
      purpose: "Device trust and registration"
      revocation: "User-initiated and automatic on suspicious activity"
```

### **Authentication Implementation**
```typescript
// shared/auth/AuthManager.ts
export interface AuthCredentials {
  accessToken: string;
  refreshToken: string;
  deviceToken: string;
  expiresAt: number;
  user: UserProfile;
}

export interface AuthConfig {
  platform: PlatformCapabilities['platform'];
  clientId: string;
  redirectUri: string;
  scopes: string[];
  biometricEnabled: boolean;
}

export class AuthManager {
  private credentials: AuthCredentials | null = null;
  private storageAdapter: StorageAdapter;
  private biometricAdapter: BiometricAdapter;

  constructor(private config: AuthConfig) {
    this.storageAdapter = StorageAdapterFactory.create(config.platform);
    this.biometricAdapter = BiometricAdapterFactory.create(config.platform);
  }

  async initialize(): Promise<void> {
    // Try to restore previous session
    const storedCredentials = await this.storageAdapter.get<AuthCredentials>('auth_credentials');

    if (storedCredentials && !this.isTokenExpired(storedCredentials.accessToken)) {
      this.credentials = storedCredentials;
    } else if (storedCredentials?.refreshToken) {
      // Try to refresh the session
      await this.refreshSession(storedCredentials.refreshToken);
    }
  }

  async authenticateWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          platform: this.config.platform,
          clientId: this.config.clientId,
        }),
      });

      if (!response.ok) {
        throw new AuthError('Invalid credentials');
      }

      const credentials = await response.json();
      await this.storeCredentials(credentials);
      return { success: true, credentials };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async authenticateWithBiometrics(): Promise<AuthResult> {
    if (!this.config.biometricEnabled || !await this.biometricAdapter.isAvailable()) {
      throw new AuthError('Biometric authentication not available');
    }

    try {
      const biometricResult = await this.biometricAdapter.authenticate({
        promptMessage: 'Authenticate to access Tanqory',
        fallbackTitle: 'Use PIN',
      });

      if (!biometricResult.success) {
        throw new AuthError('Biometric authentication failed');
      }

      // Use stored refresh token to get new access token
      const storedCredentials = await this.storageAdapter.get<AuthCredentials>('auth_credentials');
      if (!storedCredentials?.refreshToken) {
        throw new AuthError('No stored credentials for biometric authentication');
      }

      return await this.refreshSession(storedCredentials.refreshToken);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async authenticateWithSocial(provider: 'google' | 'facebook' | 'apple'): Promise<AuthResult> {
    const socialAdapter = SocialAuthAdapterFactory.create(provider, this.config.platform);

    try {
      const socialResult = await socialAdapter.authenticate();

      if (!socialResult.success) {
        throw new AuthError(`${provider} authentication failed`);
      }

      // Exchange social token for our tokens
      const response = await fetch('/api/v1/auth/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          token: socialResult.token,
          platform: this.config.platform,
          clientId: this.config.clientId,
        }),
      });

      if (!response.ok) {
        throw new AuthError('Social authentication failed');
      }

      const credentials = await response.json();
      await this.storeCredentials(credentials);
      return { success: true, credentials };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout(): Promise<void> {
    if (this.credentials) {
      // Revoke tokens on server
      await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.credentials.refreshToken,
          deviceToken: this.credentials.deviceToken,
        }),
      });
    }

    // Clear local storage
    await this.storageAdapter.remove('auth_credentials');
    this.credentials = null;
  }

  async getValidAccessToken(): Promise<string | null> {
    if (!this.credentials) {
      return null;
    }

    if (!this.isTokenExpired(this.credentials.accessToken)) {
      return this.credentials.accessToken;
    }

    // Try to refresh
    const refreshResult = await this.refreshSession(this.credentials.refreshToken);
    return refreshResult.success ? refreshResult.credentials.accessToken : null;
  }

  private async refreshSession(refreshToken: string): Promise<AuthResult> {
    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken,
          platform: this.config.platform,
        }),
      });

      if (!response.ok) {
        throw new AuthError('Token refresh failed');
      }

      const credentials = await response.json();
      await this.storeCredentials(credentials);
      return { success: true, credentials };
    } catch (error) {
      // Clear invalid credentials
      await this.storageAdapter.remove('auth_credentials');
      this.credentials = null;
      return { success: false, error: error.message };
    }
  }

  private async storeCredentials(credentials: AuthCredentials): Promise<void> {
    this.credentials = credentials;

    // Store refresh token securely
    await this.storageAdapter.set('auth_credentials', {
      refreshToken: credentials.refreshToken,
      deviceToken: credentials.deviceToken,
      user: credentials.user,
    });
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
```

---

## Quality Gates

### **Cross-Platform Integration Excellence**
- [ ] Unified API contracts maintained across all 8 platforms
- [ ] Consistent authentication and authorization flow
- [ ] Offline-first data synchronization implemented
- [ ] Platform-specific optimizations while maintaining consistency
- [ ] Universal component library with platform adaptations

### **Technical Excellence**
- [ ] Comprehensive error handling and retry mechanisms
- [ ] Real-time data synchronization with conflict resolution
- [ ] Security standards maintained across all platforms
- [ ] Performance optimizations for each platform's constraints
- [ ] Automated testing across all integration points

## Success Metrics
- Cross-platform consistency score: >95% feature parity
- Sync reliability: >99.9% successful data synchronization
- Authentication success rate: >99% across all platforms
- Performance targets: <2s app startup time across platforms
- User experience consistency: <5% variation in user satisfaction across platforms

---

**Integration References:**
- `enterprise/unified_architecture_decision_framework.md` - Architecture decision criteria and hybrid strategies
- `integration/02_api_integration_patterns.md` - API design and service communication patterns
- `enterprise/05_enterprise_microservice_template_guide.md` - Service implementation standards
- `multi-platform/03_multiplatform_cross_platform_deployment.md` - Platform deployment strategies