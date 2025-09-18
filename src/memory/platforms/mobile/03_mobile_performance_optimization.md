---
title: Mobile Performance Optimization & Battery Efficiency
version: 2.0
owner: Mobile Engineering & Performance Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [React_Native_Performance, Battery_Optimization, Memory_Management, Bundle_Optimization]
primary_stack: "React Native New Architecture + Metro + Flipper + Performance Profiling (see official technology versions)"
---

# Mobile Performance Optimization & Battery Efficiency

> **Platform Memory**: Enterprise-grade mobile performance optimization strategies ensuring 60fps smooth experiences, minimal battery drain, and optimal memory usage for billion-dollar scale React Native applications

## Table of Contents
- [Performance Architecture](#performance-architecture)
- [Bundle Size Optimization](#bundle-size-optimization)
- [Memory Management](#memory-management)
- [Battery Efficiency](#battery-efficiency)
- [Animation Performance](#animation-performance)
- [Network Optimization](#network-optimization)
- [Offline Performance](#offline-performance)
- [Performance Monitoring](#performance-monitoring)

---

## Performance Architecture

### **React Native New Architecture Performance**
```yaml
New_Architecture_Performance:
  fabric_renderer:
    advantage: "Direct C++ bridge eliminates JavaScript bridge overhead"
    performance_gain: "50-70% faster UI updates and rendering"
    memory_efficiency: "30-40% lower memory footprint"
    ui_threading: "True concurrent UI updates with priority-based scheduling"

  turbo_modules:
    advantage: "Lazy-loaded native modules with type-safe interfaces"
    performance_gain: "60-80% faster native module invocation"
    memory_savings: "On-demand loading reduces startup memory by 40%"
    type_safety: "TypeScript interfaces prevent runtime errors"

  jsi_javascript_interface:
    advantage: "Direct JavaScript to native communication"
    performance_gain: "90% reduction in bridge serialization overhead"
    real_time_capability: "Enables 60fps animations and real-time features"
    memory_efficiency: "Zero-copy data transfer between JavaScript and native"

React_Native_Performance_Stack:
  runtime: "Hermes JavaScript Engine (optimized for mobile)"
  bundler: "Metro with tree-shaking and code splitting"
  profiling: "Flipper + React DevTools + Performance Monitor"
  crash_reporting: "Crashlytics + Sentry for React Native"
```

### **Performance-First Architecture Pattern**
```typescript
// architecture/performance-first-app.tsx
import { enableScreens } from 'react-native-screens';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Enable native screen optimization
enableScreens();

interface PerformanceOptimizedAppProps {
  children: React.ReactNode;
}

export const PerformanceOptimizedApp: React.FC<PerformanceOptimizedAppProps> = ({
  children
}) => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {/* Memory-efficient navigation container */}
        <NavigationContainer>
          {/* Lazy-loaded screens with performance monitoring */}
          <PerformanceMonitorProvider>
            {children}
          </PerformanceMonitorProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

// Performance monitoring wrapper
const PerformanceMonitorProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  useEffect(() => {
    // Monitor frame drops and performance metrics
    const performanceMonitor = new PerformanceMonitor({
      frameDropThreshold: 3, // Alert if >3 dropped frames
      memoryThreshold: 0.8,  // Alert at 80% memory usage
      batteryOptimization: true
    });

    performanceMonitor.start();
    return () => performanceMonitor.stop();
  }, []);

  return <>{children}</>;
};
```

---

## Bundle Size Optimization

### **Advanced Metro Configuration**
```javascript
// metro.config.js - Production optimized
const { getDefaultConfig } = require('expo/metro-config');
const { mergeConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Production optimization
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Aggressive minification for production
    mangle: {
      keep_fnames: false, // Mangle function names for smaller size
    },
    compress: {
      drop_console: true,  // Remove console.logs in production
      drop_debugger: true, // Remove debugger statements
      pure_funcs: ['console.log', 'console.warn', 'console.info'],
    },
  },
  // Enable tree shaking for unused code elimination
  unstable_allowRequireContext: true,
  // Optimize images and assets
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// Bundle splitting for large apps
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: () => (path) => {
    // Create stable module IDs for better caching
    return require('crypto')
      .createHash('sha1')
      .update(path)
      .digest('hex')
      .substring(0, 8);
  },
  // Enable experimental bundle splitting
  experimentalSerializerHook: (graph, delta) => {
    // Split large dependencies into separate chunks
    return splitLargeDependencies(graph, delta);
  },
};

module.exports = mergeConfig(config, {
  resolver: {
    // Alias for smaller alternative packages
    alias: {
      'react-native-vector-icons': 'react-native-vector-icons/dist',
      'lodash': 'lodash-es', // Use ES modules for better tree shaking
    },
  },
});
```

### **Bundle Analysis & Optimization Tools**
```typescript
// tools/bundle-analyzer.ts
import { execSync } from 'child_process';
import fs from 'fs';

export class BundleAnalyzer {
  static async analyzeBundleSize(): Promise<BundleAnalysis> {
    // Generate bundle map
    execSync('npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output bundle.js --sourcemap-output bundle.map');

    // Analyze bundle composition
    const bundleStats = await this.generateBundleStats();

    return {
      totalSize: bundleStats.totalSize,
      jsSize: bundleStats.jsSize,
      assetsSize: bundleStats.assetsSize,
      largestModules: bundleStats.largestModules,
      recommendations: this.generateOptimizationRecommendations(bundleStats)
    };
  }

  private static generateOptimizationRecommendations(stats: BundleStats): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Check for large dependencies
    if (stats.largestModules.some(m => m.size > 100000)) {
      recommendations.push({
        type: 'dependency_optimization',
        message: 'Consider lazy loading or replacing large dependencies',
        impact: 'high',
        modules: stats.largestModules.filter(m => m.size > 100000)
      });
    }

    // Check for unused code
    const unusedCode = this.detectUnusedCode(stats);
    if (unusedCode.length > 0) {
      recommendations.push({
        type: 'dead_code_elimination',
        message: 'Remove unused imports and code',
        impact: 'medium',
        files: unusedCode
      });
    }

    return recommendations;
  }
}

interface BundleAnalysis {
  totalSize: number;
  jsSize: number;
  assetsSize: number;
  largestModules: Module[];
  recommendations: Recommendation[];
}
```

### **Lazy Loading Implementation**
```typescript
// components/LazyLoadingScreen.tsx
import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Lazy load heavy screens
const HeavyDashboardScreen = lazy(() => import('./HeavyDashboardScreen'));
const AnalyticsScreen = lazy(() => import('./AnalyticsScreen'));
const ReportsScreen = lazy(() => import('./ReportsScreen'));

const LoadingSpinner = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#007AFF" />
  </View>
);

export const LazyScreenWrapper: React.FC<{
  screen: 'dashboard' | 'analytics' | 'reports'
}> = ({ screen }) => {
  const getScreenComponent = () => {
    switch (screen) {
      case 'dashboard':
        return <HeavyDashboardScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'reports':
        return <ReportsScreen />;
      default:
        return null;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {getScreenComponent()}
    </Suspense>
  );
};

// Dynamic imports for heavy features
export const loadFeatureModule = async (featureName: string) => {
  const module = await import(`../features/${featureName}/index.ts`);
  return module.default;
};
```

---

## Memory Management

### **Memory-Efficient Component Patterns**
```typescript
// patterns/MemoryOptimizedComponents.tsx
import React, { memo, useMemo, useCallback, useRef } from 'react';
import { FlatList, VirtualizedList } from 'react-native';

// Memoized component to prevent unnecessary re-renders
export const MemoryOptimizedListItem = memo<{
  item: ListItem;
  onPress: (item: ListItem) => void;
}>(({ item, onPress }) => {
  // Memoize expensive calculations
  const processedItem = useMemo(() => {
    return processListItem(item);
  }, [item.id, item.lastModified]); // Only recalculate when specific props change

  // Memoize callbacks to prevent child re-renders
  const handlePress = useCallback(() => {
    onPress(item);
  }, [item.id, onPress]);

  return (
    <ListItemComponent
      item={processedItem}
      onPress={handlePress}
    />
  );
});

// Virtual list for large datasets
export const VirtualizedLargeList: React.FC<{
  data: LargeDataItem[];
  renderItem: (item: LargeDataItem) => React.ReactElement;
}> = ({ data, renderItem }) => {
  const getItemCount = useCallback(() => data.length, [data.length]);
  const getItem = useCallback((data: LargeDataItem[], index: number) => data[index], []);

  return (
    <VirtualizedList
      data={data}
      initialNumToRender={10}        // Render only 10 items initially
      maxToRenderPerBatch={5}        // Render 5 items per batch
      windowSize={10}                // Keep 10 items in memory
      removeClippedSubviews={true}   // Remove off-screen items from memory
      getItemCount={getItemCount}
      getItem={getItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => renderItem(item)}
    />
  );
};

// Memory leak prevention
export const useMemoryCleanup = () => {
  const timeouts = useRef<NodeJS.Timeout[]>([]);
  const intervals = useRef<NodeJS.Timer[]>([]);
  const subscriptions = useRef<(() => void)[]>([]);

  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay);
    timeouts.current.push(timeout);
    return timeout;
  }, []);

  const addInterval = useCallback((callback: () => void, delay: number) => {
    const interval = setInterval(callback, delay);
    intervals.current.push(interval);
    return interval;
  }, []);

  const addSubscription = useCallback((unsubscribe: () => void) => {
    subscriptions.current.push(unsubscribe);
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup all timeouts, intervals, and subscriptions
      timeouts.current.forEach(clearTimeout);
      intervals.current.forEach(clearInterval);
      subscriptions.current.forEach(unsub => unsub());

      timeouts.current = [];
      intervals.current = [];
      subscriptions.current = [];
    };
  }, []);

  return { addTimeout, addInterval, addSubscription };
};
```

### **Image Memory Optimization**
```typescript
// components/OptimizedImage.tsx
import React, { useState, useCallback } from 'react';
import { Image, ImageResizeMode } from 'react-native';
import FastImage from 'react-native-fast-image';

interface OptimizedImageProps {
  source: { uri: string } | number;
  style?: any;
  resizeMode?: ImageResizeMode;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  placeholder
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Use FastImage for better memory management
  return (
    <FastImage
      source={typeof source === 'string' ? {
        uri: source,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable
      } : source}
      style={style}
      resizeMode={FastImage.resizeMode[resizeMode]}
      onError={handleError}
      onLoad={handleLoad}
      // Memory optimization settings
      fallback={true}
      // Placeholder while loading
      PlaceholderContent={isLoading ? <PlaceholderImage /> : undefined}
    />
  );
};

// Image cache management
export class ImageCacheManager {
  private static instance: ImageCacheManager;
  private cacheSize: number = 0;
  private maxCacheSize: number = 100 * 1024 * 1024; // 100MB

  static getInstance(): ImageCacheManager {
    if (!ImageCacheManager.instance) {
      ImageCacheManager.instance = new ImageCacheManager();
    }
    return ImageCacheManager.instance;
  }

  async clearCache(): Promise<void> {
    await FastImage.clearMemoryCache();
    await FastImage.clearDiskCache();
    this.cacheSize = 0;
  }

  async preloadImages(urls: string[]): Promise<void> {
    const preloadPromises = urls.map(url =>
      FastImage.preload([{
        uri: url,
        priority: FastImage.priority.high
      }])
    );

    await Promise.all(preloadPromises);
  }

  // Monitor cache size and clean up when necessary
  async monitorCacheSize(): Promise<void> {
    if (this.cacheSize > this.maxCacheSize) {
      await this.clearCache();
    }
  }
}
```

---

## Battery Efficiency

### **Battery-Conscious Background Tasks**
```typescript
// services/BatteryOptimizedBackgroundTasks.ts
import BackgroundJob from 'react-native-background-job';
import { AppState, NetInfo } from 'react-native';

export class BatteryOptimizedTaskManager {
  private static instance: BatteryOptimizedTaskManager;
  private batteryLevel: number = 1.0;
  private isLowPowerMode: boolean = false;
  private networkType: string = 'wifi';

  static getInstance(): BatteryOptimizedTaskManager {
    if (!BatteryOptimizedTaskManager.instance) {
      BatteryOptimizedTaskManager.instance = new BatteryOptimizedTaskManager();
    }
    return BatteryOptimizedTaskManager.instance;
  }

  constructor() {
    this.initializeBatteryMonitoring();
    this.initializeNetworkMonitoring();
  }

  private initializeBatteryMonitoring(): void {
    // Monitor battery level and low power mode
    const batteryInfo = require('react-native-device-info');

    setInterval(async () => {
      this.batteryLevel = await batteryInfo.getBatteryLevel();
      this.isLowPowerMode = await batteryInfo.isPowerSaveMode();

      this.adjustTaskFrequency();
    }, 60000); // Check every minute
  }

  private adjustTaskFrequency(): void {
    const taskFrequency = this.calculateOptimalTaskFrequency();

    // Reduce background activity based on battery and power mode
    if (this.isLowPowerMode || this.batteryLevel < 0.2) {
      this.enableAggressivePowerSaving();
    } else if (this.batteryLevel < 0.5) {
      this.enableModeratePowerSaving();
    } else {
      this.enableNormalOperation();
    }
  }

  private enableAggressivePowerSaving(): void {
    // Pause non-essential background tasks
    BackgroundJob.stop();

    // Reduce network requests frequency
    this.setNetworkRequestInterval(300000); // 5 minutes

    // Disable location updates
    this.pauseLocationTracking();

    // Reduce animation frame rate
    this.setAnimationFrameRate(30);
  }

  private enableModeratePowerSaving(): void {
    // Reduce background task frequency
    this.setBackgroundTaskInterval(120000); // 2 minutes

    // Optimize network requests
    this.setNetworkRequestInterval(60000); // 1 minute

    // Reduce location accuracy
    this.setLocationAccuracy('low');
  }

  private enableNormalOperation(): void {
    // Resume normal background tasks
    this.setBackgroundTaskInterval(30000); // 30 seconds

    // Normal network request frequency
    this.setNetworkRequestInterval(30000); // 30 seconds

    // High accuracy location if needed
    this.setLocationAccuracy('high');
  }

  scheduleEfficientBackgroundTask(
    taskName: string,
    task: () => Promise<void>,
    options: TaskOptions = {}
  ): void {
    const optimizedOptions = this.optimizeTaskOptions(options);

    BackgroundJob.register({
      jobKey: taskName,
      job: async () => {
        // Check if we should run this task based on current battery state
        if (this.shouldExecuteTask(optimizedOptions.priority)) {
          try {
            await task();
          } catch (error) {
            console.error(`Background task ${taskName} failed:`, error);
          }
        }
      }
    });

    BackgroundJob.start(optimizedOptions);
  }

  private shouldExecuteTask(priority: 'high' | 'medium' | 'low'): boolean {
    if (this.isLowPowerMode && priority !== 'high') {
      return false;
    }

    if (this.batteryLevel < 0.1 && priority === 'low') {
      return false;
    }

    return true;
  }
}

interface TaskOptions {
  priority?: 'high' | 'medium' | 'low';
  requiresNetwork?: boolean;
  requiresHighAccuracy?: boolean;
  interval?: number;
}
```

### **CPU-Efficient Algorithms**
```typescript
// utils/PerformanceOptimizedAlgorithms.ts

// Debounced search to reduce CPU usage
export const useOptimizedSearch = (
  searchFunction: (query: string) => Promise<any[]>,
  delay: number = 300
) => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const debouncedSearchRef = useRef<NodeJS.Timeout | null>(null);

  const search = useCallback((query: string) => {
    setIsSearching(true);

    // Clear previous timeout
    if (debouncedSearchRef.current) {
      clearTimeout(debouncedSearchRef.current);
    }

    // Set new timeout
    debouncedSearchRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchFunction(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delay);
  }, [searchFunction, delay]);

  return { search, isSearching, results };
};

// Efficient pagination with virtualization
export const useVirtualizedPagination = <T>(
  fetchFunction: (page: number, limit: number) => Promise<T[]>,
  pageSize: number = 20
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newData = await fetchFunction(page, pageSize);

      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData(prevData => [...prevData, ...newData]);
        setPage(prevPage => prevPage + 1);
      }
    } catch (error) {
      console.error('Failed to load more data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, page, pageSize, isLoading, hasMore]);

  return { data, loadMore, isLoading, hasMore };
};

// Battery-efficient location tracking
export const useBatteryEfficientLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [accuracy, setAccuracy] = useState<'high' | 'medium' | 'low'>('medium');
  const batteryManager = BatteryOptimizedTaskManager.getInstance();

  useEffect(() => {
    let locationWatcher: any;

    const startLocationTracking = () => {
      const options = {
        enableHighAccuracy: accuracy === 'high',
        timeout: accuracy === 'high' ? 10000 : 20000,
        maximumAge: accuracy === 'high' ? 60000 : 300000, // Cache for 1-5 minutes
        distanceFilter: accuracy === 'high' ? 10 : 100, // Update every 10-100 meters
      };

      locationWatcher = navigator.geolocation.watchPosition(
        (position) => setLocation(position),
        (error) => console.error('Location error:', error),
        options
      );
    };

    startLocationTracking();

    return () => {
      if (locationWatcher) {
        navigator.geolocation.clearWatch(locationWatcher);
      }
    };
  }, [accuracy]);

  return { location, setAccuracy };
};
```

---

## Animation Performance

### **60fps Animation Guarantee**
```typescript
// animations/PerformantAnimations.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  useFrameCallback,
  useDerivedValue
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// High-performance animated components
export const PerformantAnimatedView: React.FC<{
  children: React.ReactNode;
  animationType: 'fade' | 'slide' | 'scale';
}> = ({ children, animationType }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Animate on mount with optimized timing
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    switch (animationType) {
      case 'fade':
        return { opacity: opacity.value };
      case 'slide':
        return {
          opacity: opacity.value,
          transform: [{ translateY: translateY.value }]
        };
      case 'scale':
        return {
          opacity: opacity.value,
          transform: [{ scale: scale.value }]
        };
      default:
        return {};
    }
  }, [animationType]);

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
};

// Gesture-based animations with performance optimization
export const OptimizedSwipeableCard: React.FC<{
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
}> = ({ onSwipeLeft, onSwipeRight, children }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Performance monitoring for animations
  const frameCount = useSharedValue(0);
  const lastFrameTime = useSharedValue(Date.now());

  useFrameCallback((frameInfo) => {
    frameCount.value += 1;
    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrameTime.value;

    // Monitor for frame drops (should be ~16.67ms for 60fps)
    if (deltaTime > 20) {
      console.warn('Animation frame drop detected:', deltaTime);
    }

    lastFrameTime.value = currentTime;
  }, []);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;

      // Update opacity and scale based on swipe distance
      const progress = Math.abs(event.translationX) / 200;
      opacity.value = 1 - progress * 0.5;
      scale.value = 1 - progress * 0.1;
    })
    .onEnd((event) => {
      const threshold = 100;

      if (event.translationX > threshold && onSwipeRight) {
        // Swipe right animation
        translateX.value = withTiming(500, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -threshold && onSwipeLeft) {
        // Swipe left animation
        translateX.value = withTiming(-500, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 });
        runOnJS(onSwipeLeft)();
      } else {
        // Snap back animation
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
        scale.value = withSpring(1);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

// Complex animation with performance optimization
export const OptimizedListAnimation = () => {
  const scrollY = useSharedValue(0);
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, title: `Item ${i}` }));

  // Virtualized list with animated items
  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    return <AnimatedListItem item={item} index={index} scrollY={scrollY} />;
  }, [scrollY]);

  return (
    <Animated.FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: true } // Use native driver for 60fps
      )}
      scrollEventThrottle={16} // ~60fps scroll events
      initialNumToRender={10}
      maxToRenderPerBatch={5}
      windowSize={10}
      removeClippedSubviews={true}
    />
  );
};

const AnimatedListItem: React.FC<{
  item: any;
  index: number;
  scrollY: Animated.SharedValue<number>;
}> = ({ item, index, scrollY }) => {
  const itemHeight = 80;
  const inputRange = [
    (index - 1) * itemHeight,
    index * itemHeight,
    (index + 1) * itemHeight,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      inputRange,
      [0.3, 1, 0.3],
      'clamp'
    );

    const scale = interpolate(
      scrollY.value,
      inputRange,
      [0.8, 1, 0.8],
      'clamp'
    );

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={[{ height: itemHeight, padding: 16 }, animatedStyle]}>
      <Text>{item.title}</Text>
    </Animated.View>
  );
};
```

---

## Network Optimization

### **Efficient API Communication**
```typescript
// services/OptimizedNetworkManager.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import NetInfo from '@react-native-netinfo/netinfo';

export class OptimizedNetworkManager {
  private axiosInstance: AxiosInstance;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private networkState: string = 'unknown';
  private retryAttempts: Map<string, number> = new Map();

  constructor() {
    this.initializeAxios();
    this.initializeNetworkMonitoring();
  }

  private initializeAxios(): void {
    this.axiosInstance = axios.create({
      timeout: 10000,
      // Compression for faster transfers
      headers: {
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for optimization
    this.axiosInstance.interceptors.request.use((config) => {
      // Add request deduplication
      const requestKey = this.generateRequestKey(config);

      if (this.requestQueue.has(requestKey)) {
        return Promise.reject(new Error('Duplicate request prevented'));
      }

      // Adjust timeout based on network quality
      if (this.networkState === 'cellular') {
        config.timeout = 15000; // Longer timeout for cellular
      } else if (this.networkState === 'wifi') {
        config.timeout = 8000;  // Shorter timeout for WiFi
      }

      return config;
    });

    // Response interceptor for caching and cleanup
    this.axiosInstance.interceptors.response.use(
      (response) => {
        const requestKey = this.generateRequestKey(response.config);
        this.requestQueue.delete(requestKey);
        this.retryAttempts.delete(requestKey);
        return response;
      },
      (error) => {
        const requestKey = this.generateRequestKey(error.config);
        this.requestQueue.delete(requestKey);

        // Intelligent retry logic
        return this.handleRequestError(error);
      }
    );
  }

  private initializeNetworkMonitoring(): void {
    NetInfo.addEventListener((state) => {
      this.networkState = state.type;

      // Adjust request strategies based on network quality
      if (state.type === 'cellular') {
        this.enableDataSavingMode();
      } else if (state.type === 'wifi') {
        this.disableDataSavingMode();
      }
    });
  }

  private enableDataSavingMode(): void {
    // Reduce image quality requests
    this.defaultImageQuality = 'medium';
    // Increase cache duration
    this.cacheMaxAge = 86400; // 24 hours
    // Batch API requests
    this.enableRequestBatching = true;
  }

  private async handleRequestError(error: any): Promise<any> {
    const requestKey = this.generateRequestKey(error.config);
    const attempts = this.retryAttempts.get(requestKey) || 0;

    // Exponential backoff retry
    if (attempts < 3 && this.shouldRetry(error)) {
      this.retryAttempts.set(requestKey, attempts + 1);

      const delay = Math.pow(2, attempts) * 1000; // 1s, 2s, 4s
      await new Promise(resolve => setTimeout(resolve, delay));

      return this.axiosInstance.request(error.config);
    }

    return Promise.reject(error);
  }

  // Optimized request method with caching
  async optimizedRequest<T>(
    config: AxiosRequestConfig,
    options: RequestOptions = {}
  ): Promise<T> {
    const requestKey = this.generateRequestKey(config);

    // Check cache first
    if (options.cache && this.cache.has(requestKey)) {
      const cached = this.cache.get(requestKey);
      if (!this.isCacheExpired(cached)) {
        return cached.data;
      }
    }

    // Check for duplicate requests
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    // Make request
    const requestPromise = this.axiosInstance.request<T>(config)
      .then(response => {
        // Cache successful responses
        if (options.cache) {
          this.cache.set(requestKey, {
            data: response.data,
            timestamp: Date.now(),
            maxAge: options.cacheMaxAge || 300000 // 5 minutes default
          });
        }
        return response.data;
      });

    this.requestQueue.set(requestKey, requestPromise);
    return requestPromise;
  }

  // Batch multiple requests for efficiency
  async batchRequests<T>(requests: BatchRequest[]): Promise<T[]> {
    const batchSize = this.networkState === 'cellular' ? 3 : 6;
    const results: T[] = [];

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(req =>
        this.optimizedRequest<T>(req.config, req.options)
      );

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<T>).value)
      );

      // Small delay between batches to prevent overwhelming
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }
}

interface RequestOptions {
  cache?: boolean;
  cacheMaxAge?: number;
  priority?: 'high' | 'medium' | 'low';
}

interface BatchRequest {
  config: AxiosRequestConfig;
  options?: RequestOptions;
}
```

---

## Offline Performance

### **Offline-First Architecture**
```typescript
// services/OfflineManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import { SQLiteDatabase } from 'react-native-sqlite-storage';

export class OfflineManager {
  private static instance: OfflineManager;
  private database: SQLiteDatabase;
  private syncQueue: SyncOperation[] = [];
  private isOnline: boolean = true;

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    this.initializeDatabase();
    this.initializeNetworkListener();
    this.startSyncProcess();
  }

  private async initializeDatabase(): Promise<void> {
    // Initialize SQLite database for offline storage
    this.database = await SQLite.openDatabase({
      name: 'OfflineDB',
      location: 'default',
    });

    // Create tables for offline data
    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS offline_data (
        id TEXT PRIMARY KEY,
        table_name TEXT NOT NULL,
        data TEXT NOT NULL,
        operation TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        synced INTEGER DEFAULT 0
      )
    `);

    await this.database.executeSql(`
      CREATE TABLE IF NOT EXISTS cached_responses (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
      )
    `);
  }

  private initializeNetworkListener(): void {
    NetInfo.addEventListener((state) => {
      const wasOffline = !this.isOnline;
      this.isOnline = !!state.isConnected;

      // If we just came back online, start sync process
      if (wasOffline && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  // Store data for offline usage
  async storeOfflineData(
    tableName: string,
    data: any,
    operation: 'CREATE' | 'UPDATE' | 'DELETE' = 'CREATE'
  ): Promise<void> {
    const id = data.id || `${tableName}_${Date.now()}`;

    await this.database.executeSql(
      'INSERT OR REPLACE INTO offline_data (id, table_name, data, operation, timestamp) VALUES (?, ?, ?, ?, ?)',
      [id, tableName, JSON.stringify(data), operation, Date.now()]
    );

    // Add to sync queue if online
    if (this.isOnline) {
      this.syncQueue.push({ id, tableName, data, operation });
    }
  }

  // Retrieve offline data
  async getOfflineData(tableName: string, id?: string): Promise<any[]> {
    const query = id
      ? 'SELECT * FROM offline_data WHERE table_name = ? AND id = ? ORDER BY timestamp DESC'
      : 'SELECT * FROM offline_data WHERE table_name = ? ORDER BY timestamp DESC';

    const params = id ? [tableName, id] : [tableName];
    const [results] = await this.database.executeSql(query, params);

    const data = [];
    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      data.push({
        ...JSON.parse(row.data),
        _offline_id: row.id,
        _operation: row.operation,
        _timestamp: row.timestamp,
        _synced: row.synced === 1
      });
    }

    return data;
  }

  // Cache API responses for offline use
  async cacheResponse(
    key: string,
    data: any,
    expiresIn: number = 86400000 // 24 hours
  ): Promise<void> {
    const expiresAt = Date.now() + expiresIn;

    await this.database.executeSql(
      'INSERT OR REPLACE INTO cached_responses (key, data, timestamp, expires_at) VALUES (?, ?, ?, ?)',
      [key, JSON.stringify(data), Date.now(), expiresAt]
    );
  }

  // Get cached response
  async getCachedResponse(key: string): Promise<any | null> {
    const [results] = await this.database.executeSql(
      'SELECT * FROM cached_responses WHERE key = ? AND expires_at > ?',
      [key, Date.now()]
    );

    if (results.rows.length > 0) {
      const row = results.rows.item(0);
      return JSON.parse(row.data);
    }

    return null;
  }

  // Process sync queue when coming back online
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const batchSize = 5;
    const batches = this.chunkArray(this.syncQueue, batchSize);

    for (const batch of batches) {
      const syncPromises = batch.map(operation => this.syncOperation(operation));

      try {
        await Promise.allSettled(syncPromises);
      } catch (error) {
        console.error('Batch sync failed:', error);
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Clear processed operations
    this.syncQueue = [];
  }

  private async syncOperation(operation: SyncOperation): Promise<void> {
    try {
      const response = await this.networkManager.optimizedRequest({
        method: this.getHttpMethod(operation.operation),
        url: this.getApiUrl(operation.tableName, operation.data.id),
        data: operation.operation !== 'DELETE' ? operation.data : undefined
      });

      // Mark as synced in database
      await this.database.executeSql(
        'UPDATE offline_data SET synced = 1 WHERE id = ?',
        [operation.id]
      );

      console.log(`Synced ${operation.operation} operation for ${operation.tableName}`);
    } catch (error) {
      console.error(`Failed to sync operation:`, error);
      // Keep in queue for retry
      throw error;
    }
  }

  // Cleanup old cached data
  async cleanupExpiredCache(): Promise<void> {
    await this.database.executeSql(
      'DELETE FROM cached_responses WHERE expires_at < ?',
      [Date.now()]
    );

    // Remove synced offline data older than 7 days
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    await this.database.executeSql(
      'DELETE FROM offline_data WHERE synced = 1 AND timestamp < ?',
      [sevenDaysAgo]
    );
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}

interface SyncOperation {
  id: string;
  tableName: string;
  data: any;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
}
```

---

## Performance Monitoring

### **Real-Time Performance Analytics**
```typescript
// monitoring/PerformanceMonitor.ts
import { PerformanceObserver } from 'react-native-performance';
import crashlytics from '@react-native-firebase/crashlytics';

export class MobilePerformanceMonitor {
  private static instance: MobilePerformanceMonitor;
  private performanceMetrics: PerformanceMetrics = {
    frameDrops: 0,
    memoryUsage: 0,
    batteryUsage: 0,
    networkLatency: 0,
    appLaunchTime: 0,
    screenLoadTimes: new Map()
  };

  static getInstance(): MobilePerformanceMonitor {
    if (!MobilePerformanceMonitor.instance) {
      MobilePerformanceMonitor.instance = new MobilePerformanceMonitor();
    }
    return MobilePerformanceMonitor.instance;
  }

  constructor() {
    this.initializePerformanceMonitoring();
    this.startContinuousMonitoring();
  }

  private initializePerformanceMonitoring(): void {
    // Monitor frame drops
    const frameObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.duration > 16.67) { // 60fps = 16.67ms per frame
          this.performanceMetrics.frameDrops++;
          this.reportFrameDrop(entry);
        }
      });
    });
    frameObserver.observe({ entryTypes: ['frame'] });

    // Monitor navigation performance
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.recordScreenLoadTime(entry.name, entry.duration);
      });
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });

    // Monitor memory usage
    setInterval(() => {
      this.checkMemoryUsage();
    }, 30000); // Every 30 seconds

    // Monitor battery usage
    setInterval(() => {
      this.checkBatteryUsage();
    }, 60000); // Every minute
  }

  private async checkMemoryUsage(): Promise<void> {
    try {
      const memInfo = await performance.memory;
      this.performanceMetrics.memoryUsage = memInfo.usedJSHeapSize / 1024 / 1024; // MB

      // Alert if memory usage is high
      if (this.performanceMetrics.memoryUsage > 100) { // 100MB threshold
        this.reportHighMemoryUsage(this.performanceMetrics.memoryUsage);
      }
    } catch (error) {
      console.error('Failed to check memory usage:', error);
    }
  }

  private async checkBatteryUsage(): Promise<void> {
    try {
      const DeviceInfo = require('react-native-device-info');
      const batteryLevel = await DeviceInfo.getBatteryLevel();

      // Calculate battery drain rate (simplified)
      if (this.lastBatteryLevel && this.lastBatteryCheck) {
        const timeDiff = (Date.now() - this.lastBatteryCheck) / 1000 / 60; // minutes
        const batteryDiff = this.lastBatteryLevel - batteryLevel;
        const drainRate = batteryDiff / timeDiff; // % per minute

        if (drainRate > 0.5) { // More than 0.5% per minute
          this.reportHighBatteryDrain(drainRate);
        }
      }

      this.lastBatteryLevel = batteryLevel;
      this.lastBatteryCheck = Date.now();
    } catch (error) {
      console.error('Failed to check battery usage:', error);
    }
  }

  // Track screen load performance
  trackScreenLoad(screenName: string, startTime: number): void {
    const loadTime = Date.now() - startTime;
    this.recordScreenLoadTime(screenName, loadTime);

    // Alert if load time is too long
    if (loadTime > 3000) { // 3 seconds threshold
      this.reportSlowScreenLoad(screenName, loadTime);
    }
  }

  // Track API request performance
  trackAPIRequest(
    url: string,
    method: string,
    startTime: number,
    success: boolean
  ): void {
    const duration = Date.now() - startTime;

    // Update network latency average
    this.updateNetworkLatency(duration);

    // Report slow API requests
    if (duration > 5000) { // 5 seconds threshold
      this.reportSlowAPIRequest(url, method, duration, success);
    }

    // Report API failures
    if (!success) {
      this.reportAPIFailure(url, method, duration);
    }
  }

  private recordScreenLoadTime(screenName: string, loadTime: number): void {
    const existing = this.performanceMetrics.screenLoadTimes.get(screenName) || [];
    existing.push(loadTime);

    // Keep only last 10 measurements
    if (existing.length > 10) {
      existing.shift();
    }

    this.performanceMetrics.screenLoadTimes.set(screenName, existing);
  }

  private updateNetworkLatency(latency: number): void {
    // Simple moving average
    this.performanceMetrics.networkLatency =
      (this.performanceMetrics.networkLatency * 0.9) + (latency * 0.1);
  }

  // Generate performance report
  generatePerformanceReport(): PerformanceReport {
    const averageScreenLoadTimes = new Map<string, number>();

    this.performanceMetrics.screenLoadTimes.forEach((times, screenName) => {
      const average = times.reduce((a, b) => a + b, 0) / times.length;
      averageScreenLoadTimes.set(screenName, average);
    });

    return {
      timestamp: Date.now(),
      metrics: {
        ...this.performanceMetrics,
        averageScreenLoadTimes
      },
      recommendations: this.generateRecommendations()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.performanceMetrics.frameDrops > 10) {
      recommendations.push('Consider optimizing animations and reducing UI complexity');
    }

    if (this.performanceMetrics.memoryUsage > 80) {
      recommendations.push('Implement memory cleanup and optimize image loading');
    }

    if (this.performanceMetrics.networkLatency > 2000) {
      recommendations.push('Optimize API requests and implement caching');
    }

    const slowScreens = Array.from(this.performanceMetrics.screenLoadTimes.entries())
      .filter(([_, times]) => {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        return avg > 2000;
      });

    if (slowScreens.length > 0) {
      recommendations.push(`Optimize slow-loading screens: ${slowScreens.map(([name]) => name).join(', ')}`);
    }

    return recommendations;
  }

  private reportFrameDrop(entry: PerformanceEntry): void {
    crashlytics().recordError(new Error('Frame drop detected'), {
      screen: entry.name,
      duration: entry.duration,
      timestamp: Date.now()
    });
  }

  private reportHighMemoryUsage(usage: number): void {
    crashlytics().recordError(new Error('High memory usage'), {
      memoryUsage: usage,
      timestamp: Date.now()
    });
  }

  private reportSlowScreenLoad(screenName: string, loadTime: number): void {
    crashlytics().recordError(new Error('Slow screen load'), {
      screen: screenName,
      loadTime: loadTime,
      timestamp: Date.now()
    });
  }
}

interface PerformanceMetrics {
  frameDrops: number;
  memoryUsage: number;
  batteryUsage: number;
  networkLatency: number;
  appLaunchTime: number;
  screenLoadTimes: Map<string, number[]>;
}

interface PerformanceReport {
  timestamp: number;
  metrics: PerformanceMetrics & {
    averageScreenLoadTimes: Map<string, number>;
  };
  recommendations: string[];
}
```

---

## Implementation Strategy

### **Performance Optimization Roadmap**
```yaml
Phase_1_Foundation: # Week 1
  - "Implement New Architecture performance optimizations"
  - "Setup bundle size monitoring and optimization"
  - "Deploy memory management patterns"
  - "Initialize performance monitoring"

Phase_2_Battery_Network: # Week 2
  - "Implement battery-efficient background tasks"
  - "Deploy network optimization strategies"
  - "Setup offline-first architecture"
  - "Optimize API request patterns"

Phase_3_Animations_UX: # Week 3
  - "Deploy 60fps animation framework"
  - "Implement gesture-based optimizations"
  - "Setup performance-first component patterns"
  - "Optimize image loading and caching"

Phase_4_Monitoring_Analytics: # Week 4
  - "Deploy real-time performance monitoring"
  - "Setup automated performance alerts"
  - "Implement performance analytics dashboard"
  - "Create performance regression testing"
```

### **Performance KPIs & Targets**
```typescript
interface MobilePerformanceKPIs {
  userExperience: {
    appLaunchTime: number;        // Target: <2 seconds
    screenLoadTime: number;       // Target: <1.5 seconds
    animationFrameRate: number;   // Target: 60fps consistently
    uiResponseTime: number;       // Target: <100ms
  };

  resourceEfficiency: {
    memoryUsage: number;          // Target: <100MB average
    batteryDrainRate: number;     // Target: <0.3% per minute
    bundleSize: number;           // Target: <50MB
    crashRate: number;            // Target: <0.1%
  };

  networkPerformance: {
    apiResponseTime: number;      // Target: <2 seconds
    offlineCapability: number;    // Target: 80% features offline
    dataUsage: number;            // Target: <10MB per session
    cacheHitRate: number;         // Target: >70%
  };
}
```

---

**Last Updated**: 2025-09-16
**Version**: 2.0
**Classification**: CONFIDENTIAL
**Owner**: Mobile Engineering & Performance Team

> 📱 **"Delivering lightning-fast mobile experiences that users love"**