---
title: Enterprise Development Tools Standards & IDE Configuration
version: 2.0
owner: Platform Engineering Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [IDE, Development_Environment, Code_Quality, Debugging_Tools]
primary_stack: "VS Code + JetBrains IDEs + Enterprise Toolchain"
---

# Enterprise Development Tools Standards & IDE Configuration

> **Platform Memory**: Comprehensive development tools ecosystem supporting billion-dollar scale operations across 8 platforms with unified developer experience

## Primary Development Tools Stack

### **Core Development Environment**
```yaml
Primary IDE: Visual Studio Code 1.90+ (Insiders for advanced features)
Secondary IDE: JetBrains (WebStorm, IntelliJ IDEA, DataGrip)
Terminal: Warp + Oh My Zsh with custom Tanqory theme
Package Managers: pnpm (primary), npm (fallback), yarn (legacy)
Node.js: 20.x LTS (managed via fnm/nvm)
Runtime Engines: Bun 1.x, Deno 1.x (specialized use cases)
Container Platform: Docker Desktop + Kubernetes (local dev)
Database Tools: TablePlus, DBeaver, Redis Insight
API Testing: Bruno (primary), Postman (team collaboration)
```

### **VS Code Enterprise Configuration**
```json
// .vscode/settings.json (workspace-level)
{
  "typescript.preferences.useAliasesForRenames": false,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.parameterTypes.enabled": true,
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,

  "editor.formatOnSave": true,
  "editor.formatOnPaste": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit",
    "source.removeUnusedImports": "explicit"
  },

  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.rulers": [80, 120],
  "editor.wordWrap": "bounded",
  "editor.wordWrapColumn": 120,

  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.trimFinalNewlines": true,

  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true,
    "**/coverage": true,
    "**/.nyc_output": true
  },

  "git.enableSmartCommit": true,
  "git.autofetch": true,
  "git.confirmSync": false,
  "git.enableStatusBarSync": true,

  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },

  "tailwindCSS.experimental.classRegex": [
    "cn\\(([^)]*)\\)",
    "cva\\(([^)]*)\\)"
  ]
}
```

### **Essential VS Code Extensions**
```typescript
// scripts/setup-dev-environment.ts
export const REQUIRED_VSCODE_EXTENSIONS = [
  // Language Support
  'ms-vscode.vscode-typescript-next',
  'bradlc.vscode-tailwindcss',
  'ms-vscode.vscode-json',
  'redhat.vscode-yaml',

  // Code Quality & Formatting
  'esbenp.prettier-vscode',
  'dbaeumer.vscode-eslint',
  'streetsidesoftware.code-spell-checker',
  'usernamehw.errorlens',

  // Git Integration
  'eamodio.gitlens',
  'github.vscode-pull-request-github',
  'github.vscode-github-actions',

  // Testing & Debugging
  'ms-playwright.playwright',
  'jest-runner-extension.vscode-jest-runner',
  'ms-vscode.vscode-jest',

  // Productivity
  'christian-kohler.path-intellisense',
  'formulahendry.auto-rename-tag',
  'ms-vscode.vscode-thunder-client',
  'rangav.vscode-thunder-client',

  // AI & Code Intelligence
  'github.copilot',
  'github.copilot-chat',
  'continue.continue',

  // Platform Specific
  'ms-vscode.vscode-react-native',
  'ms-dotnettools.vscode-dotnet-runtime',
  'golang.go'
] as const;

export interface DevEnvironmentSetup {
  vscodeExtensions: typeof REQUIRED_VSCODE_EXTENSIONS;
  nodeVersion: string;
  packageManager: 'pnpm' | 'npm';
  globalPackages: string[];
  dockerImages: string[];
}

export const TANQORY_DEV_SETUP: DevEnvironmentSetup = {
  vscodeExtensions: REQUIRED_VSCODE_EXTENSIONS,
  nodeVersion: '20.11.0',
  packageManager: 'pnpm',
  globalPackages: [
    '@tanqory/cli@latest',
    '@tanqory/dev-tools@latest',
    'turbo@latest',
    'nx@latest',
    'vercel@latest',
    'typescript@latest',
    'tsx@latest',
    'nodemon@latest'
  ],
  dockerImages: [
    'node:20-alpine',
    'postgres:15',
    'redis:7-alpine',
    'elasticsearch:8.11.0',
    'nginx:alpine'
  ]
};
```

