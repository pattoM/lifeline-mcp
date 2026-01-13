import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ASK_HUMAN_TOOL, AskHumanParamsShape } from "./tools.ts";
import type { SlackClient } from "../slack/client.ts";
import type { Config } from "../types.ts";
import type { AskHumanInput } from "./tools.ts";

export function createMcpServer(slackClient: SlackClient, config: Config): McpServer {
  const server = new McpServer({
    name: "lifeline-mcp",
    version: "0.1.0",
  });

  // Register the ask_human tool with Zod schema shape
  server.tool(
    ASK_HUMAN_TOOL.name,
    ASK_HUMAN_TOOL.description,
    AskHumanParamsShape,
    async (params: AskHumanInput) => {
      // MCP SDK validates params against the Zod schema automatically
      try {
        const result = await slackClient.askHuman(params);

        if (result.timedOut) {
          return {
            content: [
              {
                type: "text" as const,
                text: `No response received within ${config.timeoutMs / 1000} seconds. Please proceed with your best judgment.`,
              },
            ],
          };
        }

        const responderInfo = result.responder
          ? ` (from user ${result.responder})`
          : "";

        return {
          content: [
            {
              type: "text" as const,
              text: `Human response${responderInfo}: ${result.response}`,
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: "text" as const,
              text: `Error communicating with Slack: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  return server;
}

export async function runServer(slackClient: SlackClient, config: Config): Promise<void> {
  const server = createMcpServer(slackClient, config);
  const transport = new StdioServerTransport();

  await server.connect(transport);
}
