# ai-dev-setup shell aliases
# Source this file in your ~/.zshrc or ~/.bashrc:
#   source ~/.config/ai-dev/aliases.sh

# =============================================================================
# AI CLI 工具
# =============================================================================
alias c='claude'
alias cc='claude --continue'
alias g='gemini'
alias cx='codex'

# =============================================================================
# Git 快捷鍵
# =============================================================================
alias gs='git status -sb'
alias gst='git status'
alias gd='git diff'
alias gds='git diff --staged'
alias ga='git add'
alias gaa='git add -A'
alias gc='git commit'
alias gcm='git commit -m'
alias gp='git push'
alias gl='git pull'
alias gco='git checkout'
alias gb='git branch'
alias glog='git log --oneline --graph --decorate -20'

# =============================================================================
# 目錄導航
# =============================================================================
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

# =============================================================================
# 常用工具
# =============================================================================
alias cls='clear'
alias h='history'
alias grep='grep --color=auto'
alias df='df -h'
alias du='du -h'

# =============================================================================
# 開發常用
# =============================================================================
alias ni='npm install'
alias nr='npm run'
alias nrd='npm run dev'
alias nrb='npm run build'
alias nrt='npm run test'

alias yi='yarn install'
alias yr='yarn run'
alias yrd='yarn dev'
alias yrb='yarn build'

alias pi='pnpm install'
alias pr='pnpm run'
alias prd='pnpm dev'
alias prb='pnpm build'
