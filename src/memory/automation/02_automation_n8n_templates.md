---
title: N8N Workflow Templates
version: 1.0
owner: Architecture Team
last_reviewed: 2025-09-16
next_review: 2025-12-16
---

# N8N Workflow Templates

> **Automation Memory**: เทมเพลต n8n workflows สำหรับ AI-first continuous development streams ที่ทำงาน 24/7

## Table of Contents
- [Continuous Stream Templates](#continuous-stream-templates)
- [AI Agent Integration Patterns](#ai-agent-integration-patterns)
- [Real-Time Processing Nodes](#real-time-processing-nodes)
- [Autonomous Decision Flows](#autonomous-decision-flows)
- [Human Escalation Patterns](#human-escalation-patterns)
- [Monitoring & Intelligence](#monitoring--intelligence)
- [Deployment & Auto-scaling](#deployment--auto-scaling)

---

## Continuous Stream Templates

### **Stream Naming Convention**
```
Tanqory-{Stream}-{Domain}-{Environment}

Examples:
- Tanqory-Requirements-Stream-Production
- Tanqory-Implementation-Stream-Catalog-Live
- Tanqory-Quality-Stream-Global-Continuous
```

### **Common Workflow Structure**
```json
{
  "meta": {
    "instanceId": "tanqory-{stage}-{service}-{env}"
  },
  "nodes": [
    "1-trigger",
    "2-context-injection",
    "3-ai-agent",
    "4-validation",
    "5-quality-gates",
    "6-success-action",
    "7-error-handler",
    "8-notification"
  ],
  "connections": {
    "trigger": ["context-injection"],
    "context-injection": ["ai-agent"],
    "ai-agent": ["validation"],
    "validation": ["quality-gates", "error-handler"],
    "quality-gates": ["success-action", "error-handler"],
    "success-action": ["notification"],
    "error-handler": ["notification"]
  }
}
```

---

## Common Node Patterns

### **1. Context Injection Node (Reusable)**
```javascript
// Node: Context-Injection
// Type: Function
const items = $input.all();

// Load Company Memory
const companyMemory = {
  policies: await $nodeHelpers.httpRequest({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/00_policies.md'
  }),
  domains: await $nodeHelpers.httpRequest({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/01_domain_glossary.md'
  }),
  apiRules: await $nodeHelpers.httpRequest({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/02_api_rules.md'
  }),
  security: await $nodeHelpers.httpRequest({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/03_security.md'
  }),
  coding: await $nodeHelpers.httpRequest({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/04_coding_standards.md'
  }),
  docs: await $nodeHelpers.httpRequest({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/05_docs_style.md'
  }),
  aiWorkflow: await $nodeHelpers.httpRequest({
    method: 'GET',
    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/automation/01_automation_ai_workflow_rules.md'
  })
};

// Add service-specific context
const serviceName = items[0].json.service;
if (serviceName) {
  companyMemory.openapi = await $nodeHelpers.httpRequest({
    method: 'GET',
    url: `https://raw.githubusercontent.com/tanqory/company-memory/main/openapi/${serviceName}.v1.yaml`
  });
}

// Build AI prompt context
const aiContext = `
# TANQORY AI AGENT HEADER v1.0
## SYSTEM GOALS
- ทำตาม Company Memory และ OpenAPI rules เคร่งครัด
- ห้ามสร้างโครงใหม่ แก้เฉพาะไฟล์ที่ระบุ
- ผลลัพธ์ต้องเป็น unified diffs + deterministic/idempotent

## CONTEXT PACK
${Object.entries(companyMemory).map(([key, content]) =>
  `### ${key.toUpperCase()}\n${content}`
).join('\n\n')}

## OUTPUT FORMAT
1) รายการไฟล์ที่จะเปลี่ยน
2) Unified diffs
3) รายการเทส/คำสั่งเทส
4) บันทึก docs/changelog

## TASK: ${items[0].json.task || 'Process the given request'}
---
`;

return items.map(item => ({
  json: {
    ...item.json,
    aiContext: aiContext,
    companyMemory: companyMemory,
    contextSize: aiContext.length,
    timestamp: new Date().toISOString()
  }
}));
```

### **2. AI Agent Node (Reusable)**
```javascript
// Node: AI-Agent
// Type: OpenAI GPT-4
{
  "model": "gpt-4-turbo-preview",
  "messages": [
    {
      "role": "system",
      "content": "{{$json.aiContext}}"
    },
    {
      "role": "user",
      "content": "{{$json.userRequest || $json.task}}"
    }
  ],
  "temperature": 0.1,
  "max_tokens": 4000,
  "stream": false
}
```

### **3. Validation Node (Reusable)**
```javascript
// Node: Output-Validation
// Type: Function
const items = $input.all();

const validateAIResponse = (response) => {
  const requiredSections = [
    '1) รายการไฟล์ที่จะเปลี่ยน',
    '2) Unified diffs',
    '3) รายการเทส/คำสั่งเทส',
    '4) บันทึก docs/changelog'
  ];

  const validations = {
    hasRequiredSections: requiredSections.every(section =>
      response.includes(section)
    ),
    hasValidDiffs: /^[\+\-@]/m.test(response),
    noForbiddenPatterns: !response.includes('new file mode'),
    hasTestRequirements: /test|spec/i.test(response),
    hasDeterministicOutput: !/(Math\.random|Date\.now|UUID)/i.test(response)
  };

  const allValid = Object.values(validations).every(Boolean);

  return {
    valid: allValid,
    validations: validations,
    score: Object.values(validations).filter(Boolean).length / Object.keys(validations).length
  };
};

return items.map(item => {
  const aiResponse = item.json.choices?.[0]?.message?.content || item.json.response;
  const validation = validateAIResponse(aiResponse);

  if (!validation.valid) {
    throw new Error(`AI response validation failed: ${JSON.stringify(validation.validations)}`);
  }

  return {
    json: {
      ...item.json,
      aiResponse: aiResponse,
      validation: validation,
      validatedAt: new Date().toISOString()
    }
  };
});
```

