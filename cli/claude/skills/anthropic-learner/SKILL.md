---
name: anthropic-learner
description: 巡邏 Anthropic/Claude 官方資源，下載知識到本地，自主更新 skills 並通知到 Telegram。Use when user says "巡邏 anthropic", "claude 更新", "anthropic news", or triggered by hook.
trigger: 巡邏 anthropic, claude 更新, anthropic news, claude code 更新
---

# Anthropic Learner - Anthropic 知識巡邏

**專注於 Anthropic/Claude 生態系的知識更新。**

## Overview

巡邏 Anthropic 官方資源，自動更新相關 skills：
1. 下載官方文件到本地知識庫（Obsidian Vault）
2. 分析並識別可改進的 skills
3. **小改動：自動執行，事後通知**
4. **大改動：先通知，等你確認**

## 知識庫位置

```
/Users/panda/site/knowledge/obsidian-vault/knowledge/
├── anthropic/
│   ├── _meta.md              ← 來源設定、同步時間
│   ├── claude-code-docs.md   ← 精煉後的內容
│   ├── changelog.md
│   └── best-practices.md
└── n8n/                      ← n8n-learner 使用
```

## 資料來源

| 來源 | URL | 提取重點 |
|------|-----|---------|
| Claude Code Docs | https://docs.anthropic.com/en/docs/claude-code | hooks, skills, MCP, best practices |
| Anthropic Blog | https://www.anthropic.com/news | 新功能公告 |
| Claude API Docs | https://docs.anthropic.com/en/api | API 變更 |

## 會更新的 Skills

| Skill | 關注點 |
|-------|--------|
| `claude-code-guide` | Claude Code 功能、hooks、skills |
| `skill-creator` | skill 撰寫最佳實踐 |
| `prompt-router` | 模型推薦邏輯 |

## 通知設定

| 設定 | 值 |
|------|-----|
| 方式 | Telegram Bot |
| Bot | n8n_monitors_bot |
| Chat ID | `-5008242976` |

### Telegram 發送注意事項

**重要**: 發送 Telegram 時必須使用 `/usr/bin/curl`，避免 zshrc alias 干擾。

```bash
# 正確方式
printf '%s' 'chat_id=-5008242976&text=訊息內容' | /usr/bin/curl -s -X POST \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" -d @-

# 錯誤方式（可能被 alias 干擾）
curl -s -X POST ... -d 'text=...'
```

### 時間戳記

所有通知必須包含 **UTC+8 時間戳記**：

```bash
# 取得 UTC+8 時間
TZ='Asia/Taipei' date '+%Y/%m/%d %H:%M'
# 輸出: 2025/12/31 14:30
```

### 通知格式

**無更新時（簡短格式）**：
```
2025/12/31 18:00 anthropic report 沒有額外更新
```

**有更新時（完整格式）**：
```
🔍 Anthropic 巡邏報告
📅 2025/12/31 14:30 (UTC+8)

📦 重大發現：
[更新內容...]
```

---

## 自主更新邏輯

### 改動分級

| 級別 | 定義 | 處理方式 |
|------|------|---------|
| 🟢 **小改動** | 新增觸發詞、修正 typo、補充說明 | 自動執行 → 事後通知 |
| 🟡 **中改動** | 新增 workflow、調整流程順序 | 先通知 → 等 24 小時 → 自動執行 |
| 🔴 **大改動** | 刪除功能、改變核心邏輯、breaking change | 先通知 → 等你確認 → 才執行 |

---

## 執行流程

```
┌─────────────┐
│  觸發巡邏    │ (手動 or hook)
└──────┬──────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 0: 去重檢查 (Dedup)           │
│  讀取 _meta.md 的 content_hash       │
│  比對：相同 → 跳過，不同 → 繼續       │
└──────┬──────────────────────────────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 1: 下載 (Download)            │
│  提取關鍵內容，寫入 Obsidian Vault    │
└──────┬──────────────────────────────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 2-3: 分析與分級               │
│  識別新功能、breaking changes         │
│  比對現有 skills，分級改動            │
└──────┬──────────────────────────────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 4: 執行                       │
│  🟢 直接執行 │ 🟡 排程 │ 🔴 等確認    │
└──────┬──────────────────────────────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 5: 通知 (Telegram)            │
└─────────────────────────────────────┘
```

---

## 配置檔

`/Users/panda/site/knowledge/obsidian-vault/knowledge/anthropic/_meta.md`:

```yaml
---
sources:
  - name: Claude Code Docs
    url: https://docs.anthropic.com/en/docs/claude-code
    enabled: true
    last_sync: null
    content_hash: null
  - name: Anthropic Blog
    url: https://www.anthropic.com/news
    enabled: true
    last_sync: null
    content_hash: null

notification:
  telegram_chat_id: "-5008242976"  # n8n_monitors_bot 群組

auto_update:
  small_changes: true
  medium_delay_hours: 24
  large_require_confirm: true
---
```

---

## 觸發方式

### 手動觸發

```
「巡邏 anthropic」
「claude 有什麼更新」
「anthropic news」
```

### 自動排程（launchd）

每 6 小時自動執行一次（與 n8n-learner 一起）。

```bash
# 排程腳本
~/site/automation/scripts/patrol-learners.sh

# 管理指令
launchctl list | grep patrol                    # 查看狀態
launchctl unload ~/Library/LaunchAgents/com.claude.patrol-learners.plist  # 停用
launchctl load ~/Library/LaunchAgents/com.claude.patrol-learners.plist    # 啟用

# Log 位置
~/site/automation/logs/learner-YYYYMMDD.log
```

---

## 相關 Skills

| Skill | 功能 |
|-------|------|
| `n8n-learner` | 巡邏 n8n 官方資源 |
| `skill-reviewer` | 分析現有 skills 缺口 |
| `skill-discovery` | 搜尋 skill marketplace |
