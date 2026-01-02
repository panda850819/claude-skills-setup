---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch
---

# Frontend Design

Create distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics.

---

## Integrations

```
upstream:
  - skill: spec-interviewer
    receives: UI requirements, user stories
  - skill: product-management
    receives: PRD with UX specs

downstream:
  - skill: spec-sync
    produces: implemented UI code for verification
```

---

## Out of Scope

- **後端 API 開發** - 只處理前端，後端用 mock 或現有 API
- **資料庫設計** - 不涉及持久化層
- **身份驗證流程設計** - 使用現有 auth 機制
- **效能優化** - 專注設計和實作，優化另外處理

---

## Purpose

This skill guides creation of distinctive, production-grade frontend interfaces. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.

---

## Implementation Checklist

- [ ] 確定美學方向 (tone, color, typography)
- [ ] 選擇技術棧 (HTML/CSS, React, Vue, etc.)
- [ ] 建立基礎結構和 CSS variables
- [ ] 實作核心 UI 組件
- [ ] 加入動畫和互動效果
- [ ] 響應式設計 (mobile, tablet, desktop)
- [ ] 無障礙基本支援 (semantic HTML, focus states)
- [ ] 最終細節打磨

---

## Verification

驗證命令（根據專案調整）：

```bash
pnpm lint          # 程式碼品質
pnpm build         # 建置成功
pnpm dev           # 開發預覽
```

完成標準：
- [ ] 所有建置命令成功
- [ ] 在多種螢幕尺寸下正常顯示
- [ ] 互動效果流暢
- [ ] 無 console 錯誤
- [ ] 視覺效果符合設計意圖

---

## Safety and Escalation

- **需要後端變更時** - 停止，建議使用其他 skill 或請求後端支援
- **效能問題** - 記錄問題，建議後續優化
- **無障礙衝突** - 優先無障礙，記錄設計妥協
- **複雜狀態管理** - 評估是否需要引入狀態管理方案

---

## Handoff Template

設計完成後交接：

```markdown
## Frontend Design Handoff

**Component/Page**: [name]
**Files created**:
- `src/components/[name].tsx`
- `src/styles/[name].css`

**Design decisions**:
- Aesthetic: [chosen direction]
- Color palette: [main colors]
- Typography: [fonts used]

**For integration** (if API needed):
→ Use `frontend-integration` skill

**For verification**:
→ Use `spec-sync` skill

**Notes**:
- [any responsive breakpoints]
- [animation details]
- [accessibility considerations]
```
