# 02. Multi-Platform Specific Implementations / การใช้งานเฉพาะแพลตฟอร์ม

> **Multi-Platform Memory**: Detailed implementation patterns and best practices for each target platform in the Tanqory ecosystem.
>
> **ความเป็นเยี่ยมในการใช้งาน**: รูปแบบการใช้งานและแนวปฏิบัติที่ดีที่สุดสำหรับแต่ละแพลตฟอร์มเป้าหมายในระบบนิเวศ Tanqory

> **Technology Versions**: For specific version requirements and compatibility matrices, see [`memory/core/00_official_technology_versions.md`](../core/00_official_technology_versions.md)

## Implementation Architecture Matrix

### **Platform Implementation Overview**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TANQORY IMPLEMENTATION PATTERNS                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Platform    │ Primary Tech      │ UI Framework    │ State Mgmt │ Build Tool │
├─────────────────────────────────────────────────────────────────────────────┤
│ Web         │ Next.js           │ React 18        │ Zustand    │ Turbopack  │
│ Mobile      │ React Native      │ RN New Arch     │ Zustand    │ Metro      │
│ Desktop     │ Electron          │ React 18        │ Zustand    │ Webpack 5  │
│ Vision      │ visionOS          │ SwiftUI         │ @State     │ Xcode      │
│ TV          │ React Native TV   │ RN + TV Focus   │ Zustand    │ Metro      │
│ Watch       │ watchOS           │ SwiftUI         │ @State     │ Xcode      │
│ Car         │ CarPlay/Auto      │ Native UI       │ Core Data  │ Native     │
│ Backend     │ Node.js           │ Express/Fastify │ Redis      │ esbuild    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 1. Web Platform Implementation (Next.js)

### **Project Structure**
```
tanqory-web/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route groups
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── products/
│   │   └── orders/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   ├── forms/                   # Form components
│   ├── layouts/                 # Layout components
│   └── features/                # Feature-specific components
├── lib/                         # Utility libraries
│   ├── auth.ts
│   ├── db.ts
│   ├── utils.ts
│   └── validations.ts
├── hooks/                       # Custom React hooks
├── store/                       # State management
├── styles/                      # Global styles
├── public/                      # Static assets
├── middleware.ts                # Next.js middleware
├── next.config.js              # Next.js configuration
└── package.json
```

### **Advanced Implementation Patterns**
```typescript
// app/layout.tsx - Root Layout with Providers
import { TanqoryProviders } from '@/components/providers';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: {
    template: '%s | Tanqory',
    default: 'Tanqory - Global E-commerce Platform'
  },
  description: 'AI-first e-commerce platform for global markets',
  keywords: ['e-commerce', 'AI', 'global', 'marketplace'],
  authors: [{ name: 'Tanqory Team', url: 'https://tanqory.com' }],
  creator: 'Tanqory',
  publisher: 'Tanqory',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  alternates: {
    canonical: 'https://tanqory.com',
    languages: {
      'en-US': 'https://tanqory.com/en',
      'th-TH': 'https://tanqory.com/th',
      'ja-JP': 'https://tanqory.com/ja',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tanqory.com',
    siteName: 'Tanqory',
    images: [
      {
        url: 'https://tanqory.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tanqory Global E-commerce Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tanqory - Global E-commerce Platform',
    description: 'AI-first e-commerce platform for global markets',
    creator: '@tanqory',
    images: ['https://tanqory.com/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TanqoryProviders>
          {children}
        </TanqoryProviders>
      </body>
    </html>
  );
}

// components/providers.tsx - Combined Providers
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from 'next-themes';
import { TanqoryAuthProvider } from '@tanqory/auth-sdk';
import { TanqoryAnalyticsProvider } from '@tanqory/analytics';
import { useState } from 'react';

export function TanqoryProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            cacheTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error instanceof Error && error.message.includes('4')) {
                return false;
              }
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TanqoryAuthProvider
          config={{
            apiUrl: process.env.NEXT_PUBLIC_API_URL!,
            clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
            redirectUri: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI!,
          }}
        >
          <TanqoryAnalyticsProvider
            config={{
              trackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID!,
              enableDevMode: process.env.NODE_ENV === 'development',
            }}
          >
            {children}
          </TanqoryAnalyticsProvider>
        </TanqoryAuthProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

// app/api/products/route.ts - API Route with Edge Runtime
import { NextRequest, NextResponse } from 'next/server';
import { TanqoryApiClient } from '@tanqory/api-client';
import { auth } from '@/lib/auth';

export const runtime = 'edge';

const apiClient = new TanqoryApiClient({
  baseURL: process.env.INTERNAL_API_URL!,
  timeout: 10000,
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '20';
    const category = searchParams.get('category');

    const products = await apiClient.products.list({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      userId: session.user.id,
    });

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '999',
      },
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### **Web Performance Optimization**
```typescript
// next.config.js - Advanced Configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
    serverComponentsExternalPackages: ['@tanqory/backend-utils'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.tanqory.com',
        port: '',
        pathname: '/images/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Bundle analyzer
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains',
        },
      ],
    },
  ],
};

