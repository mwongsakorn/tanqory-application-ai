---
title: Tanqory Core Business Policies
version: 1.0
owner: Architecture Team
last_reviewed: 2025-09-16
next_review: 2025-12-16
---

# Core Business Policies

> **Core Memory**: Company-wide development principles, AI-first workflow integration, and governance standards

## Overview
เอกสารนี้รวบรวมนโยบายการพัฒนา แนวทางการทำงาน และมาตรฐานการปฏิบัติงานของ Tanqory ที่ออกแบบมาเพื่อรองรับการขยายระดับโลกและการทำงานแบบ AI-first

## Company Information
**TANQ PTE. LTD. (Tanqory)**
- **ชื่อเต็ม**: TANQ PTE. LTD.
- **UEN**: 202448997H
- **วันที่จดทะเบียน**: November 29, 2024
- **ประเภทบริษัท**: Exempt Private Company Limited by Shares
- **สถานะ**: LIVE COMPANY (Active)
- **ที่อยู่จดทะเบียน**: 160 Robinson Road #14-04, Singapore Business Federation Center, Singapore 068914
- **วันที่ย้ายที่อยู่**: November 29, 2024
- **ประเทศ**: Republic of Singapore
- **หน่วยงานกำกับ**: Accounting and Corporate Regulatory Authority (ACRA)

### **Intellectual Property Portfolio**
- **Legal Documentation**: [Complete IP Portfolio](../legal/01_intellectual_property_portfolio.md)
- **Trademark Registrations**: 4 registered marks in Singapore (Class 42)
- **Protection Period**: 10 years each (renewable)
- **Registrar**: Intellectual Property Office of Singapore (IPOS)
- **Global Expansion**: ASEAN and international filing strategy in progress

