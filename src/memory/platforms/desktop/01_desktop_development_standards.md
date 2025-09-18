# Desktop Development Standards

> **Platform Memory**: Desktop development standards for Electron applications

---

## Overview

This document defines comprehensive desktop development standards for cross-platform desktop applications using modern frameworks like Electron, Tauri, and native technologies. It establishes patterns for building secure, performant, and maintainable desktop applications that integrate seamlessly with operating systems.

## Architecture Standards

### Framework Selection

#### Electron vs Tauri Comparison
```typescript
interface FrameworkComparison {
  electron: {
    technology: 'Chromium + Node.js';
    bundleSize: '120-200MB';
    memoryUsage: '100-300MB';
    startupTime: '2-4 seconds';
    platforms: ['macOS', 'Windows', 'Linux'];
    advantages: [
      'Mature ecosystem',
      'Rich native integrations',
      'Extensive community support',
      'Hot reload development'
    ];
    disadvantages: [
      'Large bundle size',
      'Higher memory usage',
      'Security complexity'
    ];
    useCase: 'Feature-rich applications with complex UI';
  };

  tauri: {
    technology: 'Rust + WebView';
    bundleSize: '10-40MB';
    memoryUsage: '20-100MB';
    startupTime: '0.5-1.5 seconds';
    platforms: ['macOS', 'Windows', 'Linux'];
    advantages: [
      'Lightweight bundle',
      'Better performance',
      'Enhanced security',
      'Native system integration'
    ];
    disadvantages: [
      'Newer ecosystem',
      'Learning curve for Rust',
      'Limited third-party plugins'
    ];
    useCase: 'Performance-critical applications with simpler UI';
  };
}
```

#### Turborepo Integration
```typescript
// turbo.json - Desktop workspace configuration
interface TurborepoConfig {
  "$schema": "https://turbo.build/schema.json";
  "pipeline": {
    "build": {
      "dependsOn": ["^build"];
      "outputs": ["dist/**", "build/**"];
    };
    "dev": {
      "cache": false;
      "persistent": true;
    };
    "package": {
      "dependsOn": ["build"];
      "outputs": ["release/**"];
    };
    "test": {
      "dependsOn": ["^build"];
      "outputs": ["coverage/**"];
    };
    "lint": {
      "outputs": [];
    };
    "type-check": {
      "dependsOn": ["^build"];
      "outputs": [];
    };
  };
  "globalDependencies": [
    "package.json",
    "tsconfig.json",
    ".env",
    ".env.local"
  ];
}

// Workspace structure for desktop apps
const workspaceStructure = {
  "apps/desktop-electron": "Primary Electron application",
  "apps/desktop-tauri": "Alternative Tauri application",
  "packages/desktop-shared": "Shared desktop utilities",
  "packages/desktop-ui": "Desktop-specific UI components",
  "packages/desktop-native": "Native integration helpers"
};
```

### Application Architecture

#### Multi-Process Architecture
```typescript
// Main Process (Node.js)
class DesktopApplicationManager {
  private mainWindow: BrowserWindow;
  private workerProcesses: Map<string, ChildProcess> = new Map();
  private ipcHandlers: Map<string, Function> = new Map();

  constructor() {
    this.setupMainProcess();
    this.setupSecurityPolicies();
    this.setupIPC();
  }

  private setupMainProcess(): void {
    app.whenReady().then(() => {
      this.createMainWindow();
      this.setupAutoUpdater();
      this.setupNativeIntegrations();
    });
  }

  private createMainWindow(): void {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js')
      },
      titleBarStyle: 'hiddenInset',
      vibrancy: 'under-window',
      show: false
    });

    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      this.optimizeForPlatform();
    });
  }

  private setupSecurityPolicies(): void {
    // Content Security Policy
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval';"
          ]
        }
      });
    });
  }

  private setupIPC(): void {
    // Secure IPC communication
    ipcMain.handle('secure-invoke', async (event, { action, data }) => {
      const handler = this.ipcHandlers.get(action);
      if (!handler) throw new Error(`Unknown action: ${action}`);
      return await handler(data);
    });

    // File operations
    this.ipcHandlers.set('file:read', async (filePath: string) => {
      if (!this.validateFilePath(filePath)) {
        throw new Error('Invalid file path');
      }
      return fs.promises.readFile(filePath, 'utf8');
    });

    this.ipcHandlers.set('file:write', async ({ path, content }: { path: string, content: string }) => {
      if (!this.validateFilePath(path)) {
        throw new Error('Invalid file path');
      }
      return fs.promises.writeFile(path, content, 'utf8');
    });
  }

  private validateFilePath(filePath: string): boolean {
    const allowedPaths = [
      app.getPath('documents'),
      app.getPath('downloads'),
      app.getPath('desktop')
    ];
    return allowedPaths.some(allowed => filePath.startsWith(allowed));
  }

  private optimizeForPlatform(): void {
    if (process.platform === 'darwin') {
      this.setupMacOSIntegrations();
    } else if (process.platform === 'win32') {
      this.setupWindowsIntegrations();
    } else if (process.platform === 'linux') {
      this.setupLinuxIntegrations();
    }
  }
}
```

