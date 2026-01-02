# Skills Integration Guide

## Skill Graph (誰可以調用誰)

```
                    ┌─────────────────┐
                    │  spec-interviewer │
                    │  (需求探索)        │
                    └────────┬────────┘
                             │ 產出: spec.md
                             ▼
    ┌────────────────────────┴────────────────────────┐
    │                                                  │
    ▼                                                  ▼
┌───────────────┐                          ┌───────────────────┐
│ frontend-design│                          │ pine-developer    │
│ (UI 實作)      │                          │ (Pine Script 實作) │
└───────┬───────┘                          └─────────┬─────────┘
        │                                            │
        │ 產出: 代碼                                  │ 產出: .pine
        ▼                                            ▼
┌───────────────┐                          ┌───────────────────┐
│   spec-sync   │◄─────────────────────────│  pine-debugger    │
│ (驗證一致性)   │                          │  pine-backtester  │
└───────────────┘                          └───────────────────┘
```

## Integration Patterns

### Pattern A: Spec-Driven Development
```
spec-interviewer → [implementation skill] → spec-sync
```

### Pattern B: Analysis to Implementation
```
quant-analyst → pine-developer → pine-backtester
```

### Pattern C: Debug Cycle
```
[any skill] → debugger → [fix] → debugger (verify)
```

## Standard Handoff Format

當 skill A 完成後要交接給 skill B，使用這個格式：

```markdown
## Handoff to [next-skill]

**From**: [current-skill]
**Artifacts produced**:
- [file path]: [description]

**Next actions**:
1. [action 1]
2. [action 2]

**Context preserved**:
- [key decision 1]
- [key decision 2]
```

## Skill Categories

| Category | Skills | 觸發時機 |
|----------|--------|---------|
| **Discovery** | spec-interviewer, triage | 需求不明確時 |
| **Implementation** | frontend-design, pine-developer, n8n-* | 需要寫代碼時 |
| **Validation** | spec-sync, pine-debugger, pine-backtester | 驗證品質時 |
| **Optimization** | pine-optimizer | 改進效能時 |
| **Publishing** | pine-publisher, publish-substack | 準備發布時 |

## Integration Signals

在 skill.md 中加入這個 section 來聲明整合點：

```yaml
# 在 frontmatter 後加入
integrations:
  upstream:
    - skill: spec-interviewer
      receives: spec.md
  downstream:
    - skill: spec-sync
      produces: implementation code
```
