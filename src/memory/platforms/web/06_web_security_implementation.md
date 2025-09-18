---
title: Web Security Implementation & Advanced Threat Protection
version: 2.0
owner: Security Engineering Team + Frontend Architecture Team
last_reviewed: 2025-09-16
next_review: 2025-10-16
classification: CONFIDENTIAL
technical_scope: [Web_Security, CSP, XSS_Protection, CSRF, Next.js, TypeScript]
primary_stack: "Next.js + CSP + HTTPS + WAF + Security Headers + OWASP (see official technology versions)"
---

# Web Security Implementation & Advanced Threat Protection

> **Platform Memory**: Enterprise-grade web security framework implementing defense-in-depth strategies for billion-dollar e-commerce operations with zero-trust architecture

## Web Security Architecture Strategy

### **Security Philosophy & Standards**
```yaml
Security Framework: Defense-in-depth + Zero-trust architecture
Compliance Standards: OWASP Top 10 + SOC 2 Type II + PCI DSS Level 1
Threat Protection: Real-time monitoring + Automated response + ML-based detection
Security Headers: Comprehensive CSP + HSTS + Security headers
Data Protection: End-to-end encryption + PII anonymization + GDPR compliance
Incident Response: <5min detection + <15min mitigation + <1hr notification
```

### **Content Security Policy (CSP) Implementation**
```typescript
// lib/security/content-security-policy.ts
export class ContentSecurityPolicyManager {
  // Generate comprehensive CSP headers
  static generateCSPHeader(environment: 'development' | 'production'): string {
    const basePolicy = {
      'default-src': ["'self'"],
      'script-src': [
        "'self'",
        "'unsafe-inline'", // Only for development
        "'unsafe-eval'", // Only for development
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://api.tanqory.com',
        'https://cdn.tanqory.com'
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'", // Required for CSS-in-JS
        'https://fonts.googleapis.com',
        'https://cdn.tanqory.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https:',
        'https://*.tanqory.com',
        'https://images.tanqory.com',
        'https://cdn.tanqory.com',
        'https://www.google-analytics.com',
        'https://www.googletagmanager.com'
      ],
      'font-src': [
        "'self'",
        'data:',
        'https://fonts.gstatic.com',
        'https://cdn.tanqory.com'
      ],
      'connect-src': [
        "'self'",
        'https://api.tanqory.com',
        'https://analytics.tanqory.com',
        'https://www.google-analytics.com',
        'https://vitals.vercel-insights.com',
        'https://js.stripe.com',
        'wss://ws.tanqory.com' // WebSocket connections
      ],
      'frame-src': [
        "'self'",
        'https://js.stripe.com',
        'https://checkout.stripe.com',
        'https://www.youtube.com',
        'https://player.vimeo.com'
      ],
      'frame-ancestors': [
        "'none'" // Prevent clickjacking
      ],
      'form-action': [
        "'self'",
        'https://api.tanqory.com',
        'https://checkout.stripe.com'
      ],
      'base-uri': ["'self'"],
      'object-src': ["'none'"],
      'media-src': [
        "'self'",
        'https://cdn.tanqory.com',
        'https://media.tanqory.com'
      ],
      'worker-src': [
        "'self'",
        'blob:'
      ],
      'manifest-src': ["'self'"],
      'upgrade-insecure-requests': [] // Force HTTPS
    };

    // Remove unsafe policies in production
    if (environment === 'production') {
      basePolicy['script-src'] = basePolicy['script-src'].filter(
        src => !src.includes('unsafe')
      );

      // Add nonce-based script execution
      basePolicy['script-src'].push("'nonce-{NONCE}'");
    }

    // Convert to CSP string
    return Object.entries(basePolicy)
      .map(([directive, sources]) =>
        sources.length > 0
          ? `${directive} ${sources.join(' ')}`
          : directive
      )
      .join('; ');
  }

  // Generate nonce for inline scripts
  static generateNonce(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(16).toString('base64');
  }

  // CSP violation reporting
  static handleCSPViolation(report: CSPViolation): void {
    console.warn('CSP Violation detected:', report);

    // Send to security monitoring
    fetch('/api/security/csp-violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        violation: report,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    }).catch(error => {
      console.error('Failed to report CSP violation:', error);
    });

    // Auto-block suspicious sources
    if (this.isSuspiciousViolation(report)) {
      this.blockMaliciousSource(report['blocked-uri']);
    }
  }

  private static isSuspiciousViolation(report: CSPViolation): boolean {
    const suspiciousPatterns = [
      /javascript:/i,
      /data:text\/html/i,
      /eval\(/i,
      /onclick=/i,
      /onerror=/i,
      /\.exe$/i,
      /\.bat$/i
    ];

    const blockedUri = report['blocked-uri'];
    return suspiciousPatterns.some(pattern => pattern.test(blockedUri));
  }

  private static blockMaliciousSource(source: string): void {
    // Add to real-time blocklist
    fetch('/api/security/block-source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source,
        reason: 'CSP violation - suspicious content',
        timestamp: Date.now()
      })
    });
  }
}

interface CSPViolation {
  'document-uri': string;
  'referrer': string;
  'violated-directive': string;
  'effective-directive': string;
  'original-policy': string;
  'blocked-uri': string;
  'status-code': number;
  'script-sample': string;
}

// Next.js middleware for CSP
export function securityMiddleware(request: NextRequest) {
  const nonce = ContentSecurityPolicyManager.generateNonce();
  const csp = ContentSecurityPolicyManager.generateCSPHeader('production')
    .replace('{NONCE}', nonce);

  const response = NextResponse.next();

  // Security headers
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
  response.headers.set('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // Store nonce for use in components
  response.headers.set('X-Nonce', nonce);

  return response;
}
```

