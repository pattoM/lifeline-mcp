import { z } from "zod/v3";

// Zod schema shape for MCP SDK - using Zod v3 for compatibility
export const AskHumanParamsShape = {
  question: z.string().describe("The question or decision point to ask the human about"),
  context: z.string().optional().describe("Additional context about the situation"),
  options: z.array(z.string()).optional().describe("Suggested options for the human to choose from"),
  urgency: z.enum(["low", "normal", "high"]).optional().default("normal").describe("Urgency level of the request"),
};

// Full Zod schema for validation
export const AskHumanSchema = z.object(AskHumanParamsShape);

export type AskHumanInput = z.infer<typeof AskHumanSchema>;

export const ASK_HUMAN_TOOL = {
  name: "ask_human",
  description: `Request input from a human when the AI agent is stuck, uncertain, or facing a critical decision.

Use this tool when:
- You encounter an ambiguous situation that requires human judgment
- You need to make a decision that could have significant consequences
- You're stuck and need guidance on how to proceed
- You want to validate an approach before implementing it

The human will receive a Slack message and can reply in a thread. Their response will be returned to you.
If no response is received within the timeout period, you'll receive a timeout indication and should proceed with your best judgment.`,
};