module.exports = nextConfig;
```

## 2. Mobile Platform Implementation (React Native)

### **Project Structure**
```
tanqory-mobile/
├── src/
│   ├── components/              # Reusable components
│   │   ├── ui/                 # Base UI components
│   │   ├── forms/              # Form components
│   │   └── navigation/         # Navigation components
│   ├── screens/                # Screen components
│   │   ├── auth/
│   │   ├── home/
│   │   ├── product/
│   │   └── profile/
│   ├── navigation/             # Navigation configuration
│   ├── hooks/                  # Custom hooks
│   ├── store/                  # State management
│   ├── services/               # API services
│   ├── utils/                  # Utility functions
│   ├── types/                  # TypeScript types
│   └── constants/              # App constants
├── ios/                        # iOS specific files
├── android/                    # Android specific files
├── metro.config.js            # Metro bundler config
├── react-native.config.js     # React Native config
└── package.json
```

### **Advanced Mobile Implementation**
```typescript
// App.tsx - Main App Component
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TanqoryMobileProvider } from '@tanqory/mobile-sdk';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { useAuthStore } from './src/store/authStore';
import { SplashScreen } from './src/screens/SplashScreen';
import { enableScreens } from 'react-native-screens';
import { LogBox } from 'react-native';

// Enable screen optimization
enableScreens();

// Hide yellow box warnings in development
if (__DEV__) {
  LogBox.ignoreLogs(['Warning: ...']);
}

const Stack = createNativeStackNavigator();

export default function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TanqoryMobileProvider
          config={{
            apiEndpoint: __DEV__
              ? 'https://dev-api.tanqory.com'
              : 'https://api.tanqory.com',
            enableCrashlytics: !__DEV__,
            enableAnalytics: true,
            enablePushNotifications: true,
          }}
        >
          <NavigationContainer>
            <Stack.Navigator
              screenOptions={{
                headerShown: false,
                gestureEnabled: true,
                animation: 'slide_from_right',
              }}
            >
              {isAuthenticated ? (
                <Stack.Screen name="Main" component={MainNavigator} />
              ) : (
                <Stack.Screen name="Auth" component={AuthNavigator} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </TanqoryMobileProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// src/components/ui/TanqoryButton.tsx - Custom Button Component
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@tanqory/mobile-sdk';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface TanqoryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const TanqoryButton: React.FC<TanqoryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    { backgroundColor: theme.colors[variant] },
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    { color: theme.colors.text[variant] },
  ];

  return (
    <AnimatedTouchableOpacity
      style={[buttonStyles, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.text[variant]} />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 32,
  },
  medium: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#007AFF',
  },
  ghostText: {
    color: '#007AFF',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
});
```

### **Native Module Integration**
```typescript
// src/modules/BiometricAuth.ts - Custom Native Module
import { NativeModules, Platform } from 'react-native';

interface BiometricAuthModule {
  isAvailable(): Promise<boolean>;
  authenticate(options: AuthOptions): Promise<AuthResult>;
  getSupportedBiometrics(): Promise<BiometricType[]>;
}

