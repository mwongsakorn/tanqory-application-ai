---
title: Mobile UI Patterns & React Native Design System
version: 2.0
owner: Mobile UI/UX Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [React_Native_UI, Design_System, Mobile_UX, Animations]
primary_stack: "React Native + Reanimated + Gesture Handler + Tamagui (see official technology versions)"
---

# Mobile UI Patterns & React Native Design System

> **Platform Memory**: Advanced React Native UI patterns and design system for consistent, performant mobile experiences across iOS and Android

## Design System Architecture

### **Core Design Token System**
```typescript
// tokens/design-tokens.ts
import { Platform, Dimensions, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const statusBarHeight = StatusBar.currentHeight || 0;

export const DesignTokens = {
  // Typography Scale
  typography: {
    fontFamilies: {
      primary: Platform.select({
        ios: 'SF Pro Display',
        android: 'Roboto',
        default: 'System'
      }),
      monospace: Platform.select({
        ios: 'SF Mono',
        android: 'Roboto Mono',
        default: 'monospace'
      })
    },
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48
    },
    fontWeights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8
    }
  },

  // Color System
  colors: {
    // Brand Colors
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6', // Primary brand color
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A'
    },
    secondary: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A'
    },
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      900: '#064E3B'
    },
    warning: {
      50: '#FFFBEB',
      500: '#F59E0B',
      900: '#78350F'
    },
    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      900: '#7F1D1D'
    },

    // Semantic Colors
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9'
    },
    surface: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      elevated: '#FFFFFF'
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      tertiary: '#94A3B8',
      inverse: '#FFFFFF'
    },
    border: {
      light: '#E2E8F0',
      medium: '#CBD5E1',
      strong: '#94A3B8'
    }
  },

  // Dark Theme
  darkColors: {
    background: {
      primary: '#0F172A',
      secondary: '#1E293B',
      tertiary: '#334155'
    },
    surface: {
      primary: '#1E293B',
      secondary: '#334155',
      elevated: '#475569'
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#CBD5E1',
      tertiary: '#94A3B8',
      inverse: '#1E293B'
    },
    border: {
      light: '#334155',
      medium: '#475569',
      strong: '#64748B'
    }
  },

  // Spacing System (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
    '4xl': 96
  },

  // Border Radius
  borderRadius: {
    none: 0,
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999
  },

  // Shadows
  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12
    }
  },

  // Breakpoints
  breakpoints: {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
  },

  // Layout Constants
  layout: {
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
    statusBarHeight,
    headerHeight: Platform.select({
      ios: 44,
      android: 56,
      default: 50
    }),
    tabBarHeight: Platform.select({
      ios: 83,
      android: 60,
      default: 60
    }),
    safeAreaPadding: {
      horizontal: 16,
      vertical: 16
    }
  },

  // Animation Timing
  animations: {
    duration: {
      fast: 150,
      normal: 250,
      slow: 400
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }
  }
};
```

### **Responsive Design System**
```typescript
// hooks/useResponsiveDesign.ts
import { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import { DesignTokens } from '@/tokens/design-tokens';

interface ResponsiveValues<T> {
  base: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
}

export function useResponsiveValue<T>(values: ResponsiveValues<T>): T {
  const [screenWidth, setScreenWidth] = useState(() => Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return subscription?.remove;
  }, []);

  const getResponsiveValue = (): T => {
    const { breakpoints } = DesignTokens;

    if (screenWidth >= breakpoints.xl && values.xl !== undefined) {
      return values.xl;
    }
    if (screenWidth >= breakpoints.lg && values.lg !== undefined) {
      return values.lg;
    }
    if (screenWidth >= breakpoints.md && values.md !== undefined) {
      return values.md;
    }
    if (screenWidth >= breakpoints.sm && values.sm !== undefined) {
      return values.sm;
    }

    return values.base;
  };

  return getResponsiveValue();
}

export function useDeviceType() {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return {
    isTablet: screenWidth >= 768,
    isLandscape: screenWidth > screenHeight,
    isSmallScreen: screenWidth < 375,
    deviceType: Platform.select({
      ios: screenWidth >= 768 ? 'ipad' : 'iphone',
      android: screenWidth >= 768 ? 'tablet' : 'phone',
      default: 'unknown'
    })
  };
}
```