### **JetBrains IDE Configuration**
```kotlin
// .idea/tanqory-settings.xml
<?xml version="1.0" encoding="UTF-8"?>
<application>
  <component name="TanqoryCodeStyle">
    <option name="TYPESCRIPT_INDENT_SIZE" value="2" />
    <option name="JAVASCRIPT_INDENT_SIZE" value="2" />
    <option name="JSON_INDENT_SIZE" value="2" />
    <option name="YAML_INDENT_SIZE" value="2" />

    <option name="ENABLE_ESLINT" value="true" />
    <option name="ENABLE_PRETTIER" value="true" />
    <option name="RUN_ESLINT_ON_SAVE" value="true" />
    <option name="RUN_PRETTIER_ON_SAVE" value="true" />

    <option name="TYPESCRIPT_STRICT_MODE" value="true" />
    <option name="ENABLE_TYPE_CHECKING" value="true" />
    <option name="SHOW_PARAMETER_HINTS" value="true" />
    <option name="SHOW_RETURN_TYPE_HINTS" value="true" />
  </component>

  <component name="TanqoryLiveTemplates">
    <templateSet group="React">
      <template name="tfc" toReformat="true" toShortenFQNames="true">
        <description>Tanqory Functional Component</description>
        <context>
          <option name="TYPESCRIPT" value="true" />
          <option name="TSX" value="true" />
        </context>
        <text>
interface $COMPONENT_NAME$Props {
  $PROPS$
}

export function $COMPONENT_NAME$({ $DESTRUCTURED_PROPS$ }: $COMPONENT_NAME$Props) {
  return (
    &lt;div&gt;
      $CONTENT$
    &lt;/div&gt;
  );
}
        </text>
        <variable name="COMPONENT_NAME" expression="" defaultValue="" alwaysStopAt="true" />
        <variable name="PROPS" expression="" defaultValue="" alwaysStopAt="true" />
        <variable name="DESTRUCTURED_PROPS" expression="" defaultValue="" alwaysStopAt="true" />
        <variable name="CONTENT" expression="" defaultValue="" alwaysStopAt="true" />
      </template>
    </templateSet>
  </component>
</application>
```

### **Code Formatting & Linting Standards**
```javascript
// .eslintrc.js (enterprise configuration)
module.exports = {
  extends: [
    '@tanqory/eslint-config',
    '@tanqory/eslint-config/react',
    '@tanqory/eslint-config/typescript'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'jsx-a11y',
    'import',
    'security',
    'sonarjs'
  ],
  rules: {
    // Tanqory-specific rules
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',

    // Security rules
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',

    // Code quality rules
    'sonarjs/cognitive-complexity': ['error', 15],
    'sonarjs/no-duplicate-string': ['error', 3],
    'sonarjs/no-identical-functions': 'error',

    // Import organization
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc',
        'caseInsensitive': true
      }
    }],

    // React best practices
    'react/jsx-no-leaked-render': 'error',
    'react/jsx-no-useless-fragment': 'error',
    'react/no-unstable-nested-components': 'error',
    'react-hooks/exhaustive-deps': 'error'
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
      extends: ['@tanqory/eslint-config/testing']
    },
    {
      files: ['**/e2e/**/*.ts'],
      extends: ['@tanqory/eslint-config/playwright']
    }
  ]
};
```

### **Prettier Configuration**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "embeddedLanguageFormatting": "auto",
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "proseWrap": "preserve",
  "insertPragma": false,
  "requirePragma": false,
  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
  "importOrder": [
    "^(react|react-dom)(/.*)?$",
    "^next(/.*)?$",
    "<THIRD_PARTY_MODULES>",
    "^@tanqory/(.*)$",
    "^@/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true,
  "tailwindConfig": "./tailwind.config.js",
  "tailwindFunctions": ["cn", "cva"]
}
```

### **Debugging & Profiling Tools**
```typescript
// .vscode/launch.json - Debugging configurations
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "args": ["dev"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "skipFiles": [
        "<node_internals>/**",
        "node_modules/**"
      ],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Debug Jest Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-coverage"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "disableOptimisticBPs": true,
      "env": {
        "NODE_ENV": "test"
      }
    },
    {
      "name": "Debug Current Test File",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${relativeFile}", "--runInBand", "--no-coverage"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    },
    {
      "name": "Debug Express.js Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/main.js",
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      },
      "preLaunchTask": "npm: build"
    }
  ]
}
```

### **Local Development Environment**
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: tanqory_dev
      POSTGRES_USER: tanqory
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

  maildev:
    image: maildev/maildev
    ports:
      - "1080:1080"
      - "1025:1025"

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:
```

