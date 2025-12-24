# ai-dev-setup Makefile
# AI CLI 開發環境快速部署
#
# 使用方式:
#   make all      - 完整安裝
#   make minimal  - 最小安裝 (core + claude)
#   make help     - 顯示說明

SHELL := /bin/bash
.PHONY: all minimal core claude gemini codex git shell tools status backup clean help

# 顏色定義
GREEN  := \033[0;32m
BLUE   := \033[0;34m
YELLOW := \033[1;33m
RED    := \033[0;31m
BOLD   := \033[1m
NC     := \033[0m

# 目錄定義
CLAUDE_DIR := $(HOME)/.claude
MCP_FILE   := $(HOME)/.mcp.json
REPO_DIR   := $(shell pwd)

#==============================================================================
# 主要 Targets
#==============================================================================

all: core claude gemini codex ## 完整安裝所有工具
	@echo ""
	@echo -e "$(GREEN)$(BOLD)✓ 完整安裝完成$(NC)"
	@echo -e "  執行 $(BOLD)make status$(NC) 檢查狀態"

minimal: core claude ## 最小安裝 (core + Claude Code)
	@echo ""
	@echo -e "$(GREEN)$(BOLD)✓ 最小安裝完成$(NC)"

#==============================================================================
# Core 設定
#==============================================================================

core: git shell tools ## 安裝核心開發設定

git: ## 設定 Git
	@echo -e "$(BLUE)【Git 設定】$(NC)"
	@if [ -f core/git/.gitconfig.template ]; then \
		if [ ! -f $(HOME)/.gitconfig ]; then \
			cp core/git/.gitconfig.template $(HOME)/.gitconfig; \
			echo -e "  $(GREEN)✓$(NC) 已建立 ~/.gitconfig"; \
			echo -e "  $(YELLOW)⚠$(NC) 請編輯 ~/.gitconfig 設定 user.name 和 user.email"; \
		else \
			echo -e "  $(YELLOW)⚠$(NC) ~/.gitconfig 已存在，跳過"; \
		fi; \
	fi
	@if [ -f core/git/.gitignore_global ]; then \
		cp core/git/.gitignore_global $(HOME)/.gitignore_global; \
		git config --global core.excludesfile $(HOME)/.gitignore_global; \
		echo -e "  $(GREEN)✓$(NC) 已設定 global gitignore"; \
	fi

shell: ## 設定 Shell aliases 和環境變數
	@echo -e "$(BLUE)【Shell 設定】$(NC)"
	@mkdir -p $(HOME)/.config/ai-dev
	@if [ -f core/shell/aliases.sh ]; then \
		cp core/shell/aliases.sh $(HOME)/.config/ai-dev/; \
		echo -e "  $(GREEN)✓$(NC) 已複製 aliases.sh"; \
	fi
	@if [ -f core/shell/exports.sh ]; then \
		cp core/shell/exports.sh $(HOME)/.config/ai-dev/; \
		echo -e "  $(GREEN)✓$(NC) 已複製 exports.sh"; \
	fi
	@echo ""
	@echo -e "  $(YELLOW)請將以下行加入你的 ~/.zshrc 或 ~/.bashrc:$(NC)"
	@echo -e "    source ~/.config/ai-dev/aliases.sh"
	@echo -e "    source ~/.config/ai-dev/exports.sh"

tools: ## 顯示建議安裝的工具
	@echo -e "$(BLUE)【建議安裝的工具】$(NC)"
	@if [ -f core/tools.txt ]; then \
		echo ""; \
		cat core/tools.txt | grep -v '^#' | grep -v '^$$' | sed 's/^/  • /'; \
		echo ""; \
		echo -e "  macOS: $(BOLD)brew install $$(cat core/tools.txt | grep -v '^#' | grep -v '^$$' | tr '\n' ' ')$(NC)"; \
	fi

#==============================================================================
# Claude Code
#==============================================================================

claude: claude-dirs claude-skills claude-external-skills claude-commands claude-scripts claude-mcp ## 安裝 Claude Code 完整設定
	@echo ""
	@echo -e "$(GREEN)✓ Claude Code 設定完成$(NC)"
	@echo ""
	@echo -e "$(YELLOW)請在 Claude Code 中手動執行:$(NC)"
	@echo "  /plugin marketplace add obra/superpowers-marketplace"
	@echo "  /plugin marketplace add thedotmack/claude-mem"
	@echo "  /plugin marketplace add anthropic/claude-plugins-official"
	@echo ""
	@echo "  /plugin install superpowers@superpowers-marketplace"
	@echo "  /plugin install claude-mem@thedotmack"
	@echo "  /plugin install context7@claude-plugins-official"
	@echo "  /plugin install Notion@claude-plugins-official"

claude-dirs: ## 建立 Claude Code 目錄結構
	@echo -e "$(BLUE)【Claude Code 目錄】$(NC)"
	@mkdir -p $(CLAUDE_DIR)/skills
	@mkdir -p $(CLAUDE_DIR)/commands
	@mkdir -p $(CLAUDE_DIR)/scripts
	@echo -e "  $(GREEN)✓$(NC) 目錄結構已建立"

claude-skills: ## 安裝個人 Skills
	@echo -e "$(BLUE)【Claude Code Skills】$(NC)"
	@if [ -d cli/claude/skills ]; then \
		cp -r cli/claude/skills/* $(CLAUDE_DIR)/skills/ 2>/dev/null || true; \
		echo -e "  $(GREEN)✓$(NC) 個人 skills 已安裝"; \
	fi

claude-external-skills: ## 安裝外部 Skills (n8n-skills 等)
	@echo -e "$(BLUE)【外部 Skills】$(NC)"
	@if [ -f cli/claude/external-skills.txt ]; then \
		while IFS= read -r url || [ -n "$$url" ]; do \
			if [[ "$$url" =~ ^https:// ]]; then \
				name=$$(basename $$url .git); \
				echo "  正在安裝 $$name..."; \
				rm -rf /tmp/$$name 2>/dev/null; \
				if git clone --quiet $$url /tmp/$$name 2>/dev/null; then \
					cp -r /tmp/$$name/skills/* $(CLAUDE_DIR)/skills/ 2>/dev/null || true; \
					rm -rf /tmp/$$name; \
					echo -e "  $(GREEN)✓$(NC) $$name 已安裝"; \
				else \
					echo -e "  $(RED)✗$(NC) $$name 安裝失敗"; \
				fi; \
			fi; \
		done < cli/claude/external-skills.txt; \
	fi

claude-commands: ## 安裝自訂指令
	@if [ -d cli/claude/commands ]; then \
		cp cli/claude/commands/* $(CLAUDE_DIR)/commands/ 2>/dev/null || true; \
		echo -e "  $(GREEN)✓$(NC) 自訂指令已安裝"; \
	fi

claude-scripts: ## 安裝輔助腳本
	@if [ -d cli/claude/scripts ]; then \
		cp cli/claude/scripts/* $(CLAUDE_DIR)/scripts/ 2>/dev/null || true; \
		chmod +x $(CLAUDE_DIR)/scripts/*.sh 2>/dev/null || true; \
		echo -e "  $(GREEN)✓$(NC) 輔助腳本已安裝"; \
	fi

claude-mcp: ## 設定 MCP
	@echo -e "$(BLUE)【MCP 設定】$(NC)"
	@if [ -f cli/claude/mcp.json.template ] && [ ! -f $(MCP_FILE) ]; then \
		cp cli/claude/mcp.json.template $(MCP_FILE); \
		echo -e "  $(GREEN)✓$(NC) 已建立 ~/.mcp.json"; \
		echo -e "  $(YELLOW)⚠$(NC) 請編輯 ~/.mcp.json 設定 API keys"; \
	elif [ -f $(MCP_FILE) ]; then \
		echo -e "  $(YELLOW)⚠$(NC) ~/.mcp.json 已存在，跳過"; \
	fi

#==============================================================================
# Gemini CLI
#==============================================================================

gemini: ## 安裝 Gemini CLI
	@echo -e "$(BLUE)【Gemini CLI】$(NC)"
	@if command -v gemini &> /dev/null; then \
		echo -e "  $(GREEN)✓$(NC) Gemini CLI 已安裝"; \
	else \
		echo -e "  $(YELLOW)⚠$(NC) Gemini CLI 未安裝"; \
		echo -e "  安裝指令: $(BOLD)npm install -g @anthropic-ai/gemini-cli$(NC)"; \
	fi
	@if [ -f cli/gemini/SETUP.md ]; then \
		echo -e "  詳細說明: cli/gemini/SETUP.md"; \
	fi

#==============================================================================
# Codex CLI
#==============================================================================

codex: ## 安裝 Codex CLI
	@echo -e "$(BLUE)【Codex CLI】$(NC)"
	@if command -v codex &> /dev/null; then \
		echo -e "  $(GREEN)✓$(NC) Codex CLI 已安裝"; \
	else \
		echo -e "  $(YELLOW)⚠$(NC) Codex CLI 未安裝"; \
		echo -e "  安裝指令: $(BOLD)npm install -g @openai/codex$(NC)"; \
	fi
	@echo -e "  $(GREEN)✓$(NC) Codex 共用 Claude Code 的 skills"
	@if [ -f cli/codex/SETUP.md ]; then \
		echo -e "  詳細說明: cli/codex/SETUP.md"; \
	fi

#==============================================================================
# 工具類
#==============================================================================

status: ## 檢查安裝狀態
	@echo ""
	@echo -e "$(BOLD)═══════════════════════════════════════════$(NC)"
	@echo -e "$(BOLD)       AI Dev Setup 安裝狀態$(NC)"
	@echo -e "$(BOLD)═══════════════════════════════════════════$(NC)"
	@echo ""
	@echo -e "$(BLUE)【AI CLI 工具】$(NC)"
	@command -v claude &> /dev/null && echo -e "  $(GREEN)✓$(NC) Claude Code" || echo -e "  $(RED)✗$(NC) Claude Code"
	@command -v gemini &> /dev/null && echo -e "  $(GREEN)✓$(NC) Gemini CLI" || echo -e "  $(RED)✗$(NC) Gemini CLI"
	@command -v codex &> /dev/null && echo -e "  $(GREEN)✓$(NC) Codex CLI" || echo -e "  $(RED)✗$(NC) Codex CLI"
	@echo ""
	@echo -e "$(BLUE)【Claude Code Skills】$(NC)"
	@if [ -d $(CLAUDE_DIR)/skills ]; then \
		count=$$(find $(CLAUDE_DIR)/skills -maxdepth 1 -type d | wc -l); \
		count=$$((count - 1)); \
		echo -e "  已安裝 $$count 個 skills"; \
		ls -1 $(CLAUDE_DIR)/skills 2>/dev/null | sed 's/^/    • /'; \
	else \
		echo -e "  $(YELLOW)尚未安裝$(NC)"; \
	fi
	@echo ""
	@echo -e "$(BLUE)【設定檔】$(NC)"
	@[ -f $(HOME)/.gitconfig ] && echo -e "  $(GREEN)✓$(NC) ~/.gitconfig" || echo -e "  $(RED)✗$(NC) ~/.gitconfig"
	@[ -f $(HOME)/.gitignore_global ] && echo -e "  $(GREEN)✓$(NC) ~/.gitignore_global" || echo -e "  $(RED)✗$(NC) ~/.gitignore_global"
	@[ -f $(MCP_FILE) ] && echo -e "  $(GREEN)✓$(NC) ~/.mcp.json" || echo -e "  $(RED)✗$(NC) ~/.mcp.json"
	@[ -f $(HOME)/.config/ai-dev/aliases.sh ] && echo -e "  $(GREEN)✓$(NC) aliases.sh" || echo -e "  $(RED)✗$(NC) aliases.sh"
	@echo ""

backup: ## 備份現有設定
	@echo -e "$(BLUE)【備份現有設定】$(NC)"
	@mkdir -p backups/$$(date +%Y%m%d_%H%M%S)
	@[ -d $(CLAUDE_DIR)/skills ] && cp -r $(CLAUDE_DIR)/skills backups/$$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
	@[ -f $(MCP_FILE) ] && cp $(MCP_FILE) backups/$$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
	@[ -f $(HOME)/.gitconfig ] && cp $(HOME)/.gitconfig backups/$$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
	@echo -e "  $(GREEN)✓$(NC) 已備份到 backups/"

clean: ## 清理安裝 (謹慎使用)
	@echo -e "$(RED)$(BOLD)警告: 這將移除所有已安裝的設定$(NC)"
	@read -p "確定要繼續嗎? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	@rm -rf $(CLAUDE_DIR)/skills/*
	@rm -rf $(CLAUDE_DIR)/commands/*
	@rm -rf $(CLAUDE_DIR)/scripts/*
	@rm -rf $(HOME)/.config/ai-dev
	@echo -e "$(GREEN)✓$(NC) 已清理"

help: ## 顯示說明
	@echo ""
	@echo -e "$(BOLD)ai-dev-setup$(NC) - AI CLI 開發環境快速部署"
	@echo ""
	@echo -e "$(BOLD)使用方式:$(NC)"
	@echo "  make <target>"
	@echo ""
	@echo -e "$(BOLD)主要指令:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