### **Advanced Component Library**
```typescript
// components/Button/Button.tsx
import React, { forwardRef, useState } from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  View,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { DesignTokens } from '@/tokens/design-tokens';
import { useTheme } from '@/hooks/useTheme';
import { useResponsiveValue } from '@/hooks/useResponsiveDesign';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
  hapticFeedback?: boolean;
  style?: any;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const Button = forwardRef<TouchableOpacity, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  disabled,
  hapticFeedback = true,
  style,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}, ref) => {
  const theme = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  // Responsive button sizes
  const buttonHeight = useResponsiveValue({
    base: size === 'sm' ? 36 : size === 'md' ? 44 : size === 'lg' ? 52 : 60,
    md: size === 'sm' ? 40 : size === 'md' ? 48 : size === 'lg' ? 56 : 64
  });

  const fontSize = useResponsiveValue({
    base: size === 'sm' ? 14 : size === 'md' ? 16 : size === 'lg' ? 18 : 20,
    md: size === 'sm' ? 16 : size === 'md' ? 18 : size === 'lg' ? 20 : 22
  });

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const backgroundColorProgress = useSharedValue(0);

  // Get button colors based on variant and theme
  const getButtonColors = () => {
    const colors = theme.colors;

    switch (variant) {
      case 'primary':
        return {
          background: colors.primary[500],
          backgroundPressed: colors.primary[600],
          text: colors.text.inverse,
          border: 'transparent'
        };
      case 'secondary':
        return {
          background: colors.secondary[100],
          backgroundPressed: colors.secondary[200],
          text: colors.text.primary,
          border: 'transparent'
        };
      case 'outline':
        return {
          background: 'transparent',
          backgroundPressed: colors.secondary[50],
          text: colors.primary[500],
          border: colors.border.medium
        };
      case 'ghost':
        return {
          background: 'transparent',
          backgroundPressed: colors.secondary[100],
          text: colors.text.primary,
          border: 'transparent'
        };
      case 'destructive':
        return {
          background: colors.error[500],
          backgroundPressed: colors.error[600],
          text: colors.text.inverse,
          border: 'transparent'
        };
      default:
        return {
          background: colors.primary[500],
          backgroundPressed: colors.primary[600],
          text: colors.text.inverse,
          border: 'transparent'
        };
    }
  };

  const buttonColors = getButtonColors();

  // Gesture handlers
  const pressGesture = Gesture.Tap()
    .onBegin(() => {
      if (!disabled && !loading) {
        scale.value = withSpring(0.95, { duration: 100 });
        backgroundColorProgress.value = withTiming(1, { duration: 100 });
        setIsPressed(true);

        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    })
    .onFinalize(() => {
      if (!disabled && !loading) {
        scale.value = withSpring(1, { duration: 200 });
        backgroundColorProgress.value = withTiming(0, { duration: 200 });
        setIsPressed(false);
      }
    })
    .onEnd(() => {
      if (!disabled && !loading && onPress) {
        onPress({} as any);
      }
    });

  // Animated styles
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      backgroundColorProgress.value,
      [0, 1],
      [buttonColors.background, buttonColors.backgroundPressed]
    )
  }));

  const animatedOpacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  // Handle disabled state
  React.useEffect(() => {
    opacity.value = withTiming(disabled || loading ? 0.6 : 1, { duration: 200 });
  }, [disabled, loading]);

  const buttonStyle = [
    styles.button,
    {
      height: buttonHeight,
      paddingHorizontal: DesignTokens.spacing.md,
      borderRadius: DesignTokens.borderRadius.lg,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: buttonColors.border,
      width: fullWidth ? '100%' : undefined,
      ...DesignTokens.shadows.sm
    },
    style
  ];

  const textStyle = [
    styles.text,
    {
      fontSize,
      color: buttonColors.text,
      fontWeight: DesignTokens.typography.fontWeights.semibold
    }
  ];

  return (
    <GestureDetector gesture={pressGesture}>
      <AnimatedTouchableOpacity
        ref={ref}
        style={[buttonStyle, animatedButtonStyle, animatedOpacityStyle]}
        disabled={disabled || loading}
        activeOpacity={1}
        {...props}
      >
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="small" color={buttonColors.text} />
          ) : (
            <>
              {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
              <Text style={textStyle}>{children}</Text>
              {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </>
          )}
        </View>
      </AnimatedTouchableOpacity>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false
  },
  leftIcon: {
    marginRight: DesignTokens.spacing.xs
  },
  rightIcon: {
    marginLeft: DesignTokens.spacing.xs
  }
});

Button.displayName = 'Button';
```

