---
title: Multi-Platform Cross-Platform Deployment
version: 1.0
owner: Platform Engineering Team
last_reviewed: 2025-09-16
next_review: 2025-12-16
classification: CONFIDENTIAL
scope: [Multi_Platform_Deployment, CI_CD_Pipelines, Global_Distribution]
---

# Multi-Platform Cross-Platform Deployment

> **Multi-Platform Memory**: Comprehensive CI/CD pipelines and deployment strategies for all 8 target platforms supporting billion-dollar scale operations, aligned with unified architecture framework for consistent deployment patterns across microservices, modular monoliths, and hybrid architectures.

### **Architecture Decision Alignment**
> **Reference**: This deployment strategy implements the deployment patterns defined in `unified_architecture_decision_framework.md`

**Deployment Strategy Matrix:**
- **Continuous Deployment**: High automation maturity, fast feedback, feature flags
- **Staged Releases**: Controlled quality gates, regulatory compliance, coordinated releases
- **Canary Deployment**: Risk mitigation, user validation, gradual rollout

## Deployment Architecture Overview

### **Multi-Platform Deployment Matrix**
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          TANQORY DEPLOYMENT ECOSYSTEM                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Platform    │ Deployment Target        │ CI/CD Tool    │ Store/Registry         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│ Web         │ Vercel/Netlify/AWS      │ GitHub Actions│ CDN Global Edge        │
│ Mobile      │ App Store/Google Play   │ Fastlane     │ TestFlight/Play Console│
│ Desktop     │ Auto-updater/DMG/MSI    │ Electron Forge│ GitHub Releases        │
│ Vision      │ App Store (visionOS)    │ Xcode Cloud  │ TestFlight visionOS    │
│ TV          │ TV App Stores           │ Multi-target │ Platform Stores        │
│ Watch       │ App Store (watchOS)     │ Xcode Cloud  │ TestFlight watchOS     │
│ Car         │ Embedded Systems        │ Native Build │ OEM Integration        │
│ Backend     │ Kubernetes/Docker       │ ArgoCD       │ Private Registry       │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### **Unified CI/CD Pipeline Architecture**
> **Integration**: Implements hybrid architecture deployment strategy with service-specific deployment patterns

