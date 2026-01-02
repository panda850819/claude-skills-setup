---
name: publish-substack
description: 發佈週報到 Substack。Use when publishing weekly digest to Substack, running publish script. Triggers on "publish-substack", "發佈到 Substack", "publish to substack", "發佈週報".
allowed-tools: Bash, Read
---

# 發佈週報到 Substack

執行發佈腳本：

```bash
cd "/Users/panda/site/Obsidian Vault" && python3 scripts/publish-to-substack.py
```

## Frontmatter 選項

| 欄位 | 說明 | 預設值 |
|------|------|--------|
| `publish: true` | 標記要發佈 | - |
| `published` | 發佈狀態（`true`/`false`/`'draft'`） | - |
| `slug` | 自訂 URL slug（如 `weekly-review-1`） | 自動生成 |
| `draft_only: true` | 只建立草稿，可在後台預覽 | `false` |
| `send_email: true/false` | 是否發送電子報 | `true` |
| `update: true` | 更新已發佈的文章 | `false` |

## 使用情境

### 新發佈文章
```yaml
publish: true
send_email: false  # 先不發電子報，確認後再手動發送
```

### 只建立草稿預覽
```yaml
publish: true
draft_only: true
```

### 更新已發佈文章
```yaml
published: true
substack_id: 123456789
update: true  # 設定後執行腳本即可更新
```

## Slug 限制

Substack slug 只能包含：**小寫字母、數字、連字號**
- ✅ `weekly-review-1`
- ❌ `2025-w52-系統啟動`（不支援中文）

新建文章時 API 會忽略 slug，需用 `update: true` 再次執行才能套用自訂 slug。

## 自動記錄的欄位

發佈成功後會自動更新：
- `substack_url` - 文章 URL
- `substack_id` - 文章 ID（用於更新）
- `published_at` - 發佈時間
- `email_sent` - 是否已發送電子報
- `updated_at` - 最後更新時間（更新模式）

## 本地圖片

腳本會自動上傳本地圖片到 Substack CDN：
```markdown
![截圖](../attachments/screenshot.png)  # 會自動上傳
![外部圖片](https://example.com/img.png)  # 保持不變
```

## 如果 cookies 過期

需要重新取得 cookies：
1. 登入 Substack 網站
2. 開啟 DevTools → Network
3. 找任一請求，複製 Cookie header 的值
4. 更新 `/Users/panda/site/Obsidian Vault/scripts/.substack-cookies`