#### Renderer Process (Frontend)
```typescript
// Renderer Process Security
class SecureRendererManager {
  private api: DesktopAPI;

  constructor() {
    this.api = (window as any).electronAPI;
    this.setupSecureContextBridge();
  }

  private setupSecureContextBridge(): void {
    // All main process communication goes through secure bridge
    if (!this.api) {
      throw new Error('Electron API not available - check preload script');
    }
  }

  async secureFileOperation(operation: string, params: any): Promise<any> {
    try {
      return await this.api.invoke('secure-invoke', {
        action: `file:${operation}`,
        data: params
      });
    } catch (error) {
      console.error(`File operation ${operation} failed:`, error);
      throw error;
    }
  }

  async readFile(filePath: string): Promise<string> {
    return this.secureFileOperation('read', filePath);
  }

  async writeFile(path: string, content: string): Promise<void> {
    return this.secureFileOperation('write', { path, content });
  }
}
```

#### Preload Script
```typescript
// preload.ts - Secure context bridge
import { contextBridge, ipcRenderer } from 'electron';

interface DesktopAPI {
  invoke(channel: string, data: any): Promise<any>;
  on(channel: string, callback: Function): void;
  removeAllListeners(channel: string): void;
}

const api: DesktopAPI = {
  invoke: (channel: string, data: any) => ipcRenderer.invoke(channel, data),
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);
```

### State Management

#### Desktop State Architecture
```typescript
interface DesktopState {
  window: WindowState;
  user: UserState;
  app: ApplicationState;
  system: SystemState;
}

interface WindowState {
  bounds: Rectangle;
  isMaximized: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  theme: 'light' | 'dark' | 'auto';
}

class DesktopStateManager {
  private state: DesktopState;
  private persistenceManager: StatePersistenceManager;
  private subscribers: Set<StateSubscriber> = new Set();

  constructor() {
    this.persistenceManager = new StatePersistenceManager();
    this.loadPersistedState();
    this.setupAutoSave();
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const persistedState = await this.persistenceManager.load();
      this.state = this.mergeWithDefaults(persistedState);
    } catch (error) {
      console.warn('Failed to load persisted state, using defaults:', error);
      this.state = this.getDefaultState();
    }
  }

  private setupAutoSave(): void {
    // Auto-save state changes every 5 seconds
    setInterval(() => {
      this.persistenceManager.save(this.state);
    }, 5000);

    // Save on app quit
    app.on('before-quit', () => {
      this.persistenceManager.saveSync(this.state);
    });
  }

  updateWindowBounds(bounds: Rectangle): void {
    this.state.window.bounds = bounds;
    this.notifySubscribers('window.bounds', bounds);
  }

  toggleTheme(): void {
    const currentTheme = this.state.window.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.state.window.theme = newTheme;
    this.notifySubscribers('window.theme', newTheme);
  }

  private notifySubscribers(path: string, value: any): void {
    this.subscribers.forEach(subscriber => {
      if (subscriber.path === path || subscriber.path === '*') {
        subscriber.callback(value, path);
      }
    });
  }
}

class StatePersistenceManager {
  private stateFilePath: string;

  constructor() {
    this.stateFilePath = path.join(app.getPath('userData'), 'app-state.json');
  }

  async save(state: DesktopState): Promise<void> {
    try {
      await fs.promises.writeFile(
        this.stateFilePath,
        JSON.stringify(state, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  saveSync(state: DesktopState): void {
    try {
      fs.writeFileSync(
        this.stateFilePath,
        JSON.stringify(state, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save state synchronously:', error);
    }
  }

  async load(): Promise<Partial<DesktopState>> {
    const data = await fs.promises.readFile(this.stateFilePath, 'utf8');
    return JSON.parse(data);
  }
}
```