## Advanced Navigation Patterns

### **Type-Safe Navigation System**
```typescript
// navigation/types.ts
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';

// Root Stack Navigator
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Onboarding: undefined;
  ProductDetails: { productId: string; fromScreen?: string };
  Search: { query?: string; category?: string };
  Cart: undefined;
  Checkout: { items: CartItem[] };
  Profile: undefined;
  Settings: undefined;
  WebView: { url: string; title?: string };
  Camera: { mode: 'scan' | 'photo' };
  Map: { stores?: Store[]; initialRegion?: Region };
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Search: undefined;
  Wishlist: undefined;
  Profile: undefined;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  EmailVerification: { email: string };
};

// Home Stack Navigator
export type HomeStackParamList = {
  HomeScreen: undefined;
  ProductDetails: { productId: string };
  CategoryProducts: { categoryId: string; categoryName: string };
  BrandProducts: { brandId: string; brandName: string };
  Notifications: undefined;
};

// Navigation Prop Types
export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;
export type HomeStackNavigationProp = StackNavigationProp<HomeStackParamList>;

// Combined Navigation Props
export type HomeScreenNavigationProp = CompositeNavigationProp<
  HomeStackNavigationProp,
  CompositeNavigationProp<MainTabNavigationProp, RootStackNavigationProp>
>;

// Route Props
export type ProductDetailsRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;
export type CheckoutRouteProp = RouteProp<RootStackParamList, 'Checkout'>;
```

