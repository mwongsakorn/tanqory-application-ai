---
title: Mobile Development Standards & React Native Architecture
version: 2.0
owner: Mobile Engineering Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [React_Native, iOS, Android, Mobile_Platform]
primary_stack: "React Native New Architecture + TypeScript + Expo (see official technology versions)"
---

# Mobile Development Standards & React Native Architecture

> **Platform Memory**: Enterprise-grade mobile development standards for React Native supporting billion-dollar scale iOS and Android applications

## Primary Mobile Technology Stack

### **Core Mobile Platform Stack**

> **Technology Versions**: For specific version requirements, see [`memory/core/00_official_technology_versions.md`](../../core/00_official_technology_versions.md)

```yaml
# For complete technology stack and versions, see:
# memory/core/00_official_technology_versions.md

Framework: React Native (see official versions - New Architecture mandatory)
Language: TypeScript (see official versions)
Development Platform: Expo (see official versions) + EAS Build
State Management: Zustand + TanStack Query + AsyncStorage
Navigation: React Navigation (Native Stack + Bottom Tabs)
UI Components: React Native Elements + Tamagui + @tanqory/mobile-components
Animations: Reanimated + React Native Gesture Handler
Database: SQLite (via Expo SQLite) + WatermelonDB (Offline-first)
Networking: @tanqory/api-client + React Native NetInfo
Testing: Jest + React Native Testing Library + Detox E2E
Build System: EAS Build + Fastlane (CI/CD)
Distribution: App Store Connect + Google Play Console
Monitoring: Sentry (primary) + React Native Performance
Push Notifications: Expo Notifications + Firebase Cloud Messaging
```

### **React Native New Architecture Setup**
```typescript
// App.tsx - Main application entry point
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TanqoryMobileProvider } from '@tanqory/mobile-sdk';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAppState } from './src/hooks/useAppState';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { LoadingOverlay } from './src/components/LoadingOverlay';
import { configureFlipper } from './src/utils/flipper';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

// Enable screens for better performance
enableScreens();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Configure Flipper for development
if (__DEV__) {
  configureFlipper();
}

// Create QueryClient with mobile-optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst', // Better offline support
    },
    mutations: {
      retry: 1,
      networkMode: 'offlineFirst',
    },
  },
});

export default function App() {
  const { isLoading, isReady } = useAppState();

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
          'Inter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
          'Inter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
          'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
        });

        // Additional app initialization
        await initializeApp();
      } catch (e) {
        console.warn('App initialization failed:', e);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady || isLoading) {
    return <LoadingOverlay />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <TanqoryMobileProvider
              config={{
                apiEndpoint: process.env.EXPO_PUBLIC_API_URL,
                enableAnalytics: true,
                enablePerformanceMonitoring: true,
                enableCrashReporting: true,
                offlineSupport: true,
                theme: 'system',
                features: {
                  biometricAuth: true,
                  pushNotifications: true,
                  backgroundSync: true,
                  deepLinking: true
                }
              }}
            >
              <StatusBar style="auto" />
              <AppNavigator />
            </TanqoryMobileProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

async function initializeApp() {
  // Initialize services
  const services = [
    import('./src/services/analytics'),
    import('./src/services/crashReporting'),
    import('./src/services/pushNotifications'),
    import('./src/services/deepLinking')
  ];

  await Promise.allSettled(services);
}
```