### **XSS Protection & Input Sanitization**
```typescript
// lib/security/xss-protection.ts
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export class XSSProtection {
  private static domPurify: typeof DOMPurify;

  static init() {
    // Initialize DOMPurify for server-side use
    if (typeof window === 'undefined') {
      const window = new JSDOM('').window;
      this.domPurify = DOMPurify(window);
    } else {
      this.domPurify = DOMPurify;
    }
  }

  // Sanitize HTML content
  static sanitizeHTML(dirty: string, options: {
    allowedTags?: string[];
    allowedAttributes?: string[];
    stripAll?: boolean;
  } = {}): string {
    const {
      allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes = ['class', 'id'],
      stripAll = false
    } = options;

    if (stripAll) {
      return this.domPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    }

    return this.domPurify.sanitize(dirty, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttributes,
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: true,
      FORBID_SCRIPT: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'iframe'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false
    });
  }

  // Sanitize user input
  static sanitizeInput(input: string, type: 'text' | 'email' | 'url' | 'number' = 'text'): string {
    if (!input || typeof input !== 'string') return '';

    // Remove potential XSS vectors
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
      .replace(/on\w+\s*=\s*'[^']*'/gi, '')
      .replace(/data:text\/html/gi, '')
      .replace(/eval\s*\(/gi, '')
      .replace(/expression\s*\(/gi, '');

    // Type-specific sanitization
    switch (type) {
      case 'email':
        sanitized = sanitized.replace(/[^\w@.-]/g, '').toLowerCase();
        break;
      case 'url':
        sanitized = sanitized.replace(/[^a-zA-Z0-9:/?#[\]@!$&'()*+,;=._~-]/g, '');
        break;
      case 'number':
        sanitized = sanitized.replace(/[^\d.-]/g, '');
        break;
      default:
        // Basic text sanitization
        sanitized = sanitized
          .replace(/[<>]/g, '')
          .trim()
          .substring(0, 1000); // Limit length
    }

    return sanitized;
  }

  // Validate and sanitize form data
  static validateFormData(data: Record<string, any>): {
    isValid: boolean;
    sanitized: Record<string, any>;
    errors: string[];
  } {
    const sanitized: Record<string, any> = {};
    const errors: string[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // Check for potential XSS
        if (this.containsXSS(value)) {
          errors.push(`Potential XSS detected in field: ${key}`);
          continue;
        }

        // Sanitize based on field name
        const fieldType = this.getFieldType(key);
        sanitized[key] = this.sanitizeInput(value, fieldType);
      } else {
        sanitized[key] = value;
      }
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    };
  }

  private static containsXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
      /vbscript:/gi,
      /livescript:/gi,
      /mocha:/gi,
      /charset=/gi,
      /window\./gi,
      /document\./gi,
      /\.cookie/gi,
      /alert\s*\(/gi,
      /confirm\s*\(/gi,
      /prompt\s*\(/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  private static getFieldType(fieldName: string): 'text' | 'email' | 'url' | 'number' {
    if (fieldName.toLowerCase().includes('email')) return 'email';
    if (fieldName.toLowerCase().includes('url') || fieldName.toLowerCase().includes('link')) return 'url';
    if (fieldName.toLowerCase().includes('phone') || fieldName.toLowerCase().includes('number')) return 'number';
    return 'text';
  }
}

// React component for safe HTML rendering
interface SafeHTMLProps {
  content: string;
  allowedTags?: string[];
  className?: string;
  stripAll?: boolean;
}

export function SafeHTML({
  content,
  allowedTags,
  className,
  stripAll = false
}: SafeHTMLProps) {
  const sanitizedContent = XSSProtection.sanitizeHTML(content, {
    allowedTags,
    stripAll
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
}

// Input validation hook
export function useSecureInput(initialValue: string = '') {
  const [value, setValue] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState<string>('');

  const handleChange = (newValue: string) => {
    const sanitized = XSSProtection.sanitizeInput(newValue);

    if (XSSProtection.containsXSS(newValue)) {
      setIsValid(false);
      setError('Invalid characters detected');
      return;
    }

    setValue(sanitized);
    setIsValid(true);
    setError('');
  };

  return {
    value,
    isValid,
    error,
    onChange: handleChange,
    reset: () => {
      setValue(initialValue);
      setIsValid(true);
      setError('');
    }
  };
}
```

