import type { AskHumanParams } from "../types.ts";

interface SlackMessage {
  text: string;
  blocks: SlackBlock[];
}

type SlackBlock =
  | { type: "header"; text: { type: "plain_text"; text: string; emoji: boolean } }
  | { type: "section"; text: { type: "mrkdwn"; text: string } }
  | { type: "divider" }
  | { type: "context"; elements: Array<{ type: "mrkdwn"; text: string }> };

const URGENCY_EMOJI: Record<string, string> = {
  low: "",
  normal: "",
  high: ":rotating_light:",
};

export function formatMessage(
  params: AskHumanParams,
  userIds: string[]
): SlackMessage {
  const urgency = params.urgency || "normal";
  const urgencyEmoji = URGENCY_EMOJI[urgency] || "";
  const urgencyPrefix = urgencyEmoji ? `${urgencyEmoji} ` : "";

  // Build user mentions
  const mentions =
    userIds.length > 0
      ? userIds.map((id) => `<@${id}>`).join(" ") + " "
      : "";

  // Fallback text for notifications
  const text = `${urgencyPrefix}${mentions}AI Agent needs your input: ${params.question}`;

  const blocks: SlackBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: `${urgencyPrefix}AI Agent Needs Input`,
      emoji: true,
    },
  });

  // Question
  blocks.push({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `${mentions}*Question:*\n${params.question}`,
    },
  });

  // Context if provided
  if (params.context) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Context:*\n${params.context}`,
      },
    });
  }

  // Options if provided
  if (params.options && params.options.length > 0) {
    const optionsList = params.options
      .map((opt, i) => `${i + 1}. ${opt}`)
      .join("\n");

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Suggested options:*\n${optionsList}`,
      },
    });
  }

  blocks.push({ type: "divider" });

  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: "_Reply in a thread to this message to respond to the AI agent._",
      },
    ],
  });

  return { text, blocks };
}
