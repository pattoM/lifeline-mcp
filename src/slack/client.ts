import { App } from "@slack/bolt";
import type {
  Config,
  AskHumanParams,
  AskHumanResult,
  PendingQuestion,
} from "../types.ts";
import { formatMessage } from "./messages.ts";

export class SlackClient {
  private app: App;
  private config: Config;
  private pendingQuestions: Map<string, PendingQuestion> = new Map();
  private started = false;

  constructor(config: Config) {
    this.config = config;

    this.app = new App({
      token: config.slack.botToken,
      socketMode: true,
      appToken: config.slack.appToken,
    });

    this.setupMessageHandler();
  }

  private setupMessageHandler(): void {
    // Listen for messages in threads
    this.app.message(async ({ message }) => {
      // Only process messages with thread_ts (thread replies)
      if (!("thread_ts" in message) || !message.thread_ts) {
        return;
      }

      // Ignore bot messages
      if ("bot_id" in message && message.bot_id) {
        return;
      }

      const threadTs = message.thread_ts;
      const pending = this.pendingQuestions.get(threadTs);

      if (!pending) {
        return;
      }

      // Get the response text
      const text = "text" in message ? message.text : undefined;
      const userId = "user" in message ? message.user : undefined;

      if (!text) {
        return;
      }

      // Clear the timeout and resolve
      clearTimeout(pending.timeoutId);
      this.pendingQuestions.delete(threadTs);

      pending.resolve({
        response: text,
        responded: true,
        responder: userId || null,
        timedOut: false,
      });
    });
  }

  async start(): Promise<void> {
    if (this.started) return;
    await this.app.start();
    this.started = true;
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    await this.app.stop();
    this.started = false;
  }

  async askHuman(params: AskHumanParams): Promise<AskHumanResult> {
    const message = formatMessage(params, this.config.slack.userIds);

    // Post the message to the channel
    const result = await this.app.client.chat.postMessage({
      channel: this.config.slack.channelId,
      text: message.text,
      blocks: message.blocks,
    });

    if (!result.ts) {
      throw new Error("Failed to post message to Slack - no timestamp returned");
    }

    const threadTs = result.ts;

    // Create a promise that will be resolved when we get a reply
    return new Promise<AskHumanResult>((resolve) => {
      const timeoutId = setTimeout(() => {
        this.pendingQuestions.delete(threadTs);
        resolve({
          response: null,
          responded: false,
          responder: null,
          timedOut: true,
        });
      }, this.config.timeoutMs);

      this.pendingQuestions.set(threadTs, {
        threadTs,
        channelId: this.config.slack.channelId,
        resolve,
        timeoutId,
      });
    });
  }
}