### **CSRF Protection & Token Management**
```typescript
// lib/security/csrf-protection.ts
import { createHash, randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_LIFETIME = 3600000; // 1 hour in ms

  // Generate CSRF token
  static generateToken(sessionId: string): string {
    const timestamp = Date.now();
    const randomValue = randomBytes(this.TOKEN_LENGTH).toString('hex');
    const tokenData = `${sessionId}:${timestamp}:${randomValue}`;

    const hash = createHash('sha256')
      .update(tokenData)
      .update(process.env.CSRF_SECRET!)
      .digest('hex');

    return Buffer.from(`${timestamp}:${randomValue}:${hash}`).toString('base64');
  }

  // Validate CSRF token
  static validateToken(token: string, sessionId: string): boolean {
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf8');
      const [timestamp, randomValue, hash] = decoded.split(':');

      // Check token age
      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > this.TOKEN_LIFETIME) {
        console.warn('CSRF token expired');
        return false;
      }

      // Verify hash
      const expectedTokenData = `${sessionId}:${timestamp}:${randomValue}`;
      const expectedHash = createHash('sha256')
        .update(expectedTokenData)
        .update(process.env.CSRF_SECRET!)
        .digest('hex');

      return hash === expectedHash;
    } catch (error) {
      console.error('CSRF token validation error:', error);
      return false;
    }
  }

  // Middleware for CSRF protection
  static middleware(request: NextRequest): NextResponse | null {
    const { method, headers, nextUrl } = request;

    // Skip CSRF for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return null;
    }

    // Skip CSRF for API routes that use bearer tokens
    const authHeader = headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return null;
    }

    // Get CSRF token from header or form data
    const csrfToken = headers.get('x-csrf-token') ||
                     headers.get('csrf-token');

    if (!csrfToken) {
      console.warn('CSRF token missing');
      return new NextResponse('CSRF token required', { status: 403 });
    }

    // Get session ID (from cookie or JWT)
    const sessionCookie = request.cookies.get('session')?.value;
    if (!sessionCookie) {
      console.warn('Session cookie missing for CSRF validation');
      return new NextResponse('Session required', { status: 401 });
    }

    const sessionId = this.extractSessionId(sessionCookie);
    if (!this.validateToken(csrfToken, sessionId)) {
      console.warn('Invalid CSRF token');
      this.logCSRFAttempt(request, csrfToken);
      return new NextResponse('Invalid CSRF token', { status: 403 });
    }

    return null;
  }

  private static extractSessionId(sessionCookie: string): string {
    try {
      // Extract session ID from JWT or session cookie
      const payload = JSON.parse(
        Buffer.from(sessionCookie.split('.')[1], 'base64').toString()
      );
      return payload.sub || payload.sessionId;
    } catch {
      return sessionCookie; // Fallback to cookie value
    }
  }

  private static logCSRFAttempt(request: NextRequest, token: string): void {
    const logData = {
      timestamp: Date.now(),
      ip: request.ip,
      userAgent: request.headers.get('user-agent'),
      url: request.nextUrl.toString(),
      method: request.method,
      token: token.substring(0, 10) + '...', // Partial token for debugging
      headers: Object.fromEntries(request.headers.entries())
    };

    // Send to security monitoring
    fetch('/api/security/csrf-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    }).catch(console.error);
  }
}

// React hook for CSRF protection
export function useCSRFToken() {
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    // Get CSRF token from server
    fetch('/api/auth/csrf-token', {
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => setToken(data.token))
    .catch(console.error);
  }, []);

  return token;
}

// Secure form component with CSRF protection
interface SecureFormProps {
  onSubmit: (data: FormData, csrfToken: string) => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function SecureForm({ onSubmit, children, className }: SecureFormProps) {
  const csrfToken = useCSRFToken();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!csrfToken) {
      alert('Security token not available. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData, csrfToken);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
    >
      <input type="hidden" name="csrf_token" value={csrfToken} />
      {children}
      <button
        type="submit"
        disabled={isSubmitting || !csrfToken}
        className="disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### **HTTPS & Security Headers Implementation**
```typescript
// lib/security/https-enforcement.ts
import { NextRequest, NextResponse } from 'next/server';

