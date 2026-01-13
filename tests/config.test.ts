import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { loadConfig } from "../src/config.ts";

describe("loadConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Create a fresh env object and explicitly remove Slack-related vars
    // to avoid pollution from auto-loaded .env file
    process.env = { ...originalEnv };
    delete process.env.SLACK_BOT_TOKEN;
    delete process.env.SLACK_APP_TOKEN;
    delete process.env.SLACK_CHANNEL_ID;
    delete process.env.SLACK_USER_IDS;
    delete process.env.LIFELINE_TIMEOUT_MS;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should throw if SLACK_BOT_TOKEN is missing", () => {
    process.env.SLACK_APP_TOKEN = "xapp-test";
    process.env.SLACK_CHANNEL_ID = "C123";

    expect(() => loadConfig()).toThrow("SLACK_BOT_TOKEN environment variable is required");
  });

  it("should throw if SLACK_APP_TOKEN is missing", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    process.env.SLACK_CHANNEL_ID = "C123";

    expect(() => loadConfig()).toThrow("SLACK_APP_TOKEN environment variable is required");
  });

  it("should throw if SLACK_CHANNEL_ID is missing", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    process.env.SLACK_APP_TOKEN = "xapp-test";

    expect(() => loadConfig()).toThrow("SLACK_CHANNEL_ID environment variable is required");
  });

  it("should load config with required env vars", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    process.env.SLACK_APP_TOKEN = "xapp-test";
    process.env.SLACK_CHANNEL_ID = "C123";

    const config = loadConfig();

    expect(config.slack.botToken).toBe("xoxb-test");
    expect(config.slack.appToken).toBe("xapp-test");
    expect(config.slack.channelId).toBe("C123");
    expect(config.slack.userIds).toEqual([]);
    expect(config.timeoutMs).toBe(180000); // 3 minutes default
  });

  it("should parse SLACK_USER_IDS correctly", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    process.env.SLACK_APP_TOKEN = "xapp-test";
    process.env.SLACK_CHANNEL_ID = "C123";
    process.env.SLACK_USER_IDS = "U123, U456, U789";

    const config = loadConfig();

    expect(config.slack.userIds).toEqual(["U123", "U456", "U789"]);
  });

  it("should use custom timeout when provided", () => {
    process.env.SLACK_BOT_TOKEN = "xoxb-test";
    process.env.SLACK_APP_TOKEN = "xapp-test";
    process.env.SLACK_CHANNEL_ID = "C123";
    process.env.LIFELINE_TIMEOUT_MS = "60000";

    const config = loadConfig();

    expect(config.timeoutMs).toBe(60000);
  });
});