### **Package Management Standards**
```typescript
// scripts/package-manager-setup.ts
export interface PackageManagerConfig {
  primary: 'pnpm' | 'npm' | 'yarn';
  lockfiles: string[];
  scripts: Record<string, string>;
  workspaceConfig: Record<string, unknown>;
}

export const TANQORY_PACKAGE_CONFIG: PackageManagerConfig = {
  primary: 'pnpm',
  lockfiles: ['pnpm-lock.yaml'],
  scripts: {
    'dev': 'turbo run dev --parallel',
    'build': 'turbo run build',
    'test': 'turbo run test',
    'test:e2e': 'turbo run test:e2e',
    'lint': 'turbo run lint',
    'lint:fix': 'turbo run lint:fix',
    'type-check': 'turbo run type-check',
    'clean': 'turbo run clean && rm -rf node_modules',
    'setup': 'pnpm install && pnpm run build',
    'setup:dev': 'pnpm install && docker-compose -f docker-compose.dev.yml up -d'
  },
  workspaceConfig: {
    'pnpm': {
      'workspaces': [
        'apps/*',
        'packages/*',
        'shared-libraries/*'
      ],
      'peerDependencyRules': {
        'allowedVersions': {
          'react': '18',
          'react-dom': '18'
        },
        'allowAny': ['@types/*']
      },
      'packageExtensions': {
        '@tanqory/ui-components': {
          'peerDependencies': {
            'react': '*',
            'react-dom': '*'
          }
        }
      }
    }
  }
};
```

### **TypeScript Configuration Standards**
```json
// tsconfig.json (base configuration)
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES6", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"],
      "@tanqory/ui": ["../../packages/ui/src"],
      "@tanqory/utils": ["../../packages/utils/src"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "dist",
    "build"
  ]
}
```

### **Database Development Tools**
```typescript
// tools/database/dev-setup.ts
import { Client } from 'pg';
import { createClient } from 'redis';

export interface DatabaseDevConfig {
  postgres: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  elasticsearch: {
    node: string;
    auth?: {
      username: string;
      password: string;
    };
  };
}

export const DEV_DATABASE_CONFIG: DatabaseDevConfig = {
  postgres: {
    host: 'localhost',
    port: 5432,
    database: 'tanqory_dev',
    username: 'tanqory',
    password: 'dev_password',
    ssl: false
  },
  redis: {
    host: 'localhost',
    port: 6379,
    db: 0
  },
  elasticsearch: {
    node: 'http://localhost:9200'
  }
};

export class DatabaseDevTools {
  private pgClient: Client;
  private redisClient: ReturnType<typeof createClient>;

  constructor(config: DatabaseDevConfig) {
    this.pgClient = new Client({
      host: config.postgres.host,
      port: config.postgres.port,
      database: config.postgres.database,
      user: config.postgres.username,
      password: config.postgres.password,
      ssl: config.postgres.ssl
    });

    this.redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port
      },
      password: config.redis.password,
      database: config.redis.db
    });
  }

  async setupDevelopmentData(): Promise<void> {
    await this.pgClient.connect();

    // Create development schemas
    await this.pgClient.query(`
      CREATE SCHEMA IF NOT EXISTS tanqory_core;
      CREATE SCHEMA IF NOT EXISTS tanqory_analytics;
      CREATE SCHEMA IF NOT EXISTS tanqory_cache;
    `);

    // Insert sample data
    const sampleProducts = await this.generateSampleProducts(100);
    await this.insertSampleData('products', sampleProducts);

    await this.pgClient.end();

    // Setup Redis development cache
    await this.redisClient.connect();
    await this.setupRedisDevCache();
    await this.redisClient.quit();
  }

  private async generateSampleProducts(count: number): Promise<any[]> {
    // Implementation for generating sample product data
    return Array.from({ length: count }, (_, i) => ({
      id: `prod_${i + 1}`,
      name: `Sample Product ${i + 1}`,
      price: Math.floor(Math.random() * 1000) + 10,
      category: ['electronics', 'clothing', 'books', 'home'][i % 4],
      created_at: new Date().toISOString()
    }));
  }

  private async insertSampleData(table: string, data: any[]): Promise<void> {
    // Implementation for inserting sample data
    for (const item of data) {
      const columns = Object.keys(item).join(', ');
      const values = Object.values(item).map((_, i) => `$${i + 1}`).join(', ');

      await this.pgClient.query(
        `INSERT INTO tanqory_core.${table} (${columns}) VALUES (${values})`,
        Object.values(item)
      );
    }
  }

  private async setupRedisDevCache(): Promise<void> {
    // Setup development cache data
    await this.redisClient.set('dev:cache_version', '1.0.0');
    await this.redisClient.set('dev:environment', 'development');
  }
}
```