export class HTTPSEnforcement {
  // Force HTTPS redirect
  static enforceHTTPS(request: NextRequest): NextResponse | null {
    const { protocol, host, pathname, search } = new URL(request.url);

    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    // Redirect HTTP to HTTPS
    if (protocol === 'http:') {
      const httpsUrl = `https://${host}${pathname}${search}`;
      return NextResponse.redirect(httpsUrl, 301);
    }

    return null;
  }

  // Comprehensive security headers
  static setSecurityHeaders(response: NextResponse): void {
    const headers = {
      // HTTPS enforcement
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

      // Content type sniffing protection
      'X-Content-Type-Options': 'nosniff',

      // Clickjacking protection
      'X-Frame-Options': 'DENY',

      // XSS protection (legacy browsers)
      'X-XSS-Protection': '1; mode=block',

      // Referrer policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Feature policy / Permissions policy
      'Permissions-Policy': [
        'accelerometer=()',
        'ambient-light-sensor=()',
        'autoplay=()',
        'battery=()',
        'camera=()',
        'cross-origin-isolated=()',
        'display-capture=()',
        'document-domain=()',
        'encrypted-media=()',
        'execution-while-not-rendered=()',
        'execution-while-out-of-viewport=()',
        'fullscreen=()',
        'geolocation=()',
        'gyroscope=()',
        'keyboard-map=()',
        'magnetometer=()',
        'microphone=()',
        'midi=()',
        'navigation-override=()',
        'payment=()',
        'picture-in-picture=()',
        'publickey-credentials-get=()',
        'screen-wake-lock=()',
        'sync-xhr=()',
        'usb=()',
        'web-share=()',
        'xr-spatial-tracking=()'
      ].join(', '),

      // Cross-origin policies
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',

      // Remove server information
      'Server': '',
      'X-Powered-By': '',

      // Cache control for security
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Certificate pinning configuration
  static generateHPKPHeader(pins: string[]): string {
    const pinDirectives = pins.map(pin => `pin-sha256="${pin}"`).join('; ');
    return `${pinDirectives}; max-age=5184000; includeSubDomains; report-uri="/api/security/hpkp-report"`;
  }

  // Security headers for API routes
  static setAPISecurityHeaders(response: NextResponse): void {
    this.setSecurityHeaders(response);

    // Additional API-specific headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'https://tanqory.com');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
  }
}

// TLS configuration for production
export const tlsConfig = {
  // Minimum TLS version
  minVersion: 'TLSv1.2',

  // Preferred cipher suites (ordered by preference)
  cipherSuites: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256',
    'ECDHE-RSA-AES256-SHA',
    'ECDHE-RSA-AES128-SHA',
    'DHE-RSA-AES256-GCM-SHA384',
    'DHE-RSA-AES128-GCM-SHA256',
    'DHE-RSA-AES256-SHA256',
    'DHE-RSA-AES128-SHA256',
    'DHE-RSA-AES256-SHA',
    'DHE-RSA-AES128-SHA'
  ],

  // HSTS preload requirements
  hstsPreload: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // Certificate transparency
  expectCT: {
    maxAge: 86400, // 24 hours
    enforce: true,
    reportUri: '/api/security/ct-report'
  }
};
```

### **Authentication Integration & Security**
```typescript
// lib/security/auth-security.ts
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { hash, compare } from 'bcryptjs';
import { randomBytes, timingSafeEqual } from 'crypto';

export class AuthSecurity {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;
  private static readonly SALT_ROUNDS = 12;