```yaml
# .github/workflows/multi-platform-deploy.yml
name: Tanqory Multi-Platform Deployment

on:
  push:
    branches: [main, develop, release/*]
    tags: ['v*']
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'
  JAVA_VERSION: '17'
  XCODE_VERSION: '16'
  FLUTTER_VERSION: '3.24'

jobs:
  # ================================
  # PREPARATION AND SECURITY
  # ================================

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: 'trivy-results.sarif'

      - name: SAST Scan with Semgrep
        uses: returntocorp/semgrep-action@v1
        with:
          config: >-
            p/security-audit
            p/secrets
            p/owasp-top-ten

  # ================================
  # WEB PLATFORM DEPLOYMENT
  # ================================

  deploy-web:
    name: Deploy Web Platform
    runs-on: ubuntu-latest
    needs: security-scan
    strategy:
      matrix:
        environment: [staging, production]
    environment: ${{ matrix.environment }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build:web
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.API_URL }}
          NEXT_PUBLIC_GA_TRACKING_ID: ${{ secrets.GA_TRACKING_ID }}
          NEXT_PUBLIC_ENVIRONMENT: ${{ matrix.environment }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          vercel-args: '--prod'
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: ${{ secrets.TEAM_ID }}

      - name: Update deployment status
        uses: chrnorm/deployment-status@v2
        with:
          token: '${{ github.token }}'
          environment-url: ${{ steps.deploy.outputs.preview-url }}
          deployment-id: ${{ steps.deploy.outputs.deployment-id }}
          state: 'success'

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true

  # ================================
  # MOBILE PLATFORM DEPLOYMENT
  # ================================

  deploy-mobile:
    name: Deploy Mobile Platform
    runs-on: macos-latest
    needs: security-scan
    strategy:
      matrix:
        platform: [ios, android]
        environment: [staging, production]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Setup Ruby (for Fastlane)
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.2'
          bundler-cache: true

      - name: Setup Java (for Android)
        if: matrix.platform == 'android'
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: ${{ env.JAVA_VERSION }}

      - name: Setup Xcode (for iOS)
        if: matrix.platform == 'ios'
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: ${{ env.XCODE_VERSION }}

      - name: Install dependencies
        run: |
          npm ci
          cd ios && pod install && cd ..

      - name: Decode signing certificates
        if: matrix.platform == 'ios'
        run: |
          echo ${{ secrets.IOS_CERTIFICATE_BASE64 }} | base64 --decode > certificate.p12
          echo ${{ secrets.IOS_PROVISIONING_PROFILE_BASE64 }} | base64 --decode > profile.mobileprovision

      - name: Import certificates
        if: matrix.platform == 'ios'
        run: |
          security create-keychain -p "" build.keychain
          security import certificate.p12 -k build.keychain -P ${{ secrets.IOS_CERTIFICATE_PASSWORD }} -T /usr/bin/codesign
          security set-keychain-settings build.keychain
          security unlock-keychain -p "" build.keychain
          mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
          cp profile.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/

      - name: Build and Deploy iOS
        if: matrix.platform == 'ios'
        run: |
          bundle exec fastlane ios ${{ matrix.environment }}
        env:
          FASTLANE_APPLE_ID: ${{ secrets.APPLE_ID }}
          FASTLANE_APPLE_APP_PASSWORD: ${{ secrets.APPLE_APP_PASSWORD }}
          FASTLANE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}

      - name: Build and Deploy Android
        if: matrix.platform == 'android'
        run: |
          echo ${{ secrets.ANDROID_KEYSTORE_BASE64 }} | base64 --decode > android/app/release.keystore
          bundle exec fastlane android ${{ matrix.environment }}
        env:
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
          GOOGLE_PLAY_JSON_KEY: ${{ secrets.GOOGLE_PLAY_JSON_KEY }}

      - name: Upload to App Center (Staging)
        if: matrix.environment == 'staging'
        uses: wzieba/App-Center-action@v1
        with:
          appName: tanqory/${{ matrix.platform }}
          token: ${{ secrets.APP_CENTER_TOKEN }}
          group: testers
          file: ${{ matrix.platform == 'ios' && 'ios/build/TanqoryApp.ipa' || 'android/app/build/outputs/apk/release/app-release.apk' }}
          notifyTesters: true
          debug: false

  # ================================
  # DESKTOP PLATFORM DEPLOYMENT
  # ================================

  deploy-desktop:
    name: Deploy Desktop Platform
    needs: security-scan
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        architecture: [x64, arm64]
        exclude:
          - os: ubuntu-latest
            architecture: arm64

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Electron App
        run: npm run build:desktop
        env:
          ELECTRON_BUILDER_ARCH: ${{ matrix.architecture }}

      - name: Package Application
        run: npm run package:${{ runner.os }}:${{ matrix.architecture }}

      - name: Code Sign (macOS)
        if: runner.os == 'macOS'
        run: |
          echo ${{ secrets.MACOS_CERTIFICATE_BASE64 }} | base64 --decode > certificate.p12
          security import certificate.p12 -k build.keychain -P ${{ secrets.MACOS_CERTIFICATE_PASSWORD }}
          codesign --force --deep --sign "${{ secrets.MACOS_SIGNING_IDENTITY }}" "dist/*.app"

      - name: Code Sign (Windows)
        if: runner.os == 'Windows'
        uses: azure/azure-code-signing-action@v0.3.0
        with:
          azure-tenant-id: ${{ secrets.AZURE_TENANT_ID }}
          azure-client-id: ${{ secrets.AZURE_CLIENT_ID }}
          azure-client-secret: ${{ secrets.AZURE_CLIENT_SECRET }}
          endpoint: ${{ secrets.AZURE_CODE_SIGNING_ENDPOINT }}
          code-signing-account-name: ${{ secrets.AZURE_CODE_SIGNING_ACCOUNT }}
          certificate-profile-name: ${{ secrets.AZURE_CERTIFICATE_PROFILE }}
          files-folder: 'dist'
          files-folder-filter: '*.exe,*.msi'

      - name: Notarize (macOS)
        if: runner.os == 'macOS'
        run: |
          xcrun notarytool submit "dist/*.dmg" \
            --apple-id ${{ secrets.APPLE_ID }} \
            --password ${{ secrets.APPLE_APP_PASSWORD }} \
            --team-id ${{ secrets.APPLE_TEAM_ID }} \
            --wait

      - name: Create Release
        uses: softprops/action-gh-release@v1
        if: startsWith(github.ref, 'refs/tags/')
        with:
          files: |
            dist/*.dmg
            dist/*.exe
            dist/*.msi
            dist/*.AppImage
            dist/*.deb
            dist/*.rpm
          generate_release_notes: true
          draft: false
          prerelease: false

  # ================================
  # VISION PLATFORM DEPLOYMENT
  # ================================

  deploy-vision:
    name: Deploy visionOS Platform
    runs-on: macos-latest
    needs: security-scan

    steps:
      - uses: actions/checkout@v4

      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: ${{ env.XCODE_VERSION }}

      - name: Install visionOS SDK
        run: |
          sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
          xcodebuild -downloadPlatform visionOS

      - name: Cache SPM dependencies
        uses: actions/cache@v4
        with:
          path: .build
          key: ${{ runner.os }}-spm-${{ hashFiles('**/Package.resolved') }}
          restore-keys: |
            ${{ runner.os }}-spm-

      - name: Import certificates
        run: |
          echo ${{ secrets.VISION_CERTIFICATE_BASE64 }} | base64 --decode > certificate.p12
          security create-keychain -p "" build.keychain
          security import certificate.p12 -k build.keychain -P ${{ secrets.VISION_CERTIFICATE_PASSWORD }}
          security set-keychain-settings build.keychain
          security unlock-keychain -p "" build.keychain

      - name: Build visionOS App
        run: |
          xcodebuild clean archive \
            -project TanqoryVision.xcodeproj \
            -scheme TanqoryVision \
            -destination 'platform=visionOS,name=Apple Vision Pro' \
            -archivePath TanqoryVision.xcarchive \
            CODE_SIGN_IDENTITY="${{ secrets.VISION_SIGNING_IDENTITY }}" \
            PROVISIONING_PROFILE="${{ secrets.VISION_PROVISIONING_PROFILE }}" \
            DEVELOPMENT_TEAM="${{ secrets.APPLE_TEAM_ID }}"

      - name: Export IPA
        run: |
          xcodebuild -exportArchive \
            -archivePath TanqoryVision.xcarchive \
            -exportPath ./export \
            -exportOptionsPlist ./visionos-export-options.plist

      - name: Upload to TestFlight
        run: |
          xcrun altool --upload-app \
            --type ios \
            --file ./export/TanqoryVision.ipa \
            --username ${{ secrets.APPLE_ID }} \
            --password ${{ secrets.APPLE_APP_PASSWORD }}

  # ================================
  # TV PLATFORMS DEPLOYMENT
  # ================================

  deploy-tv:
    name: Deploy TV Platforms
    runs-on: ubuntu-latest
    needs: security-scan
    strategy:
      matrix:
        platform: [tvos, tizen, webos, androidtv]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build TV App
        run: npm run build:tv:${{ matrix.platform }}
        env:
          TV_PLATFORM: ${{ matrix.platform }}

      - name: Setup Tizen Studio
        if: matrix.platform == 'tizen'
        run: |
          wget -O tizen-studio.bin http://download.tizen.org/sdk/Installer/tizen-studio_5.0/web-cli_Tizen_Studio_5.0_ubuntu-64.bin
          chmod +x tizen-studio.bin
          ./tizen-studio.bin --accept-license
          export PATH=$PATH:~/tizen-studio/tools/ide/bin

      - name: Build and Package Tizen App
        if: matrix.platform == 'tizen'
        run: |
          tizen build-web -- build/tv/tizen
          tizen package -- build/tv/tizen --sign ${{ secrets.TIZEN_CERTIFICATE }}

      - name: Setup webOS TV SDK
        if: matrix.platform == 'webos'
        run: |
          wget -O webos-sdk.run http://webossdk.lge.com/sdk/download/
          chmod +x webos-sdk.run
          ./webos-sdk.run --accept-license

      - name: Build and Package webOS App
        if: matrix.platform == 'webos'
        run: |
          ares-package build/tv/webos
          ares-install com.tanqory.app_1.0.0_all.ipk --device-list

      - name: Deploy to TV App Stores
        run: |
          # Platform-specific deployment scripts
          ./scripts/deploy-tv-${{ matrix.platform }}.sh
        env:
          TIZEN_STORE_API_KEY: ${{ secrets.TIZEN_STORE_API_KEY }}
          WEBOS_STORE_API_KEY: ${{ secrets.WEBOS_STORE_API_KEY }}
          ANDROID_TV_API_KEY: ${{ secrets.ANDROID_TV_API_KEY }}

  # ================================
  # WATCH PLATFORMS DEPLOYMENT
  # ================================

  deploy-watch:
    name: Deploy Watch Platforms
    runs-on: macos-latest
    needs: security-scan
    strategy:
      matrix:
        platform: [watchos, wearos]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Xcode (watchOS)
        if: matrix.platform == 'watchos'
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: ${{ env.XCODE_VERSION }}

      - name: Build watchOS App
        if: matrix.platform == 'watchos'
        run: |
          xcodebuild clean archive \
            -project TanqoryWatch.xcodeproj \
            -scheme TanqoryWatch \
            -destination 'platform=watchOS,name=Apple Watch Series 9 (45mm)' \
            -archivePath TanqoryWatch.xcarchive

      - name: Setup Android SDK (Wear OS)
        if: matrix.platform == 'wearos'
        uses: android-actions/setup-android@v3
        with:
          api-level: 34
          target: android-34

      - name: Build Wear OS App
        if: matrix.platform == 'wearos'
        run: |
          ./gradlew :wear:assembleRelease
          ./gradlew :wear:bundleRelease

      - name: Upload to respective stores
        run: |
          if [ "${{ matrix.platform }}" == "watchos" ]; then
            # Upload to App Store Connect
            xcrun altool --upload-app --type ios --file TanqoryWatch.ipa \
              --username ${{ secrets.APPLE_ID }} \
              --password ${{ secrets.APPLE_APP_PASSWORD }}
          else
            # Upload to Google Play Console
            ./gradlew publishWearReleaseBundle
          fi

  # ================================
  # CAR PLATFORM DEPLOYMENT
  # ================================

  deploy-car:
    name: Deploy Car Platforms
    runs-on: macos-latest
    needs: security-scan

    steps:
      - uses: actions/checkout@v4

      - name: Build CarPlay App
        run: |
          xcodebuild clean archive \
            -project TanqoryCar.xcodeproj \
            -scheme TanqoryCar \
            -destination 'platform=iOS,name=iPhone 15 Pro' \
            -archivePath TanqoryCar.xcarchive

      - name: Build Android Auto App
        run: |
          ./gradlew :automotive:assembleRelease

      - name: Package for OEM Integration
        run: |
          # Create OEM integration packages
          ./scripts/package-for-oem.sh

      - name: Upload to Partner Portal
        run: |
          # Upload to automotive partner portals
          ./scripts/upload-to-partners.sh
        env:
          OEM_PARTNER_KEYS: ${{ secrets.OEM_PARTNER_KEYS }}

  # ================================
  # BACKEND DEPLOYMENT
  # ================================

  deploy-backend:
    name: Deploy Backend Services
    runs-on: ubuntu-latest
    needs: security-scan

    steps:
      - uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Images
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            ghcr.io/tanqory/api:latest
            ghcr.io/tanqory/api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to Kubernetes
        uses: azure/k8s-deploy@v1
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
            k8s/ingress.yaml
          images: |
            ghcr.io/tanqory/api:${{ github.sha }}
          kubectl-version: 'latest'

  # ================================
  # POST-DEPLOYMENT VERIFICATION
  # ================================

  post-deployment-tests:
    name: Post-Deployment Verification
    runs-on: ubuntu-latest
    needs: [deploy-web, deploy-mobile, deploy-desktop, deploy-backend]
    if: always()

    steps:
      - uses: actions/checkout@v4

      - name: Health Check - Web
        run: |
          curl -f https://tanqory.com/health || exit 1

      - name: Health Check - API
        run: |
          curl -f https://api.tanqory.com/health || exit 1

      - name: Integration Tests
        run: |
          npm run test:integration:production

      - name: Performance Tests
        run: |
          npm run test:performance

      - name: Notify Teams
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Platform-Specific Deployment Configurations

### **1. Web Platform (Vercel/Netlify)**
```javascript
// vercel.json - Vercel Configuration
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "outputDirectory": ".next"
      }
    }
  ],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1", "sfo1", "fra1", "sin1", "syd1", "nrt1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.tanqory.com/:path*"
    }
  ],
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_GA_TRACKING_ID": "@ga-tracking-id"
  }
}

