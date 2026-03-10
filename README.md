# @usecortex/cli

Open-source CLI for [usecortex](https://usecortex.net) — sync markdown folders and capture session memories to your encrypted knowledge base.

## Install

```bash
npm install -g @usecortex/cli
```

Or run directly:

```bash
npx @usecortex/cli
```

## Setup

1. Get an API key from [usecortex.net](https://usecortex.net) → Settings → API Keys
2. Run:

```bash
cortex init
```

Or set the environment variable:

```bash
export CORTEX_API_KEY=ctx_sk_your_key_here
```

## Commands

### Knowledge

```bash
# Sync a markdown folder to usecortex
cortex sync ./docs

# Sync with preview (dry run)
cortex sync ./docs --dry-run

# Force re-sync all files
cortex sync ./docs --force

# Push a single markdown file
cortex push ./notes/architecture.md
cortex push ./notes/architecture.md --topic "arch"

# Export all knowledge as markdown
cortex pull ./export
cortex pull --format json -o backup.json

# Search your knowledge base
cortex search "authentication flow"

# Ask AI-powered questions
cortex ask "How does the billing system work?"

# Get project context (CLAUDE.md format)
cortex context my-project
cortex context my-project -o CLAUDE.md
```

### Session Memory (Memory/Team plans)

```bash
# Capture a session
cortex capture "Refactored auth module to use JWT" \
  --tool claude-code \
  --project my-app \
  --tags "auth,refactor"

# Search session memories
cortex recall "authentication changes"
cortex recall "database migrations" --project my-app

# List recent sessions
cortex sessions
cortex sessions --tool claude-code --limit 5
```

### Configuration

```bash
# Check connection status
cortex whoami

# Reconfigure
cortex init --key ctx_sk_your_new_key
```

## How Sync Works

- Scans the folder for `.md` files
- Splits each file into facts by headings
- Derives topic names from folder structure or filenames
- Tracks file hashes in `.cortex-sync.json` to skip unchanged files
- Only sends changed files on subsequent runs

## Environment Variables

| Variable | Description |
|---|---|
| `CORTEX_API_KEY` | API key (overrides config file) |
| `CORTEX_API_URL` | Custom API URL (default: `https://api.usecortex.net`) |

## Config

Stored at `~/.cortex/config.json` (permissions: 600).

## Links

- [UseCortex](https://usecortex.net) — Create your account and manage knowledge
- [cortex-mcp](https://github.com/usecortex-official/cortex-mcp) — MCP server for AI coding agents

## License

MIT
