---
name: image-generator
description: 用 AI 生成圖片。Claude 生成詳細描述，Puppeteer 自動操作 Gemini 生圖並下載。Use when user says "生成圖片", "generate image", "幫我配圖", "create illustration", or needs images for blog/website.
allowed-tools: Read, Write, Bash, Glob
---

# Image Generator v2

使用 CDP (Chrome DevTools Protocol) 模式自動化 Gemini 生圖。

---

## Integrations

```
upstream:
  - skill: browser-automation
    uses: Chrome CDP 控制 (start.js, nav.js, eval.js, screenshot.js, pick.js)
```

> **注意**：通用瀏覽器工具已抽出到 `browser-automation` skill。

---

## Out of Scope

- **瀏覽器工具** - 已抽到 browser-automation
- **圖片編輯** - 只生成，不編輯
- **批量生成** - 一次處理一張

---

## 架構

```
┌─────────────────────────────────────────────────────────┐
│          browser-automation (通用瀏覽器工具)             │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ start.js │  nav.js  │ eval.js  │screenshot│   pick.js   │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               image-generator (Gemini 專用)              │
├─────────────────────────┬───────────────────────────────┤
│      generate.js        │        watermark.js           │
│      Gemini 生圖         │        浮水印移除             │
└─────────────────────────┴───────────────────────────────┘
```

---

## 安裝

```bash
cd ~/.claude/skills/image-generator
pnpm install
```

---

## 快速開始

```bash
# 1. 啟動 Chrome (使用 browser-automation，首次需登入 Google)
node ~/.claude/skills/browser-automation/scripts/start.js --profile

# 2. 生成圖片
node ~/.claude/skills/image-generator/scripts/generate.js \
  --prompt "A minimalist tech illustration" \
  --output "./images/hero.png"
```

---

## 瀏覽器工具 (browser-automation)

通用瀏覽器工具已移至 `browser-automation` skill：

```bash
BROWSER=~/.claude/skills/browser-automation/scripts

node $BROWSER/start.js --profile    # 啟動 Chrome CDP
node $BROWSER/nav.js <url>          # 頁面導航
node $BROWSER/eval.js '<js>'        # 執行 JavaScript
node $BROWSER/screenshot.js         # 截圖
node $BROWSER/pick.js               # DOM 元素選取器
```

> 詳細說明請參考 `browser-automation` skill

---

## Gemini 專用腳本

### generate.js - Gemini 生圖

```bash
node scripts/generate.js -p "prompt" -o "./output.png"
```

### watermark.js - 浮水印移除

```bash
node scripts/watermark.js input.png output.png
```

---

## Prompt 生成原則

### 結構

```
[主體] + [風格] + [構圖] + [色調] + [細節]
```

### 範例

用戶：「部落格需要一張關於 AI 協作的配圖」

生成 prompt：
```
A minimalist illustration of a human hand and a robotic hand
reaching toward each other, clean modern style with soft blue
and white gradient background, subtle geometric patterns,
professional tech aesthetic, 16:9 aspect ratio
```

### 風格關鍵詞

| 用途 | 建議風格 |
|------|---------|
| 部落格配圖 | minimalist, clean, professional, modern |
| 技術文章 | geometric, abstract, tech aesthetic |
| 教學內容 | friendly, illustrative, clear |
| 概念說明 | metaphorical, symbolic, simple |

---

## 故障排除

### Chrome 未啟動

```bash
# 檢查 CDP 狀態
curl http://127.0.0.1:9222/json/version

# 重新啟動
node scripts/start.js --profile
```

### Selector 失效

```bash
# 用 pick.js 互動式找新 selector
node scripts/pick.js

# 更新 generate.js 中的 SELECTORS 物件
```

### 需要登入

```bash
# 用 --profile 保持登入狀態
node scripts/start.js --profile

# 首次需在瀏覽器中手動登入 Google
```

---

## 與舊版差異

| 項目 | v1 (舊) | v2 (新) |
|------|---------|---------|
| 套件管理 | npm | pnpm (共享 store) |
| 依賴 | puppeteer (~400MB) | puppeteer-core (~50MB) |
| Chrome | 每次啟動新實例 | 連接已運行的 Chrome |
| 認證 | 獨立 profile | 可用本地 profile |
| 架構 | 單一腳本 | 模組化工具箱 |
| 維護 | 改腳本 | pick.js 互動找 selector |

---

## 浮水印移除

生成圖片後自動移除 Gemini SynthID 浮水印。

```bash
# 預設：自動移除浮水印
node generate.js -p "prompt" -o "./image.png"

# 保留浮水印
node generate.js -p "prompt" -o "./image.png" --keep-watermark

# 單獨移除浮水印
node watermark.js input.png output.png
```

原理：反向 alpha blending（無損還原）

---

## 輸出

| 項目 | 說明 |
|------|------|
| 圖片檔案 | 下載到指定路徑（已去浮水印）|
| .prompt.txt | 保存使用的 prompt |
| .debug.png | 失敗時的除錯截圖 |

---

## Verification

生成完成標準：

- [ ] 圖片已下載到指定路徑
- [ ] prompt.txt 已保存
- [ ] 浮水印已移除（除非 --keep-watermark）
- [ ] 圖片內容符合 prompt

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| 需要登入 | 用 --profile 保持登入狀態 |
| Selector 失效 | 用 pick.js 找新 selector |
| 生成失敗 | 檢查 .debug.png 診斷問題 |
| 內容不當 | 修改 prompt，避免敏感內容 |
