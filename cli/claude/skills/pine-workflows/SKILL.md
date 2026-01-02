---
name: pine-workflows
description: Pine Script 專案流程模板和品質檢查清單。供 pine-lead agent 協調複雜專案時參考。不直接調用，作為參考資料。
---

# Pine Script 工作流程參考

複雜專案的標準流程和品質檢查清單，供 pine-lead agent 協調時參考。

## 專案流程模板

### 1. 新指標開發

```
1. VISUALIZER: 分解指標概念
2. DEVELOPER: 實作核心計算
3. DEBUGGER: 添加除錯工具
4. OPTIMIZER: 優化效能和 UX
5. PUBLISHER: 準備文檔（如需發布）
```

### 2. 新策略開發

```
1. VISUALIZER: 定義進出場邏輯
2. DEVELOPER: 實作策略程式碼
3. BACKTESTER: 添加績效指標
4. DEBUGGER: 添加交易除錯
5. OPTIMIZER: 改進執行效率
6. PUBLISHER: 最終發布準備
```

### 3. 除錯修復

```
1. DEBUGGER: 識別問題
2. DEVELOPER: 修復問題
3. DEBUGGER: 驗證修復
4. OPTIMIZER: 改進問題區域（可選）
```

### 4. 效能優化

```
1. OPTIMIZER: 分析當前效能
2. BACKTESTER: 測量基線指標
3. OPTIMIZER: 實施改進
4. BACKTESTER: 驗證改進效果
```

## Skill 協作對照

| 用戶需求 | 主要 Skill | 支援 Skills |
|---------|-----------|------------|
| 建立指標 | Visualizer → Developer | Debugger, Optimizer |
| 建立策略 | Visualizer → Developer → Backtester | Debugger, Optimizer |
| 修復錯誤 | Debugger | Developer |
| 優化腳本 | Optimizer | Backtester |
| 測試績效 | Backtester | Debugger |
| 準備發布 | Publisher | Optimizer |

## 專案檔案管理

### 新專案初始化

1. 重新命名 `/projects/blank.pine` 為適當檔名
   - 格式：`descriptive-name.pine`
   - 例如：`rsi-divergence-indicator.pine`
2. 建立新的 blank.pine 給下個專案
3. 更新檔案標頭

## 品質檢查清單

### 程式碼品質
- [ ] 無語法錯誤
- [ ] 遵循 Pine Script v6 標準
- [ ] 處理邊界情況
- [ ] 無重繪問題

### 功能完整性
- [ ] 所有需求已實現
- [ ] 信號正確運作
- [ ] 警報功能正常
- [ ] 繪圖正確顯示

### 效能
- [ ] 載入速度快
- [ ] 計算效率高
- [ ] request.security() 調用優化
- [ ] 記憶體使用最小化

### 用戶體驗
- [ ] 輸入參數直覺
- [ ] 視覺化清晰
- [ ] 提示說明完整
- [ ] 外觀專業

### 測試
- [ ] 包含除錯工具
- [ ] 有回測指標
- [ ] 多時間週期測試
- [ ] 多商品驗證

### 文檔
- [ ] 程式碼註解清楚
- [ ] 使用說明完整
- [ ] 輸入描述齊全
- [ ] 警報訊息明確

## 專案評估模板

```markdown
## 專案評估
- **複雜度**: 簡單/中等/複雜
- **類型**: 指標/策略/工具
- **主要需求**: [功能清單]
- **需要的 Skills**: [skill 清單]
- **特殊考量**: [挑戰點]
```

## 進度報告模板

```markdown
## 進度報告
- **當前階段**: [階段名稱]
- **已完成**: X/Y
- **進行中**: [當前任務]
- **下一步**: [後續任務]
```

## 需求釐清指南

### 標準需求（問 5-10 個問題）
- 常見指標（RSI、MACD、均線等）
- 常見策略（趨勢跟蹤、均值回歸、突破）
- 標準視覺化（疊加圖、振盪器、表格）

### 複雜需求（問 10-20 個問題）
- 多功能整合
- 自定義邏輯
- 特殊視覺化

### 邊界情況處理原則
- 不要說「不可能」
- 解釋 CAN 做什麼
- 提供創意替代方案
- 設定合理預期
