#!/bin/bash

# Claude Code 完整環境安裝腳本
# 包含：Plugins、Skills、MCP Servers、自訂指令
# 用法: bash setup-plugins.sh

set -e

# 顏色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${BOLD}   Claude Code 完整環境安裝腳本${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""

# ============================================
# 步驟 1: 檢查前置條件
# ============================================
echo -e "${BLUE}【步驟 1/6】檢查前置條件${NC}"
echo "----------------------------------------"

# 檢查 claude
if ! command -v claude &> /dev/null; then
    echo -e "${RED}✗ Claude Code 尚未安裝${NC}"
    echo "  請先安裝: npm install -g @anthropic-ai/claude-code"
    exit 1
fi
echo -e "${GREEN}✓${NC} Claude Code 已安裝"

# 檢查 git
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git 尚未安裝${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Git 已安裝"

# 檢查 npx
if ! command -v npx &> /dev/null; then
    echo -e "${YELLOW}⚠ npx 未找到，n8n-mcp 可能無法使用${NC}"
else
    echo -e "${GREEN}✓${NC} npx 已安裝"
fi

echo ""

# ============================================
# 步驟 2: 建立目錄結構
# ============================================
echo -e "${BLUE}【步驟 2/6】建立目錄結構${NC}"
echo "----------------------------------------"

mkdir -p ~/.claude/skills
mkdir -p ~/.claude/commands
mkdir -p ~/.claude/scripts

echo -e "${GREEN}✓${NC} ~/.claude/skills/"
echo -e "${GREEN}✓${NC} ~/.claude/commands/"
echo -e "${GREEN}✓${NC} ~/.claude/scripts/"
echo ""

# ============================================
# 步驟 3: 安裝個人 Skills
# ============================================
echo -e "${BLUE}【步驟 3/6】安裝個人 Skills${NC}"
echo "----------------------------------------"

# 檢查是否有 skills 目錄
if [ -d "$SCRIPT_DIR/skills" ]; then
    cp -r "$SCRIPT_DIR/skills/"* ~/.claude/skills/ 2>/dev/null || true
    echo -e "${GREEN}✓${NC} 已複製個人 skills"
else
    echo -e "${YELLOW}⚠${NC} 找不到 skills 目錄，跳過"
fi

echo ""

# ============================================
# 步驟 4: 安裝 n8n-skills
# ============================================
echo -e "${BLUE}【步驟 4/6】安裝 n8n-skills${NC}"
echo "----------------------------------------"

if [ -d "/tmp/n8n-skills" ]; then
    rm -rf /tmp/n8n-skills
fi

echo "正在從 GitHub 克隆 n8n-skills..."
if git clone --quiet https://github.com/czlonkowski/n8n-skills.git /tmp/n8n-skills 2>/dev/null; then
    cp -r /tmp/n8n-skills/skills/* ~/.claude/skills/
    rm -rf /tmp/n8n-skills
    echo -e "${GREEN}✓${NC} n8n-skills 安裝完成（7 個 skills）"
else
    echo -e "${YELLOW}⚠${NC} n8n-skills 安裝失敗，請手動安裝"
fi

echo ""

# ============================================
# 步驟 5: 部署自訂指令與腳本
# ============================================
echo -e "${BLUE}【步驟 5/6】部署自訂指令${NC}"
echo "----------------------------------------"

# 部署狀態檢查腳本
if [ -f "$SCRIPT_DIR/claude-skills-status.sh" ]; then
    cp "$SCRIPT_DIR/claude-skills-status.sh" ~/.claude/scripts/
    chmod +x ~/.claude/scripts/claude-skills-status.sh
    echo -e "${GREEN}✓${NC} claude-skills-status.sh 已部署"
fi

# 建立 /plugins-status 指令
if [ -d "$SCRIPT_DIR/commands" ]; then
    cp "$SCRIPT_DIR/commands/"* ~/.claude/commands/ 2>/dev/null || true
    echo -e "${GREEN}✓${NC} 自訂指令已部署"
else
    # 如果沒有 commands 目錄，建立預設指令
    cat > ~/.claude/commands/plugins-status.md << 'EOF'
執行 skills 狀態檢查腳本並顯示結果：

```bash
~/.claude/scripts/claude-skills-status.sh
```

用表格整理輸出結果，確認所有 plugins 和 skills 的安裝狀態。
EOF
    echo -e "${GREEN}✓${NC} 已建立 /plugins-status 指令"
fi

echo ""

# ============================================
# 步驟 6: Plugin 安裝指引
# ============================================
echo -e "${BLUE}【步驟 6/6】Plugin 安裝指引${NC}"
echo "----------------------------------------"
echo ""
echo "請在 Claude Code 互動介面中執行以下命令："
echo ""
echo -e "${BOLD}新增 Marketplaces:${NC}"
echo -e "  ${GREEN}/plugin marketplace add obra/superpowers-marketplace${NC}"
echo -e "  ${GREEN}/plugin marketplace add thedotmack/claude-mem${NC}"
echo -e "  ${GREEN}/plugin marketplace add anthropic/claude-plugins-official${NC}"
echo ""
echo -e "${BOLD}安裝 Plugins:${NC}"
echo -e "  ${GREEN}/plugin install superpowers@superpowers-marketplace${NC}"
echo -e "  ${GREEN}/plugin install claude-mem@thedotmack${NC}"
echo -e "  ${GREEN}/plugin install context7@claude-plugins-official${NC}"
echo ""

# ============================================
# MCP 設定提示
# ============================================
echo -e "${BOLD}MCP Server 設定:${NC}"
echo "----------------------------------------"

if [ -f ~/.mcp.json ]; then
    echo -e "${GREEN}✓${NC} ~/.mcp.json 已存在"
else
    echo -e "${YELLOW}⚠${NC} 尚未設定 MCP Server"
    echo ""
    echo "如需使用 n8n-mcp，請建立 ~/.mcp.json："
    echo ""
    cat << 'EOF'
{
  "mcpServers": {
    "n8n-mcp": {
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key"
      }
    }
  }
}
EOF
fi

echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ 安裝腳本執行完成${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""
echo "已安裝的 Skills:"
ls -1 ~/.claude/skills/ 2>/dev/null | sed 's/^/  • /'
echo ""
echo "下一步:"
echo "  1. 在 Claude Code 中執行上述 /plugin 命令"
echo "  2. 重新啟動 Claude Code"
echo "  3. 執行 /plugins-status 確認安裝狀態"
echo ""