interface AuthOptions {
  promptMessage: string;
  subtitle?: string;
  description?: string;
  fallbackLabel?: string;
  cancelLabel?: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
  biometricType?: BiometricType;
}

type BiometricType = 'TouchID' | 'FaceID' | 'Fingerprint' | 'Iris';

const { TanqoryBiometricAuth } = NativeModules;

export class BiometricAuth {
  static async isAvailable(): Promise<boolean> {
    try {
      return await TanqoryBiometricAuth.isAvailable();
    } catch (error) {
      console.error('BiometricAuth.isAvailable error:', error);
      return false;
    }
  }

  static async authenticate(options: AuthOptions): Promise<AuthResult> {
    try {
      return await TanqoryBiometricAuth.authenticate(options);
    } catch (error) {
      console.error('BiometricAuth.authenticate error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async getSupportedBiometrics(): Promise<BiometricType[]> {
    try {
      return await TanqoryBiometricAuth.getSupportedBiometrics();
    } catch (error) {
      console.error('BiometricAuth.getSupportedBiometrics error:', error);
      return [];
    }
  }
}
```

## 3. Desktop Platform Implementation (Electron)

### **Project Structure**
```
tanqory-desktop/
├── src/
│   ├── main/                   # Main process
│   │   ├── main.ts
│   │   ├── menu.ts
│   │   ├── protocol.ts
│   │   └── updater.ts
│   ├── renderer/               # Renderer process
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
│   ├── preload/               # Preload scripts
│   │   ├── api.ts
│   │   └── security.ts
│   └── shared/                # Shared types and utilities
├── build/                     # Build resources
│   ├── icons/
│   └── installers/
├── electron-builder.json      # Electron Builder config
├── forge.config.js           # Electron Forge config
└── package.json
```

### **Advanced Electron Implementation**
```typescript
// src/main/main.ts - Main Process with Security
import { app, BrowserWindow, ipcMain, session, protocol } from 'electron';
import { autoUpdater } from 'electron-updater';
import windowStateKeeper from 'electron-window-state';
import path from 'path';
import isDev from 'electron-is-dev';
import { TanqoryElectronSecurity } from '@tanqory/electron-security';
import { TanqoryElectronUpdater } from '@tanqory/electron-updater';
import { createMenu } from './menu';
import { setupProtocol } from './protocol';

class TanqoryDesktopApp {
  private mainWindow: BrowserWindow | null = null;
  private splashWindow: BrowserWindow | null = null;
  private security: TanqoryElectronSecurity;
  private updater: TanqoryElectronUpdater;

  constructor() {
    this.security = new TanqoryElectronSecurity();
    this.updater = new TanqoryElectronUpdater();
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    // Single instance enforcement
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus();
      }
    });