## Security Standards

### Electron Security Best Practices

#### Context Isolation
```typescript
// Secure preload implementation
class SecurePreloadManager {
  private allowedChannels = [
    'secure-invoke',
    'app-ready',
    'theme-changed',
    'window-state-changed'
  ];

  setupContextBridge(): void {
    const secureAPI = {
      // File operations
      files: {
        read: (path: string) => this.secureInvoke('file:read', path),
        write: (path: string, content: string) =>
          this.secureInvoke('file:write', { path, content }),
        exists: (path: string) => this.secureInvoke('file:exists', path),
        dialog: {
          showOpenDialog: (options: OpenDialogOptions) =>
            this.secureInvoke('dialog:showOpenDialog', options),
          showSaveDialog: (options: SaveDialogOptions) =>
            this.secureInvoke('dialog:showSaveDialog', options)
        }
      },

      // System integration
      system: {
        getTheme: () => this.secureInvoke('system:getTheme'),
        setTheme: (theme: string) => this.secureInvoke('system:setTheme', theme),
        notifications: {
          show: (options: NotificationOptions) =>
            this.secureInvoke('notification:show', options)
        }
      },

      // App controls
      app: {
        minimize: () => this.secureInvoke('app:minimize'),
        maximize: () => this.secureInvoke('app:maximize'),
        close: () => this.secureInvoke('app:close'),
        restart: () => this.secureInvoke('app:restart')
      },

      // Event listeners
      on: (channel: string, callback: Function) => {
        if (this.allowedChannels.includes(channel)) {
          ipcRenderer.on(channel, (event, ...args) => callback(...args));
        } else {
          throw new Error(`Channel ${channel} is not allowed`);
        }
      },

      removeAllListeners: (channel: string) => {
        if (this.allowedChannels.includes(channel)) {
          ipcRenderer.removeAllListeners(channel);
        }
      }
    };

    contextBridge.exposeInMainWorld('desktopAPI', secureAPI);
  }

  private async secureInvoke(channel: string, data?: any): Promise<any> {
    try {
      return await ipcRenderer.invoke('secure-invoke', {
        action: channel,
        data
      });
    } catch (error) {
      console.error(`Secure invoke failed for ${channel}:`, error);
      throw error;
    }
  }
}
```

#### Content Security Policy
```typescript
class SecurityPolicyManager {
  setupCSP(): void {
    const cspPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' wss: https:",
      "media-src 'none'",
      "object-src 'none'",
      "frame-src 'none'"
    ].join('; ');

    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [cspPolicy],
          'X-Content-Type-Options': ['nosniff'],
          'X-Frame-Options': ['DENY'],
          'X-XSS-Protection': ['1; mode=block']
        }
      });
    });
  }

  setupSecureDefaults(): void {
    // Disable node integration in renderer
    app.on('web-contents-created', (event, contents) => {
      contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      });

      contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        if (parsedUrl.origin !== 'file://' && !this.isAllowedOrigin(parsedUrl.origin)) {
          event.preventDefault();
        }
      });
    });
  }

  private isAllowedOrigin(origin: string): boolean {
    const allowedOrigins = [
      'https://api.company.com',
      'https://auth.company.com'
    ];
    return allowedOrigins.includes(origin);
  }
}
```

## Performance Standards

### Application Startup Optimization