### **Performance Profiling Tools**
```typescript
// tools/performance/profiler.ts
import { performance, PerformanceObserver } from 'perf_hooks';

export interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  metadata?: Record<string, unknown>;
}

export class TanqoryPerformanceProfiler {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private observer: PerformanceObserver;

  constructor() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime,
          endTime: entry.startTime + entry.duration
        });
      }
    });

    this.observer.observe({ entryTypes: ['measure'] });
  }

  startTimer(name: string): void {
    performance.mark(`${name}-start`);
  }

  endTimer(name: string, metadata?: Record<string, unknown>): PerformanceMetric {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    const metric = this.metrics.get(name);
    if (metric && metadata) {
      metric.metadata = metadata;
    }

    return metric!;
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.set(metric.name, metric);

    // Log slow operations (> 100ms)
    if (metric.duration > 100) {
      console.warn(`Slow operation detected: ${metric.name} took ${metric.duration.toFixed(2)}ms`);
    }
  }

  generateReport(): string {
    const report = Array.from(this.metrics.values())
      .sort((a, b) => b.duration - a.duration)
      .map(metric => `${metric.name}: ${metric.duration.toFixed(2)}ms`)
      .join('\n');

    return `Performance Report:\n${report}`;
  }

  clear(): void {
    this.metrics.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// Usage example
export const globalProfiler = new TanqoryPerformanceProfiler();

export function profileAsync<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> {
  return new Promise((resolve, reject) => {
    globalProfiler.startTimer(name);
    fn()
      .then(result => {
        globalProfiler.endTimer(name, metadata);
        resolve(result);
      })
      .catch(error => {
        globalProfiler.endTimer(name, { error: error.message, ...metadata });
        reject(error);
      });
  });
}
```

### **Cost Optimization Strategies**

#### **Development Environment Costs**
- **Local Development**: Docker containers vs cloud development environments
- **IDE Licensing**: VS Code (free) + JetBrains (team licenses)
- **Tool Subscriptions**: Managed vs self-hosted solutions
- **Cloud Development**: GitHub Codespaces for remote development

#### **Infrastructure Costs**
- **Database Development**: Local containers vs managed dev instances
- **Testing Infrastructure**: Parallel testing with resource optimization
- **Build Resources**: Optimized Docker layers and build caching

### **Security & Compliance**

#### **Code Security Standards**
- **Static Analysis**: ESLint security rules + SonarQube integration
- **Dependency Scanning**: Automated vulnerability detection
- **Secret Management**: Environment variable validation
- **Code Review**: Automated security checks in PR process

#### **Development Environment Security**
- **Access Control**: IDE extensions security review
- **Local Data**: Encryption of local development databases
- **Network Security**: VPN requirements for remote development
- **Compliance**: GDPR and data protection in development

### **Integration with Platform Ecosystem**
- **Multi-Platform Development**: Shared tooling across web, mobile, backend
- **Code Sharing**: Monorepo tooling with Turborepo/Nx
- **API Development**: Unified API testing and documentation
- **Database Management**: Multi-database development environment
- **Analytics Integration**: Development analytics and performance tracking

---

**Document Classification**: CONFIDENTIAL
**Technical Scope**: IDE, Development Environment, Code Quality, Debugging Tools
**Platform Priority**: Foundation (All Platforms)
**Review Cycle**: Quarterly
**Last Updated**: September 16, 2025
**Version**: 2.0.0