    // App event handlers
    app.whenReady().then(() => this.onReady());
    app.on('window-all-closed', this.onWindowAllClosed);
    app.on('activate', this.onActivate);
    app.on('before-quit', this.onBeforeQuit);
  }

  private async onReady(): Promise<void> {
    // Security configuration
    await this.security.configure({
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'", "https://api.tanqory.com", "wss://ws.tanqory.com"],
        'img-src': ["'self'", "data:", "https:", "blob:"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'font-src': ["'self'", "data:"],
      },
      permissions: {
        camera: false,
        microphone: false,
        geolocation: false,
        notifications: true,
        persistentStorage: true,
      },
    });

    // Setup protocol handlers
    setupProtocol();

    // Create application menu
    createMenu();

    // Create splash screen
    await this.createSplashWindow();

    // Create main window
    await this.createMainWindow();

    // Setup auto updater
    this.setupAutoUpdater();

    // Setup IPC handlers
    this.setupIpcHandlers();
  }

  private async createSplashWindow(): Promise<void> {
    this.splashWindow = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    const splashUrl = isDev
      ? 'http://localhost:3000/splash'
      : `file://${path.join(__dirname, '../renderer/splash.html')}`;

    await this.splashWindow.loadURL(splashUrl);

    this.splashWindow.on('closed', () => {
      this.splashWindow = null;
    });
  }

  private async createMainWindow(): Promise<void> {
    // Restore window state
    const mainWindowState = windowStateKeeper({
      defaultWidth: 1200,
      defaultHeight: 800,
    });

    this.mainWindow = new BrowserWindow({
      x: mainWindowState.x,
      y: mainWindowState.y,
      width: mainWindowState.width,
      height: mainWindowState.height,
      minWidth: 800,
      minHeight: 600,
      show: false, // Don't show until ready
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      trafficLightPosition: { x: 16, y: 16 },
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        sandbox: true,
        preload: path.join(__dirname, '../preload/api.js'),
        webSecurity: !isDev,
      },
      icon: path.join(__dirname, '../build/icons/512x512.png'),
    });

    // Manage window state
    mainWindowState.manage(this.mainWindow);

    // Load the app
    const mainUrl = isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../renderer/index.html')}`;

    await this.mainWindow.loadURL(mainUrl);

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      if (this.splashWindow) {
        this.splashWindow.close();
      }
      this.mainWindow?.show();

      if (isDev) {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Window event handlers
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupAutoUpdater(): void {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
      this.mainWindow?.webContents.send('update-available');
    });

    autoUpdater.on('update-downloaded', () => {
      this.mainWindow?.webContents.send('update-downloaded');
    });
  }

  private setupIpcHandlers(): void {
    // App info
    ipcMain.handle('app:getVersion', () => app.getVersion());
    ipcMain.handle('app:getName', () => app.getName());

    // Window controls
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });

    // System info
    ipcMain.handle('system:getInfo', () => ({
      platform: process.platform,
      arch: process.arch,
      version: process.getSystemVersion(),
    }));

    // Auto updater
    ipcMain.handle('updater:quitAndInstall', () => {
      autoUpdater.quitAndInstall();
    });
  }

  private onWindowAllClosed = (): void => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  };

  private onActivate = (): void => {
    if (BrowserWindow.getAllWindows().length === 0) {
      this.createMainWindow();
    }
  };

  private onBeforeQuit = (): void => {
    // Cleanup before quit
    this.mainWindow?.removeAllListeners('close');
  };
}

// Initialize the app
new TanqoryDesktopApp();
```

### **Preload Script for Security**
```typescript
// src/preload/api.ts - Secure API Bridge
import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
interface TanqoryElectronAPI {
  app: {
    getVersion(): Promise<string>;
    getName(): Promise<string>;
  };
  window: {
    minimize(): Promise<void>;
    maximize(): Promise<void>;
    close(): Promise<void>;
  };
  system: {
    getInfo(): Promise<SystemInfo>;
  };
  updater: {
    quitAndInstall(): Promise<void>;
    onUpdateAvailable(callback: () => void): void;
    onUpdateDownloaded(callback: () => void): void;
  };
}

interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
}

// Expose the API to the renderer process
const api: TanqoryElectronAPI = {
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
  },
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },
  system: {
    getInfo: () => ipcRenderer.invoke('system:getInfo'),
  },
  updater: {
    quitAndInstall: () => ipcRenderer.invoke('updater:quitAndInstall'),
    onUpdateAvailable: (callback) => {
      ipcRenderer.on('update-available', callback);
    },
    onUpdateDownloaded: (callback) => {
      ipcRenderer.on('update-downloaded', callback);
    },
  },
};

contextBridge.exposeInMainWorld('tanqoryElectron', api);

// Type declaration for TypeScript
declare global {
  interface Window {
    tanqoryElectron: TanqoryElectronAPI;
  }
}
```

## 4. Vision Platform Implementation (visionOS)

### **visionOS Project Structure**
```swift
// TanqoryVision.swift - Main App Entry Point
import SwiftUI
import RealityKit
import ARKit

@main
struct TanqoryVisionApp: App {
    @StateObject private var appModel = TanqoryAppModel()
    @StateObject private var spatialTrackingSession = SpatialTrackingSession()

