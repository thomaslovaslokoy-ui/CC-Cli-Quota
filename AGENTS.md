# AGENTS.md

## Cursor Cloud specific instructions

This is a VS Code extension ("CC Cli Quota") that monitors AI CLI usage quotas for Claude Code, OpenAI Codex, Google Gemini, Z.ai, and OpenRouter. It is **not** a monorepo — the entire project is a single `package.json` at the root.

### Architecture

- `extension.js` — VS Code extension entry point (Node.js/JavaScript). Registers commands and manages the status bar.
- `cclimits.py` — Python monitoring engine (~1300 lines). Fetched quota data by reading local OAuth tokens and calling provider APIs. The extension spawns this as a child process.
- No databases, Docker services, or backend servers are involved.

### Key development commands

| Task | Command |
|---|---|
| Install dependencies | `pnpm install` |
| Package `.vsix` | `npx @vscode/vsce package --no-git-tag-version --allow-missing-repository` |
| Test Python script | `python3 cclimits.py --json --claude` |
| Install extension | `code --install-extension cc-cli-quota-*.vsix --force` |

### Gotchas

- **No test framework**: There are no automated tests configured. Validation is done by packaging the `.vsix` and manually testing in VS Code.
- **No lint scripts**: There are no lint/format scripts in `package.json`.
- **`python` vs `python3`**: The extension defaults to calling `python` (configurable via `cclimits.pythonPath` setting). In environments where only `python3` is available, create a symlink: `sudo ln -sf /usr/bin/python3 /usr/local/bin/python`.
- **Provider credentials**: The extension expects OAuth tokens / API keys for the AI providers it monitors. Without credentials, the extension shows "AI: Off" in the status bar and reports "No credentials found" per provider — this is normal and does not indicate a bug.
- **Build artifacts**: `vsce package` produces a `.vsix` file in the repo root. This file is gitignored.