// lighthouserc.json - Performance Monitoring
{
  "ci": {
    "collect": {
      "url": [
        "https://tanqory.com",
        "https://tanqory.com/catalog",
        "https://tanqory.com/product/sample"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["warn", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    },
    "upload": {
      "target": "lhci",
      "serverBaseUrl": "https://lhci.tanqory.com",
      "token": "your-lhci-build-token"
    }
  }
}
```

### **2. Mobile Platform (Fastlane)**
```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  before_all do
    setup_circle_ci
  end

  desc "Build and upload to TestFlight"
  lane :staging do
    match(type: "appstore", readonly: true)
    increment_build_number(xcodeproj: "TanqoryApp.xcodeproj")

    build_app(
      scheme: "TanqoryApp",
      configuration: "Release",
      export_method: "app-store",
      export_options: {
        provisioningProfiles: {
          "com.tanqory.app" => "match AppStore com.tanqory.app"
        }
      }
    )

    upload_to_testflight(
      beta_app_feedback_email: "beta-feedback@tanqory.com",
      beta_app_description: "Latest staging build with new features and bug fixes",
      demo_account_required: false,
      distribute_external: true,
      groups: ["Internal Testers", "External Testers"],
      notify_external_testers: true
    )

    # Notify Slack
    slack(
      message: "iOS staging build uploaded to TestFlight! 🚀",
      success: true,
      channel: "#mobile-deployments",
      default_payloads: [:git_branch, :git_author, :last_git_commit_message]
    )
  end

  desc "Deploy to App Store"
  lane :production do
    match(type: "appstore", readonly: true)

    build_app(
      scheme: "TanqoryApp",
      configuration: "Release",
      export_method: "app-store"
    )

    upload_to_app_store(
      force: true,
      reject_if_possible: true,
      skip_metadata: false,
      skip_screenshots: false,
      submit_for_review: true,
      automatic_release: false,
      submission_information: {
        add_id_info_limits_tracking: true,
        add_id_info_serves_ads: false,
        add_id_info_tracks_action: true,
        add_id_info_tracks_install: true,
        add_id_info_uses_idfa: true,
        content_rights_has_rights: true,
        content_rights_contains_third_party_content: true,
        export_compliance_platform: 'ios',
        export_compliance_compliance_required: false,
        export_compliance_encryption_updated: false,
        export_compliance_app_type: nil,
        export_compliance_uses_encryption: false,
        export_compliance_is_exempt: false,
        export_compliance_contains_third_party_cryptography: false,
        export_compliance_contains_proprietary_cryptography: false,
        export_compliance_available_on_french_store: false
      }
    )
  end

  error do |lane, exception|
    slack(
      message: "iOS deployment failed: #{exception.message}",
      success: false,
      channel: "#mobile-deployments"
    )
  end
end

# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Build and upload to Google Play Console"
  lane :staging do
    gradle(
      task: "clean bundleRelease",
      project_dir: "android/"
    )

    upload_to_play_store(
      track: 'internal',
      aab: 'android/app/build/outputs/bundle/release/app-release.aab',
      skip_upload_apk: true,
      skip_upload_metadata: true,
      skip_upload_images: true,
      skip_upload_screenshots: true
    )
  end

  desc "Deploy to Google Play Store"
  lane :production do
    gradle(
      task: "clean bundleRelease",
      project_dir: "android/"
    )

    upload_to_play_store(
      track: 'production',
      aab: 'android/app/build/outputs/bundle/release/app-release.aab',
      skip_upload_apk: true
    )
  end
end
```

### **3. Desktop Platform (Electron Builder)**
```json
// electron-builder.json
{
  "appId": "com.tanqory.desktop",
  "productName": "Tanqory",
  "directories": {
    "output": "dist"
  },
  "files": [
    "build/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "extraMetadata": {
    "main": "build/main.js"
  },
  "mac": {
    "category": "public.app-category.business",
    "icon": "build/icons/512x512.icns",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist",
    "notarize": {
      "teamId": "APPLE_TEAM_ID"
    },
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      },
      {
        "target": "zip",
        "arch": ["x64", "arm64"]
      }
    ]
  },
  "win": {
    "icon": "build/icons/512x512.ico",
    "publisherName": "Tanqory Inc.",
    "certificateFile": "build/certificates/windows.p12",
    "certificatePassword": "password",
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32"]
      },
      {
        "target": "msi",
        "arch": ["x64", "ia32"]
      }
    ]
  },
  "linux": {
    "icon": "build/icons/512x512.png",
    "category": "Office",
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
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "Tanqory"
  },
  "publish": [
    {
      "provider": "github",
      "owner": "tanqory",
      "repo": "tanqory-desktop"
    }
  ],
  "afterSign": "scripts/notarize.js"
}
```

### **4. Kubernetes Backend Deployment**
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tanqory-api
  namespace: production
  labels:
    app: tanqory-api
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 1
  selector:
    matchLabels:
      app: tanqory-api
  template:
    metadata:
      labels:
        app: tanqory-api
        version: v1
    spec:
      containers:
      - name: api
        image: ghcr.io/tanqory/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: tanqory-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: tanqory-secrets
              key: redis-url
        resources:
          limits:
            cpu: 1000m
            memory: 1Gi
          requests:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: tanqory-api-service
  namespace: production
spec:
  selector:
    app: tanqory-api
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tanqory-api-ingress
  namespace: production
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - api.tanqory.com
    secretName: tanqory-api-tls
  rules:
  - host: api.tanqory.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tanqory-api-service
            port:
              number: 80
```

