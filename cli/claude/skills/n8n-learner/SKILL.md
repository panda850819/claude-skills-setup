---
name: n8n-learner
description: 巡邏 n8n 官方資源，追蹤版本更新、新節點、API 變更，自動優化 n8n 相關 skills。Use when user says "巡邏 n8n", "n8n 更新", "n8n news", or triggered by hook.
trigger: 巡邏 n8n, n8n 更新, n8n news, n8n 有什麼新功能
---

# n8n Learner - n8n 知識巡邏

**專注於 n8n 生態系的知識更新。**

## Overview

巡邏 n8n 官方資源，自動更新相關 skills：
1. 追蹤版本更新（Release Notes, Breaking Changes）
2. 發現新節點、新功能
3. 更新 n8n skills 的最佳實踐
4. **小改動：自動執行，事後通知**
5. **大改動：先通知，等你確認**

## 知識庫位置

```
/Users/panda/site/knowledge/obsidian-vault/knowledge/
├── n8n/
│   ├── _meta.md              ← 來源設定、同步時間、版本追蹤
│   ├── release-notes.md      ← 版本更新摘要
│   ├── breaking-changes.md   ← Breaking changes 追蹤
│   ├── new-nodes.md          ← 新節點紀錄
│   └── best-practices.md     ← 最佳實踐更新
└── anthropic/                ← anthropic-learner 使用
```

## 資料來源

| 來源 | URL | 提取重點 |
|------|-----|---------|
| Release Notes | https://docs.n8n.io/release-notes/ | 版本變更、新功能 |
| n8n Blog | https://blog.n8n.io/tag/news/ | 重大公告、新功能介紹 |
| GitHub Releases | https://github.com/n8n-io/n8n/releases | 詳細 changelog |
| n8n Community | https://community.n8n.io/c/announcements | 社群公告 |

## 會更新的 Skills

| Skill | 關注點 |
|-------|--------|
| `n8n-code` | Code node 語法、內建函數變更 |
| `n8n-expression-syntax` | 表達式語法、新變數 |
| `n8n-node-config` | 節點配置、屬性變更 |
| `n8n-workflow-patterns` | 新模式（如 AI Agent） |
| `n8n-api` | API 端點變更 |
| `n8n-quick` | 快速操作指令更新 |

## 重點追蹤項目

### n8n 2.0 變更（2025/12）

| 變更 | 影響 |
|------|------|
| Task runners 預設啟用 | Code node 執行在隔離環境 |
| 新 Publish/Save 機制 | Save 不再直接更新 production |
| SQLite pooling driver | 效能提升 10x |
| MCP 支援 | 可整合 Model Context Protocol |
| 環境變數預設封鎖 | Code node 無法直接存取 env vars |

### 持續追蹤

- 新 AI 節點（70+ AI nodes）
- 新觸發器類型
- 表達式語法變更
- Node deprecations

---

## 自主更新邏輯

### 改動分級

| 級別 | n8n 相關定義 | 處理方式 |
|------|-------------|---------|
| 🟢 **小改動** | 新增節點範例、修正語法說明 | 自動執行 → 事後通知 |
| 🟡 **中改動** | 新增 workflow pattern、新節點文檔 | 先通知 → 等 24 小時 |
| 🔴 **大改動** | Breaking changes、節點 deprecated、API 變更 | 先通知 → 等確認 |

### n8n 專屬判斷標準

```python
def classify_n8n_change(change):
    # 大改動
    if any([
        "breaking" in change.lower(),
        "deprecated" in change.lower(),
        "removed" in change.lower(),
        "v2.0" in change,  # Major version changes
        "security" in change.lower(),
    ]):
        return "🔴 大改動"

    # 中改動
    if any([
        "new node" in change.lower(),
        "new trigger" in change.lower(),
        "新增 workflow" in change,
        "mcp" in change.lower(),
    ]):
        return "🟡 中改動"

    # 小改動
    return "🟢 小改動"
```

---

## 執行流程

```
┌─────────────┐
│  觸發巡邏    │ (手動 or hook)
└──────┬──────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 0: 版本檢查                   │
│  讀取 _meta.md 的 tracked_version    │
│  比對 GitHub latest release          │
└──────┬──────────────────────────────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 1: 下載更新內容               │
│  Fetch Release Notes, Blog          │
│  提取新功能、breaking changes        │
└──────┬──────────────────────────────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 2: 分析影響                   │
│  比對現有 n8n skills                 │
│  識別需要更新的部分                   │
└──────┬──────────────────────────────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 3: 分級與執行                 │
│  🟢 自動更新 skill 內容              │
│  🟡 排程 24 小時後執行                │
│  🔴 等待確認                         │
└──────┬──────────────────────────────┘
       ▼
┌─────────────────────────────────────┐
│  Phase 4: 通知 (Telegram)            │
│  發送更新摘要與執行狀態               │
└─────────────────────────────────────┘
```