### **Platform Configuration**
```json
// app.json - Expo configuration
{
  "expo": {
    "name": "Tanqory",
    "slug": "tanqory-mobile",
    "version": "2.0.0",
    "orientation": "portrait",
    "icon": "./assets/icons/app-icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tanqory.mobile",
      "buildNumber": "1",
      "deploymentTarget": "13.0",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to scan product barcodes and take photos for reviews.",
        "NSLocationWhenInUseUsageDescription": "This app uses location to find nearby stores and provide location-based services.",
        "NSFaceIDUsageDescription": "This app uses Face ID for secure authentication.",
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": false,
          "NSAllowsLocalNetworking": true
        }
      },
      "associatedDomains": [
        "applinks:tanqory.com",
        "applinks:app.tanqory.com"
      ],
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icons/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.tanqory.mobile",
      "versionCode": 1,
      "compileSdkVersion": 34,
      "targetSdkVersion": 34,
      "minSdkVersion": 21,
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE",
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.USE_FINGERPRINT",
        "android.permission.USE_BIOMETRIC",
        "android.permission.VIBRATE"
      ],
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "tanqory.com"
            },
            {
              "scheme": "https",
              "host": "app.tanqory.com"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-router",
      "expo-font",
      [
        "expo-notifications",
        {
          "icon": "./assets/icons/notification-icon.png",
          "color": "#ffffff",
          "sounds": [
            "./assets/sounds/notification.wav"
          ]
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Tanqory to access your camera to scan products and take photos."
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow Tanqory to use your location to find nearby stores."
        }
      ],
      [
        "expo-local-authentication",
        {
          "faceIDPermission": "Allow Tanqory to use Face ID for secure authentication."
        }
      ],
      "@react-native-async-storage/async-storage",
      "react-native-reanimated/plugin"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### **Mobile-Optimized State Management**
```typescript
// stores/mobile-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

interface MobileAppState {
  // Device & Platform State
  platform: 'ios' | 'android';
  isOnline: boolean;
  networkType: string | null;
  deviceId: string;
  appVersion: string;

  // User Interface State
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  hapticFeedback: boolean;
  soundEnabled: boolean;

  // Navigation State
  currentRoute: string;
  routeHistory: string[];
  deepLinkData: any;

  // Offline State
  pendingActions: OfflineAction[];
  syncInProgress: boolean;
  lastSyncTime: Date | null;

  // Performance State
  backgroundTasksEnabled: boolean;
  dataCompressionEnabled: boolean;
  imageQuality: 'high' | 'medium' | 'low';

  // Actions
  setNetworkStatus: (isOnline: boolean, networkType: string | null) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  addPendingAction: (action: OfflineAction) => void;
  removePendingAction: (actionId: string) => void;
  updateRoute: (route: string) => void;
  setDeepLinkData: (data: any) => void;
  clearDeepLinkData: () => void;
}

export const useMobileStore = create<MobileAppState>()(n  persist(
    immer((set, get) => ({
      // Initial state
      platform: Platform.OS as 'ios' | 'android',
      isOnline: true,
      networkType: null,
      deviceId: '',
      appVersion: Constants.expoConfig?.version || '1.0.0',
      theme: 'system',
      fontSize: 'medium',
      hapticFeedback: true,
      soundEnabled: true,
      currentRoute: '/',
      routeHistory: [],
      deepLinkData: null,
      pendingActions: [],
      syncInProgress: false,
      lastSyncTime: null,
      backgroundTasksEnabled: true,
      dataCompressionEnabled: true,
      imageQuality: 'medium',

      // Actions
      setNetworkStatus: (isOnline, networkType) => set((state) => {
        state.isOnline = isOnline;
        state.networkType = networkType;

        // Trigger sync when coming back online
        if (isOnline && state.pendingActions.length > 0 && !state.syncInProgress) {
          // Sync pending actions
          syncPendingActions();
        }
      }),

      setTheme: (theme) => set((state) => {
        state.theme = theme;
      }),

      addPendingAction: (action) => set((state) => {
        state.pendingActions.push({
          ...action,
          id: generateActionId(),
          timestamp: new Date(),
          retryCount: 0
        });
      }),

      removePendingAction: (actionId) => set((state) => {
        state.pendingActions = state.pendingActions.filter(action => action.id !== actionId);
      }),

      updateRoute: (route) => set((state) => {
        if (state.currentRoute !== route) {
          state.routeHistory.push(state.currentRoute);
          // Keep only last 10 routes
          if (state.routeHistory.length > 10) {
            state.routeHistory = state.routeHistory.slice(-10);
          }
          state.currentRoute = route;
        }
      }),

      setDeepLinkData: (data) => set((state) => {
        state.deepLinkData = data;
      }),

      clearDeepLinkData: () => set((state) => {
        state.deepLinkData = null;
      }),
    })),
    {
      name: 'tanqory-mobile-state',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        fontSize: state.fontSize,
        hapticFeedback: state.hapticFeedback,
        soundEnabled: state.soundEnabled,
        backgroundTasksEnabled: state.backgroundTasksEnabled,
        dataCompressionEnabled: state.dataCompressionEnabled,
        imageQuality: state.imageQuality,
        pendingActions: state.pendingActions, // Persist offline actions
        lastSyncTime: state.lastSyncTime
      })
    }
  )
);