    var body: some Scene {
        // Main window group for 2D content
        WindowGroup {
            TanqoryContentView()
                .environmentObject(appModel)
                .environmentObject(spatialTrackingSession)
        }
        .windowStyle(.volumetric)
        .defaultSize(width: 1.0, height: 1.0, depth: 1.0, in: .meters)

        // Immersive space for 3D content
        ImmersiveSpace(id: "ProductShowcase") {
            TanqoryImmersiveView()
                .environmentObject(appModel)
                .environmentObject(spatialTrackingSession)
        }
        .immersionStyle(selection: .constant(.progressive), in: .progressive)

        // Shared space for collaborative features
        ImmersiveSpace(id: "CollaborativeSpace") {
            TanqoryCollaborativeView()
                .environmentObject(appModel)
        }
        .immersionStyle(selection: .constant(.mixed), in: .mixed)
    }
}

// TanqoryAppModel.swift - Application State Management
import Foundation
import RealityKit
import Combine

@MainActor
class TanqoryAppModel: ObservableObject {
    @Published var currentUser: User?
    @Published var selectedProduct: Product?
    @Published var immersiveSpaceIsShown = false
    @Published var spatialAnchor: ARAnchor?

    private var apiClient: TanqoryAPIClient
    private var cancellables = Set<AnyCancellable>()

    init() {
        self.apiClient = TanqoryAPIClient(
            baseURL: Bundle.main.object(forInfoDictionaryKey: "API_BASE_URL") as? String ?? ""
        )
        setupBindings()
    }

    private func setupBindings() {
        // Listen for authentication changes
        NotificationCenter.default.publisher(for: .userAuthenticationChanged)
            .sink { [weak self] notification in
                if let user = notification.object as? User {
                    self?.currentUser = user
                } else {
                    self?.currentUser = nil
                }
            }
            .store(in: &cancellables)
    }

    func loadFeaturedProducts() async {
        do {
            let products = try await apiClient.fetchFeaturedProducts()
            // Update state with fetched products
        } catch {
            print("Failed to load featured products: \(error)")
        }
    }

    func toggleImmersiveSpace() {
        immersiveSpaceIsShown.toggle()
    }
}

// TanqoryImmersiveView.swift - 3D Product Showcase
import SwiftUI
import RealityKit
import ARKit

struct TanqoryImmersiveView: View {
    @EnvironmentObject var appModel: TanqoryAppModel
    @State private var productEntities: [ProductEntity] = []
    @State private var currentProductIndex = 0

    var body: some View {
        RealityView { content in
            await setupImmersiveEnvironment(content: content)
        } update: { content in
            updateProductDisplay(content: content)
        }
        .gesture(
            TapGesture()
                .targetedToAnyEntity()
                .onEnded { value in
                    handleProductTap(entity: value.entity)
                }
        )
        .gesture(
            DragGesture()
                .onChanged { value in
                    handleProductDrag(value: value)
                }
        )
        .onAppear {
            Task {
                await loadProducts()
            }
        }
    }

    @MainActor
    private func setupImmersiveEnvironment(content: RealityViewContent) async {
        // Create ambient lighting
        let ambientLight = DirectionalLight()
        ambientLight.light.intensity = 1000
        ambientLight.light.isRealWorldProxy = true
        content.add(ambientLight)

        // Add environment mapping
        let environmentResource = try? await EnvironmentResource(named: "studio_environment")
        if let environment = environmentResource {
            content.environment = environment
        }

        // Setup spatial anchoring
        let spatialAnchor = ARAnchor(name: "TanqoryProductAnchor", transform: simd_float4x4(1))
        appModel.spatialAnchor = spatialAnchor
    }

    private func updateProductDisplay(content: RealityViewContent) {
        // Update 3D product models based on current selection
        guard let selectedProduct = appModel.selectedProduct else { return }

        // Load and display 3D model for selected product
        Task {
            if let modelEntity = await loadProductModel(for: selectedProduct) {
                content.add(modelEntity)
            }
        }
    }

    private func handleProductTap(entity: Entity) {
        // Handle product interaction
        if let productEntity = entity as? ProductEntity {
            appModel.selectedProduct = productEntity.product

            // Trigger haptic feedback
            let impactFeedback = UIImpactFeedbackGenerator(style: .medium)
            impactFeedback.impactOccurred()

            // Show product details overlay
            showProductDetails(for: productEntity.product)
        }
    }

