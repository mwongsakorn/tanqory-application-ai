# Tanqory Company Memory - Standardized Multi-Platform Architecture

> **Standardized Memory System**: Comprehensive knowledge base for enterprise multi-platform development with consistent file organization and naming conventions

---

## 📁 **Standardized File Structure**

### **🔧 Core Memory (หลักการพื้นฐาน)**
```
docs/memory/core/                    # Core business and technical standards
├── 00_official_technology_versions.md # SINGLE SOURCE OF TRUTH for all technology versions
├── 01_core_policies.md              # Company-wide development principles
├── 02_core_domain_glossary.md       # Domain definitions and terminology
├── 03_core_api_standards.md         # RESTful API design standards
├── 04_core_security.md              # Enterprise security architecture
├── 05_core_coding_standards.md      # TypeScript patterns and guidelines
└── 06_core_documentation_style.md   # Documentation standards
```

### **📱 Platform-Specific Memory (แพลตฟอร์มเฉพาะ)**
```
docs/memory/platforms/
├── mobile/                          # Mobile development (React Native)
│   ├── 01_mobile_development_standards.md
│   ├── 02_mobile_ui_patterns.md
│   ├── 03_mobile_performance_optimization.md
│   ├── 04_mobile_security_standards.md
│   └── 05_mobile_testing_strategies.md
├── web/                             # Web development (Next.js, React)
│   ├── 01_web_development_standards.md
│   ├── 02_web_responsive_design.md
│   ├── 03_web_seo_optimization.md
│   ├── 04_web_accessibility_standards.md
│   └── 05_web_performance_optimization.md
├── desktop/                         # Desktop development (Electron)
│   ├── 01_desktop_development_standards.md
│   ├── 02_desktop_native_integration.md
│   └── 03_desktop_performance_optimization.md
├── vision/                          # Vision development (visionOS)
│   ├── 01_vision_development_standards.md
│   ├── 02_vision_spatial_design.md
│   └── 03_vision_interaction_patterns.md
├── tv/                              # TV development (tvOS, Smart TV)
│   ├── 01_tv_development_standards.md
│   └── 02_tv_remote_interaction.md
├── watch/                           # Watch development (watchOS)
│   ├── 01_watch_development_standards.md
│   └── 02_watch_health_integration.md
├── automotive/                      # Automotive development (CarPlay)
│   ├── 01_automotive_development_standards.md
│   └── 02_automotive_safety_standards.md
└── backend/                         # Backend development (Node.js, APIs)
    ├── 01_backend_development_standards.md
    ├── 02_backend_scalability_patterns.md
    └── 03_backend_database_optimization.md
```

### **🔗 Integration & Cross-Platform (การเชื่อมต่อ)**
```
docs/memory/integration/
├── 01_cross_platform_integration.md
├── 02_api_integration_patterns.md
├── 03_data_synchronization.md
└── 04_authentication_integration.md
```

### **🤖 AI Development Memory (การพัฒนาด้วย AI)**
```
docs/memory/ai-development/
├── 01_ai_driven_development.md
├── 02_ai_testing_automation.md
├── 03_ai_code_review.md
└── 04_ai_deployment_automation.md
```

### **🛠️ Development Tools (เครื่องมือพัฒนา)**
```
docs/memory/tools/
├── 01_development_tools_standards.md
├── 02_ci_cd_standards.md
├── 03_monitoring_and_analytics.md
└── 04_version_control_standards.md
```

---

## 🎯 **AI Prompt Templates (เทมเพลต Prompt)**

### **🔧 Core Prompts (Prompts หลัก)**
```
docs/prompts/core/
├── 01_core_code_generation.md
├── 02_core_api_design.md
├── 03_core_security_review.md
├── 04_core_documentation.md
├── 05_core_testing.md
└── 06_core_technology_stack.md
```

### **📱 Platform-Specific Prompts (Prompts แพลตฟอร์มเฉพาะ)**
```
docs/prompts/platforms/
├── mobile/                          # Mobile prompts
│   ├── 01_mobile_ui_component_generator.md
│   ├── 02_mobile_navigation_generator.md
│   ├── 03_mobile_performance_optimizer.md
│   └── 04_mobile_security_implementer.md
├── web/                             # Web prompts
│   ├── 01_web_component_generator.md
│   ├── 02_web_seo_optimizer.md
│   ├── 03_web_accessibility_implementer.md
│   └── 04_web_performance_optimizer.md
├── desktop/                         # Desktop prompts
│   ├── 01_desktop_app_generator.md
│   ├── 02_desktop_native_integrator.md
│   └── 03_desktop_performance_optimizer.md
├── vision/                          # Vision prompts
│   ├── 01_vision_spatial_designer.md
│   ├── 02_vision_interaction_designer.md
│   └── 03_vision_app_generator.md
├── tv/                              # TV prompts
│   ├── 01_tv_app_generator.md
│   ├── 02_tv_remote_handler.md
│   └── 03_tv_media_optimizer.md
├── watch/                           # Watch prompts
│   ├── 01_watch_app_generator.md
│   ├── 02_watch_health_integrator.md
│   └── 03_watch_complication_generator.md
├── automotive/                      # Automotive prompts
│   ├── 01_automotive_app_generator.md
│   ├── 02_automotive_safety_implementer.md
│   └── 03_automotive_voice_handler.md
└── backend/                         # Backend prompts
    ├── 01_backend_api_generator.md
    ├── 02_backend_database_optimizer.md
    └── 03_backend_scalability_architect.md
```

