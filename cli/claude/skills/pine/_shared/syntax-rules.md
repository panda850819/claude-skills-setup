# Pine Script v6 Syntax Rules

共用語法規則，所有 pine-* skills 參考。

---

## Line Continuation (關鍵！)

### 規則

1. **Ternary (`? :`)** - **必須在同一行**
2. **續行縮排** - 必須比起始行縮排更多
3. **在 operator/comma 後斷行** - 不是之前

### 常見錯誤

```pinescript
// ❌ WRONG - "end of line without line continuation"
text = condition ?
    "value1" :
    "value2"

dollarsText = priceDiff >= 0 ?
    str.format("+${0}", priceDiff) :
    str.format("-${0}", math.abs(priceDiff))

// ✅ CORRECT - 整個 ternary 在一行
text = condition ? "value1" : "value2"
dollarsText = priceDiff >= 0 ? str.format("+${0}", priceDiff) : str.format("-${0}", math.abs(priceDiff))
```

### 長行解決方案

```pinescript
// 方案 1: 用中間變數
trueValue = str.format("+${0}", priceDiff)
falseValue = str.format("-${0}", math.abs(priceDiff))
dollarsText = priceDiff >= 0 ? trueValue : falseValue

// 方案 2: 用 if-else
var string dollarsText = ""
if priceDiff >= 0
    dollarsText := str.format("+${0}", priceDiff)
else
    dollarsText := str.format("-${0}", math.abs(priceDiff))
```

---

## 檢查清單

寫完程式碼後檢查：

- [ ] `indicator()` / `strategy()` 宣告
- [ ] 所有 `plot()`, `plotshape()`, `plotchar()`
- [ ] 多條件 `if` 語句
- [ ] 長變數賦值
- [ ] `strategy.entry()`, `strategy.exit()`
- [ ] `alertcondition()`, `table.cell()`, `label.new()`
- [ ] 任何超過 80 字元的行

---

## 常見陷阱

| 情況 | 錯誤原因 | 解法 |
|------|----------|------|
| Ternary 跨行 | Pine 不支援 | 保持一行或用 if-else |
| 續行縮排不足 | 縮排必須更多 | 增加縮排 |
| 在 operator 前斷行 | 應在 operator 後 | 移動斷行位置 |