## Global Distribution Strategy

### **CDN and Edge Deployment**
```typescript
// scripts/deploy-global.ts
import { CloudFront } from 'aws-sdk';
import { Config } from '@tanqory/deployment-config';

interface GlobalDeploymentConfig {
  regions: {
    primary: string[];
    secondary: string[];
    edge: string[];
  };
  distributions: {
    web: CloudFrontDistribution;
    api: CloudFrontDistribution;
    assets: CloudFrontDistribution;
  };
  failover: {
    enabled: boolean;
    healthCheckUrl: string;
    failoverThreshold: number;
  };
}

class GlobalDeploymentManager {
  private cloudfront: CloudFront;
  private config: GlobalDeploymentConfig;

  constructor(config: GlobalDeploymentConfig) {
    this.cloudfront = new CloudFront();
    this.config = config;
  }

  async deployToGlobalRegions(): Promise<void> {
    // Deploy to primary regions
    for (const region of this.config.regions.primary) {
      await this.deployToRegion(region, 'primary');
    }

    // Deploy to secondary regions
    for (const region of this.config.regions.secondary) {
      await this.deployToRegion(region, 'secondary');
    }

    // Update CDN distributions
    await this.updateCDNDistributions();

    // Setup health checks and monitoring
    await this.setupHealthChecks();

    // Verify deployment
    await this.verifyGlobalDeployment();
  }

  private async deployToRegion(region: string, type: 'primary' | 'secondary'): Promise<void> {
    console.log(`Deploying to ${region} as ${type} region...`);

    // Region-specific deployment logic
    const deploymentStrategy = type === 'primary'
      ? this.getPrimaryDeploymentStrategy()
      : this.getSecondaryDeploymentStrategy();

    await deploymentStrategy.execute(region);
  }

  private async updateCDNDistributions(): Promise<void> {
    const distributionUpdates = [
      this.updateWebDistribution(),
      this.updateApiDistribution(),
      this.updateAssetsDistribution()
    ];

    await Promise.all(distributionUpdates);
  }

  private async setupHealthChecks(): Promise<void> {
    // Setup Route 53 health checks for all regions
    const healthChecks = this.config.regions.primary.map(region => {
      return this.createHealthCheck({
        region,
        url: `https://${region}.api.tanqory.com/health`,
        threshold: this.config.failover.failoverThreshold
      });
    });

    await Promise.all(healthChecks);
  }
}