```typescript
class StartupOptimizer {
  private loadingPhases = {
    preload: 0,
    core: 1,
    ui: 2,
    features: 3,
    background: 4
  };

  async optimizeStartup(): Promise<void> {
    // Phase 0: Critical preload
    await this.loadCriticalResources();

    // Phase 1: Core systems
    await this.initializeCoreServices();

    // Phase 2: UI rendering
    this.showSplashScreen();
    await this.loadMainUI();

    // Phase 3: Feature loading (deferred)
    setImmediate(() => {
      this.loadFeatures();
    });

    // Phase 4: Background services (lowest priority)
    setTimeout(() => {
      this.initializeBackgroundServices();
    }, 1000);
  }

  private async loadCriticalResources(): Promise<void> {
    const startTime = performance.now();

    // Load essential configurations
    await Promise.all([
      this.loadAppConfig(),
      this.loadUserPreferences(),
      this.initializeSecurityContext()
    ]);

    const loadTime = performance.now() - startTime;
    console.log(`Critical resources loaded in ${loadTime.toFixed(2)}ms`);
  }

  private showSplashScreen(): void {
    const splash = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false,
      alwaysOnTop: true,
      transparent: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    splash.loadFile('splash.html');

    // Auto-hide splash after main window is ready
    this.mainWindow.once('ready-to-show', () => {
      splash.close();
    });
  }
}
```

### Memory Management

```typescript
class MemoryManager {
  private memoryThreshold = 512 * 1024 * 1024; // 512MB
  private gcInterval: NodeJS.Timeout;
  private memoryMonitorInterval: NodeJS.Timeout;

  constructor() {
    this.setupMemoryMonitoring();
    this.setupAutomaticGC();
  }

  private setupMemoryMonitoring(): void {
    this.memoryMonitorInterval = setInterval(() => {
      const usage = process.memoryUsage();
      const heapUsed = usage.heapUsed;

      if (heapUsed > this.memoryThreshold) {
        console.warn(`High memory usage detected: ${(heapUsed / 1024 / 1024).toFixed(2)}MB`);
        this.performMemoryCleanup();
      }
    }, 30000); // Check every 30 seconds
  }

  private setupAutomaticGC(): void {
    if (global.gc) {
      this.gcInterval = setInterval(() => {
        global.gc();
      }, 60000); // Force GC every minute
    }
  }

  private performMemoryCleanup(): void {
    // Clear caches
    session.defaultSession.clearCache();

    // Clear temporary data
    session.defaultSession.clearStorageData({
      storages: ['cookies', 'localstorage', 'sessionstorage']
    });

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
  }

  cleanup(): void {
    clearInterval(this.memoryMonitorInterval);
    clearInterval(this.gcInterval);
  }
}
```

## Platform Integration Standards

### macOS Integration

```typescript
class MacOSIntegration {
  setupMacOSFeatures(): void {
    this.setupTouchBar();
    this.setupDockIntegration();
    this.setupMenuBar();
    this.setupNotificationCenter();
  }

  private setupTouchBar(): void {
    const { TouchBar } = require('electron');
    const { TouchBarLabel, TouchBarButton, TouchBarSpacer } = TouchBar;

    const touchBar = new TouchBar({
      items: [
        new TouchBarButton({
          label: 'New File',
          backgroundColor: '#7851A9',
          click: () => {
            this.createNewFile();
          }
        }),
        new TouchBarSpacer({ size: 'small' }),
        new TouchBarButton({
          label: 'Save',
          backgroundColor: '#2ECC71',
          click: () => {
            this.saveCurrentFile();
          }
        }),
        new TouchBarSpacer({ size: 'flexible' }),
        new TouchBarLabel({
          label: 'Desktop App'
        })
      ]
    });

    this.mainWindow.setTouchBar(touchBar);
  }

  private setupDockIntegration(): void {
    // Set dock badge
    app.dock.setBadge('1');

    // Dock context menu
    app.dock.setMenu(Menu.buildFromTemplate([
      {
        label: 'New Window',
        click: () => this.createNewWindow()
      },
      {
        label: 'Settings',
        click: () => this.openSettings()
      }
    ]));
  }

  private setupMenuBar(): void {
    const template = [
      {
        label: 'App',
        submenu: [
          {
            label: 'About App',
            role: 'about'
          },
          { type: 'separator' },
          {
            label: 'Preferences',
            accelerator: 'Cmd+,',
            click: () => this.openPreferences()
          },
          { type: 'separator' },
          {
            label: 'Hide App',
            role: 'hide'
          },
          {
            label: 'Hide Others',
            role: 'hideothers'
          },
          {
            label: 'Show All',
            role: 'unhide'
          },
          { type: 'separator' },
          {
            label: 'Quit',
            role: 'quit'
          }
        ]
      },
      {
        label: 'File',
        submenu: [
          {
            label: 'New',
            accelerator: 'Cmd+N',
            click: () => this.createNewFile()
          },
          {
            label: 'Open',
            accelerator: 'Cmd+O',
            click: () => this.openFile()
          },
          {
            label: 'Save',
            accelerator: 'Cmd+S',
            click: () => this.saveFile()
          }
        ]
      }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
}
```

