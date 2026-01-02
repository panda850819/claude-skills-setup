---
name: browser-automation
description: 透過 CDP 控制 Chrome 瀏覽器執行自動化任務。Use when needing to control browser, scrape websites, take screenshots, interact with web apps, or automate browser tasks. Triggers on "瀏覽器自動化", "截圖網頁", "scrape", "browser automation", "CDP".
allowed-tools: Read, Write, Bash, Glob
---

# Browser Automation

透過 Chrome DevTools Protocol (CDP) 控制瀏覽器執行自動化任務。

---

## Integrations

```
downstream:
  - skill: image-generator
    provides: 瀏覽器控制能力
  - skill: notebooklm
    provides: 瀏覽器控制能力
```

---

## 架構

```
┌─────────────────────────────────────────────────────────┐
│                   Browser Tools                          │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ start.js │  nav.js  │ eval.js  │screenshot│   pick.js   │
│ 啟動CDP  │  導航頁面 │ 執行JS   │   截圖   │  選取元素   │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
                           │
                           ▼
                   ┌──────────────┐
                   │    cdp.js    │
                   │   共用連接   │
                   └──────────────┘
```

---

## 安裝

```bash
cd ~/.claude/skills/browser-automation
pnpm install
```

---

## 快速開始

```bash
# 1. 啟動 Chrome (首次需登入相關服務)
node ~/.claude/skills/browser-automation/scripts/start.js --profile

# 2. 導航到目標網站
node ~/.claude/skills/browser-automation/scripts/nav.js https://example.com

# 3. 執行操作
node ~/.claude/skills/browser-automation/scripts/eval.js 'document.title'
```

---

## 腳本說明

### start.js - 啟動 Chrome CDP

```bash
node start.js                  # 新 profile（需登入）
node start.js --profile        # 用本地 Chrome profile（已登入）
```

**重要**：使用 `--profile` 可保持登入狀態，避免每次重新登入。

**原理**：將 Chrome profile 複製到暫存目錄，避免與運行中的 Chrome 衝突。

### nav.js - 頁面導航

```bash
node nav.js https://google.com         # 導航到 URL
node nav.js --new https://google.com   # 新分頁開啟
node nav.js --list                     # 列出所有分頁
```

### eval.js - 執行 JavaScript

```bash
# 簡單表達式
node eval.js 'document.title'

# JSON 輸出（陣列/物件）
node eval.js --json 'Array.from(document.querySelectorAll("a")).map(a => a.href)'

# 多語句（用 IIFE）
node eval.js '(() => { const el = document.querySelector("h1"); return el?.textContent; })()'
```

**注意**：程式碼必須是單一表達式，或使用 IIFE 包裝多語句。

### screenshot.js - 截圖

```bash
node screenshot.js                       # 截圖到暫存檔
node screenshot.js -o ./screen.png       # 指定輸出路徑
node screenshot.js --full                # 整頁截圖
node screenshot.js -s "img.hero"         # 指定元素截圖
```

### pick.js - DOM 元素選取器

```bash
node pick.js   # 互動模式
```

**用途**：當網站 UI 更新導致 selector 失效時，用此工具找到新的 selector。

**操作**：
1. 執行後瀏覽器會注入選取 overlay
2. 移動滑鼠高亮元素
3. 點擊元素取得 CSS selector
4. 按 Escape 退出

---

## 常用模式

### 抓取資料

```bash
# 取得頁面標題
node eval.js 'document.title'

# 取得所有連結
node eval.js --json 'Array.from(document.querySelectorAll("a")).map(a => ({text: a.textContent, href: a.href}))'

# 取得表格資料
node eval.js --json '
(() => {
  const rows = document.querySelectorAll("table tr");
  return Array.from(rows).map(row =>
    Array.from(row.cells).map(cell => cell.textContent.trim())
  );
})()
'
```

### 點擊和輸入

```bash
# 點擊按鈕
node eval.js 'document.querySelector("button.submit").click()'

# 輸入文字
node eval.js 'document.querySelector("input[name=search]").value = "hello"'

# 提交表單
node eval.js 'document.querySelector("form").submit()'
```

### 等待元素

```bash
# 等待元素出現
node eval.js '
(() => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      const el = document.querySelector(".result");
      if (el) { observer.disconnect(); resolve(el.textContent); }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => resolve(null), 5000);
  });
})()
'
```

---

## 故障排除

### Chrome 未啟動

```bash
# 檢查 CDP 狀態
curl http://127.0.0.1:9222/json/version

# 重新啟動
node scripts/start.js --profile
```

### Port 被佔用

```bash
# 找出佔用程序
lsof -i :9222

# 終止程序
kill -9 <PID>
```

### 連接失敗

```bash
# 確認 Chrome 運行中
pgrep -f "remote-debugging-port"

# 重新啟動 Chrome
pkill -f "remote-debugging-port"
node scripts/start.js --profile
```

---

## 進階用法

### 從其他 Skill 調用

```bash
# 在其他 skill 中使用瀏覽器工具
BROWSER_SCRIPTS=~/.claude/skills/browser-automation/scripts

# 啟動
node $BROWSER_SCRIPTS/start.js --profile

# 導航
node $BROWSER_SCRIPTS/nav.js https://target.com

# 操作
node $BROWSER_SCRIPTS/eval.js 'document.querySelector("button").click()'
```

### 環境變數

| 變數 | 預設值 | 說明 |
|------|--------|------|
| `CDP_PORT` | 9222 | Chrome CDP 端口 |

---

## 安全注意

- **不要**在不信任的網站執行任意 JavaScript
- **不要**將敏感資訊（密碼等）硬編碼在腳本中
- 使用 `--profile` 時，登入憑證會被複製到暫存目錄
- 暫存 profile 在系統重啟時會被清除

---

## 與 Factory Browser Skill 比較

| 項目 | Factory | 本實作 |
|------|---------|--------|
| 架構 | 模組化腳本 | 模組化腳本 |
| Profile | 複製到暫存 | 複製到暫存 |
| CDP 連接 | puppeteer-core | puppeteer-core |
| 特色 | 通用工具箱 | + pick.js 互動選取 |

---

## Out of Scope

- **複雜爬蟲邏輯** - 只提供基礎工具，複雜邏輯由調用者實作
- **反爬蟲繞過** - 不處理 CAPTCHA、rate limiting 等
- **資料持久化** - 只負責抓取，儲存由調用者處理

---

## Verification

### 連線測試

```bash
# 檢查 Chrome CDP 狀態
curl http://127.0.0.1:9222/json/version

# 預期輸出包含 "Browser" 和 "webSocketDebuggerUrl"
```

### 完成標準

- [ ] Chrome 已啟動並監聽 CDP port
- [ ] 可成功連接並執行基本操作
- [ ] 無 timeout 或連接錯誤

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| 不信任的網站 | **警告** - 不要執行任意 JavaScript |
| 需要輸入密碼 | **停止** - 不硬編碼敏感資訊 |
| 網站結構變更 | 用 pick.js 找新 selector |
| 操作可能修改資料 | **確認** - 告知用戶可能的影響 |
| 大量請求 | **警告** - 可能觸發 rate limiting |

### 安全原則

1. **最小權限** - 只執行必要操作
2. **不儲存憑證** - 用 --profile 使用現有登入
3. **謹慎執行 JS** - 避免在不信任網站執行複雜腳本
4. **告知影響** - 修改操作前先說明
