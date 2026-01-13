export interface Config {
  slack: {
    botToken: string;
    appToken: string;
    channelId: string;
    userIds: string[];
  };
  timeoutMs: number;
}

export interface AskHumanParams {
  question: string;
  context?: string;
  options?: string[];
  urgency?: "low" | "normal" | "high";
}

export interface AskHumanResult {
  response: string | null;
  responded: boolean;
  responder: string | null;
  timedOut: boolean;
}

export interface PendingQuestion {
  threadTs: string;
  channelId: string;
  resolve: (result: AskHumanResult) => void;
  timeoutId: ReturnType<typeof setTimeout>;
}