### Windows Integration

```typescript
class WindowsIntegration {
  setupWindowsFeatures(): void {
    this.setupJumpList();
    this.setupTaskbarProgress();
    this.setupSystemTray();
    this.setupWindowsNotifications();
  }

  private setupJumpList(): void {
    app.setJumpList([
      {
        type: 'custom',
        name: 'Recent Projects',
        items: [
          {
            type: 'file',
            path: process.execPath,
            args: '--open-recent',
            title: 'Recent Project 1',
            description: 'Open recent project'
          }
        ]
      },
      {
        type: 'frequent',
        name: 'Frequent'
      },
      {
        type: 'tasks',
        name: 'Tasks',
        items: [
          {
            type: 'task',
            title: 'New Project',
            description: 'Create new project',
            program: process.execPath,
            args: '--new-project',
            iconPath: process.execPath,
            iconIndex: 0
          }
        ]
      }
    ]);
  }

  private setupTaskbarProgress(): void {
    // Show progress in taskbar
    this.mainWindow.setProgressBar(0.5); // 50% progress

    // Clear progress
    setTimeout(() => {
      this.mainWindow.setProgressBar(-1);
    }, 5000);
  }

  private setupSystemTray(): void {
    const tray = new Tray(path.join(__dirname, 'assets/tray-icon.png'));

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          this.mainWindow.show();
        }
      },
      {
        label: 'Quit',
        click: () => {
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Desktop App');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show();
    });
  }
}
```

### Linux Integration

```typescript
class LinuxIntegration {
  setupLinuxFeatures(): void {
    this.setupDesktopEntry();
    this.setupAppIndicator();
    this.setupDBusIntegration();
  }

  private setupDesktopEntry(): void {
    const desktopEntry = `
[Desktop Entry]
Version=1.0
Type=Application
Name=Desktop App
Comment=Modern desktop application
Exec=${process.execPath}
Icon=${path.join(__dirname, 'assets/app-icon.png')}
Terminal=false
Categories=Development;Office;
`;

    const desktopPath = path.join(
      os.homedir(),
      '.local/share/applications/desktop-app.desktop'
    );

    fs.writeFileSync(desktopPath, desktopEntry);
  }

  private setupAppIndicator(): void {
    if (process.platform === 'linux') {
      const tray = new Tray(path.join(__dirname, 'assets/tray-icon.png'));

      tray.setContextMenu(Menu.buildFromTemplate([
        { label: 'Show', click: () => this.mainWindow.show() },
        { label: 'Quit', click: () => app.quit() }
      ]));
    }
  }

  private setupDBusIntegration(): void {
    // Linux-specific D-Bus integrations for system notifications
    // and desktop environment features would go here
  }
}
```

## Auto-Update System

### Update Management