### **Custom Navigation Components**
```typescript
// navigation/components/CustomTabBar.tsx
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { DesignTokens } from '@/tokens/design-tokens';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/Badge';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  // Animation values for each tab
  const tabAnimations = state.routes.map(() => useSharedValue(0));
  const indicatorPosition = useSharedValue(0);

  const tabIcons: Record<string, { default: string; focused: string }> = {
    Home: { default: 'home-outline', focused: 'home' },
    Categories: { default: 'grid-outline', focused: 'grid' },
    Search: { default: 'search-outline', focused: 'search' },
    Wishlist: { default: 'heart-outline', focused: 'heart' },
    Profile: { default: 'person-outline', focused: 'person' }
  };

  React.useEffect(() => {
    // Animate focused tab
    tabAnimations.forEach((animation, index) => {
      animation.value = withSpring(
        state.index === index ? 1 : 0,
        { damping: 15, stiffness: 150 }
      );
    });

    // Animate indicator position
    indicatorPosition.value = withSpring(
      state.index * (100 / state.routes.length),
      { damping: 15, stiffness: 150 }
    );
  }, [state.index]);

  const getBadgeCount = (routeName: string): number => {
    switch (routeName) {
      case 'Cart':
        return itemCount;
      case 'Wishlist':
        return wishlistCount;
      default:
        return 0;
    }
  };

  const handleTabPress = (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate(route.name);
    }
  };

  const tabBarHeight = DesignTokens.layout.tabBarHeight + insets.bottom;

  return (
    <View style={[styles.container, { height: tabBarHeight }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 100 : 50}
        style={StyleSheet.absoluteFillObject}
        tint={theme.isDark ? 'dark' : 'light'}
      />

      {/* Active Tab Indicator */}
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.colors.primary[500],
            transform: [
              {
                translateX: useAnimatedStyle(() => ({
                  transform: [
                    {
                      translateX: interpolate(
                        indicatorPosition.value,
                        [0, 100],
                        [0, DesignTokens.layout.screenWidth - (100 / state.routes.length)]
                      )
                    }
                  ]
                })).transform[0].translateX
              }
            ],
            width: `${100 / state.routes.length}%`
          }
        ]}
      />

      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const badgeCount = getBadgeCount(route.name);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [
              { scale: interpolate(tabAnimations[index].value, [0, 1], [1, 1.1]) }
            ],
            opacity: interpolate(tabAnimations[index].value, [0, 1], [0.6, 1])
          }));

          const textAnimatedStyle = useAnimatedStyle(() => ({
            opacity: tabAnimations[index].value,
            transform: [
              { translateY: interpolate(tabAnimations[index].value, [0, 1], [10, 0]) }
            ]
          }));

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={() => handleTabPress(route, index)}
              activeOpacity={0.7}
            >
              <Animated.View style={[styles.tabContent, animatedStyle]}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={
                      tabIcons[route.name]?.[isFocused ? 'focused' : 'default'] ||
                      'ellipse-outline'
                    }
                    size={24}
                    color={
                      isFocused
                        ? theme.colors.primary[500]
                        : theme.colors.text.secondary
                    }
                  />

                  {badgeCount > 0 && (
                    <Badge
                      value={badgeCount}
                      style={styles.badge}
                      size="sm"
                    />
                  )}
                </View>

                {isFocused && (
                  <Animated.Text
                    style={[
                      styles.tabLabel,
                      { color: theme.colors.primary[500] },
                      textAnimatedStyle
                    ]}
                  >
                    {options.tabBarLabel || route.name}
                  </Animated.Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)'
  },
  indicator: {
    position: 'absolute',
    top: 0,
    height: 2,
    borderRadius: 1
  },
  tabContainer: {
    flexDirection: 'row',
    flex: 1,
    paddingHorizontal: DesignTokens.spacing.md
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.sm
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2
  }
});
```

## Advanced Gesture Handling