// Usage
const globalConfig: GlobalDeploymentConfig = {
  regions: {
    primary: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    secondary: ['us-west-2', 'eu-central-1', 'ap-northeast-1'],
    edge: ['us-east-2', 'eu-west-2', 'ap-south-1']
  },
  distributions: {
    web: Config.cloudfront.web,
    api: Config.cloudfront.api,
    assets: Config.cloudfront.assets
  },
  failover: {
    enabled: true,
    healthCheckUrl: '/health',
    failoverThreshold: 3
  }
};

const deploymentManager = new GlobalDeploymentManager(globalConfig);
await deploymentManager.deployToGlobalRegions();
```

### **Monitoring and Rollback Strategy**
```typescript
// scripts/deployment-monitor.ts
import { CloudWatch, Route53 } from 'aws-sdk';
import { SlackWebhook } from '@tanqory/notifications';

interface DeploymentMetrics {
  errorRate: number;
  responseTime: number;
  throughput: number;
  availability: number;
}

class DeploymentMonitor {
  private cloudwatch: CloudWatch;
  private route53: Route53;
  private slack: SlackWebhook;

  constructor() {
    this.cloudwatch = new CloudWatch();
    this.route53 = new Route53();
    this.slack = new SlackWebhook(process.env.SLACK_WEBHOOK_URL!);
  }

