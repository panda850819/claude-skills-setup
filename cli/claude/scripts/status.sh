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

# 2. 檢查個人 Skills（分類顯示）
echo -e "${BLUE}【已安裝的 Skills】${NC}"
echo -e "目錄: ${SKILLS_DIR}"
echo ""

if [ -d "$SKILLS_DIR" ]; then
    # 分類計數
    personal_skills=()
    n8n_skills=()
    pine_skills=()
    other_skills=()

    for skill_dir in "$SKILLS_DIR"/*/; do
        if [ -d "$skill_dir" ]; then
            skill_name=$(basename "$skill_dir")
            skill_file="$skill_dir/SKILL.md"

            if [ -f "$skill_file" ]; then
                # 根據前綴分類
                if [[ "$skill_name" == n8n-* ]]; then
                    n8n_skills+=("$skill_name")
                elif [[ "$skill_name" == pine-* ]]; then
                    pine_skills+=("$skill_name")
                elif [[ "$skill_name" == "triage" || "$skill_name" == "quant-analyst" ]]; then
                    personal_skills+=("$skill_name")
                else
                    other_skills+=("$skill_name")
                fi
            fi
        fi
    done

    # 顯示個人 Skills
    if [ ${#personal_skills[@]} -gt 0 ]; then
        echo -e "  ${BOLD}個人 Skills (${#personal_skills[@]})${NC}"
        for skill in "${personal_skills[@]}"; do
            echo -e "    ${GREEN}✓${NC} $skill"
        done
        echo ""
    fi

    # 顯示 n8n Skills
    if [ ${#n8n_skills[@]} -gt 0 ]; then
        echo -e "  ${BOLD}n8n Skills (${#n8n_skills[@]})${NC}"
        for skill in "${n8n_skills[@]}"; do
            echo -e "    ${GREEN}✓${NC} $skill"
        done
        echo ""
    fi

    # 顯示 Pine Script Skills
    if [ ${#pine_skills[@]} -gt 0 ]; then
        echo -e "  ${BOLD}Pine Script Skills (${#pine_skills[@]})${NC}"
        for skill in "${pine_skills[@]}"; do
            echo -e "    ${GREEN}✓${NC} $skill"
        done
        echo ""
    fi

    # 顯示其他 Skills
    if [ ${#other_skills[@]} -gt 0 ]; then
        echo -e "  ${BOLD}其他 Skills (${#other_skills[@]})${NC}"
        for skill in "${other_skills[@]}"; do
            echo -e "    ${GREEN}✓${NC} $skill"
        done
        echo ""
    fi

    total_count=$((${#personal_skills[@]} + ${#n8n_skills[@]} + ${#pine_skills[@]} + ${#other_skills[@]}))
    if [ $total_count -eq 0 ]; then
        echo -e "  ${YELLOW}尚未安裝任何 skill${NC}"
    else
        echo -e "  ${BOLD}總計: ${total_count} 個 skills${NC}"
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

    # Notion
    if jq -e '.enabledPlugins["Notion@claude-plugins-official"] == true' "$SETTINGS_FILE" > /dev/null 2>&1; then
        echo ""
        echo -e "  ${GREEN}✓${NC} ${BOLD}Notion${NC} (6 skills)"
        echo "    notion-search, notion-find, notion-create-page, notion-create-task,"
        echo "    notion-database-query, notion-create-database-row"
    fi
fi

echo ""
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo -e "檢查時間: $(date '+%Y-%m-%d %H:%M:%S')"
echo -e "${BOLD}═══════════════════════════════════════════${NC}"
echo ""