### **Swipe-to-Action Components**
```typescript
// components/SwipeableRow/SwipeableRow.tsx
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
  interpolate,
  interpolateColor
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { DesignTokens } from '@/tokens/design-tokens';
import { useTheme } from '@/hooks/useTheme';

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

interface SwipeAction {
  icon: string;
  label: string;
  color: string;
  backgroundColor: string;
  onPress: () => void;
  hapticType?: 'light' | 'medium' | 'heavy';
}

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 80;

export const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeStart,
  onSwipeEnd
}) => {
  const theme = useTheme();
  const translateX = useSharedValue(0);
  const leftActionsOpacity = useSharedValue(0);
  const rightActionsOpacity = useSharedValue(0);

  const panGestureRef = useRef();

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
      if (onSwipeStart) {
        runOnJS(onSwipeStart)();
      }
    },
    onActive: (event, context) => {
      const newTranslateX = context.startX + event.translationX;

      // Constrain swipe to available actions
      const maxLeft = leftActions.length * ACTION_WIDTH;
      const maxRight = -rightActions.length * ACTION_WIDTH;

      translateX.value = Math.max(
        maxRight,
        Math.min(maxLeft, newTranslateX)
      );

      // Update action opacities
      leftActionsOpacity.value = interpolate(
        translateX.value,
        [0, SWIPE_THRESHOLD],
        [0, 1],
        'clamp'
      );

      rightActionsOpacity.value = interpolate(
        translateX.value,
        [-SWIPE_THRESHOLD, 0],
        [1, 0],
        'clamp'
      );
    },
    onEnd: (event) => {
      const shouldCompleteSwipe = Math.abs(event.translationX) > SWIPE_THRESHOLD;
      const velocity = Math.abs(event.velocityX) > 500;

      if (shouldCompleteSwipe || velocity) {
        // Determine which action to trigger
        if (event.translationX > 0 && leftActions.length > 0) {
          // Swipe right - left actions
          const actionIndex = Math.min(
            Math.floor(Math.abs(translateX.value) / ACTION_WIDTH),
            leftActions.length - 1
          );
          const action = leftActions[actionIndex];

          runOnJS(() => {
            const hapticType = action.hapticType || 'medium';
            const hapticMapping = {
              light: Haptics.ImpactFeedbackStyle.Light,
              medium: Haptics.ImpactFeedbackStyle.Medium,
              heavy: Haptics.ImpactFeedbackStyle.Heavy
            };

            Haptics.impactAsync(hapticMapping[hapticType]);
            action.onPress();
          })();
        } else if (event.translationX < 0 && rightActions.length > 0) {
          // Swipe left - right actions
          const actionIndex = Math.min(
            Math.floor(Math.abs(translateX.value) / ACTION_WIDTH),
            rightActions.length - 1
          );
          const action = rightActions[actionIndex];

          runOnJS(() => {
            const hapticType = action.hapticType || 'medium';
            const hapticMapping = {
              light: Haptics.ImpactFeedbackStyle.Light,
              medium: Haptics.ImpactFeedbackStyle.Medium,
              heavy: Haptics.ImpactFeedbackStyle.Heavy
            };

            Haptics.impactAsync(hapticMapping[hapticType]);
            action.onPress();
          })();
        }
      }

      // Reset position
      translateX.value = withSpring(0, {
        damping: 20,
        stiffness: 300
      });

      leftActionsOpacity.value = withSpring(0);
      rightActionsOpacity.value = withSpring(0);

      if (onSwipeEnd) {
        runOnJS(onSwipeEnd)();
      }
    }
  });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const leftActionsStyle = useAnimatedStyle(() => ({
    opacity: leftActionsOpacity.value,
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [0, leftActions.length * ACTION_WIDTH],
          [-leftActions.length * ACTION_WIDTH, 0]
        )
      }
    ]
  }));

  const rightActionsStyle = useAnimatedStyle(() => ({
    opacity: rightActionsOpacity.value,
    transform: [
      {
        translateX: interpolate(
          translateX.value,
          [-rightActions.length * ACTION_WIDTH, 0],
          [0, rightActions.length * ACTION_WIDTH]
        )
      }
    ]
  }));

  const renderActions = (actions: SwipeAction[], isLeft: boolean) => (
    <View style={[
      styles.actionsContainer,
      isLeft ? styles.leftActions : styles.rightActions
    ]}>
      {actions.map((action, index) => (
        <Animated.View
          key={index}
          style={[
            styles.actionButton,
            {
              backgroundColor: action.backgroundColor,
              width: ACTION_WIDTH
            }
          ]}
        >
          <Ionicons
            name={action.icon as any}
            size={24}
            color={action.color}
          />
          <Text style={[styles.actionLabel, { color: action.color }]}>
            {action.label}
          </Text>
        </Animated.View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Left Actions */}
      {leftActions.length > 0 && (
        <Animated.View style={[styles.actionsWrapper, leftActionsStyle]}>
          {renderActions(leftActions, true)}
        </Animated.View>
      )}

      {/* Right Actions */}
      {rightActions.length > 0 && (
        <Animated.View style={[styles.actionsWrapper, rightActionsStyle]}>
          {renderActions(rightActions, false)}
        </Animated.View>
      )}

      {/* Main Content */}
      <PanGestureHandler
        ref={panGestureRef}
        onGestureEvent={gestureHandler}
        activeOffsetX={[-10, 10]}
        failOffsetY={[-30, 30]}
      >
        <Animated.View
          style={[
            styles.row,
            { backgroundColor: theme.colors.surface.primary },
            animatedRowStyle
          ]}
        >
          {children}
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  row: {
    minHeight: 60,
    justifyContent: 'center',
    paddingHorizontal: DesignTokens.spacing.md,
    ...DesignTokens.shadows.sm
  },
  actionsWrapper: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row'
  },
  leftActions: {
    left: 0
  },
  rightActions: {
    right: 0
  },
  actionsContainer: {
    flexDirection: 'row',
    height: '100%'
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.sm
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4
  }
});
```