// Network status monitoring
NetInfo.addEventListener(state => {
  useMobileStore.getState().setNetworkStatus(
    state.isConnected ?? false,
    state.type
  );
});
```

### **Mobile-Optimized Components**
```typescript
// components/ProductCard.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/hooks/useTheme';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { formatCurrency } from '@/utils/currency';
import { trackEvent } from '@/services/analytics';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 2; // 2 columns with padding

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  index
}) => {
  const theme = useTheme();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animations
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const wishlistScale = useSharedValue(1);

  // Gesture handlers
  const pressGesture = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.95);
    })
    .onFinalize(() => {
      scale.value = withSpring(1);
    })
    .onEnd(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(product);
      trackEvent('product_card_tap', {
        product_id: product.id,
        product_name: product.name,
        position: index
      });
    });

  const wishlistGesture = Gesture.Tap()
    .onBegin(() => {
      wishlistScale.value = withSpring(0.8);
    })
    .onFinalize(() => {
      wishlistScale.value = withSpring(1);
    })
    .onEnd(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleWishlist(product);
      trackEvent('wishlist_toggle', {
        product_id: product.id,
        action: isInWishlist(product.id) ? 'remove' : 'add'
      });
    });

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const wishlistAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: wishlistScale.value }]
  }));

  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  React.useEffect(() => {
    // Stagger animation based on index
    opacity.value = withTiming(1, {
      duration: 300,
      delay: index * 50
    });
  }, []);

  const handleAddToCart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    addToCart(product);
    trackEvent('add_to_cart_from_card', {
      product_id: product.id,
      product_name: product.name,
      price: product.price
    });
  };

  return (
    <Animated.View style={[fadeInStyle, { marginBottom: 16 }]}>
      <GestureDetector gesture={pressGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle, { backgroundColor: theme.colors.card }]}>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: product.images[0] }}
              style={styles.productImage}
              onLoad={() => setImageLoaded(true)}
              resizeMode="cover"
            />

            {/* Image Loading Overlay */}
            {!imageLoaded && (
              <View style={[styles.imageOverlay, { backgroundColor: theme.colors.placeholder }]} />
            )}

            {/* Discount Badge */}
            {product.discount > 0 && (
              <LinearGradient
                colors={['#FF6B6B', '#FF5252']}
                style={styles.discountBadge}
              >
                <Text style={styles.discountText}>-{product.discount}%</Text>
              </LinearGradient>
            )}

            {/* Wishlist Button */}
            <GestureDetector gesture={wishlistGesture}>
              <Animated.View style={[styles.wishlistButton, wishlistAnimatedStyle]}>
                <BlurView intensity={80} style={styles.wishlistBlur}>
                  <Ionicons
                    name={isInWishlist(product.id) ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isInWishlist(product.id) ? '#FF6B6B' : theme.colors.text}
                  />
                </BlurView>
              </Animated.View>
            </GestureDetector>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text
              style={[styles.productName, { color: theme.colors.text }]}
              numberOfLines={2}
            >
              {product.name}
            </Text>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={[styles.ratingText, { color: theme.colors.textSecondary }]}>
                {product.rating.toFixed(1)} ({product.reviewCount})
              </Text>
            </View>

            {/* Price */}
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                {formatCurrency(product.price)}
              </Text>
              {product.originalPrice > product.price && (
                <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
                  {formatCurrency(product.originalPrice)}
                </Text>
              )}
            </View>

            {/* Add to Cart Button */}
            <TouchableOpacity
              style={[
                styles.addToCartButton,
                {
                  backgroundColor: isInCart(product.id)
                    ? theme.colors.success
                    : theme.colors.primary
                }
              ]}
              onPress={handleAddToCart}
              disabled={isInCart(product.id)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={isInCart(product.id) ? 'checkmark' : 'add'}
                size={16}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>
                {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden'
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: cardWidth * 0.8, // Maintain aspect ratio
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  wishlistBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
```

### **Platform-Specific Features**
```typescript
// Platform-specific implementations
// services/biometric-auth.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { useMobileStore } from '@/stores/mobile-store';

export class BiometricAuthService {
  static async isAvailable(): Promise<boolean> {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  }

  static async getSupportedTypes(): Promise<string[]> {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types.map(type => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris Recognition';
        default:
          return 'Biometric Authentication';
      }
    });
  }

  static async authenticate(reason: string): Promise<{ success: boolean; error?: string }> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return { success: false, error: 'Biometric authentication not available' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancel',
        fallbackLabel: Platform.OS === 'ios' ? 'Use Passcode' : 'Use PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
```

### **Mobile Performance Optimization**
```typescript
// Performance monitoring and optimization
// utils/performance.ts
import { InteractionManager, Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { trackEvent } from '@/services/analytics';

export class PerformanceMonitor {
  private static startTimes = new Map<string, number>();
  private static performanceEntries: PerformanceEntry[] = [];

  static startTiming(label: string): void {
    this.startTimes.set(label, Date.now());
  }

  static endTiming(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      console.warn(`No start time found for ${label}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(label);

    // Record performance entry
    this.performanceEntries.push({
      name: label,
      duration,
      timestamp: Date.now(),
      deviceInfo: {
        platform: Platform.OS,
        version: Platform.Version,
        deviceName: Device.deviceName,
        modelName: Device.modelName,
      }
    });

    // Track in analytics if duration is significant
    if (duration > 100) { // Only track if > 100ms
      trackEvent('performance_timing', {
        operation: label,
        duration,
        platform: Platform.OS,
        device_model: Device.modelName
      });
    }

    return duration;
  }

  static measureNavigationTiming(screenName: string, callback: () => void): void {
    this.startTiming(`navigation_${screenName}`);

    InteractionManager.runAfterInteractions(() => {
      const duration = this.endTiming(`navigation_${screenName}`);
      console.log(`Navigation to ${screenName}: ${duration}ms`);
    });

    callback();
  }

  static async getDevicePerformanceInfo() {
    return {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      deviceName: Device.deviceName,
      modelName: Device.modelName,
      totalMemory: Device.totalMemory,
      appVersion: Application.nativeApplicationVersion,
      buildNumber: Application.nativeBuildVersion,
      isTablet: Device.deviceType === Device.DeviceType.TABLET,
      supportedCpuArchitectures: Device.supportedCpuArchitectures
    };
  }

  static getPerformanceReport() {
    return {
      entries: this.performanceEntries.slice(-100), // Last 100 entries
      averages: this.calculateAverages(),
      deviceInfo: this.getDevicePerformanceInfo()
    };
  }

  private static calculateAverages() {
    const groupedEntries = this.performanceEntries.reduce((acc, entry) => {
      if (!acc[entry.name]) {
        acc[entry.name] = [];
      }
      acc[entry.name].push(entry.duration);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(groupedEntries).reduce((acc, [name, durations]) => {
      acc[name] = {
        average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        count: durations.length
      };
      return acc;
    }, {} as Record<string, any>);
  }
}

interface PerformanceEntry {
  name: string;
  duration: number;
  timestamp: number;
  deviceInfo: any;
}
```

### **Integration with Platform Ecosystem**
- **Backend Integration**: Optimized mobile APIs with data compression
- **Web Synchronization**: Shared state via WebSocket + offline sync
- **Desktop Integration**: Cloud sync for seamless experience
- **Push Notifications**: Firebase Cloud Messaging + Expo Notifications
- **Deep Linking**: Universal links for iOS and Android App Links
- **Biometric Authentication**: Touch ID, Face ID, Fingerprint
- **Camera Integration**: QR/Barcode scanning + Photo capture
- **Location Services**: Store locator + location-based features

---

**Document Classification**: CONFIDENTIAL
**Technical Scope**: React Native, iOS, Android, Mobile Platform
**Platform Priority**: Primary (Revenue-generating)
**Review Cycle**: Monthly
**Last Updated**: September 16, 2025
**Version**: 2.0.0