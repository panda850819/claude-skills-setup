# Prompt Router 關鍵字規則

這個檔案定義了 prompt-router.sh 使用的關鍵字規則。
修改此檔案可以調整路由行為。

## 匹配順序（重要！）

```
1. Opus patterns（優先 - 複雜任務不應被簡單關鍵字攔截）
2. Sonnet patterns
3. Haiku patterns
4. 都沒命中 → 預設 Opus
```

---

## Opus（深度思考）- 優先匹配

適合：架構設計、重構規劃、策略分析、創意發想、深入調查

```
設計|design|架構|architecture|規劃|plan|重構|refactor
brainstorm|發想|構思|優化策略|分析.*參數|為什麼.*這樣設計
複雜|complex|system|系統|framework|框架|pattern|模式
strategy|策略|approach|方法|solution|解決方案|trade-?off|權衡
evaluate|評估|review|審查|audit|稽核|security|安全
performance|效能|scale|擴展|migrate|遷移|upgrade|升級
transform|轉換|理解.*整體|explain.*how|深入|原理
underlying|底層|root cause|根本原因|investigate|調查|研究|research
```

**典型問題：**
- 「設計一個新的監控系統」
- 「這個架構應該怎麼重構？」
- 「幫我 brainstorm 這個功能」
- 「為什麼這樣設計比較好？」
- 「這個系統的架構是什麼？」

---

## Sonnet（一般開發）

適合：bug 修復、功能實作、設定配置、git 操作、整合任務

```
修|fix|bug|錯誤|建立|create|新增|add|安裝|install|設定|config
寫.*function|implement|commit|push|merge|update|更新
change|改|modify|調整|edit|編輯|write|寫|delete|刪|remove|移除
move|搬|copy|複製|extract|抽|split|拆|combine|合併|connect|連
integrate|整合|hook|workflow|n8n|pine|script|api|endpoint
route|handler|component|module|service|class|method|function
variable|import|export|deploy|部署
```

**典型問題：**
- 「幫我修這個 bug」
- 「新增一個 API endpoint」
- 「安裝這個 plugin」
- 「commit 這些改動」
- 「建立一個 n8n workflow」

---

## Haiku（快速任務）

適合：查詢、列表、簡單搜尋、格式轉換、狀態檢查

```
在哪|where|找|search|有哪些|是什麼|what is|解釋.*意思
列出|list|顯示|show|格式|format|rename|怎麼用|how to use
status|狀態|help|說明|check|檢查|look|看|查|count|數
幾個|多少|version|版本|exist|存在|diff|compare|比較
run|執行|跑|test|測試|open|打開|read|讀|cat|log|日誌
history|歷史|current|目前|now|現在
```

**典型問題：**
- 「skills 有哪些？」
- 「這個 function 在哪裡？」
- 「目前的狀態是什麼？」
- 「怎麼用這個指令？」
- 「幫我看一下這個 log」

---

## 自訂規則

如果你發現某些問題被錯誤分類，可以：

1. 編輯 `~/site/automation/scripts/prompt-router.sh` 中的 patterns
2. 同步更新此文件作為參考

**注意：** 目前 script 中的 patterns 是硬編碼的。
