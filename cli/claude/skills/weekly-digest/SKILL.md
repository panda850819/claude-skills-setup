---
name: weekly-digest
description: 把本週日報整理成週報草稿。Use when user asks to generate weekly digest, create weekly report, or summarize this week's notes. Triggers on "週報", "weekly", "整理本週", "digest".
allowed-tools: Read, Write, Glob, Bash
---

# Weekly Digest Generator

將 Telegram 收集的日報整理成週報草稿。

## 路徑配置

```
日報來源: /Users/panda/site/obsidian vault/blog/_daily/
週報輸出: /Users/panda/site/obsidian vault/blog/weekly/
```

## 執行流程

### 1. 收集日報

讀取過去 7 天的日報檔案：

```bash
# 取得日期範圍
TODAY=$(date +%Y-%m-%d)
WEEK_AGO=$(date -v-7d +%Y-%m-%d)
```

使用 Glob 找到日期範圍內的檔案：
- 檔案格式：`YYYY-MM-DD.md`
- 路徑：`/Users/panda/site/obsidian vault/blog/_daily/*.md`

### 2. 分析內容

從每個日報中提取：
- **想法**：原創觀點和思考
- **連結收集**：收藏的文章和資源
- **轉發**：轉發的內容和評論

### 3. 整理週報

將內容整理成以下結構：

```markdown
---
title: "週報 #N：標題"
date: YYYY-MM-DD
slug: weekly-review-{N}
publish: false
platforms: [substack]
source_days: [日報日期列表]
---

# 週報 #N：[根據內容生成標題]

## 本週觀察

### 主題一：[歸納主題]
整合相關的想法，形成連貫的觀點...

### 主題二：[歸納主題]
...

## 值得關注的連結
- [標題](url) — 一句話說明價值

## 碎念
一些零散但有趣的想法...

---
*本週報由 AI 初稿生成，經人工審核編輯*
```

### 4. 輸出週報

檔案命名：`yyyy-w{週數}-{標題}.md`
- 格式範例：`2025-w52-系統啟動.md`
- 標題取自週報主標題（`# 週報 #N：[標題]` 的 `[標題]` 部分）
- 標題中的空格保留，特殊字元移除

**編號規則：**
- N 是連續編號，從 1 開始
- 查看 `/Users/panda/site/obsidian vault/blog/weekly/` 目錄中最大的編號 +1

路徑：`/Users/panda/site/obsidian vault/blog/weekly/`

## 整理原則

1. **歸納主題** — 不要逐條列出，而是找出 2-4 個核心主題
2. **保留語氣** — 維持用戶的個人風格和用詞
3. **補充脈絡** — 連結不同天的想法，找出呼應
4. **精簡連結** — 只保留最有價值的 5-10 個連結
5. **誠實標註** — 文末說明是 AI 生成的初稿

## 注意事項

- 移除 `<!-- msg:xxx -->` 追蹤碼
- `publish: false` 預設不發佈，等用戶審核
- 如果某天沒有日報，跳過該天
- 週報標題應反映本週最重要的主題