### **4. Quality Gates Node (Reusable)**
```javascript
// Node: Quality-Gates
// Type: Function
const items = $input.all();

const runQualityChecks = async (aiResponse) => {
  const checks = {
    syntax: checkSyntaxValidity(aiResponse),
    security: await runSecurityScan(aiResponse),
    patterns: validateCodingPatterns(aiResponse),
    api: validateApiCompliance(aiResponse),
    tests: validateTestCoverage(aiResponse)
  };

  const scores = Object.values(checks).map(check => check.score);
  const overallScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    passed: overallScore >= 0.8,
    score: overallScore,
    checks: checks,
    recommendations: generateRecommendations(checks)
  };
};

// Helper functions
const checkSyntaxValidity = (response) => {
  // Check for common syntax errors in generated code
  const syntaxErrors = [
    /console\.log/g,           // No console.log in production
    /var\s+/g,                // Use const/let instead of var
    /==\s*[^=]/g,             // Use === instead of ==
    /function\s*\(/g          // Prefer arrow functions
  ];

  const errorCount = syntaxErrors.reduce((count, regex) => {
    const matches = response.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  return {
    score: Math.max(0, 1 - (errorCount * 0.1)),
    errors: errorCount,
    passed: errorCount === 0
  };
};

const runSecurityScan = async (response) => {
  // Security pattern detection
  const securityIssues = [
    /password\s*=\s*['"]/gi,   // Hardcoded passwords
    /api[_-]?key\s*=\s*['"]/gi, // Hardcoded API keys
    /secret\s*=\s*['"]/gi,     // Hardcoded secrets
    /eval\s*\(/gi,             // Dangerous eval usage
    /innerHTML\s*=/gi          // XSS vulnerability
  ];

  let issueCount = 0;
  const foundIssues = [];

  securityIssues.forEach((regex, index) => {
    const matches = response.match(regex);
    if (matches) {
      issueCount += matches.length;
      foundIssues.push({
        type: ['password', 'apiKey', 'secret', 'eval', 'innerHTML'][index],
        count: matches.length
      });
    }
  });

  return {
    score: issueCount === 0 ? 1 : 0,
    issues: foundIssues,
    passed: issueCount === 0
  };
};

const validateCodingPatterns = (response) => {
  // Check for compliance with coding standards
  const patterns = {
    hasTypeAnnotations: /:\s*(string|number|boolean|object)/g,
    usesAsyncAwait: /async\s+.*await/g,
    hasErrorHandling: /try\s*{[\s\S]*catch/g,
    usesProperImports: /import\s+.*from/g,
    hasDocumentation: /@\w+/g
  };

  const scores = Object.entries(patterns).map(([name, regex]) => {
    const hasPattern = regex.test(response);
    return hasPattern ? 1 : 0;
  });

  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  return {
    score: averageScore,
    patterns: patterns,
    passed: averageScore >= 0.7
  };
};

const validateApiCompliance = (response) => {
  // Check API compliance with company standards
  if (!response.includes('openapi:') && !response.includes('/v1/')) {
    return { score: 1, passed: true, reason: 'Not an API change' };
  }

  const apiChecks = {
    hasVersioning: /\/v\d+\//g.test(response),
    usesRestfulUrls: !/\/get[A-Z]|\/create[A-Z]|\/update[A-Z]|\/delete[A-Z]/g.test(response),
    hasProperStatusCodes: /200|201|400|401|403|404|500/.test(response),
    includesPagination: /limit|offset|page|next|cursor/.test(response),
    hasErrorHandling: /error|Error/.test(response)
  };

  const passedChecks = Object.values(apiChecks).filter(Boolean).length;
  const totalChecks = Object.keys(apiChecks).length;

  return {
    score: passedChecks / totalChecks,
    checks: apiChecks,
    passed: passedChecks / totalChecks >= 0.8
  };
};

const validateTestCoverage = (response) => {
  // Check if tests are included
  const testIndicators = [
    /describe\s*\(/g,
    /it\s*\(/g,
    /test\s*\(/g,
    /expect\s*\(/g,
    /\.test\.|\.spec\./g
  ];

  const hasTests = testIndicators.some(regex => regex.test(response));
  const testCount = testIndicators.reduce((count, regex) => {
    const matches = response.match(regex);
    return count + (matches ? matches.length : 0);
  }, 0);

  return {
    score: hasTests ? Math.min(1, testCount / 10) : 0,
    hasTests: hasTests,
    testCount: testCount,
    passed: hasTests
  };
};

const generateRecommendations = (checks) => {
  const recommendations = [];

  if (!checks.syntax.passed) {
    recommendations.push('Fix syntax errors: avoid console.log, use const/let, prefer ===');
  }

  if (!checks.security.passed) {
    recommendations.push('Security issues found: remove hardcoded secrets, avoid dangerous functions');
  }

  if (!checks.patterns.passed) {
    recommendations.push('Improve code patterns: add type annotations, error handling, documentation');
  }

  if (!checks.api.passed) {
    recommendations.push('API compliance issues: ensure RESTful URLs, proper status codes, pagination');
  }

  if (!checks.tests.passed) {
    recommendations.push('Add comprehensive tests: unit tests with proper assertions');
  }

  return recommendations;
};

// Main execution
return Promise.all(items.map(async item => {
  const qualityResult = await runQualityChecks(item.json.aiResponse);

  if (!qualityResult.passed) {
    throw new Error(`Quality gates failed: Score ${qualityResult.score}, Issues: ${qualityResult.recommendations.join(', ')}`);
  }

  return {
    json: {
      ...item.json,
      qualityGates: qualityResult,
      qualityScore: qualityResult.score,
      qualityCheckedAt: new Date().toISOString()
    }
  };
}));
```