```typescript
class AutoUpdateManager {
  private updateServer: string;
  private currentVersion: string;
  private autoDownload: boolean;

  constructor(config: UpdateConfig) {
    this.updateServer = config.updateServer;
    this.currentVersion = app.getVersion();
    this.autoDownload = config.autoDownload || true;

    this.setupAutoUpdater();
  }

  private setupAutoUpdater(): void {
    autoUpdater.setFeedURL({
      provider: 'generic',
      url: this.updateServer
    });

    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
      this.notifyRenderer('update-checking');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info.version);
      this.notifyRenderer('update-available', info);

      if (this.autoDownload) {
        autoUpdater.downloadUpdate();
      }
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available');
      this.notifyRenderer('update-not-available');
    });

    autoUpdater.on('error', (err) => {
      console.error('Update error:', err);
      this.notifyRenderer('update-error', err.message);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log = `Download speed: ${progressObj.bytesPerSecond}`;
      log += ` - Downloaded ${progressObj.percent}%`;
      log += ` (${progressObj.transferred}/${progressObj.total})`;

      console.log(log);
      this.notifyRenderer('update-progress', progressObj);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded');
      this.notifyRenderer('update-downloaded', info);

      // Show update notification
      this.showUpdateNotification(info);
    });

    // Check for updates on app launch
    app.whenReady().then(() => {
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify();
      }, 3000);
    });
  }

  private notifyRenderer(event: string, data?: any): void {
    this.mainWindow.webContents.send('update-event', { event, data });
  }

  private showUpdateNotification(info: UpdateInfo): void {
    const notification = new Notification({
      title: 'Update Available',
      body: `Version ${info.version} is ready to install`,
      actions: [
        { text: 'Install Now', type: 'button' },
        { text: 'Install Later', type: 'button' }
      ]
    });

    notification.on('action', (event, index) => {
      if (index === 0) {
        this.installUpdate();
      }
    });

    notification.show();
  }

  installUpdate(): void {
    autoUpdater.quitAndInstall();
  }

  checkForUpdates(): void {
    autoUpdater.checkForUpdatesAndNotify();
  }
}
```

## Testing Standards

### Unit Testing

```typescript
// Main process tests
describe('DesktopApplicationManager', () => {
  let app: DesktopApplicationManager;
  let mockWindow: jest.Mocked<BrowserWindow>;

  beforeEach(() => {
    mockWindow = {
      show: jest.fn(),
      hide: jest.fn(),
      close: jest.fn(),
      webContents: {
        send: jest.fn()
      }
    } as any;

    app = new DesktopApplicationManager();
  });

  it('should create main window with security settings', () => {
    expect(mockWindow.webPreferences).toEqual({
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: expect.stringContaining('preload.js')
    });
  });

  it('should handle IPC securely', async () => {
    const result = await app.handleSecureInvoke('file:read', '/safe/path/file.txt');
    expect(result).toBeDefined();
  });

  it('should reject unsafe file paths', async () => {
    await expect(
      app.handleSecureInvoke('file:read', '/etc/passwd')
    ).rejects.toThrow('Invalid file path');
  });
});
```

### Integration Testing

```typescript
// Renderer process integration tests
describe('Desktop App Integration', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    const app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '../app')]
    });

    await app.start();
    driver = app.client;
  });

  afterAll(async () => {
    if (driver) {
      await driver.app.stop();
    }
  });

  it('should launch application successfully', async () => {
    await driver.waitUntilWindowLoaded();
    const title = await driver.getTitle();
    expect(title).toBe('Desktop App');
  });

  it('should handle file operations', async () => {
    await driver.click('[data-testid="open-file-btn"]');
    await driver.waitForVisible('.file-dialog');

    // Simulate file selection
    await driver.execute(() => {
      window.desktopAPI.files.read('/test/file.txt');
    });

    await driver.waitForVisible('.file-content');
    const content = await driver.getText('.file-content');
    expect(content).toBeDefined();
  });
});
```

### End-to-End Testing

```typescript
class E2ETestRunner {
  private spectron: Application;

  async setup(): Promise<void> {
    this.spectron = new Application({
      path: electronPath,
      args: [path.join(__dirname, '../../dist')],
      env: {
        NODE_ENV: 'test',
        ELECTRON_ENABLE_LOGGING: true
      }
    });

    await this.spectron.start();
    await this.spectron.client.waitUntilWindowLoaded();
  }

  async testCompleteWorkflow(): Promise<void> {
    // Test complete user workflow
    await this.testAppLaunch();
    await this.testUserAuthentication();
    await this.testFileOperations();
    await this.testSettingsManagement();
    await this.testAppClose();
  }

  private async testAppLaunch(): Promise<void> {
    const windowCount = await this.spectron.client.getWindowCount();
    expect(windowCount).toBe(1);

    const title = await this.spectron.client.getTitle();
    expect(title).toBe('Desktop App');
  }

  private async testFileOperations(): Promise<void> {
    // Test file creation
    await this.spectron.client.click('[data-testid="new-file"]');
    await this.spectron.client.waitForExist('[data-testid="file-editor"]');

    // Test file save
    await this.spectron.client.setValue('[data-testid="file-editor"]', 'Test content');
    await this.spectron.client.click('[data-testid="save-file"]');

    // Verify file saved notification
    await this.spectron.client.waitForExist('[data-testid="save-success"]');
  }

  async cleanup(): Promise<void> {
    if (this.spectron && this.spectron.isRunning()) {
      await this.spectron.stop();
    }
  }
}
```

