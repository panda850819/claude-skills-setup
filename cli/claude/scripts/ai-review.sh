#!/bin/bash
# AI Code Review Script (Global Version)
# 並行執行 Gemini + Codex review
# 可在任何 git 專案中使用

set -e

# ============ 配置區 ============
CODEX_MODEL="GPT-5.2-Codex"
GEMINI_MODEL="gemini-3-pro-preview"
# ================================

# 使用當前工作目錄作為專案根目錄
PROJECT_ROOT="$(pwd)"

# 確認是 git repo
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "Error: Not a git repository"
    exit 1
fi

# Review 輸出目錄（在專案內）
GEMINI_DIR="$PROJECT_ROOT/gemini-reviews"
CODEX_DIR="$PROJECT_ROOT/codex-reviews"

# 建立輸出目錄
mkdir -p "$GEMINI_DIR" "$CODEX_DIR"

# 時間戳記
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")

echo "Starting AI Code Review..."
echo "Project: $PROJECT_ROOT"
echo "Models: Codex=$CODEX_MODEL, Gemini=$GEMINI_MODEL"
echo ""

# 檢查是否有 uncommitted changes
if git diff --quiet HEAD 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
    echo "No uncommitted changes to review."
    exit 0
fi

# Review Prompt for Gemini
REVIEW_PROMPT="You are a senior code reviewer. Review this git diff.

Focus on:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance issues
4. Code readability and maintainability

Guidelines:
- Only report meaningful issues, avoid nitpicking
- Be specific with line references when possible
- Provide actionable suggestions
- Use markdown format with clear sections

If no significant issues found, say so briefly."

# 並行執行 Codex 和 Gemini review
echo "Running Codex review..."
(
    codex review --uncommitted -c model="$CODEX_MODEL" 2>&1 | tee "$CODEX_DIR/latest-review.md"
    cp "$CODEX_DIR/latest-review.md" "$CODEX_DIR/review-$TIMESTAMP.md"
) &
CODEX_PID=$!

echo "Running Gemini review..."
(
    git diff HEAD | gemini -m "$GEMINI_MODEL" "$REVIEW_PROMPT" 2>&1 | tee "$GEMINI_DIR/latest-review.md"
    cp "$GEMINI_DIR/latest-review.md" "$GEMINI_DIR/review-$TIMESTAMP.md"
) &
GEMINI_PID=$!

# 等待兩個都完成
echo ""
echo "Waiting for reviews to complete..."
wait $CODEX_PID
CODEX_STATUS=$?
wait $GEMINI_PID
GEMINI_STATUS=$?

echo ""
echo "========================================"
echo "Review Complete!"
echo "========================================"
echo ""

if [ $CODEX_STATUS -eq 0 ]; then
    echo "Codex review: $CODEX_DIR/latest-review.md"
else
    echo "Codex review: FAILED"
fi

if [ $GEMINI_STATUS -eq 0 ]; then
    echo "Gemini review: $GEMINI_DIR/latest-review.md"
else
    echo "Gemini review: FAILED"
fi

echo ""
echo "To view results, ask Claude:"
echo "  show me @gemini-reviews/latest-review.md and @codex-reviews/latest-review.md"
echo ""
echo "To fix issues:"
echo "  fix based on the reviews"