### **5. Success Action Node (Template)**
```javascript
// Node: Success-Action
// Type: HTTP Request + GitHub API
const items = $input.all();

const createPullRequest = async (item) => {
  const { aiResponse, service, issue } = item.json;

  // Parse AI response to extract changes
  const changes = parseAIResponse(aiResponse);

  // Create branch
  const branchName = `ai-feature/${service}-${issue.number}-${Date.now()}`;

  // Commit changes
  const commits = await Promise.all(changes.files.map(async file => {
    return await $nodeHelpers.httpRequest({
      method: 'PUT',
      url: `https://api.github.com/repos/tanqory/${service}-repo/contents/${file.path}`,
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: {
        message: `AI: ${file.changeDescription}`,
        content: Buffer.from(file.newContent).toString('base64'),
        branch: branchName,
        sha: file.currentSha
      }
    });
  }));

  // Create Pull Request
  const pr = await $nodeHelpers.httpRequest({
    method: 'POST',
    url: `https://api.github.com/repos/tanqory/${service}-repo/pulls`,
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: {
      title: `🤖 AI Implementation: ${issue.title}`,
      head: branchName,
      base: 'main',
      body: generatePRDescription(aiResponse, changes),
      draft: false
    }
  });

  return {
    pullRequest: pr,
    commits: commits,
    branchName: branchName
  };
};

const parseAIResponse = (response) => {
  // Extract file changes from AI response
  const fileChangesSection = response.split('1) รายการไฟล์ที่จะเปลี่ยน')[1]?.split('2) Unified diffs')[0];
  const diffSection = response.split('2) Unified diffs')[1]?.split('3) รายการเทส')[0];
  const testSection = response.split('3) รายการเทส')[1]?.split('4) บันทึก docs/changelog')[0];
  const changelogSection = response.split('4) บันทึก docs/changelog')[1];

  return {
    files: parseFileChanges(fileChangesSection, diffSection),
    tests: parseTestRequirements(testSection),
    changelog: parseChangelog(changelogSection)
  };
};

const generatePRDescription = (aiResponse, changes) => {
  return `
## 🤖 AI-Generated Implementation

**Generated by**: Tanqory AI Workflow System
**Stage**: Implementation
**Quality Score**: ${changes.qualityScore || 'N/A'}

## 📋 Changes Made

${changes.files.map(file => `- **${file.path}**: ${file.changeDescription}`).join('\n')}

## 🧪 Testing

${changes.tests.map(test => `- ${test}`).join('\n')}

## 📖 Documentation

${changes.changelog || 'No documentation changes'}

## ✅ Quality Gates Passed

- [x] Syntax validation
- [x] Security scan
- [x] Coding patterns
- [x] API compliance
- [x] Test coverage

---

*This PR was automatically generated by the Tanqory AI workflow system. Please review the changes before merging.*

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
  `;
};

// Execute for all items
return Promise.all(items.map(async item => {
  const result = await createPullRequest(item);

  return {
    json: {
      ...item.json,
      successAction: result,
      pullRequestUrl: result.pullRequest.html_url,
      branchName: result.branchName,
      completedAt: new Date().toISOString()
    }
  };
}));
```

### **6. Error Handler Node (Template)**
```javascript
// Node: Error-Handler
// Type: Function
const items = $input.all();

const handleError = (error, context, attemptCount = 0) => {
  const errorCategory = classifyError(error);

  const errorResponse = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      category: errorCategory,
      attemptCount: attemptCount
    },
    context: {
      stage: context.stage,
      service: context.service,
      issueId: context.issue?.id,
      workflowId: context.workflowId
    },
    action: null,
    escalation: null
  };

  switch (errorCategory) {
    case 'retryable':
      if (attemptCount < 3) {
        errorResponse.action = {
          type: 'retry',
          delay: Math.pow(2, attemptCount) * 1000,
          nextAttempt: attemptCount + 1
        };
      } else {
        errorResponse.action = { type: 'escalate', reason: 'max_retries_exceeded' };
        errorResponse.escalation = createEscalationContext(error, context);
      }
      break;

    case 'fixable':
      errorResponse.action = {
        type: 'fix_and_retry',
        enhancedContext: {
          ...context,
          errorDetails: error.message,
          fixingSuggestions: generateFixSuggestions(error),
          similarSuccessfulFixes: findSimilarFixes(error)
        }
      };
      break;

    case 'escalation':
      errorResponse.action = { type: 'escalate_immediately' };
      errorResponse.escalation = createEscalationContext(error, context, {
        priority: 'high',
        expert: determineRequiredExpert(error),
        blocking: true
      });
      break;

    case 'system':
      errorResponse.action = { type: 'system_notification' };
      errorResponse.escalation = {
        type: 'system_admin',
        details: error.message,
        systemHealth: checkSystemHealth()
      };
      break;

    default:
      errorResponse.action = { type: 'escalate', reason: 'unknown_error' };
      errorResponse.escalation = createEscalationContext(error, context);
  }

  return errorResponse;
};