  // Secure password hashing
  static async hashPassword(password: string): Promise<string> {
    // Add pepper (server-side secret)
    const pepperedPassword = password + process.env.PASSWORD_PEPPER!;
    return hash(pepperedPassword, this.SALT_ROUNDS);
  }

  // Secure password verification
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const pepperedPassword = password + process.env.PASSWORD_PEPPER!;
    return compare(pepperedPassword, hashedPassword);
  }

  // Generate secure JWT tokens
  static generateTokens(payload: { userId: string; email: string; roles: string[] }): {
    accessToken: string;
    refreshToken: string;
  } {
    const now = Date.now();
    const accessTokenPayload = {
      ...payload,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + 15 * 60 * 1000) / 1000), // 15 minutes
      type: 'access'
    };

    const refreshTokenPayload = {
      userId: payload.userId,
      iat: Math.floor(now / 1000),
      exp: Math.floor((now + 7 * 24 * 60 * 60 * 1000) / 1000), // 7 days
      type: 'refresh',
      jti: randomBytes(16).toString('hex') // JWT ID for revocation
    };

    const accessToken = sign(accessTokenPayload, this.JWT_SECRET, { algorithm: 'HS256' });
    const refreshToken = sign(refreshTokenPayload, this.REFRESH_SECRET, { algorithm: 'HS256' });

    return { accessToken, refreshToken };
  }

  // Verify JWT token with security checks
  static verifyToken(token: string, type: 'access' | 'refresh' = 'access'): JwtPayload | null {
    try {
      const secret = type === 'access' ? this.JWT_SECRET : this.REFRESH_SECRET;
      const payload = verify(token, secret, { algorithms: ['HS256'] }) as JwtPayload;

      // Verify token type
      if (payload.type !== type) {
        throw new Error('Invalid token type');
      }

      // Check if token is expired (additional check)
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }

      return payload;
    } catch (error) {
      console.warn('Token verification failed:', error.message);
      return null;
    }
  }

  // Rate limiting for authentication attempts
  private static attemptCounts = new Map<string, { count: number; resetTime: number }>();

  static checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now();
    const record = this.attemptCounts.get(identifier);

    if (!record || now > record.resetTime) {
      // Reset or initialize
      this.attemptCounts.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false; // Rate limit exceeded
    }

    record.count++;
    return true;
  }

  // Secure session management
  static generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  static createSessionCookie(sessionId: string): string {
    const cookieOptions = [
      `session=${sessionId}`,
      'HttpOnly',
      'Secure',
      'SameSite=Strict',
      `Max-Age=${7 * 24 * 60 * 60}`, // 7 days
      'Path=/'
    ];

    return cookieOptions.join('; ');
  }

  // Multi-factor authentication
  static generateTOTPSecret(): string {
    return randomBytes(20).toString('base32');
  }

  static generateBackupCodes(count: number = 10): string[] {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  // Constant-time string comparison to prevent timing attacks
  static constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    const bufferA = Buffer.from(a);
    const bufferB = Buffer.from(b);

    return timingSafeEqual(bufferA, bufferB);
  }
}

// Secure authentication middleware
export function authMiddleware(requiredRoles: string[] = []) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return new NextResponse('Authentication required', { status: 401 });
    }

    const payload = AuthSecurity.verifyToken(token, 'access');
    if (!payload) {
      return new NextResponse('Invalid or expired token', { status: 401 });
    }

    // Check role-based access
    if (requiredRoles.length > 0) {
      const userRoles = payload.roles || [];
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        return new NextResponse('Insufficient permissions', { status: 403 });
      }
    }

    // Add user info to request
    req.headers.set('X-User-ID', payload.userId);
    req.headers.set('X-User-Email', payload.email);
    req.headers.set('X-User-Roles', JSON.stringify(payload.roles));

    return null;
  };
}
```

### **Data Validation & Sanitization**
```typescript
// lib/security/data-validation.ts
import { z } from 'zod';

export class DataValidation {
  // Common validation schemas
  static readonly schemas = {
    email: z.string().email().max(255),
    password: z.string()
      .min(8)
      .max(128)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, lowercase letter, number, and special character'),

    username: z.string()
      .min(3)
      .max(30)
      .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),

    url: z.string().url().max(2048),

