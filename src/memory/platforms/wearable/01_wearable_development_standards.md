# Wearable Platform Development Standards

> **Platform Memory**: Wearable development standards for smartwatch companion experiences

---

## Overview

This document defines comprehensive wearable platform development standards for smartwatch applications focusing on companion-based networking, lightweight interactions, and battery-optimized experiences across watchOS and Wear OS platforms.

## Wearable Architecture

### Platform Support Matrix

#### Supported Wearable Platforms
```typescript
interface WearablePlatformMatrix {
  watchOS: {
    framework: 'SwiftUI + WatchConnectivity';
    language: 'Swift';
    minVersion: 'watchOS 8.0+';
    distribution: 'App Store (bundled with iPhone app)';
    packaging: '.ipa (watch app bundle)';
    input: 'Digital Crown + Tap + Voice';
    connectivity: 'iPhone companion required';
    capabilities: [
      'Health and fitness integration',
      'Complications and watch faces',
      'Haptic feedback patterns',
      'Siri integration',
      'Apple Pay',
      'Background refresh'
    ];
  };

  wearOS: {
    framework: 'Compose for Wear + Data Layer API';
    language: 'Kotlin/Java';
    minVersion: 'Wear OS 3.0+ (API 30)';
    distribution: 'Google Play Store (Wear apps)';
    packaging: '.apk + companion';
    input: 'Touch + Rotary + Voice';
    connectivity: 'Phone companion + standalone';
    capabilities: [
      'Google Fit integration',
      'Tiles and complications',
      'Assistant integration',
      'Google Pay',
      'Standalone connectivity',
      'Health sensors'
    ];
  };
}
```

### Phone Proxy Architecture

#### Companion Connectivity Manager
```typescript
// Cross-platform companion connectivity
class WearableConnectivityManager {
    private phoneProxy: PhoneProxy;
    private dataSync: WearableDataSync;
    private offlineQueue: OfflineQueue;

    constructor(platform: WearablePlatform) {
        this.phoneProxy = new PhoneProxy(platform);
        this.dataSync = new WearableDataSync(platform);
        this.offlineQueue = new OfflineQueue();
    }

    async sendMessageToPhone(message: WearableMessage): Promise<MessageResult> {
        try {
            // Check phone connectivity
            const isPhoneConnected = await this.phoneProxy.isConnected();

            if (!isPhoneConnected) {
                // Queue for later delivery
                await this.offlineQueue.enqueue(message);
                return {
                    success: false,
                    queued: true,
                    message: 'Phone not connected, message queued'
                };
            }

            // Send via phone proxy
            const result = await this.phoneProxy.sendMessage(message);
            return result;

        } catch (error) {
            // Fallback to offline queue
            await this.offlineQueue.enqueue(message);
            throw error;
        }
    }

    async syncDataWithPhone(): Promise<SyncResult> {
        const pendingData = await this.dataSync.getPendingSync();

        if (pendingData.length === 0) {
            return { success: true, itemsSynced: 0 };
        }

        try {
            const syncResults = await Promise.all(
                pendingData.map(data => this.phoneProxy.syncData(data))
            );

            const successfulSyncs = syncResults.filter(r => r.success).length;

            // Clear successfully synced data
            await this.dataSync.clearSynced(syncResults.filter(r => r.success));

            return {
                success: true,
                itemsSynced: successfulSyncs,
                itemsFailed: pendingData.length - successfulSyncs
            };

        } catch (error) {
            console.error('Data sync failed:', error);
            return {
                success: false,
                error: error.message,
                itemsSynced: 0
            };
        }
    }
}
```