## Cross-Platform UI Consistency

### **Platform-Adaptive Components**
```typescript
// components/PlatformAdaptive/SearchBar.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { DesignTokens } from '@/tokens/design-tokens';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onCancel?: () => void;
  autoFocus?: boolean;
  showCancel?: boolean;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value,
  onChangeText,
  onFocus,
  onBlur,
  onCancel,
  autoFocus = false,
  showCancel = false,
  style
}) => {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Animation values
  const focusAnimation = useSharedValue(0);
  const cancelAnimation = useSharedValue(0);

  React.useEffect(() => {
    focusAnimation.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    cancelAnimation.value = withTiming(
      (isFocused || showCancel) ? 1 : 0,
      { duration: 200 }
    );
  }, [isFocused, showCancel]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleCancel = () => {
    inputRef.current?.blur();
    onChangeText('');
    setIsFocused(false);
    Keyboard.dismiss();
    onCancel?.();
  };

  const clearText = () => {
    onChangeText('');
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Platform-specific styles
  const getSearchBarStyle = () => {
    if (Platform.OS === 'ios') {
      return {
        backgroundColor: theme.colors.surface.secondary,
        borderRadius: DesignTokens.borderRadius.lg,
        paddingHorizontal: DesignTokens.spacing.md,
        height: 36,
        ...DesignTokens.shadows.sm
      };
    } else {
      return {
        backgroundColor: theme.colors.surface.primary,
        borderRadius: DesignTokens.borderRadius.md,
        paddingHorizontal: DesignTokens.spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: isFocused
          ? theme.colors.primary[500]
          : theme.colors.border.light,
        elevation: isFocused ? 4 : 2
      };
    }
  };

  // Animated styles
  const searchContainerStyle = useAnimatedStyle(() => ({
    flex: interpolate(cancelAnimation.value, [0, 1], [1, 0.8])
  }));

  const cancelButtonStyle = useAnimatedStyle(() => ({
    opacity: cancelAnimation.value,
    transform: [
      { translateX: interpolate(cancelAnimation.value, [0, 1], [50, 0]) }
    ]
  }));

  const searchIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(focusAnimation.value, [0, 1], [0.6, 1]),
    transform: [
      { scale: interpolate(focusAnimation.value, [0, 1], [1, 1.1]) }
    ]
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.searchContainer, searchContainerStyle]}>
        <View style={[styles.inputContainer, getSearchBarStyle()]}>
          {/* Search Icon */}
          <Animated.View style={[styles.searchIcon, searchIconStyle]}>
            <Ionicons
              name="search"
              size={20}
              color={isFocused ? theme.colors.primary[500] : theme.colors.text.secondary}
            />
          </Animated.View>

          {/* Text Input */}
          <TextInput
            ref={inputRef}
            style={[
              styles.textInput,
              {
                color: theme.colors.text.primary,
                fontSize: Platform.OS === 'ios' ? 16 : 14
              }
            ]}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.text.tertiary}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoFocus={autoFocus}
            returnKeyType="search"
            selectionColor={theme.colors.primary[500]}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          />

          {/* Clear Button (Android) */}
          {Platform.OS === 'android' && value.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearText}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Cancel Button */}
      <Animated.View style={[styles.cancelButtonContainer, cancelButtonStyle]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
        >
          <Text style={[styles.cancelText, { color: theme.colors.primary[500] }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.md
  },
  searchContainer: {
    flex: 1
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchIcon: {
    marginRight: DesignTokens.spacing.sm
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'ios' ? 8 : 12,
    includeFontPadding: false
  },
  clearButton: {
    padding: 4
  },
  cancelButtonContainer: {
    marginLeft: DesignTokens.spacing.sm
  },
  cancelButton: {
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500'
  }
});
```