    phoneNumber: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),

    creditCard: z.string()
      .regex(/^\d{13,19}$/, 'Invalid credit card number'),

    // PII fields with extra protection
    ssn: z.string()
      .regex(/^\d{3}-?\d{2}-?\d{4}$/, 'Invalid SSN format')
      .transform(val => val.replace(/-/g, '')),

    dateOfBirth: z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
      .refine(date => {
        const birthDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return age >= 13 && age <= 120;
      }, 'Invalid date of birth'),
  };

  // Validate API request data
  static validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    errors?: string[];
  } {
    try {
      const validatedData = schema.parse(data);
      return { success: true, data: validatedData };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { success: false, errors: ['Validation failed'] };
    }
  }

  // Sanitize file uploads
  static validateFileUpload(file: File, options: {
    allowedTypes?: string[];
    maxSize?: number;
    allowedExtensions?: string[];
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const {
      allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxSize = 5 * 1024 * 1024, // 5MB
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    } = options;

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed`);
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size ${file.size} exceeds limit of ${maxSize} bytes`);
    }

    // Check file extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} not allowed`);
    }

    // Check for malicious file names
    if (this.containsMaliciousFileName(file.name)) {
      errors.push('Suspicious file name detected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static containsMaliciousFileName(fileName: string): boolean {
    const maliciousPatterns = [
      /\.\./,           // Directory traversal
      /[<>:"|?*]/,      // Invalid characters
      /\.exe$/i,        // Executable files
      /\.bat$/i,
      /\.cmd$/i,
      /\.scr$/i,
      /\.pif$/i,
      /\.php$/i,
      /\.jsp$/i,
      /\.asp$/i,
      /\.js$/i,
      /\.vbs$/i,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i // Windows reserved names
    ];

    return maliciousPatterns.some(pattern => pattern.test(fileName));
  }

  // PII detection and masking
  static maskPII(data: Record<string, any>): Record<string, any> {
    const masked = { ...data };
    const piiFields = ['ssn', 'creditCard', 'password', 'token'];

    const maskValue = (value: string, showLast: number = 4): string => {
      if (value.length <= showLast) return '*'.repeat(value.length);
      return '*'.repeat(value.length - showLast) + value.slice(-showLast);
    };

    for (const [key, value] of Object.entries(masked)) {
      if (typeof value === 'string' && piiFields.some(field =>
        key.toLowerCase().includes(field.toLowerCase())
      )) {
        masked[key] = maskValue(value);
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskPII(value);
      }
    }

    return masked;
  }
}

// Secure input components with validation
interface SecureInputProps {
  name: string;
  type: 'email' | 'password' | 'text' | 'url' | 'tel';
  required?: boolean;
  className?: string;
  placeholder?: string;
  onChange?: (value: string, isValid: boolean) => void;
}

export function SecureInput({
  name,
  type,
  required = false,
  className,
  placeholder,
  onChange
}: SecureInputProps) {
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  const getSchema = () => {
    switch (type) {
      case 'email': return DataValidation.schemas.email;
      case 'password': return DataValidation.schemas.password;
      case 'url': return DataValidation.schemas.url;
      case 'tel': return DataValidation.schemas.phoneNumber;
      default: return z.string().min(1).max(1000);
    }
  };

  const validateInput = (inputValue: string) => {
    const schema = required ? getSchema() : getSchema().optional();
    const result = DataValidation.validateRequest(schema, inputValue);

    setErrors(result.errors || []);
    onChange?.(inputValue, result.success);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = XSSProtection.sanitizeInput(e.target.value, type === 'email' ? 'email' : 'text');
    setValue(newValue);
    validateInput(newValue);
  };

  return (
    <div>
      <input
        name={name}
        type={type === 'tel' ? 'tel' : type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'border rounded px-3 py-2 w-full',
          errors.length > 0 ? 'border-red-500' : 'border-gray-300',
          className
        )}
        required={required}
        autoComplete={type === 'password' ? 'new-password' : 'on'}
      />
      {errors.length > 0 && (
        <div className="text-red-500 text-sm mt-1">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### **Security Monitoring & Alerting**
```typescript
// lib/security/monitoring.ts

interface SecurityEvent {
  type: 'csp_violation' | 'csrf_attempt' | 'auth_failure' | 'suspicious_activity' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  details: Record<string, any>;
  timestamp: number;
  userId?: string;
  ip?: string;
}

export class SecurityMonitoring {
  private static readonly MAX_QUEUE_SIZE = 1000;
  private static eventQueue: SecurityEvent[] = [];

  // Log security events
  static logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.eventQueue.push(securityEvent);

    // Prevent memory leaks
    if (this.eventQueue.length > this.MAX_QUEUE_SIZE) {
      this.eventQueue.shift();
    }

    // Immediate alerting for critical events
    if (event.severity === 'critical') {
      this.sendImmediateAlert(securityEvent);
    }

    // Send to monitoring service
    this.sendToMonitoring(securityEvent);
  }

  // Send immediate alerts for critical security events
  private static async sendImmediateAlert(event: SecurityEvent): Promise<void> {
    try {
      // Multiple alerting channels
      await Promise.allSettled([
        this.sendSlackAlert(event),
        this.sendEmailAlert(event),
        this.sendSMSAlert(event)
      ]);
    } catch (error) {
      console.error('Failed to send immediate security alert:', error);
    }
  }

  private static async sendSlackAlert(event: SecurityEvent): Promise<void> {
    const webhookUrl = process.env.SLACK_SECURITY_WEBHOOK!;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 CRITICAL SECURITY ALERT`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Event Type', value: event.type, short: true },
            { title: 'Severity', value: event.severity.toUpperCase(), short: true },
            { title: 'Source', value: event.source, short: true },
            { title: 'IP Address', value: event.ip || 'Unknown', short: true },
            { title: 'User ID', value: event.userId || 'Anonymous', short: true },
            { title: 'Timestamp', value: new Date(event.timestamp).toISOString(), short: true },
            { title: 'Details', value: JSON.stringify(event.details, null, 2), short: false }
          ]
        }]
      })
    });
  }

  private static async sendEmailAlert(event: SecurityEvent): Promise<void> {
    // Implementation depends on email service (SendGrid, AWS SES, etc.)
    const emailData = {
      to: process.env.SECURITY_TEAM_EMAIL!,
      subject: `CRITICAL SECURITY ALERT: ${event.type}`,
      html: `
        <h2>🚨 Critical Security Alert</h2>
        <p><strong>Event Type:</strong> ${event.type}</p>
        <p><strong>Severity:</strong> ${event.severity.toUpperCase()}</p>
        <p><strong>Source:</strong> ${event.source}</p>
        <p><strong>IP Address:</strong> ${event.ip || 'Unknown'}</p>
        <p><strong>User ID:</strong> ${event.userId || 'Anonymous'}</p>
        <p><strong>Timestamp:</strong> ${new Date(event.timestamp).toISOString()}</p>
        <h3>Details:</h3>
        <pre>${JSON.stringify(event.details, null, 2)}</pre>
      `
    };

    await fetch('/api/internal/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData)
    });
  }

  private static async sendSMSAlert(event: SecurityEvent): Promise<void> {
    if (event.severity !== 'critical') return;

    const message = `SECURITY ALERT: ${event.type} detected from ${event.ip}. Check dashboard immediately.`;

    await fetch('/api/internal/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: process.env.SECURITY_TEAM_PHONE!,
        message
      })
    });
  }

  private static async sendToMonitoring(event: SecurityEvent): Promise<void> {
    try {
      await fetch('/api/internal/security-monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send event to monitoring:', error);
    }
  }

  // Anomaly detection
  static analyzeSecurityPatterns(): void {
    const recentEvents = this.eventQueue.filter(
      event => Date.now() - event.timestamp < 3600000 // Last hour
    );

    // Detect brute force attacks
    const authFailures = recentEvents.filter(e => e.type === 'auth_failure');
    this.detectBruteForce(authFailures);

    // Detect suspicious user behavior
    this.detectSuspiciousActivity(recentEvents);

    // Detect potential data exfiltration
    this.detectDataExfiltration(recentEvents);
  }

  private static detectBruteForce(authFailures: SecurityEvent[]): void {
    const ipCounts = new Map<string, number>();

    authFailures.forEach(event => {
      if (event.ip) {
        ipCounts.set(event.ip, (ipCounts.get(event.ip) || 0) + 1);
      }
    });

    ipCounts.forEach((count, ip) => {
      if (count >= 10) { // 10 failed attempts in an hour
        this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          source: 'brute_force_detector',
          details: {
            suspectedBruteForce: true,
            ip,
            attemptCount: count,
            timeWindow: '1 hour'
          },
          ip
        });
      }
    });
  }

  private static detectSuspiciousActivity(events: SecurityEvent[]): void {
    const userActivities = new Map<string, SecurityEvent[]>();

    events.forEach(event => {
      if (event.userId) {
        if (!userActivities.has(event.userId)) {
          userActivities.set(event.userId, []);
        }
        userActivities.get(event.userId)!.push(event);
      }
    });

    userActivities.forEach((userEvents, userId) => {
      const uniqueIPs = new Set(userEvents.map(e => e.ip).filter(Boolean));

      // Suspicious: Same user from multiple IPs
      if (uniqueIPs.size > 3) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'medium',
          source: 'activity_analyzer',
          details: {
            suspectedAccountTakeover: true,
            uniqueIPs: Array.from(uniqueIPs),
            eventCount: userEvents.length
          },
          userId
        });
      }
    });
  }

  private static detectDataExfiltration(events: SecurityEvent[]): void {
    // Look for patterns indicating potential data theft
    const suspiciousPatterns = [
      'large_data_download',
      'bulk_api_requests',
      'unauthorized_data_access'
    ];

    events.forEach(event => {
      const details = JSON.stringify(event.details).toLowerCase();
      if (suspiciousPatterns.some(pattern => details.includes(pattern))) {
        this.logSecurityEvent({
          type: 'data_breach',
          severity: 'critical',
          source: 'data_exfiltration_detector',
          details: {
            originalEvent: event,
            suspectedDataExfiltration: true
          },
          userId: event.userId,
          ip: event.ip
        });
      }
    });
  }

  // Generate security reports
  static generateSecurityReport(timeframe: 'hour' | 'day' | 'week' = 'day'): {
    summary: Record<string, number>;
    criticalEvents: SecurityEvent[];
    trends: Record<string, number>;
  } {
    const timeMs = {
      hour: 3600000,
      day: 86400000,
      week: 604800000
    }[timeframe];

    const relevantEvents = this.eventQueue.filter(
      event => Date.now() - event.timestamp < timeMs
    );

    const summary = relevantEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const criticalEvents = relevantEvents.filter(
      event => event.severity === 'critical'
    );

    const trends = this.calculateSecurityTrends(relevantEvents);

    return { summary, criticalEvents, trends };
  }

  private static calculateSecurityTrends(events: SecurityEvent[]): Record<string, number> {
    // Simple trend calculation - could be enhanced with ML
    const now = Date.now();
    const halfTime = now - (now - Math.min(...events.map(e => e.timestamp))) / 2;

    const recentEvents = events.filter(e => e.timestamp > halfTime);
    const olderEvents = events.filter(e => e.timestamp <= halfTime);

    const trends: Record<string, number> = {};

    Object.keys(events.reduce((acc, e) => ({ ...acc, [e.type]: 0 }), {})).forEach(type => {
      const recentCount = recentEvents.filter(e => e.type === type).length;
      const olderCount = olderEvents.filter(e => e.type === type).length;

      trends[type] = olderCount === 0 ?
        (recentCount > 0 ? 100 : 0) :
        ((recentCount - olderCount) / olderCount) * 100;
    });

    return trends;
  }
}

