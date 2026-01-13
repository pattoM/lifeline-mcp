import type { Config } from "./types.ts";

const DEFAULT_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

export function loadConfig(): Config {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const appToken = process.env.SLACK_APP_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;

  if (!botToken) {
    throw new Error("SLACK_BOT_TOKEN environment variable is required");
  }
  if (!appToken) {
    throw new Error("SLACK_APP_TOKEN environment variable is required");
  }
  if (!channelId) {
    throw new Error("SLACK_CHANNEL_ID environment variable is required");
  }

  const userIdsRaw = process.env.SLACK_USER_IDS || "";
  const userIds = userIdsRaw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  const timeoutMs = process.env.LIFELINE_TIMEOUT_MS
    ? parseInt(process.env.LIFELINE_TIMEOUT_MS, 10)
    : DEFAULT_TIMEOUT_MS;

  return {
    slack: {
      botToken,
      appToken,
      channelId,
      userIds,
    },
    timeoutMs,
  };
}