---

## 通知格式

### 時間戳記

所有通知必須包含 **UTC+8 時間戳記**：

```bash
# 取得 UTC+8 時間
TZ='Asia/Taipei' date '+%Y/%m/%d %H:%M'
# 輸出: 2025/12/31 14:30
```

### 無更新時（簡短格式）

當沒有發現新版本或更新時，發送簡短訊息：

```
2025/12/31 18:00 n8n report 沒有額外更新
```

### 有更新時（完整格式）

```markdown
🔄 *n8n Learner Report*
📅 2025/12/31 14:30 (UTC+8)

*版本追蹤*
📦 Latest: v2.0.1
📦 Tracked: v1.70.0
⚠️ 發現新版本！

━━━━━━━━━━━━━━━━━━

*Breaking Changes* 🔴
需要確認（回覆 "確認 1" 執行）

1️⃣ `n8n-code`
   Task runners 預設啟用
   → 需更新 Code node 文檔

━━━━━━━━━━━━━━━━━━

*新功能* 🟡
24 小時後執行（回覆 "取消 2" 可取消）

2️⃣ `n8n-workflow-patterns`
   新增 MCP 整合 pattern

━━━━━━━━━━━━━━━━━━

*已自動執行* 🟢

3️⃣ `n8n-expression-syntax`
   新增 Time Saved node 範例

━━━━━━━━━━━━━━━━━━

📚 知識庫已更新
```

### Telegram 發送注意事項

**重要**: 發送 Telegram 時必須使用 `/usr/bin/curl`，避免 zshrc alias 干擾。

```bash
# 正確方式
printf '%s' 'chat_id=-5008242976&text=訊息內容' | /usr/bin/curl -s -X POST \
  "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" -d @-

# 錯誤方式（可能被 alias 干擾）
curl -s -X POST ... -d 'text=...'
```

---

## 配置檔

`/Users/panda/site/knowledge/obsidian-vault/knowledge/n8n/_meta.md`:

```yaml
---
tracked_version: "1.70.0"  # 目前追蹤的版本
last_sync: null
content_hash: null

sources:
  - name: Release Notes
    url: https://docs.n8n.io/release-notes/
    enabled: true
    last_sync: null
  - name: n8n Blog
    url: https://blog.n8n.io/tag/news/
    enabled: true
    last_sync: null
  - name: GitHub Releases
    url: https://github.com/n8n-io/n8n/releases
    enabled: true
    last_sync: null

notification:
  telegram_chat_id: "-5008242976"  # n8n_monitors_bot 群組

auto_update:
  small_changes: true
  medium_delay_hours: 24
  large_require_confirm: true

# n8n 專屬追蹤
track_items:
  - breaking_changes: true
  - new_nodes: true
  - deprecated_nodes: true
  - expression_changes: true
  - ai_features: true
  - mcp_updates: true
---
```

---

## 觸發方式

### 手動觸發

```
「巡邏 n8n」
「n8n 有什麼更新」
「n8n news」
「檢查 n8n 版本」
```

### 自動排程（launchd）

每 6 小時自動執行一次。

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

## 首次設定

1. **建立知識庫目錄**
   ```
   /Users/panda/site/knowledge/obsidian-vault/knowledge/n8n/
   ```

2. **初始化 _meta.md**
   - 設定 `tracked_version` 為目前使用的 n8n 版本
   - 設定 Telegram chat ID

3. **首次同步**
   - 說「巡邏 n8n」建立知識基準

---

## 相關 Skills

| Skill | 功能 |
|-------|------|
| `anthropic-learner` | 巡邏 Anthropic 官方資源 |
| `skill-reviewer` | 分析現有 skills 缺口 |
| `n8n-*` | 所有 n8n 相關 skills |

---

## n8n API 整合

使用直接 API 呼叫檢查版本：
```bash
source ~/.claude/skills/n8n-api/config.env
# 檢查 n8n 版本（透過 /health endpoint 或 workflows API）
curl -s "$N8N_API_URL/api/v1/workflows?limit=1" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | jq
```