#### Phone Proxy Implementation
```typescript
// Phone proxy for network requests
class PhoneProxy {
    private connectionManager: ConnectionManager;
    private messageQueue: MessageQueue;
    private responseHandlers: Map<string, Function> = new Map();

    constructor(platform: WearablePlatform) {
        this.connectionManager = new ConnectionManager(platform);
        this.messageQueue = new MessageQueue();
        this.setupConnectionHandlers();
    }

    async makeAPIRequest(request: APIRequest): Promise<APIResponse> {
        const messageId = this.generateMessageId();

        // Create proxy request message
        const proxyMessage: ProxyMessage = {
            id: messageId,
            type: 'api_request',
            payload: {
                url: request.url,
                method: request.method,
                headers: request.headers,
                body: request.body,
                timeout: request.timeout || 30000
            },
            timestamp: Date.now()
        };

        // Send to phone and wait for response
        return new Promise((resolve, reject) => {
            // Set up response handler
            this.responseHandlers.set(messageId, (response: ProxyResponse) => {
                if (response.success) {
                    resolve(response.data);
                } else {
                    reject(new Error(response.error));
                }
            });

            // Send message with timeout
            this.sendMessageWithTimeout(proxyMessage, 30000)
                .catch(reject);
        });
    }

    private async sendMessageWithTimeout(
        message: ProxyMessage,
        timeout: number
    ): Promise<void> {
        const timeoutId = setTimeout(() => {
            this.responseHandlers.delete(message.id);
            throw new Error(`Request timeout after ${timeout}ms`);
        }, timeout);

        try {
            await this.connectionManager.sendMessage(message);
        } catch (error) {
            clearTimeout(timeoutId);
            this.responseHandlers.delete(message.id);
            throw error;
        }
    }

    handlePhoneResponse(response: ProxyResponse): void {
        const handler = this.responseHandlers.get(response.messageId);
        if (handler) {
            handler(response);
            this.responseHandlers.delete(response.messageId);
        }
    }
}
```

### Wearable Commerce Implementation

#### Watch Commerce Manager
```typescript
// Wearable commerce implementation
class WearableCommerceManager {
    private connectivityManager: WearableConnectivityManager;
    private localCache: WearableCache;
    private hapticManager: HapticFeedbackManager;

    constructor(platform: WearablePlatform) {
        this.connectivityManager = new WearableConnectivityManager(platform);
        this.localCache = new WearableCache();
        this.hapticManager = new HapticFeedbackManager(platform);
    }

    async getQuickActions(): Promise<QuickAction[]> {
        // Load from local cache first
        const cached = await this.localCache.get('quick_actions');
        if (cached && this.isCacheValid(cached)) {
            return cached.data;
        }

        // Fetch via phone proxy
        try {
            const actions = await this.connectivityManager.sendMessageToPhone({
                type: 'get_quick_actions',
                payload: { limit: 6 } // Limit for watch display
            });

            // Cache for 1 hour
            await this.localCache.set('quick_actions', actions, 60 * 60);
            return actions;

        } catch (error) {
            // Fallback to cached data if available
            if (cached) return cached.data;
            return this.getDefaultQuickActions();
        }
    }

    async addToCart(productId: string): Promise<CartResult> {
        try {
            // Provide immediate haptic feedback
            this.hapticManager.success();

            // Send add to cart request via phone
            const result = await this.connectivityManager.sendMessageToPhone({
                type: 'add_to_cart',
                payload: { productId, quantity: 1 }
            });

            // Show success notification
            this.showNotification('Added to cart!');

            return result;

        } catch (error) {
            this.hapticManager.error();
            this.showError('Failed to add to cart');
            throw error;
        }
    }

    async initiateCheckout(): Promise<CheckoutResult> {
        try {
            // Create checkout session via phone
            const session = await this.connectivityManager.sendMessageToPhone({
                type: 'create_checkout_session',
                payload: {
                    source: 'watch',
                    confirmationRequired: true
                }
            });

            // Show confirmation on watch
            const confirmed = await this.showCheckoutConfirmation(session);

            if (confirmed) {
                // Send confirmation to phone for processing
                return await this.connectivityManager.sendMessageToPhone({
                    type: 'confirm_checkout',
                    payload: { sessionId: session.id }
                });
            } else {
                // Cancel checkout
                await this.connectivityManager.sendMessageToPhone({
                    type: 'cancel_checkout',
                    payload: { sessionId: session.id }
                });

                return { success: false, cancelled: true };
            }

        } catch (error) {
            this.hapticManager.error();
            this.showError('Checkout failed');
            throw error;
        }
    }

    private async showCheckoutConfirmation(session: CheckoutSession): Promise<boolean> {
        return new Promise((resolve) => {
            // Show native confirmation dialog
            this.showConfirmationDialog({
                title: 'Confirm Purchase',
                message: `Total: $${session.total.toFixed(2)}`,
                confirmText: 'Pay',
                cancelText: 'Cancel',
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false)
            });
        });
    }
}
```

