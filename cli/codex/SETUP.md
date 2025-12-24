# Codex CLI Setup

## 安裝

```bash
npm install -g @openai/codex
```

## 設定 API Key

```bash
export OPENAI_API_KEY="your-api-key"
```

建議加入 `~/.zshrc` 或 `~/.bashrc`。

## Skills 共用

Codex CLI 共用 Claude Code 的 skills，位於:

```
~/.claude/skills/
```

安裝 Claude Code skills 後，Codex CLI 也可使用。

## 驗證安裝

```bash
codex --version
```

## 參考文件

- [Codex CLI GitHub](https://github.com/openai/codex)
- [OpenAI Documentation](https://platform.openai.com/docs)
