#!/bin/bash

# Claude Skills 安裝狀態檢查腳本
# 用法: ./claude-skills-status.sh

SETTINGS_FILE="$HOME/.claude/settings.json"
SKILLS_DIR="$HOME/.claude/skills"

# 顏色定義
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "${BOLD}       Claude Skills 安裝狀態檢查${NC}"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""

# 1. 檢查 settings.json
echo -e "${BLUE}【Plugins 狀態】${NC}"
echo -e "設定檔: ${SETTINGS_FILE}"
echo ""

if [ -f "$SETTINGS_FILE" ]; then
    # 檢查是否有 enabledPlugins
    if jq -e '.enabledPlugins' "$SETTINGS_FILE" > /dev/null 2>&1; then
        echo -e "  ${BOLD}已安裝的 Plugins:${NC}"
        jq -r '.enabledPlugins | to_entries[] | "  " + (if .value then "✓" else "✗" end) + " " + .key + (if .value then " (啟用)" else " (停用)" end)' "$SETTINGS_FILE" | while read line; do
            if [[ $line == *"(啟用)"* ]]; then
                echo -e "  ${GREEN}${line}${NC}"
            else
                echo -e "  ${YELLOW}${line}${NC}"
            fi
        done
    else
        echo -e "  ${YELLOW}尚未安裝任何 plugin${NC}"
    fi
else
    echo -e "  ${RED}✗ 找不到 settings.json${NC}"
fi

echo ""

# 2. 檢查個人 Skills
echo -e "${BLUE}【個人 Skills】${NC}"
echo -e "目錄: ${SKILLS_DIR}"
echo ""

if [ -d "$SKILLS_DIR" ]; then
    skill_count=0
    for skill_dir in "$SKILLS_DIR"/*/; do
        if [ -d "$skill_dir" ]; then
            skill_name=$(basename "$skill_dir")
            skill_file="$skill_dir/SKILL.md"

            if [ -f "$skill_file" ]; then
                # 嘗試提取 description
                desc=$(grep -A1 "^description:" "$skill_file" 2>/dev/null | head -1 | sed 's/^description: *//')
                if [ -z "$desc" ]; then
                    desc="(無描述)"
                fi
                echo -e "  ${GREEN}✓${NC} ${BOLD}${skill_name}${NC}"
                echo -e "    ${desc:0:60}..."
                ((skill_count++))
            else
                echo -e "  ${YELLOW}⚠${NC} ${skill_name} (缺少 SKILL.md)"
            fi
        fi
    done

    if [ $skill_count -eq 0 ]; then
        echo -e "  ${YELLOW}尚未安裝任何個人 skill${NC}"
    fi
else
    echo -e "  ${YELLOW}Skills 目錄不存在${NC}"
    echo -e "  建立目錄: mkdir -p ~/.claude/skills"
fi

echo ""

# 3. Plugin 提供的 Skills 概覽
echo -e "${BLUE}【Plugin Skills 概覽】${NC}"
echo ""

# 從 settings 讀取已啟用的 plugins
if [ -f "$SETTINGS_FILE" ] && jq -e '.enabledPlugins' "$SETTINGS_FILE" > /dev/null 2>&1; then

    # superpowers
    if jq -e '.enabledPlugins["superpowers@superpowers-marketplace"] == true' "$SETTINGS_FILE" > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} ${BOLD}superpowers${NC} (14 skills)"
        echo "    brainstorming, writing-plans, executing-plans, test-driven-development,"
        echo "    systematic-debugging, verification-before-completion, requesting-code-review,"
        echo "    receiving-code-review, writing-skills, dispatching-parallel-agents,"
        echo "    subagent-driven-development, using-git-worktrees, finishing-a-development-branch,"
        echo "    using-superpowers"
    fi

    # claude-mem
    if jq -e '.enabledPlugins["claude-mem@thedotmack"] == true' "$SETTINGS_FILE" > /dev/null 2>&1; then
        echo ""
        echo -e "  ${GREEN}✓${NC} ${BOLD}claude-mem${NC} (2 skills)"
        echo "    mem-search, troubleshoot"
    fi

    # context7
    if jq -e '.enabledPlugins["context7@claude-plugins-official"] == true' "$SETTINGS_FILE" > /dev/null 2>&1; then
        echo ""
        echo -e "  ${GREEN}✓${NC} ${BOLD}context7${NC} (MCP 工具)"
        echo "    resolve-library-id, get-library-docs"
    fi
fi

echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "檢查時間: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""