## Build and Packaging Standards

### Build Tools Integration

#### esbuild/SWC Configuration
```typescript
// esbuild.config.ts - High-performance bundling
interface ESBuildConfig {
  entryPoints: ['src/main/main.ts', 'src/renderer/index.tsx'];
  bundle: true;
  platform: 'node' | 'browser';
  target: 'es2022';
  format: 'esm';
  splitting: true;
  outdir: 'dist';
  external: ['electron'];
  define: {
    'process.env.NODE_ENV': '"production"';
  };
  plugins: [
    'esbuild-plugin-typescript-decorators',
    'esbuild-plugin-copy'
  ];
}

// SWC Configuration for faster compilation
interface SWCConfig {
  jsc: {
    parser: {
      syntax: 'typescript';
      tsx: true;
      decorators: true;
    };
    target: 'es2022';
    transform: {
      react: {
        runtime: 'automatic';
        development: false;
        refresh: true; // Fast Refresh in development
      };
    };
  };
  module: {
    type: 'es6';
  };
  minify: true;
}
```

#### Tauri Build Configuration
```rust
// tauri.conf.json - Tauri specific configuration
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "Tanqory Desktop",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      },
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "exists": true,
        "scope": ["$APPDATA/*", "$DOCUMENT/*"]
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.tanqory.desktop",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'"
    }
  }
}
```

### Build Configuration

```json
{
  "build": {
    "appId": "com.company.desktop-app",
    "productName": "Desktop App",
    "directories": {
      "output": "dist"
    },
    "files": [
      "build/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "mas",
          "arch": ["x64", "arm64"]
        }
      ],
      "hardenedRuntime": true,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "notarize": {
        "teamId": "TEAM_ID"
      }
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "certificateFile": "certificates/certificate.p12",
      "certificatePassword": "${CSC_KEY_PASSWORD}"
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        },
        {
          "target": "rpm",
          "arch": ["x64"]
        }
      ]
    },
    "publish": {
      "provider": "github",
      "owner": "company",
      "repo": "desktop-app"
    }
  }
}
```

### Deployment Pipeline

```typescript
class DeploymentManager {
  private buildTargets = {
    mac: ['dmg', 'mas'],
    windows: ['nsis', 'portable'],
    linux: ['AppImage', 'deb', 'rpm']
  };

  async buildForAllPlatforms(): Promise<void> {
    console.log('Starting multi-platform build...');

    for (const [platform, targets] of Object.entries(this.buildTargets)) {
      console.log(`Building for ${platform}...`);

      for (const target of targets) {
        await this.buildTarget(platform, target);
      }
    }
  }

  private async buildTarget(platform: string, target: string): Promise<void> {
    const startTime = Date.now();

    try {
      await electronBuilder.build({
        targets: electronBuilder.Platform[platform.toUpperCase()].createTarget(target),
        config: this.getBuildConfig(platform, target)
      });

      const buildTime = (Date.now() - startTime) / 1000;
      console.log(`✅ ${platform}/${target} built in ${buildTime}s`);
    } catch (error) {
      console.error(`❌ Failed to build ${platform}/${target}:`, error);
      throw error;
    }
  }

  private getBuildConfig(platform: string, target: string): Configuration {
    return {
      ...baseConfig,
      [platform]: {
        target: [{ target, arch: ['x64'] }]
      }
    };
  }
}
```

## Development Tools and Workflow

### Development Environment Setup

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:main": "electron-webpack dev",
    "dev:renderer": "webpack serve --config webpack.renderer.config.js",
    "build": "npm run build:renderer && npm run build:main",
    "build:main": "webpack --config webpack.main.config.js",
    "build:renderer": "webpack --config webpack.renderer.config.js",
    "test": "jest",
    "test:e2e": "jest --config jest.e2e.config.js",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "package": "electron-builder",
    "package:all": "electron-builder --mac --win --linux",
    "release": "npm run build && npm run package:all"
  }
}
```

### Hot Reload Development

```typescript
class DevelopmentServer {
  private mainProcess: ChildProcess;
  private rendererServer: webpack.DevServer;
  private isReloading = false;