### Platform-Specific Implementations

#### watchOS SwiftUI Implementation
```swift
// watchOS SwiftUI implementation
import SwiftUI
import WatchConnectivity

struct WearableCommerceView: View {
    @StateObject private var viewModel = WearableCommerceViewModel()
    @StateObject private var connectivityManager = WatchConnectivityManager.shared

    var body: some View {
        NavigationView {
            List {
                // Quick actions section
                Section("Quick Actions") {
                    ForEach(viewModel.quickActions, id: \.id) { action in
                        QuickActionRow(action: action) {
                            viewModel.performAction(action)
                        }
                    }
                }

                // Cart section
                if viewModel.cartItemCount > 0 {
                    Section("Cart") {
                        HStack {
                            Image(systemName: "cart.fill")
                                .foregroundColor(.blue)
                            Text("\(viewModel.cartItemCount) items")
                            Spacer()
                            Text("$\(viewModel.cartTotal, specifier: "%.2f")")
                                .fontWeight(.semibold)
                        }
                        .onTapGesture {
                            viewModel.showCart()
                        }

                        Button("Checkout") {
                            viewModel.initiateCheckout()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                }
            }
            .navigationTitle("Tanqory")
            .onAppear {
                viewModel.loadQuickActions()
            }
        }
    }
}

struct QuickActionRow: View {
    let action: QuickAction
    let onTap: () -> Void

    var body: some View {
        HStack {
            Image(systemName: action.iconName)
                .foregroundColor(.blue)
                .frame(width: 24, height: 24)

            VStack(alignment: .leading, spacing: 2) {
                Text(action.title)
                    .font(.headline)
                    .lineLimit(1)

                if let subtitle = action.subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            if let price = action.price {
                Text("$\(price, specifier: "%.2f")")
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.primary)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
    }
}

// Watch Connectivity Manager
class WatchConnectivityManager: NSObject, ObservableObject, WCSessionDelegate {
    static let shared = WatchConnectivityManager()
    private var session: WCSession?

    override init() {
        super.init()
        if WCSession.isSupported() {
            session = WCSession.default
            session?.delegate = self
            session?.activate()
        }
    }

    func sendMessage(_ message: [String: Any], replyHandler: @escaping ([String: Any]) -> Void, errorHandler: @escaping (Error) -> Void) {
        guard let session = session, session.isReachable else {
            errorHandler(WearableError.phoneNotReachable)
            return
        }

        session.sendMessage(message, replyHandler: replyHandler, errorHandler: errorHandler)
    }

    // MARK: - WCSessionDelegate
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        DispatchQueue.main.async {
            // Handle activation completion
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String : Any], replyHandler: @escaping ([String : Any]) -> Void) {
        // Handle incoming messages from iPhone
        DispatchQueue.main.async {
            self.handleIncomingMessage(message, replyHandler: replyHandler)
        }
    }
}
```

#### Wear OS Compose Implementation
```kotlin
// Wear OS Compose implementation
@Composable
fun WearableCommerceScreen(
    viewModel: WearableCommerceViewModel = hiltViewModel()
) {
    val quickActions by viewModel.quickActions.collectAsState()
    val cartState by viewModel.cartState.collectAsState()

    WearApp {
        ScalingLazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            // Header
            item {
                Text(
                    text = "Tanqory",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(vertical = 8.dp),
                    textAlign = TextAlign.Center
                )
            }

            // Quick Actions
            items(quickActions) { action ->
                QuickActionChip(
                    action = action,
                    onClick = { viewModel.performAction(action) }
                )
            }

            // Cart section
            if (cartState.itemCount > 0) {
                item {
                    Divider(modifier = Modifier.padding(vertical = 8.dp))
                }

                item {
                    CartSummaryChip(
                        itemCount = cartState.itemCount,
                        total = cartState.total,
                        onClick = { viewModel.showCart() }
                    )
                }

                item {
                    Chip(
                        onClick = { viewModel.initiateCheckout() },
                        label = { Text("Checkout") },
                        colors = ChipDefaults.primaryChipColors(),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        viewModel.loadQuickActions()
    }
}

@Composable
fun QuickActionChip(
    action: QuickAction,
    onClick: () -> Unit
) {
    Chip(
        onClick = onClick,
        label = {
            Text(
                text = action.title,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        },
        secondaryLabel = action.subtitle?.let { subtitle ->
            {
                Text(
                    text = subtitle,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        },
        icon = {
            Icon(
                painter = painterResource(action.iconRes),
                contentDescription = action.title,
                modifier = Modifier.size(24.dp)
            )
        },
        colors = ChipDefaults.secondaryChipColors(),
        modifier = Modifier.fillMaxWidth()
    )
}

@Composable
fun CartSummaryChip(
    itemCount: Int,
    total: Double,
    onClick: () -> Unit
) {
    Chip(
        onClick = onClick,
        label = {
            Text("$itemCount items")
        },
        secondaryLabel = {
            Text("$${String.format("%.2f", total)}")
        },
        icon = {
            Icon(
                Icons.Filled.ShoppingCart,
                contentDescription = "Cart"
            )
        },
        colors = ChipDefaults.primaryChipColors(),
        modifier = Modifier.fillMaxWidth()
    )
}
```