  async monitorDeployment(deploymentId: string): Promise<boolean> {
    const startTime = Date.now();
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes

    while (Date.now() - startTime < maxWaitTime) {
      const metrics = await this.collectMetrics();

      if (this.isDeploymentHealthy(metrics)) {
        await this.notifySuccess(deploymentId, metrics);
        return true;
      }

      if (this.isDeploymentFailing(metrics)) {
        await this.triggerRollback(deploymentId);
        await this.notifyFailure(deploymentId, metrics);
        return false;
      }

      // Wait before next check
      await this.wait(30000); // 30 seconds
    }

    // Timeout reached
    await this.triggerRollback(deploymentId);
    await this.notifyTimeout(deploymentId);
    return false;
  }

  private async collectMetrics(): Promise<DeploymentMetrics> {
    const [errorRate, responseTime, throughput, availability] = await Promise.all([
      this.getErrorRate(),
      this.getResponseTime(),
      this.getThroughput(),
      this.getAvailability()
    ]);

    return { errorRate, responseTime, throughput, availability };
  }

  private isDeploymentHealthy(metrics: DeploymentMetrics): boolean {
    return (
      metrics.errorRate < 0.01 && // Less than 1% error rate
      metrics.responseTime < 500 && // Less than 500ms response time
      metrics.availability > 0.999 // Greater than 99.9% availability
    );
  }