const classifyError = (error) => {
  const message = error.message.toLowerCase();

  // Retryable errors
  if (message.includes('timeout') ||
      message.includes('rate limit') ||
      message.includes('network') ||
      message.includes('temporary')) {
    return 'retryable';
  }

  // Fixable errors
  if (message.includes('validation') ||
      message.includes('syntax') ||
      message.includes('type error') ||
      message.includes('lint')) {
    return 'fixable';
  }

  // Escalation errors
  if (message.includes('security') ||
      message.includes('policy') ||
      message.includes('breaking change') ||
      message.includes('permission denied')) {
    return 'escalation';
  }

  // System errors
  if (message.includes('authentication') ||
      message.includes('infrastructure') ||
      message.includes('dependency')) {
    return 'system';
  }

  return 'unknown';
};

const createEscalationContext = (error, context, options = {}) => {
  return {
    summary: {
      title: `Workflow Error: ${context.stage} stage failed`,
      description: error.message,
      stage: context.stage,
      service: context.service,
      priority: options.priority || 'medium'
    },
    technical: {
      errorDetails: {
        message: error.message,
        stack: error.stack,
        category: classifyError(error)
      },
      context: context,
      systemState: checkSystemHealth(),
      relatedLogs: getRelatedLogs(context.workflowId)
    },
    business: {
      impact: assessBusinessImpact(context),
      stakeholders: getStakeholders(context.service),
      timeline: calculateTimeline(context)
    },
    recommendations: {
      expert: options.expert || determineRequiredExpert(error),
      actions: generateActionPlan(error, context),
      alternativeApproaches: suggestAlternatives(context)
    }
  };
};

const generateFixSuggestions = (error) => {
  const message = error.message.toLowerCase();
  const suggestions = [];

  if (message.includes('validation')) {
    suggestions.push('Check input data format and required fields');
    suggestions.push('Verify API schema compliance');
  }

  if (message.includes('syntax')) {
    suggestions.push('Review generated code for syntax errors');
    suggestions.push('Check for missing semicolons, brackets, or quotes');
  }

  if (message.includes('type')) {
    suggestions.push('Add proper TypeScript type annotations');
    suggestions.push('Check for type mismatches in function parameters');
  }

  if (message.includes('test')) {
    suggestions.push('Ensure test files follow naming conventions');
    suggestions.push('Add missing test assertions and setup');
  }

  return suggestions;
};