### Battery Optimization

#### Power Management
```typescript
// Battery optimization for wearables
class WearablePowerManager {
    private backgroundTasks: Map<string, BackgroundTask> = new Map();
    private syncScheduler: SyncScheduler;
    private displayManager: DisplayManager;

    constructor() {
        this.syncScheduler = new SyncScheduler();
        this.displayManager = new DisplayManager();
        this.initializePowerOptimizations();
    }

    private initializePowerOptimizations(): void {
        // Minimize background activity
        this.setupEfficientBackgroundSync();

        // Optimize display usage
        this.setupDisplayOptimization();

        // Manage network requests efficiently
        this.setupNetworkOptimization();

        // Monitor battery level
        this.setupBatteryMonitoring();
    }

    private setupEfficientBackgroundSync(): void {
        // Batch sync operations
        this.syncScheduler.schedule('data_sync', {
            interval: 5 * 60 * 1000, // 5 minutes
            batchSize: 10,
            condition: () => this.getBatteryLevel() > 20 // Only sync if battery > 20%
        });

        // Reduce sync frequency when battery is low
        this.syncScheduler.schedule('low_priority_sync', {
            interval: 15 * 60 * 1000, // 15 minutes
            condition: () => this.getBatteryLevel() > 50
        });
    }

    private setupDisplayOptimization(): void {
        // Use dark themes to save power on OLED displays
        this.displayManager.setTheme('dark');

        // Reduce brightness when battery is low
        this.displayManager.setAutoBrightness(true);

        // Minimize wake-up frequency
        this.displayManager.setWakePolicy('minimal');
    }

    private setupNetworkOptimization(): void {
        // Batch network requests
        const requestBatcher = new NetworkRequestBatcher({
            maxBatchSize: 5,
            maxWaitTime: 10000, // 10 seconds
            condition: () => this.isPhoneConnected()
        });

        // Use compression for data transfer
        requestBatcher.setCompression(true);

        // Prioritize critical requests
        requestBatcher.setPriorityHandler((request) => {
            if (request.type === 'checkout' || request.type === 'payment') {
                return 'high';
            }
            return 'normal';
        });
    }

    async executeBackgroundTask(taskId: string, task: BackgroundTask): Promise<void> {
        // Check battery level before executing
        const batteryLevel = this.getBatteryLevel();

        if (batteryLevel < 15 && task.priority !== 'critical') {
            console.log(`Skipping background task ${taskId} due to low battery`);
            return;
        }

        try {
            // Execute with timeout
            await Promise.race([
                task.execute(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Task timeout')), task.timeout || 30000)
                )
            ]);

        } catch (error) {
            console.error(`Background task ${taskId} failed:`, error);
        }
    }

    private getBatteryLevel(): number {
        // Platform-specific battery level implementation
        if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
            // Web API (if available)
            return (navigator as any).getBattery().then((battery: any) => battery.level * 100);
        }

        // Default to conservative estimate
        return 50;
    }
}
```

### Haptic Feedback System