### **Accessibility Patterns**
```typescript
// hooks/useAccessibility.ts
import { AccessibilityInfo, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

export interface AccessibilitySettings {
  isScreenReaderEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  prefersCrossFadeTransitions: boolean;
  isVoiceOverEnabled: boolean;
  isTalkBackEnabled: boolean;
}

export function useAccessibility(): AccessibilitySettings {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    isScreenReaderEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    prefersCrossFadeTransitions: false,
    isVoiceOverEnabled: false,
    isTalkBackEnabled: false
  });

  useEffect(() => {
    const checkAccessibilitySettings = async () => {
      try {
        const [
          screenReader,
          reduceMotion,
          reduceTransparency
        ] = await Promise.all([
          AccessibilityInfo.isScreenReaderEnabled(),
          AccessibilityInfo.isReduceMotionEnabled(),
          Platform.OS === 'ios' ? AccessibilityInfo.isReduceTransparencyEnabled() : Promise.resolve(false)
        ]);

        setSettings({
          isScreenReaderEnabled: screenReader,
          isReduceMotionEnabled: reduceMotion,
          isReduceTransparencyEnabled: reduceTransparency,
          prefersCrossFadeTransitions: reduceMotion,
          isVoiceOverEnabled: Platform.OS === 'ios' && screenReader,
          isTalkBackEnabled: Platform.OS === 'android' && screenReader
        });
      } catch (error) {
        console.warn('Error checking accessibility settings:', error);
      }
    };

    checkAccessibilitySettings();

    // Listen for accessibility changes
    const screenReaderListener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled) => {
        setSettings(prev => ({
          ...prev,
          isScreenReaderEnabled: isEnabled,
          isVoiceOverEnabled: Platform.OS === 'ios' && isEnabled,
          isTalkBackEnabled: Platform.OS === 'android' && isEnabled
        }));
      }
    );

    const reduceMotionListener = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled) => {
        setSettings(prev => ({
          ...prev,
          isReduceMotionEnabled: isEnabled,
          prefersCrossFadeTransitions: isEnabled
        }));
      }
    );

    let reduceTransparencyListener: any;
    if (Platform.OS === 'ios') {
      reduceTransparencyListener = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        (isEnabled) => {
          setSettings(prev => ({
            ...prev,
            isReduceTransparencyEnabled: isEnabled
          }));
        }
      );
    }

    return () => {
      screenReaderListener?.remove();
      reduceMotionListener?.remove();
      reduceTransparencyListener?.remove();
    };
  }, []);

  return settings;
}

// Accessibility helper functions
export const accessibilityHelpers = {
  announceForScreenReader: (message: string) => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.announceForAccessibility(message);
    } else {
      // Android TalkBack announcement
      AccessibilityInfo.announceForAccessibility(message);
    }
  },

  setAccessibilityFocus: (reactTag: number) => {
    AccessibilityInfo.setAccessibilityFocus(reactTag);
  },

  hapticForAccessibility: (type: 'light' | 'medium' | 'heavy' = 'light') => {
    const hapticTypes = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy
    };

    Haptics.impactAsync(hapticTypes[type]);
  },

  getAccessibilityLabel: (label: string, value?: string, hint?: string) => {
    let fullLabel = label;

    if (value) {
      fullLabel += `, ${value}`;
    }

    if (hint) {
      fullLabel += `. ${hint}`;
    }

    return fullLabel;
  }
};
```

---

**Document Classification**: CONFIDENTIAL
**Technical Scope**: React Native UI, Design System, Mobile UX, Animations
**Platform Priority**: Primary (Revenue-generating)
**Review Cycle**: Monthly
**Last Updated**: September 16, 2025
**Version**: 2.0.0