// Execute error handling
return items.map(item => {
  const error = new Error(item.json.error || 'Unknown error occurred');
  const context = {
    stage: item.json.stage || 'unknown',
    service: item.json.service || 'unknown',
    issue: item.json.issue,
    workflowId: item.json.workflowId || 'unknown'
  };

  const errorHandling = handleError(error, context, item.json.attemptCount || 0);

  return {
    json: {
      ...item.json,
      errorHandling: errorHandling,
      handled: true,
      handledAt: new Date().toISOString()
    }
  };
});
```

---

## Stage Templates

### **Stage 0: Intake & Triage Template**
```json
{
  "name": "Tanqory-0-Intake-Production",
  "description": "Stage 0: Issue classification and team assignment",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "github-webhook",
        "responseMode": "responseNode",
        "options": {}
      },
      "name": "GitHub-Webhook-Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": "// Inject Company Memory for issue classification\nconst issue = $input.first().json.issue;\n\nconst context = {\n  title: issue.title,\n  body: issue.body,\n  labels: issue.labels?.map(l => l.name) || [],\n  author: issue.user.login,\n  repository: $input.first().json.repository.name\n};\n\n// Load domain glossary for classification\nconst domainGlossary = await $nodeHelpers.httpRequest({\n  method: 'GET',\n  url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/01_domain_glossary.md'\n});\n\nconst aiContext = `\n# TANQORY AI AGENT HEADER v1.0\n## TASK: Classify GitHub issue and assign to appropriate team\n\n## CONTEXT PACK\n### DOMAIN GLOSSARY\n${domainGlossary}\n\n### ISSUE TO CLASSIFY\nTitle: ${context.title}\nBody: ${context.body}\nRepository: ${context.repository}\n\n## OUTPUT FORMAT\n1) Domain: [catalog|order|analytics|identity|platform]\n2) Type: [feature|bug|enhancement|documentation]\n3) Priority: [low|medium|high|critical]\n4) Team: [@team-name]\n5) Labels: [label1, label2, label3]\n6) Template: [template-file.md]\n`;\n\nreturn [{\n  json: {\n    ...context,\n    aiContext: aiContext,\n    stage: 'intake',\n    task: 'classify-and-route'\n  }\n}];"
      },
      "name": "Context-Injection",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "model": "gpt-4-turbo-preview",
        "messages": {
          "messageType": "multipleMessages",
          "multipleMessages": {
            "messages": [
              {
                "role": "system",
                "content": "={{$json.aiContext}}"
              },
              {
                "role": "user",
                "content": "Classify this GitHub issue according to the domain glossary and company policies."
              }
            ]
          }
        },
        "options": {
          "temperature": 0.1,
          "maxTokens": 1000
        }
      },
      "name": "AI-Classifier",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "functionCode": "// Parse AI classification and apply labels\nconst classification = $input.first().json.choices[0].message.content;\n\n// Extract classification data\nconst domain = classification.match(/Domain: (\\w+)/)?.[1];\nconst type = classification.match(/Type: (\\w+)/)?.[1];\nconst priority = classification.match(/Priority: (\\w+)/)?.[1];\nconst team = classification.match(/Team: (@[\\w-]+)/)?.[1];\nconst labels = classification.match(/Labels: \\[([^\\]]+)\\]/)?.[1]?.split(', ');\nconst template = classification.match(/Template: ([\\w.-]+)/)?.[1];\n\nif (!domain || !type || !priority || !team) {\n  throw new Error(`Incomplete classification: domain=${domain}, type=${type}, priority=${priority}, team=${team}`);\n}\n\nreturn [{\n  json: {\n    classification: {\n      domain: domain,\n      type: type,\n      priority: priority,\n      team: team,\n      labels: labels || [],\n      template: template\n    },\n    githubActions: {\n      addLabels: [`domain:${domain}`, `type:${type}`, `priority:${priority}`].concat(labels || []),\n      assignTeam: team,\n      addComment: `🤖 **Auto-classified by AI**\\n\\n**Domain**: ${domain}\\n**Type**: ${type}\\n**Priority**: ${priority}\\n**Assigned to**: ${team}\\n\\nNext: Contract drafting will begin automatically.`\n    },\n    nextStage: {\n      trigger: 'contract-draft',\n      service: domain,\n      template: template\n    }\n  }\n}];"
      },
      "name": "Parse-Classification",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "resource": "issue",
        "operation": "update",
        "owner": "={{$json.repository.owner.login}}",
        "repository": "={{$json.repository.name}}",
        "issueNumber": "={{$json.issue.number}}",
        "updateFields": {
          "labels": "={{$json.githubActions.addLabels}}",
          "assignees": ["={{$json.classification.team.replace('@', '')}}"]
        }
      },
      "name": "Update-GitHub-Issue",
      "type": "n8n-nodes-base.github",
      "typeVersion": 1,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "channel": "#engineering-intake",
        "text": "🎯 **New Issue Classified**\\n\\n**Issue**: {{$json.issue.title}}\\n**Domain**: {{$json.classification.domain}}\\n**Priority**: {{$json.classification.priority}}\\n**Team**: {{$json.classification.team}}\\n\\n**Next**: Contract drafting started automatically",
        "otherOptions": {
          "includeLinkToWorkflow": true
        }
      },
      "name": "Slack-Notification",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [1340, 300]
    }
  ],
  "connections": {
    "GitHub-Webhook-Trigger": {
      "main": [
        [
          {
            "node": "Context-Injection",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Context-Injection": {
      "main": [
        [
          {
            "node": "AI-Classifier",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI-Classifier": {
      "main": [
        [
          {
            "node": "Parse-Classification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Parse-Classification": {
      "main": [
        [
          {
            "node": "Update-GitHub-Issue",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update-GitHub-Issue": {
      "main": [
        [
          {
            "node": "Slack-Notification",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### **Stage 1: Contract Draft Template**
```json
{
  "name": "Tanqory-1-Contract-Draft-Production",
  "description": "Stage 1: OpenAPI specification generation",
  "nodes": [
    {
      "parameters": {
        "triggerOn": "labelAdded",
        "labels": "needs-api-contract"
      },
      "name": "GitHub-Label-Trigger",
      "type": "n8n-nodes-base.githubTrigger",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "functionCode": "// Enhanced context for OpenAPI generation\nconst issue = $input.first().json.issue;\nconst labels = issue.labels.map(l => l.name);\nconst domain = labels.find(l => l.startsWith('domain:'))?.split(':')[1];\n\nif (!domain) {\n  throw new Error('Domain not specified in issue labels');\n}\n\n// Load comprehensive context for API design\nconst [apiRules, security, existingOpenAPI] = await Promise.all([\n  $nodeHelpers.httpRequest({\n    method: 'GET',\n    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/02_api_rules.md'\n  }),\n  $nodeHelpers.httpRequest({\n    method: 'GET', \n    url: 'https://raw.githubusercontent.com/tanqory/company-memory/main/docs/memory/03_security.md'\n  }),\n  $nodeHelpers.httpRequest({\n    method: 'GET',\n    url: `https://raw.githubusercontent.com/tanqory/company-memory/main/openapi/${domain}.v1.yaml`\n  }).catch(() => null)\n]);\n\nconst aiContext = `\n# TANQORY AI AGENT HEADER v1.0\n## TASK: Generate OpenAPI specification for new feature\n\n## CONTEXT PACK\n### API RULES\n${apiRules}\n\n### SECURITY GUIDELINES  \n${security}\n\n### EXISTING OPENAPI (if any)\n${existingOpenAPI || 'No existing OpenAPI for this service'}\n\n### FEATURE REQUEST\nTitle: ${issue.title}\nDescription: ${issue.body}\nDomain: ${domain}\n\n## OUTPUT FORMAT\n1) รายการไฟล์ที่จะเปลี่ยน\n   - openapi/${domain}.v1.yaml\n\n2) Unified diffs\n   - Complete OpenAPI specification\n   - New endpoints with proper schemas\n   - Authentication and authorization\n   - Error responses and examples\n\n3) รายการเทส/คำสั่งเทส\n   - OpenAPI validation commands\n   - Contract testing requirements\n\n4) บันทึก docs/changelog\n   - API version changes\n   - New endpoint documentation\n`;\n\nreturn [{\n  json: {\n    issue: issue,\n    domain: domain,\n    aiContext: aiContext,\n    stage: 'contract-draft',\n    task: 'generate-openapi-spec'\n  }\n}];"
      },
      "name": "Context-Injection",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [460, 300]
    },
    {
      "parameters": {
        "model": "gpt-4-turbo-preview",
        "messages": {
          "messageType": "multipleMessages",
          "multipleMessages": {
            "messages": [
              {
                "role": "system",
                "content": "={{$json.aiContext}}"
              },
              {
                "role": "user",
                "content": "Generate a comprehensive OpenAPI specification following all company standards and security requirements."
              }
            ]
          }
        },
        "options": {
          "temperature": 0.1,
          "maxTokens": 4000
        }
      },
      "name": "AI-OpenAPI-Generator",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1,
      "position": [680, 300]
    },
    {
      "parameters": {
        "functionCode": "// Validate OpenAPI specification\nconst aiResponse = $input.first().json.choices[0].message.content;\n\n// Extract OpenAPI YAML from response\nconst yamlMatch = aiResponse.match(/```ya?ml\\n([\\s\\S]*?)\\n```/);\nif (!yamlMatch) {\n  throw new Error('No YAML OpenAPI specification found in AI response');\n}\n\nconst openApiYaml = yamlMatch[1];\n\n// Basic validation\nif (!openApiYaml.includes('openapi: 3.')) {\n  throw new Error('Invalid OpenAPI version');\n}\n\nif (!openApiYaml.includes('paths:')) {\n  throw new Error('No paths defined in OpenAPI spec');\n}\n\nif (!openApiYaml.includes('components:')) {\n  throw new Error('No components defined in OpenAPI spec');\n}\n\n// Security validation\nif (!openApiYaml.includes('bearerAuth') && !openApiYaml.includes('security:')) {\n  throw new Error('No authentication/security defined');\n}\n\n// API rules compliance\nif (!openApiYaml.includes('/v1/')) {\n  throw new Error('API versioning not found');\n}\n\nconst validation = {\n  hasOpenApiVersion: openApiYaml.includes('openapi: 3.'),\n  hasPaths: openApiYaml.includes('paths:'),\n  hasComponents: openApiYaml.includes('components:'),\n  hasSecurity: openApiYaml.includes('security:'),\n  hasVersioning: openApiYaml.includes('/v1/'),\n  hasErrorResponses: openApiYaml.includes('400:') && openApiYaml.includes('500:'),\n  hasPagination: openApiYaml.includes('limit') || openApiYaml.includes('page'),\n  hasExamples: openApiYaml.includes('examples:')\n};\n\nconst validationScore = Object.values(validation).filter(Boolean).length / Object.keys(validation).length;\n\nif (validationScore < 0.8) {\n  throw new Error(`OpenAPI validation failed. Score: ${validationScore}. Issues: ${JSON.stringify(validation)}`);\n}\n\nreturn [{\n  json: {\n    aiResponse: aiResponse,\n    openApiSpec: openApiYaml,\n    validation: validation,\n    validationScore: validationScore,\n    domain: $input.first().json.domain,\n    validatedAt: new Date().toISOString()\n  }\n}];"
      },
      "name": "Validate-OpenAPI",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [900, 300]
    },
    {
      "parameters": {
        "requestMethod": "POST",
        "url": "https://api.github.com/repos/tanqory/company-memory/contents/openapi/{{$json.domain}}.v1.yaml",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "githubApi",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyContentType": "json",
        "jsonBody": "={\"message\": \"🤖 AI: Update OpenAPI spec for \" + $json.domain + \" service\\n\\n\" + $json.aiResponse.split('4) บันทึก docs/changelog')[1] + \"\\n\\n🚀 Generated with Claude Code\\nCo-Authored-By: Claude <noreply@anthropic.com>\", \"content\": $base64($json.openApiSpec), \"branch\": \"ai-openapi-\" + $json.domain + \"-\" + Date.now()}"
      },
      "name": "Create-OpenAPI-PR",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [1120, 300]
    },
    {
      "parameters": {
        "channel": "#engineering-api",
        "text": "📋 **OpenAPI Specification Generated**\\n\\n**Service**: {{$json.domain}}\\n**Validation Score**: {{$json.validationScore}}\\n**Review Required**: OpenAPI spec ready for review\\n\\n**Next**: Service implementation will start after approval",
        "otherOptions": {
          "includeLinkToWorkflow": true
        }
      },
      "name": "Slack-Notification",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 1,
      "position": [1340, 300]
    }
  ]
}
```

---

## Integration Patterns

### **GitHub Integration Pattern**
```javascript
// Standard GitHub API interaction
const githubAPI = {
  baseUrl: 'https://api.github.com',
  headers: {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Tanqory-N8N-Workflow'
  },

  async createBranch(repo, branchName, baseSha) {
    return await $nodeHelpers.httpRequest({
      method: 'POST',
      url: `${this.baseUrl}/repos/tanqory/${repo}/git/refs`,
      headers: this.headers,
      body: {
        ref: `refs/heads/${branchName}`,
        sha: baseSha
      }
    });
  },

  async createOrUpdateFile(repo, path, content, message, branch) {
    // Check if file exists
    let sha = null;
    try {
      const existing = await $nodeHelpers.httpRequest({
        method: 'GET',
        url: `${this.baseUrl}/repos/tanqory/${repo}/contents/${path}`,
        headers: this.headers
      });
      sha = existing.sha;
    } catch (error) {
      // File doesn't exist, that's fine
    }

    return await $nodeHelpers.httpRequest({
      method: 'PUT',
      url: `${this.baseUrl}/repos/tanqory/${repo}/contents/${path}`,
      headers: this.headers,
      body: {
        message: message,
        content: Buffer.from(content).toString('base64'),
        branch: branch,
        ...(sha && { sha })
      }
    });
  },

  async createPullRequest(repo, title, head, base, body) {
    return await $nodeHelpers.httpRequest({
      method: 'POST',
      url: `${this.baseUrl}/repos/tanqory/${repo}/pulls`,
      headers: this.headers,
      body: {
        title: title,
        head: head,
        base: base,
        body: body,
        draft: false
      }
    });
  }
};
```

### **Slack Integration Pattern**
```javascript
// Standard Slack notification templates
const slackTemplates = {
  workflowStart: (stage, service) => ({
    channel: '#engineering-workflow',
    text: `🚀 **Workflow Started**\n\n**Stage**: ${stage}\n**Service**: ${service}\n**Status**: In Progress`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Workflow Stage ${stage} Started*\n\nService: \`${service}\`\nStatus: 🟡 In Progress`
        }
      }
    ]
  }),

  workflowSuccess: (stage, service, result) => ({
    channel: '#engineering-workflow',
    text: `✅ **Workflow Completed**\n\n**Stage**: ${stage}\n**Service**: ${service}\n**Quality Score**: ${result.qualityScore}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stage ${stage} Completed Successfully*\n\nService: \`${service}\`\nQuality Score: ${result.qualityScore}\nPR: ${result.pullRequestUrl}`
        }
      }
    ]
  }),

  workflowError: (stage, service, error) => ({
    channel: '#engineering-alerts',
    text: `❌ **Workflow Failed**\n\n**Stage**: ${stage}\n**Service**: ${service}\n**Error**: ${error.message}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Stage ${stage} Failed*\n\nService: \`${service}\`\nError: ${error.message}\nCategory: ${error.category}`
        }
      }
    ]
  }),

  humanEscalation: (escalation) => ({
    channel: '#engineering-escalation',
    text: `🚨 **Human Intervention Required**\n\n**Issue**: ${escalation.summary.title}\n**Expert Needed**: ${escalation.recommendations.expert}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Human Intervention Required*\n\n**Problem**: ${escalation.summary.description}\n**Expert**: ${escalation.recommendations.expert}\n**Priority**: ${escalation.summary.priority}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Take Ownership' },
            action_id: 'take_ownership',
            value: escalation.workflowId
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View Details' },
            action_id: 'view_details',
            url: escalation.detailsUrl
          }
        ]
      }
    ]
  })
};
```

---

## Error Handling Templates

### **Retry Logic Template**
```javascript
// Standard retry mechanism for n8n
const retryLogic = {
  maxAttempts: 3,
  baseDelay: 1000,

  async executeWithRetry(operation, context) {
    let attempt = 0;
    let lastError = null;

    while (attempt < this.maxAttempts) {
      try {
        return await operation(context);
      } catch (error) {
        attempt++;
        lastError = error;

        if (attempt >= this.maxAttempts) {
          throw new Error(`Max retry attempts (${this.maxAttempts}) exceeded. Last error: ${error.message}`);
        }

        const delay = this.baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));

        // Enhance context with error information for next attempt
        context.previousError = error.message;
        context.attemptNumber = attempt + 1;
        context.retryReason = this.classifyRetryReason(error);
      }
    }

    throw lastError;
  },

  classifyRetryReason(error) {
    const message = error.message.toLowerCase();

    if (message.includes('timeout')) return 'timeout';
    if (message.includes('rate limit')) return 'rate_limit';
    if (message.includes('network')) return 'network_error';
    if (message.includes('temporary')) return 'temporary_failure';

    return 'unknown';
  }
};
```

### **Circuit Breaker Template**
```javascript
// Circuit breaker for external service calls
const circuitBreaker = {
  state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
  failureCount: 0,
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  lastFailureTime: null,

  async call(operation, context) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.failureCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
      }
    }

    try {
      const result = await operation(context);

      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN';
      }

      throw error;
    }
  },

  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
};
```

---

## Monitoring & Logging

### **Workflow Telemetry Template**
```javascript
// Standard telemetry collection
const telemetry = {
  async recordEvent(eventType, data) {
    const event = {
      timestamp: new Date().toISOString(),
      eventType: eventType,
      workflowId: data.workflowId,
      stage: data.stage,
      service: data.service,
      duration: data.duration,
      success: data.success,
      errorCategory: data.errorCategory,
      qualityScore: data.qualityScore,
      aiTokensUsed: data.aiTokensUsed,
      humanIntervention: data.humanIntervention,
      metadata: data.metadata || {}
    };

    // Send to multiple monitoring systems
    await Promise.all([
      this.sendToPrometheus(event),
      this.sendToElasticsearch(event),
      this.sendToDatadog(event)
    ]);
  },

  async sendToPrometheus(event) {
    // Convert to Prometheus metrics
    const metrics = [
      `workflow_duration_seconds{stage="${event.stage}",service="${event.service}"} ${event.duration / 1000}`,
      `workflow_success{stage="${event.stage}",service="${event.service}"} ${event.success ? 1 : 0}`,
      `workflow_quality_score{stage="${event.stage}",service="${event.service}"} ${event.qualityScore || 0}`
    ];

    return await $nodeHelpers.httpRequest({
      method: 'POST',
      url: process.env.PROMETHEUS_PUSHGATEWAY_URL,
      headers: { 'Content-Type': 'text/plain' },
      body: metrics.join('\n')
    });
  },

  async sendToElasticsearch(event) {
    return await $nodeHelpers.httpRequest({
      method: 'POST',
      url: `${process.env.ELASTICSEARCH_URL}/workflow-events/_doc`,
      headers: { 'Content-Type': 'application/json' },
      body: event
    });
  },

  async sendToDatadog(event) {
    return await $nodeHelpers.httpRequest({
      method: 'POST',
      url: 'https://api.datadoghq.com/api/v1/events',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': process.env.DATADOG_API_KEY
      },
      body: {
        title: `Workflow ${event.stage} ${event.success ? 'Success' : 'Failed'}`,
        text: `Stage: ${event.stage}, Service: ${event.service}, Quality: ${event.qualityScore}`,
        tags: [`stage:${event.stage}`, `service:${event.service}`, `success:${event.success}`]
      }
    });
  }
};
```

---

## Deployment & Configuration

### **Environment Configuration**
```yaml
# N8N Environment Variables
environments:
  production:
    N8N_BASIC_AUTH_ACTIVE: "true"
    N8N_BASIC_AUTH_USER: "tanqory-admin"
    N8N_BASIC_AUTH_PASSWORD: "${N8N_ADMIN_PASSWORD}"

    # AI Services
    OPENAI_API_KEY: "${OPENAI_API_KEY}"
    ANTHROPIC_API_KEY: "${ANTHROPIC_API_KEY}"

    # GitHub Integration
    GITHUB_TOKEN: "${GITHUB_TOKEN}"
    GITHUB_WEBHOOK_SECRET: "${GITHUB_WEBHOOK_SECRET}"

    # Slack Integration
    SLACK_TOKEN: "${SLACK_TOKEN}"
    SLACK_SIGNING_SECRET: "${SLACK_SIGNING_SECRET}"

    # Monitoring
    PROMETHEUS_PUSHGATEWAY_URL: "${PROMETHEUS_PUSHGATEWAY_URL}"
    ELASTICSEARCH_URL: "${ELASTICSEARCH_URL}"
    DATADOG_API_KEY: "${DATADOG_API_KEY}"

    # Security
    VAULT_URL: "${VAULT_URL}"
    VAULT_TOKEN: "${VAULT_TOKEN}"

  staging:
    # Similar configuration with staging values

  development:
    # Development configuration
```

### **Backup & Recovery**
```yaml
backup:
  workflows:
    schedule: "0 2 * * *" # Daily at 2 AM
    retention: 30 days
    location: "s3://tanqory-n8n-backups/workflows/"

  credentials:
    schedule: "0 3 * * *" # Daily at 3 AM
    encryption: true
    location: "s3://tanqory-n8n-backups/credentials/"

recovery:
  rpo: 24 hours # Recovery Point Objective
  rto: as defined in SLA  # Recovery Time Objective

  procedures:
    - "Stop N8N instance"
    - "Restore from latest backup"
    - "Verify workflow integrity"
    - "Test critical workflows"
    - "Resume operations"
```

---

## Related Documents

### **Core Dependencies**
- [Company Policies](../core/01_core_policies.md) - Corporate governance framework
- [Domain Glossary](../core/02_core_domain_glossary.md) - Business domain definitions
- [API Rules](../core/03_core_api_standards.md) - API design standards
- [Security Guidelines](../core/04_core_security.md) - Security implementation standards
- [Coding Standards](../core/05_core_coding_standards.md) - Development patterns
- [Documentation Style](../core/06_core_documentation_style.md) - Documentation standards

### **Automation Ecosystem**
- [AI Workflow Rules](01_automation_ai_workflow_rules.md) - AI workflow governance
- [Monitoring & Observability](03_automation_monitoring_observability.md) - System monitoring standards

### **AI-Human Integration**
- [AI-Human Collaboration Standards](../multi-platform/08_multiplatform_ai_human_collaboration_standards.md) - Human-AI interaction guidelines

### **Enterprise Governance**
- [Enterprise Governance](../enterprise/01_enterprise_governance.md) - Enterprise-wide governance
- [Financial Audit Controls](../enterprise/03_enterprise_financial_audit_controls.md) - Financial compliance
- [Global Privacy Compliance](../enterprise/04_enterprise_global_privacy_compliance.md) - Privacy regulations

---

*เอกสารนี้รวบรวมเทมเพลต N8N workflows สำหรับระบบ AI-first development ของ Tanqory ที่ใช้ในการทำงานอัตโนมัติทั้ง 9 stages*

**Last Updated**: September 16, 2025
**Version**: 1.0.0