### **🔗 Integration & Tools Prompts**
```
docs/prompts/integration/
├── 01_cross_platform_synchronizer.md
├── 02_api_integration_builder.md
└── 03_authentication_unifier.md

docs/prompts/ai-development/
├── 01_ai_code_generator.md
├── 02_ai_test_generator.md
└── 03_ai_refactor_optimizer.md

docs/prompts/tools/
├── 01_development_environment_setup.md
├── 02_ci_cd_pipeline_generator.md
└── 03_monitoring_setup_generator.md
```

---

## 📝 **Standardized Naming Convention**

### **File Naming Pattern**
```
{หมายเลข}_{หมวดหมู่}_{ชื่อไฟล์}.md

Examples:
✅ 01_mobile_development_standards.md
✅ 02_mobile_ui_patterns.md
✅ 01_cross_platform_integration.md
✅ 01_core_policies.md

❌ 28_mobile_development_standards.md (ไม่เป็นระเบียบ)
❌ mobile_ui_component_generator.md (ไม่มีหมายเลข)
```

### **Directory Structure Pattern**
```
docs/
├── memory/                          # ความรู้และมาตรฐาน
│   ├── core/                        # หลักการพื้นฐาน
│   ├── platforms/{platform}/        # แพลตฟอร์มเฉพาะ
│   ├── integration/                 # การเชื่อมต่อ
│   ├── ai-development/              # AI development
│   └── tools/                       # เครื่องมือ
└── prompts/                         # AI Prompts
    ├── core/                        # Prompts หลัก
    ├── platforms/{platform}/        # Prompts แพลตฟอร์มเฉพาะ
    ├── integration/                 # Integration prompts
    ├── ai-development/              # AI development prompts
    └── tools/                       # Tools prompts
```

---

## 🎯 **Context Selection Guide**

### **AI Agent Context Selection**
```typescript
function selectOptimalContext(platform: string, task: string): string[] {
  const baseContext = ['core/01_core_policies.md'];

  // Platform-specific context
  const platformContext = `platforms/${platform}/`;

  // Task-specific context
  switch (task) {
    case 'development':
      return [...baseContext, `${platformContext}01_${platform}_development_standards.md`];
    case 'ui_design':
      return [...baseContext, `${platformContext}02_${platform}_ui_patterns.md`];
    case 'performance':
      return [...baseContext, `${platformContext}03_${platform}_performance_optimization.md`];
    case 'security':
      return [...baseContext, 'core/04_core_security.md', `${platformContext}04_${platform}_security_standards.md`];
  }
}
```

### **Prompt Selection Pattern**
```typescript
function selectPrompt(platform: string, task: string): string {
  return `prompts/platforms/${platform}/${task_number}_${platform}_${task}.md`;
}

// Examples:
// selectPrompt('mobile', 'ui_component_generator')
// → prompts/platforms/mobile/01_mobile_ui_component_generator.md

// selectPrompt('web', 'seo_optimizer')
// → prompts/platforms/web/02_web_seo_optimizer.md
```

---

## 📊 **Benefits of Standardized Structure**

### **✅ ข้อดี (Advantages)**
1. **Predictable Navigation**: ทำนายเส้นทางไฟล์ได้ง่าย
2. **Consistent Naming**: ชื่อไฟล์เป็นมาตรฐานเดียวกัน
3. **Scalable Architecture**: รองรับการขยายแพลตฟอร์มใหม่
4. **Parallel Development**: ทีมพัฒนาแยกแพลตฟอร์มได้
5. **Clear Separation**: แยกความรู้และ prompts อย่างชัดเจน
6. **Easy Maintenance**: บำรุงรักษาง่าย

### **🔍 การค้นหาไฟล์ (File Discovery)**
```bash
# หาไฟล์ memory สำหรับ mobile
find docs/memory/platforms/mobile/ -name "*.md"

# หาไฟล์ prompts สำหรับ web
find docs/prompts/platforms/web/ -name "*.md"

# หาไฟล์ integration ทั้งหมด
find docs/memory/integration/ -name "*.md"
find docs/prompts/integration/ -name "*.md"
```

---

**Last Updated**: September 16, 2025
**Version**: 3.0.0 (Standardized Structure)
**Compliance**: Enterprise Multi-Platform Standards