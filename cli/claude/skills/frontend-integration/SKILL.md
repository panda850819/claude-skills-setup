---
name: frontend-integration
description: 整合現有 API 實作前端 UI，遵循設計系統和團隊規範。Use when integrating with existing backend APIs, following design system conventions, or working in team codebases. Triggers on "整合 API", "接 API", "串接", "對接後端", "follow design system".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# Frontend Integration

整合現有後端 API 實作前端 UI，遵循設計系統和團隊規範。

---

## vs frontend-design

| 面向 | frontend-integration | frontend-design |
|------|---------------------|-----------------|
| **重點** | 整合、規範、可維護 | 創意、美學、獨特 |
| **API** | 整合現有 API | 可 mock 或無 |
| **設計系統** | 遵循現有 | 每次創新 |
| **適用** | 團隊專案、企業環境 | 個人專案、Landing page |

**選擇指南**：
- 有現成 API 要整合 → `frontend-integration`
- 需要創意設計 → `frontend-design`
- 兩者都需要 → 先 `frontend-design` 設計，再用本 skill 整合

---

## Integrations

```
upstream:
  - skill: spec-interviewer
    receives: UI 需求和 API 規格
  - skill: product-management
    receives: PRD 中的 UI 規格

downstream:
  - skill: spec-sync
    produces: 實作代碼供驗證
```

---

## When to Use

- 功能主要是 **UI/UX 變更**，後端 API 已存在
- 需要遵循 **設計系統** 和 **路由慣例**
- 變更只影響 **前端**，不涉及後端修改
- 團隊協作環境，需要 **一致性** 和 **可維護性**

---

## Out of Scope

- **新建後端服務** - 只處理前端
- **修改 API 契約** - 使用現有 API
- **修改認證流程** - 使用現有 auth 機制
- **引入新框架** - 使用現有技術棧

---

## Inputs

開始前需要確認：

| 項目 | 說明 | 範例 |
|------|------|------|
| **Feature description** | 用戶流程敘述 | "用戶可以查看訂單歷史" |
| **API endpoints** | 相關 API | `GET /api/orders`, `POST /api/orders` |
| **Target routes** | 要修改的頁面/組件 | `/pages/orders`, `OrderList.tsx` |
| **Design reference** | 設計稿或參考 | Figma link, 現有頁面 |
| **Constraints** | 效能、無障礙需求 | "< 2s 載入", "WCAG AA" |

---

## Conventions

### Framework Patterns

```typescript
// React + TypeScript 範例
interface OrderListProps {
  userId: string;
  initialPage?: number;
}

// 使用現有的 data fetching pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['orders', userId],
  queryFn: () => fetchOrders(userId),
});
```

### State Management

- 優先使用現有狀態管理方案 (React Query, Redux, Zustand)
- 遵循現有的 loading/error/success 處理模式
- 使用現有的 toast/notification 系統

### Styling

- 使用現有設計系統組件 (Button, Input, Modal, etc.)
- 遵循現有的 CSS 慣例 (CSS Modules, Tailwind, styled-components)
- 使用現有的 CSS variables 和 theme

### Routing

- 遵循現有的路由結構
- 使用現有的 layout 和 navigation 組件
- 正確處理 auth guards 和 redirects

---

## Required Behavior

1. **Strong typing** - 所有 props 和 API 響應都有 TypeScript 類型
2. **State handling** - 處理 loading, empty, error, success 狀態
3. **Accessibility** - 鍵盤可操作、screen reader 友好
4. **Feature flags** - 如有需要，使用現有 feature flag 機制
5. **Error boundaries** - 適當的錯誤處理和 fallback UI

---

## Implementation Checklist

### 1. Discovery
- [ ] 確認相關 API 端點和類型
- [ ] 找到現有組件可重用
- [ ] 理解現有的狀態管理模式
- [ ] 確認設計規格

### 2. Types
- [ ] 定義或更新 API response types
- [ ] 定義組件 props types
- [ ] 確保類型與後端契約一致

### 3. Implementation
- [ ] 使用現有設計系統組件
- [ ] 實作 API 整合 (使用現有 data layer)
- [ ] 處理所有狀態 (loading/error/empty/success)
- [ ] 實作表單驗證 (如適用)

### 4. Quality
- [ ] 加入單元測試
- [ ] 加入整合/組件測試
- [ ] 確保無障礙性
- [ ] 確保響應式設計

---

## API Integration Patterns

### Data Fetching

```typescript
// 使用 React Query 範例
const useOrders = (userId: string) => {
  return useQuery({
    queryKey: ['orders', userId],
    queryFn: async () => {
      const response = await api.get<Order[]>(`/orders?userId=${userId}`);
      return response.data;
    },
  });
};
```

### Mutations

```typescript
const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => api.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('訂單建立成功');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
```

### Error Handling

```typescript
// 使用現有的錯誤處理模式
const OrderList = () => {
  const { data, isLoading, error } = useOrders(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} retry={refetch} />;
  if (!data?.length) return <EmptyState message="沒有訂單" />;

  return <OrderTable orders={data} />;
};
```

---

## State Handling Template

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };

// UI 對應
const renderState = <T,>(state: AsyncState<T>, render: (data: T) => ReactNode) => {
  switch (state.status) {
    case 'idle':
      return null;
    case 'loading':
      return <LoadingSpinner />;
    case 'error':
      return <ErrorMessage error={state.error} />;
    case 'success':
      return state.data.length === 0
        ? <EmptyState />
        : render(state.data);
  }
};
```

---

## Verification

### Commands

```bash
pnpm lint              # 程式碼品質
pnpm typecheck         # TypeScript 檢查
pnpm test              # 單元/整合測試
pnpm build             # 建置成功
```

### Completion Criteria

- [ ] 所有測試、lint、type check 通過
- [ ] UI 在正常、錯誤、邊界情況都正確運作
- [ ] 沒有修改不相關的檔案
- [ ] PR description 清楚說明變更

---

## Safety and Escalation

| 情況 | 行動 |
|------|------|
| 需要修改後端 API | **停止** - 請求後端支援或另開 task |
| 設計與無障礙衝突 | 優先無障礙，在 PR 中說明 |
| 需要新的共用組件 | 評估是否該抽出到設計系統 |
| 效能問題 | 記錄並建議後續優化 |
| Auth 變更 | **停止** - 這需要專門處理 |

---

## Testing Checklist

### Unit Tests
- [ ] 組件渲染正確
- [ ] Props 變化正確反映
- [ ] 事件處理正確

### Integration Tests
- [ ] API 呼叫正確
- [ ] 用戶流程可完成
- [ ] 錯誤處理正確

### Accessibility Tests
- [ ] 鍵盤可操作
- [ ] Focus 管理正確
- [ ] ARIA labels 適當

---

## Handoff Template

完成後提供：

```markdown
## Implementation Summary

**Feature**: [name]
**Files changed**:
- `src/pages/orders/index.tsx` (new)
- `src/components/OrderTable.tsx` (modified)
- `src/hooks/useOrders.ts` (new)

**API integrated**:
- `GET /api/orders` - 取得訂單列表
- `POST /api/orders` - 建立新訂單

**Testing**:
- [x] Unit tests added
- [x] Integration tests added
- [x] Manual testing completed

**Notes**:
- [any caveats or follow-up items]

**Ready for**: spec-sync verification
```