#### Cross-Platform Haptics
```typescript
// Haptic feedback management
class HapticFeedbackManager {
    private platform: WearablePlatform;
    private hapticEngine: HapticEngine;

    constructor(platform: WearablePlatform) {
        this.platform = platform;
        this.hapticEngine = this.createHapticEngine(platform);
    }

    success(): void {
        this.hapticEngine.play({
            type: 'success',
            intensity: 0.7,
            duration: 200
        });
    }

    error(): void {
        this.hapticEngine.play({
            type: 'error',
            intensity: 1.0,
            duration: 300
        });
    }

    warning(): void {
        this.hapticEngine.play({
            type: 'warning',
            intensity: 0.8,
            duration: 250
        });
    }

    custom(pattern: HapticPattern): void {
        this.hapticEngine.play(pattern);
    }

    // Specific commerce haptic patterns
    addToCart(): void {
        this.hapticEngine.play({
            type: 'custom',
            pattern: [100, 50, 100], // Short-pause-short
            intensity: 0.6
        });
    }

    checkout(): void {
        this.hapticEngine.play({
            type: 'custom',
            pattern: [150, 100, 150, 100, 300], // Build-up pattern
            intensity: 0.8
        });
    }

    paymentSuccess(): void {
        this.hapticEngine.play({
            type: 'custom',
            pattern: [200, 100, 100, 100, 100], // Success celebration
            intensity: 0.9
        });
    }

    private createHapticEngine(platform: WearablePlatform): HapticEngine {
        switch (platform) {
            case 'watchOS':
                return new WatchOSHapticEngine();
            case 'wearOS':
                return new WearOSHapticEngine();
            default:
                return new DefaultHapticEngine();
        }
    }
}
```

## Testing Strategy

### Wearable Testing Framework
```typescript
// Wearable-specific testing
class WearableTestRunner {
    async runWearableTests(platform: WearablePlatform): Promise<TestResults> {
        const results: TestResults = {
            platform,
            passed: 0,
            failed: 0,
            total: 0,
            tests: []
        };

        // Phone connectivity tests
        const connectivityResults = await this.testPhoneConnectivity();
        results.tests.push(connectivityResults);

        // Battery optimization tests
        const batteryResults = await this.testBatteryOptimization();
        results.tests.push(batteryResults);

        // UI responsiveness tests
        const uiResults = await this.testUIResponsiveness();
        results.tests.push(uiResults);

        // Haptic feedback tests
        const hapticResults = await this.testHapticFeedback();
        results.tests.push(hapticResults);

        return results;
    }

    private async testPhoneConnectivity(): Promise<TestResult> {
        // Test phone proxy communication
        // Test offline queue functionality
        // Test data synchronization
        return {
            name: 'Phone Connectivity',
            passed: true,
            duration: 2000,
            details: 'All connectivity tests passed'
        };
    }
}
```

## Implementation Timeline

### Phase 1: Core Architecture (Weeks 1-2)
- ✅ Phone proxy implementation
- ✅ Connectivity management system
- ✅ Basic UI components
- ✅ Data synchronization

### Phase 2: Commerce Integration (Weeks 3-4)
- ✅ Quick actions implementation
- ✅ Cart management
- ✅ Checkout flow (Watch confirm → Phone pay)
- ✅ Payment integration

### Phase 3: Optimization (Weeks 5-6)
- ✅ Battery optimization
- ✅ Performance tuning
- ✅ Haptic feedback system
- ✅ Background sync optimization

### Phase 4: Testing & Publishing (Weeks 7-8)
- ✅ Platform-specific testing
- ✅ Store submission process
- ✅ Analytics integration
- ✅ User experience optimization

## Success Metrics

- **Response Time**: < 500ms for local interactions, < 2s for phone proxy
- **Battery Life**: < 5% additional drain per hour of active use
- **Connectivity**: > 95% successful phone communication when in range
- **User Engagement**: > 30% of watch users interact with commerce features
- **Conversion Rate**: > 8% checkout completion rate from watch
- **Sync Success**: > 98% successful data synchronization
- **Haptic Satisfaction**: > 85% users report haptic feedback enhances experience
- **Memory Usage**: < 32MB RAM usage on watch

This comprehensive wearable development standards document provides enterprise-grade patterns for building battery-efficient, companion-based commerce experiences optimized for smartwatch interactions.