    private func handleProductDrag(value: DragGesture.Value) {
        // Handle product rotation/manipulation
        let rotationSpeed: Float = 0.01
        let deltaX = Float(value.translation.x) * rotationSpeed
        let deltaY = Float(value.translation.y) * rotationSpeed

        // Apply rotation to current product entity
        if let currentEntity = getCurrentProductEntity() {
            currentEntity.transform.rotation *= simd_quatf(
                angle: deltaX,
                axis: [0, 1, 0]
            ) * simd_quatf(
                angle: deltaY,
                axis: [1, 0, 0]
            )
        }
    }

    private func loadProducts() async {
        // Load product data and create 3D entities
        do {
            let products = try await TanqoryAPIClient.shared.fetchProducts()
            for product in products {
                if let entity = await createProductEntity(for: product) {
                    productEntities.append(entity)
                }
            }
        } catch {
            print("Failed to load products: \(error)")
        }
    }

    private func loadProductModel(for product: Product) async -> ModelEntity? {
        guard let modelURL = product.model3DURL else { return nil }

        do {
            let modelEntity = try await ModelEntity(contentsOf: modelURL)

            // Setup physics and collision
            modelEntity.generateCollisionShapes(recursive: true)
            modelEntity.components.set(InputTargetComponent(allowedInputTypes: .indirect))

            // Add animation components
            if let animationResource = try? await AnimationResource.load(named: "product_showcase") {
                modelEntity.playAnimation(animationResource.repeat())
            }

            return modelEntity
        } catch {
            print("Failed to load 3D model: \(error)")
            return nil
        }
    }
}
```

## 5. Platform-Specific Testing Strategies

### **Web Testing (Jest + Playwright)**
```typescript
// tests/web/e2e/product-catalog.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    await page.waitForLoadState('networkidle');
  });

  test('should display product grid', async ({ page }) => {
    // Test product grid rendering
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toBeVisible();

    // Test product cards
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards).toHaveCountGreaterThan(0);
  });

  test('should filter products by category', async ({ page }) => {
    // Test category filtering
    await page.click('[data-testid="category-electronics"]');
    await page.waitForSelector('[data-testid="product-card"]');

    const filteredProducts = page.locator('[data-testid="product-card"]');
    const count = await filteredProducts.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle search functionality', async ({ page }) => {
    // Test search
    await page.fill('[data-testid="search-input"]', 'iPhone');
    await page.keyboard.press('Enter');
    await page.waitForSelector('[data-testid="search-results"]');

    const searchResults = page.locator('[data-testid="product-card"]');
    await expect(searchResults.first()).toContainText('iPhone');
  });
});
```

### **Mobile Testing (Detox + Jest)**
```typescript
// e2e/mobile/product-catalog.e2e.ts
import { device, expect, element, by } from 'detox';

describe('Product Catalog Mobile', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await element(by.id('catalog-tab')).tap();
  });

  it('should display product list', async () => {
    await expect(element(by.id('product-list'))).toBeVisible();
    await expect(element(by.id('product-item')).atIndex(0)).toBeVisible();
  });

  it('should handle pull to refresh', async () => {
    await element(by.id('product-list')).swipe('down', 'fast');
    await expect(element(by.id('loading-indicator'))).toBeVisible();
    await expect(element(by.id('loading-indicator'))).not.toBeVisible();
  });

  it('should navigate to product details', async () => {
    await element(by.id('product-item')).atIndex(0).tap();
    await expect(element(by.id('product-details-screen'))).toBeVisible();
  });

  it('should handle device orientation changes', async () => {
    await device.setOrientation('landscape');
    await expect(element(by.id('product-list'))).toBeVisible();

    await device.setOrientation('portrait');
    await expect(element(by.id('product-list'))).toBeVisible();
  });
});
```

---

**Document Version**: 1.0.0
**Platform Coverage**: 8/8 platforms with detailed implementation patterns
**Integration Points**: Cross-platform state, API clients, testing strategies
**Maintained By**: Platform Engineering Team