// Security monitoring hook for React components
export function useSecurityMonitoring() {
  useEffect(() => {
    // Set up periodic analysis
    const interval = setInterval(() => {
      SecurityMonitoring.analyzeSecurityPatterns();
    }, 60000); // Every minute

    // Set up CSP violation listener
    const handleCSPViolation = (e: SecurityPolicyViolationEvent) => {
      SecurityMonitoring.logSecurityEvent({
        type: 'csp_violation',
        severity: 'medium',
        source: 'browser',
        details: {
          violatedDirective: e.violatedDirective,
          blockedURI: e.blockedURI,
          documentURI: e.documentURI,
          originalPolicy: e.originalPolicy
        }
      });
    };

    document.addEventListener('securitypolicyviolation', handleCSPViolation);

    return () => {
      clearInterval(interval);
      document.removeEventListener('securitypolicyviolation', handleCSPViolation);
    };
  }, []);

  return {
    logSecurityEvent: SecurityMonitoring.logSecurityEvent,
    generateReport: SecurityMonitoring.generateSecurityReport
  };
}
```

### **Integration with Platform Ecosystem**
- **Backend Security APIs**: Real-time threat detection and response coordination
- **Mobile App Security**: Shared security policies and certificate pinning
- **Desktop Integration**: Native security features and secure communication channels
- **Analytics Integration**: Security event tracking and behavioral analysis
- **Monitoring Systems**: Real-time alerting and automated incident response
- **Compliance Tools**: Automated compliance reporting and audit trail generation

---

**Document Classification**: CONFIDENTIAL
**Technical Scope**: Web Security, CSP, XSS Protection, CSRF, Next.js, TypeScript
**Platform Priority**: Critical (Security & Compliance)
**Review Cycle**: Weekly
**Last Updated**: September 16, 2025
**Version**: 2.0.0