# lifeline-mcp

Human-in-the-loop MCP server for Claude Code and other AI agents. Get human input via Slack when AI agents are stuck or facing critical decisions.

## Quick Demo

> **Note:** Make sure you've exported the required environment variables before running. See [Configuration](#configuration) below.

```bash    
claude \
  --mcp-config '{"mcpServers":{"lifeline":{"command":"npx","args":["lifeline-mcp"]}}}' \
  --allowedTools "mcp__lifeline__ask_human" \
  -p "Bootstrap a simple MCP server that exposes a get_weather tool. \
      If you encounter any dependency issues, use the ask_human tool to ask for help"
```

**What happens:**

1. Claude scaffolds the project, installs the MCP SDK, and writes the tool with Zod validation
2. While testing, Claude discovers the tool's input schema isn't working — the MCP SDK expects Zod v3 but installed Zod v4
3. Claude calls `ask_human` — a message appears in Slack:

   ```
   ┌───────────────────────────────────────────────────────────────┐
   │ AI Agent Needs Input                                          │
   ├───────────────────────────────────────────────────────────────┤
   │ @you Question:                                                │
   │ Hit a Zod version compatibility issue. How should I proceed?  │
   │                                                               │
   │ Context:                                                      │
   │ The MCP SDK's schema conversion expects Zod v3, but npm       │
   │ installed Zod v4. The tool's inputSchema is empty.            │
   │                                                               │
   │ Suggested options:                                            │
   │ 1. Import from "zod/v3" — quick fix, keeps v4 available       │
   │ 2. Write a compat layer — more flexible but more code         │
   │ 3. Use raw JSON Schema — works but loses type inference       │
   ├───────────────────────────────────────────────────────────────┤
   │ Reply in a thread to respond to the agent.                    │
   └───────────────────────────────────────────────────────────────┘
   ```

4. You reply: *"Just use v3, it's a proof of concept"*
5. Claude fixes the import and the MCP server works

## How It Works

```
┌─────────────────┐     MCP Call      ┌──────────────────┐
│   Claude Code   │ ──────────────────▶│   lifeline-mcp   │
│                 │                    │   (MCP Server)   │
└─────────────────┘                    └────────┬─────────┘
                                                │
                                       WebSocket (Socket Mode)
                                                │
                                                ▼
                                       ┌──────────────────┐
                                       │      Slack       │
                                       │  (post message,  │
                                       │  wait for reply) │
                                       └──────────────────┘
```

1. AI agent calls the `ask_human` tool when stuck or needing input
2. Message is posted to your configured Slack channel (with optional user mentions)
3. Human replies in a thread
4. Response is returned to the AI agent

## Prerequisites

### Slack App Setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app
2. Under **Socket Mode**, enable it and create an App-Level Token with `connections:write` scope
3. Under **OAuth & Permissions**, add these Bot Token Scopes:
   - `chat:write` - Post messages
   - `channels:history` - Read thread replies in public channels
   - `channels:read` - View channel info
   - `groups:history` - Read thread replies in private channels (if needed)
4. Under **Event Subscriptions**, enable events and subscribe to these bot events:
   - `message.channels` - Messages in public channels
   - `message.groups` - Messages in private channels (if needed)
5. Install the app to your workspace
6. Copy the **Bot User OAuth Token** (`xoxb-...`)
7. Copy the **App-Level Token** (`xapp-...`)
8. Invite the bot to your target channel: `/invite @YourBotName`

## Installation

```bash
npm install -g lifeline-mcp
# or use with npx
npx lifeline-mcp
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SLACK_BOT_TOKEN` | Yes | Bot User OAuth Token (`xoxb-...`) |
| `SLACK_APP_TOKEN` | Yes | App-Level Token for Socket Mode (`xapp-...`) |
| `SLACK_CHANNEL_ID` | Yes | Channel ID to post messages to (e.g., `C0123456789`) |
| `SLACK_USER_IDS` | No | Comma-separated Slack user IDs to mention (e.g., `U123,U456`) |
| `LIFELINE_TIMEOUT_MS` | No | Response timeout in ms (default: `180000` = 3 minutes) |

### Claude Code Configuration

Add to your Claude Code MCP settings (`~/.claude/claude_desktop_config.json` or project `.mcp.json`):

```json
{
  "mcpServers": {
    "lifeline": {
      "command": "npx",
      "args": ["lifeline-mcp"]
    }
  }
}
```

Environment variables are read from the shell environment. Set them before running Claude Code:

```bash
export SLACK_BOT_TOKEN="xoxb-your-bot-token"
export SLACK_APP_TOKEN="xapp-your-app-token"
export SLACK_CHANNEL_ID="C0123456789"
export SLACK_USER_IDS="U0123456789,U9876543210"  # optional
export LIFELINE_TIMEOUT_MS="180000"              # optional

# Then run Claude Code
claude
```

## Tool: `ask_human`

Request input from a human when the AI agent is stuck, uncertain, or facing a critical decision.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `question` | string | Yes | The question or decision point |
| `context` | string | No | Additional context about the situation |
| `options` | string[] | No | Suggested options for the human to choose from |
| `urgency` | "low" \| "normal" \| "high" | No | Urgency level (default: "normal") |

### Example Usage

```typescript
// Simple question
ask_human({
  question: "Should I refactor this function or leave it as is?"
})

// With context and options
ask_human({
  question: "Which database should I use for this feature?",
  context: "Building a real-time chat feature that needs low latency",
  options: ["PostgreSQL", "MongoDB", "Redis"],
  urgency: "normal"
})

// High urgency
ask_human({
  question: "This will delete 500 records. Should I proceed?",
  context: "Running database cleanup script",
  urgency: "high"
})
```

### Response

When a human responds, you'll receive:
```
Human response (from user U0123456789): Use PostgreSQL for durability
```

On timeout:
```
No response received within 180 seconds. Please proceed with your best judgment.
```

## Finding Slack IDs

- **Channel ID**: Open Slack, right-click channel name → "View channel details" → scroll to bottom for ID
- **User ID**: View a profile → click "..." → "Copy member ID"

## Development

```bash
# Install dependencies
bun install

# Run in development
bun run dev

# Run tests
bun run test

# Build
bun run build
```

## License

MIT