**Key Registered Marks:**
- **TANQORY** wordmark (TM# 40202505771S)
- **T.** symbol variations (TM# 40202505755R, 40202505909R)
- **TANQORY** logo combination (TM# 40202505910Q)

### **Official Business Activities (ACRA)**
- **Primary Activity**: Development of Software and Applications (except games and cybersecurity) - Code 62011
- **Secondary Activity**: Information Technology Consultancy (except cybersecurity) - Code 62021
- **Business Classification**: Software development, IT consulting, technology services

### **Business Profile**
- **ธุรกิจ**: SaaS E-commerce Platform + AI Agents Marketplace
- **ตำแหน่งตลาด**: Shopify Competitor with cost and technology advantages
- **เป้าหมาย**: Global B2B/B2C/B2B2C
- **โมเดลธุรกิจ**: SaaS subscription tiers, Usage add-ons, Enterprise contracts

### **Competitive Advantages**
- **Cost Leadership**: 0% transaction fees vs 2.4-3% competitors
- **Technology Innovation**: AI marketplace integration, modern tech stack
- **Regional Expertise**: Singapore-based for SEA market penetration
- **Brand Portfolio**: Multiple trademark protections for global expansion

## Table of Contents
- [Business Priority Framework](#business-priority-framework)
- [Development Principles](#development-principles)
- [AI-Human Decision Framework](#ai-human-decision-framework)
- [AI-First Continuous Workflow](#ai-first-continuous-workflow-governed-by-decision-matrix)
- [Advanced AI Prompt Templates](#advanced-ai-prompt-templates)
- [Documentation Policy](#documentation-policy)
- [Security & Privacy](#security--privacy)
- [Version Management](#version-management)
- [Observability](#observability)
- [UI/UX Design System](#uiux-design-system)
- [Governance & Review Process](#governance--review-process)
- [Related Documents](#related-documents)

---

## Business Priority Framework

> **Core Memory**: การตัดสินใจทางธุรกิจทั้งหมดต้องสอดคล้องกับ Business Priority Framework เพื่อแก้ไขความขัดแย้งระหว่าง Speed vs Quality, Innovation vs Compliance, Cost vs Premium, Global vs Local

### **Business Decision Integration**
- [ ] **Strategic Alignment**: ทุกการตัดสินใจต้องสอดคล้องกับ [Enterprise Business Priority Framework](../enterprise/00_enterprise_business_priority_framework.md)
- [ ] **Trade-off Resolution**: ใช้ Business Decision Matrix สำหรับการแก้ไขความขัดแย้งระหว่าง business objectives
- [ ] **Escalation Process**: ปฏิบัติตาม escalation matrix เมื่อเกิดความขัดแย้งที่ไม่สามารถแก้ไขได้ในระดับทีม
- [ ] **Decision Documentation**: บันทึกการตัดสินใจทางธุรกิจพร้อม rationale และ expected outcomes

### **Priority-Driven Development**
- [ ] **Customer Impact First**: Feature และ technical decisions จัดลำดับความสำคัญตาม customer impact และ business value
- [ ] **Quality Thresholds**: กำหนด minimum quality standards ที่ไม่สามารถประนีประนอมได้ แม้เพื่อ speed
- [ ] **Innovation Sandbox**: ใช้ separate environments สำหรับ innovation projects ที่อาจขัดแย้งกับ compliance requirements
- [ ] **Global Consistency**: รักษา core functionality และ brand consistency ขณะที่อนุญาตให้มี local adaptation

### **Business-Driven Architecture Decisions**
- [ ] **ROI-Based Technology Choices**: เลือก technology stack ตาม business value และ long-term ROI มากกว่า technical preference
- [ ] **Scalability vs Cost Balance**: ออกแบบ architecture ที่สมดุลระหว่าง scalability requirements และ cost constraints
- [ ] **Compliance-by-Design**: รวม compliance requirements เข้าใน architecture design ตั้งแต่เริ่มต้น
- [ ] **Market-Responsive Infrastructure**: infrastructure ต้องสามารถ adapt ได้ตาม market requirements และ business growth

---

## Development Principles
- [ ] **1 microservice = 1 repo**
- [ ] **Central gateway** สำหรับ routing และ service discovery
- [ ] ทุกแอปต้องใช้ `@tanqory/api-client` เป็น client library มาตรฐาน
- [ ] ห้าม commit โค้ดโดยตรงลง main branch ต้องผ่าน Pull Request + CI/CD checks
- [ ] ใช้ Infrastructure as Code (IaC) สำหรับ provisioning ทุก environment

---

## AI-Human Decision Framework
- [ ] **AI-Human Decision Matrix**: กำหนดเกณฑ์ชัดเจนสำหรับการตัดสินใจในแต่ละระดับ
- [ ] **Full AI Autonomy**: Task ที่ AI ทำได้เอง 100% (Low-risk, Confidence ≥90%)
  - Code formatting และ style fixes
  - Documentation grammar และ spelling corrections
  - Standard compliance checks และ minor fixes
  - Performance optimization suggestions (non-breaking)
  - Dependency security patch updates
- [ ] **AI with Human Oversight**: AI ทำแต่มี human monitoring (Medium risk, Confidence ≥85%)
  - Content creation และ optimization recommendations
  - Architecture pattern suggestions
  - Security policy updates
  - Process improvement recommendations
- [ ] **AI-Assisted Human**: Human ตัดสินใจ แต่ AI ช่วย (High impact, Confidence ≥70%)
  - Strategic product direction และ roadmap
  - Major architecture และ technology decisions
  - Security incident response และ crisis management
  - Financial control modifications และ budget decisions
- [ ] **Human-Only**: Task ที่ต้องมี human เท่านั้น (Critical/Legal/Ethical)
  - Legal compliance interpretations
  - Ethical judgment calls และ bias resolution
  - Personnel decisions และ organizational changes
  - Vendor selections และ partnership agreements

## AI-First Continuous Workflow (Governed by Decision Matrix)
- [ ] **Governed AI Development**: AI agents ทำงานต่อเนื่อง ตามกรอบ AI-Human Decision Matrix
- [ ] **Real-Time Processing Streams**: Requirements, Implementation, Quality, Deployment streams ทำงานพร้อมกัน
- [ ] **Controlled AI Autonomy**: Code generation, testing, deployment ตามระดับ autonomy ที่กำหนด
- [ ] **Strategic Human Oversight**: Human ทำหน้าที่ strategic decision และ oversight ตาม Decision Matrix
- [ ] **Continuous N8N Orchestration**: Workflow streams ทำงานแบบ event-driven พร้อม human checkpoints
- [ ] **Predictive Intelligence**: AI ทำนายและแก้ไขปัญหาก่อนเกิดขึ้นจริง พร้อม human validation
- [ ] **Self-Optimizing Systems**: AI ปรับปรุงประสิทธิภาพอัตโนมัติ ภายใต้ human oversight framework
- [ ] **Decision-Based Escalation**: Human escalation ตาม AI-Human Decision Matrix และ confidence threshold
- [ ] **Transparent Audit Trail**: บันทึกทุก AI decision พร้อม reasoning และ human oversight level

---

## Advanced AI Prompt Templates

### **Enterprise Prompt Template Categories**
- [ ] **AI/Automation Templates**: AI agent orchestration และ prompt engineering ขั้นสูง
  - `ai-agent-orchestration.md`: การสร้างและจัดการ AI agents + N8N workflow automation
  - `prompt-engineering.md`: การสร้าง prompt ขั้นสูงด้วย chain-of-thought reasoning สำหรับ enterprise agents

- [ ] **DevOps/CI-CD Templates**: Pipeline automation และ infrastructure management
  - `ci-cd-pipeline.md`: GitHub Actions pipeline design, secrets management, changeset/npm publishing
  - `infrastructure-as-code.md`: Terraform/Helm automation สำหรับ billion-dollar scale infrastructure

- [ ] **Data & Event Templates**: Event-driven architecture และ data governance
  - `event-driven-design.md`: Event bus schema, outbox pattern, pub/sub rules, saga orchestration
  - `data-governance.md`: Data retention, PII masking, multi-region replication, GDPR compliance

- [ ] **Product/UX Templates**: Design system และ API/SDK generation
  - `ui-ux-guidelines.md`: Design tokens, accessibility, Tanqory branding rules, cultural adaptation
  - `api-sdk-generation.md`: Auto-generate multi-platform SDK from OpenAPI specifications

### **Prompt Template Integration Standards**
- [ ] **Chain-of-Thought Reasoning**: ใช้ advanced reasoning frameworks สำหรับ complex enterprise decisions
- [ ] **Domain-Specific Context**: รวม relevant templates ตาม business domain และ task complexity
- [ ] **Quality Gates Integration**: prompt templates ต้องรวม quality validation และ testing frameworks
- [ ] **Global Scalability**: templates ต้องรองรับ cultural adaptation และ multi-region deployment
- [ ] **AI-First Optimization**: templates ต้องเพิ่มประสิทธิภาพ AI reasoning และลด human intervention

---

## Documentation Policy
- [ ] ทุกฟีเจอร์ **ต้องมี** OpenAPI spec (.yaml)
- [ ] ต้องมี **Changelog** อัปเดตทุก release
- [ ] เอกสารต้องมีทั้ง **ภาษาไทย** และ **ภาษาอังกฤษ**
- [ ] Docs เก็บใน monorepo `docs/` และ sync อัตโนมัติกับ Knowledge Base
- [ ] Review เอกสารทุก quarter หรือเมื่อมี breaking change

---

## Security & Privacy
- [ ] Authentication: **OAuth2 + JWT** สำหรับทุกบริการ
- [ ] **PII masking** ทุกจุดที่จัดเก็บหรือส่งผ่านข้อมูลส่วนบุคคล
- [ ] ทุกการเขียน (write operation) ต้องส่ง **`X-Idempotency-Key`**
- [ ] บังคับใช้ HTTPS/TLS1.3 และปรับ rotate keys ทุก 90 วัน
- [ ] Audit logs ต้องเก็บอย่างน้อย 1 ปี และเข้ารหัสฝั่งเซิร์ฟเวอร์
- [ ] **Secrets Management**: HashiCorp Vault สำหรับ API keys และ certificates
- [ ] **Data Encryption**: AES-256 สำหรับ data at rest, TLS 1.3 สำหรับ data in transit
- [ ] **Vulnerability Scanning**: Dependabot + Snyk สำหรับ dependency scanning
- [ ] **Network Security**: VPC isolation, security groups, และ WAF
- [ ] **Compliance**: GDPR และ PDPA compliance checklist

---

## Version Management
- [ ] ใช้ **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`
- [ ] เมื่อมี breaking change ต้องเพิ่ม **MAJOR** และประกาศ **Deprecation policy** ล่วงหน้า
- [ ] ระบุวันที่ EOL (End of Life) ชัดเจนใน Changelog
- [ ] เวอร์ชัน API ต้องระบุใน path เช่น `/v1/`

---

## Observability
- [ ] **Structured Logging**: ใช้ JSON format พร้อม correlation IDs
- [ ] **Metrics Collection**: Prometheus + Grafana สำหรับ business และ technical metrics
- [ ] **Distributed Tracing**: OpenTelemetry สำหรับ request flow ข้าม services
- [ ] **SLA/SLO**: กำหนด uptime 99.9%, response time < 200ms สำหรับ critical APIs
- [ ] **Alerting**: PagerDuty integration สำหรับ production incidents

---

## UI/UX Design System

### Brand Identity
- **Primary Brand Color**: Black (#000) / White (#fff) - Dynamic based on theme
- **Accent Color**: Electric Lime (#e1ff00) - Signature brand highlight
- **Design Philosophy**: Modern & Minimal, Accessible First, Developer Friendly

### Technology Stack
- **Framework**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS with CSS custom properties
- **Components**: Radix UI primitives for accessibility
- **Build Tool**: Vite 6.3.5

### Standards
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsive**: Mobile-first approach
- **Component Architecture**: Compound components with ref forwarding
- **Naming**: PascalCase components, camelCase props, kebab-case CSS

---

## Governance & Review Process
- [ ] **Policy Owner**: Architecture Team รับผิดชอบ policies ทั้งหมด
- [ ] **Review Cycle**: ทบทวนทุก quarter หรือเมื่อมี major changes
- [ ] **Approval Process**:
  - Minor changes: Architecture Team approval
  - Major changes: CTO + Security Team approval
- [ ] **Communication**: ประกาศใน #engineering-announcements ก่อน effective date 30 วัน

---

## Related Documents

### **Core Framework**
- [Core Domain Glossary](02_core_domain_glossary.md) - คำจำกัดความและ entity ownership
- [Core API Standards](03_core_api_standards.md) - RESTful API standards และ OpenAPI specs
- [Core Security](04_core_security.md) - รายละเอียด security implementation
- [Core Coding Standards](05_core_coding_standards.md) - Code style และ best practices
- [Core Documentation Style](06_core_documentation_style.md) - Writing และ formatting standards
- [Technology Choice Rationale](06_technology_choice_rationale.md) - Technology stack decisions
- [Platform Integration Matrix](07_platform_integration_matrix.md) - Cross-platform architecture

### **Business Strategy**
- [Competitive Analysis](../business/01_competitive_analysis.md) - Market positioning and competitor analysis
- [Growth Channels Strategy](../business/02_growth_channels_strategy.md) - Customer acquisition framework

### **Legal & Compliance**
- [Intellectual Property Portfolio](../legal/01_intellectual_property_portfolio.md) - Complete trademark and IP documentation

### **Brand & Identity**
- [Brand Identity Guidelines](../brand/01_brand_identity_guidelines.md) - Visual identity and brand standards

### **Enterprise Governance**
- [Enterprise Business Priority Framework](../enterprise/00_enterprise_business_priority_framework.md) - Complete business decision framework
- [Enterprise Governance](../enterprise/01_enterprise_governance.md) - Business decision authority and governance
- [Enterprise Architecture](../enterprise/02_enterprise_architecture.md) - Business-aligned architecture decisions

---

*เอกสารนี้เป็นคู่มือหลักสำหรับนโยบายองค์กร Tanqory ที่มุ่งเน้นการทำงานแบบ AI-first และการขยายระดับโลก*

**Last Updated**: September 16, 2025
**Version**: 1.0.0