  private isDeploymentFailing(metrics: DeploymentMetrics): boolean {
    return (
      metrics.errorRate > 0.05 || // Greater than 5% error rate
      metrics.responseTime > 2000 || // Greater than 2s response time
      metrics.availability < 0.95 // Less than 95% availability
    );
  }

  private async triggerRollback(deploymentId: string): Promise<void> {
    console.log(`Triggering rollback for deployment ${deploymentId}`);

    // Rollback to previous version
    await this.rollbackKubernetesDeployment();
    await this.rollbackCDNDistribution();
    await this.rollbackDatabaseMigrations();

    await this.slack.send({
      text: `🚨 Automatic rollback triggered for deployment ${deploymentId}`,
      channel: '#critical-alerts'
    });
  }
}
```

---

---

## Quality Gates

### **Deployment Excellence**
- [ ] All 8 platforms have consistent deployment strategies following unified framework
- [ ] Service-specific deployment patterns align with architecture decisions (microservices vs monolith)
- [ ] Automated rollback mechanisms implemented across all platforms
- [ ] Global distribution with multi-region failover capabilities
- [ ] Real-time monitoring with comprehensive alerting

### **Technical Excellence**
- [ ] Zero-downtime deployments for critical services
- [ ] Blue-green deployment for production releases
- [ ] Canary deployment for high-risk changes
- [ ] Comprehensive security scanning in all pipelines
- [ ] Performance validation at deployment time

## Success Metrics
- Deployment frequency: Multiple deployments per day across platforms
- Deployment success rate: >99.5% successful deployments
- Mean time to recovery: <10 minutes for automated rollbacks
- Cross-platform consistency: >95% feature parity deployment timing
- Security compliance: 100% security scans passed before production

---

**Integration References:**
- `enterprise/unified_architecture_decision_framework.md` - Deployment strategy selection criteria and patterns
- `integration/01_cross_platform_integration.md` - Cross-platform deployment coordination strategies
- `enterprise/05_enterprise_microservice_template_guide.md` - Service-specific deployment patterns
- `enterprise/02_enterprise_architecture.md` - Architecture compliance in deployment processes