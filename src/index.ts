#!/usr/bin/env node

import { loadConfig } from "./config.ts";
import { SlackClient } from "./slack/client.ts";
import { runServer } from "./mcp/server.ts";

async function main(): Promise<void> {
  try {
    const config = loadConfig();
    const slackClient = new SlackClient(config);

    // Start the Slack client (Socket Mode connection)
    await slackClient.start();

    // Run the MCP server
    await runServer(slackClient, config);
  } catch (error) {
    console.error("Failed to start lifeline-mcp:", error);
    process.exit(1);
  }
}

main();