  async start(): Promise<void> {
    await this.startRendererServer();
    await this.startMainProcess();
    this.setupHotReload();
  }

  private async startRendererServer(): Promise<void> {
    const config = require('./webpack.renderer.config.js');
    const compiler = webpack(config);

    this.rendererServer = new webpack.DevServer({
      port: 3000,
      hot: true,
      liveReload: true
    }, compiler);

    await this.rendererServer.start();
    console.log('Renderer server started on port 3000');
  }

  private async startMainProcess(): Promise<void> {
    this.mainProcess = spawn('electron', ['.'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        ELECTRON_RELOAD: 'true'
      }
    });
  }

  private setupHotReload(): void {
    // Watch main process files
    chokidar.watch('src/main/**/*.ts').on('change', () => {
      if (!this.isReloading) {
        this.isReloading = true;
        this.restartMainProcess();
      }
    });
  }

  private async restartMainProcess(): Promise<void> {
    if (this.mainProcess) {
      this.mainProcess.kill();
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.startMainProcess();
    this.isReloading = false;
  }
}
```

## Quality Assurance Standards

### Code Quality Metrics

```typescript
interface QualityMetrics {
  codeCoverage: number;
  cyclomaticComplexity: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  securityVulnerabilities: number;
}

class QualityAssurance {
  private metrics: QualityMetrics;
  private thresholds = {
    codeCoverage: 80,
    cyclomaticComplexity: 10,
    maintainabilityIndex: 70,
    technicalDebt: 5, // hours
    securityVulnerabilities: 0
  };

  async assessCodeQuality(): Promise<QualityReport> {
    const report = {
      passed: true,
      metrics: await this.gatherMetrics(),
      violations: [] as string[]
    };

    // Check each threshold
    for (const [metric, threshold] of Object.entries(this.thresholds)) {
      const value = report.metrics[metric as keyof QualityMetrics];
      const passed = metric === 'securityVulnerabilities'
        ? value <= threshold
        : value >= threshold;

      if (!passed) {
        report.passed = false;
        report.violations.push(
          `${metric}: ${value} (threshold: ${threshold})`
        );
      }
    }

    return report;
  }

  private async gatherMetrics(): Promise<QualityMetrics> {
    return {
      codeCoverage: await this.getCodeCoverage(),
      cyclomaticComplexity: await this.getCyclomaticComplexity(),
      maintainabilityIndex: await this.getMaintainabilityIndex(),
      technicalDebt: await this.getTechnicalDebt(),
      securityVulnerabilities: await this.getSecurityVulnerabilities()
    };
  }
}
```

## Implementation Timeline

### Phase 1: Foundation (Weeks 1-2)
- ✅ Security architecture implementation
- ✅ Multi-process setup with IPC
- ✅ Context isolation and preload scripts
- ✅ Basic window management

### Phase 2: Platform Integration (Weeks 3-4)
- ✅ macOS-specific features (TouchBar, Dock)
- ✅ Windows-specific features (Jump List, Taskbar)
- ✅ Linux desktop integration
- ✅ Auto-update system

### Phase 3: Performance & Quality (Weeks 5-6)
- ✅ Memory management optimization
- ✅ Startup performance tuning
- ✅ Testing framework implementation
- ✅ Build and packaging setup

### Phase 4: Development Tools (Weeks 7-8)
- ✅ Hot reload development server
- ✅ Quality assurance metrics
- ✅ CI/CD pipeline integration
- ✅ Documentation and deployment

## Success Metrics

- **Startup Time**: < 3 seconds from launch to ready
- **Memory Usage**: < 200MB base memory footprint
- **Security Score**: 100% Electron security checklist compliance
- **Cross-Platform**: 100% feature parity across macOS/Windows/Linux
- **Code Coverage**: > 80% test coverage
- **Build Time**: < 5 minutes for all platforms
- **Update Success Rate**: > 95% successful auto-updates
- **Performance**: 60 FPS UI rendering, < 100ms response times

This comprehensive desktop development standards document provides enterprise-grade patterns for building secure, performant, and maintainable desktop applications across all major platforms.