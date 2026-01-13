import { describe, it, expect } from "vitest";
import { AskHumanSchema, ASK_HUMAN_TOOL, AskHumanParamsShape } from "../src/mcp/tools.ts";

describe("AskHumanSchema", () => {
  it("should validate minimal valid input", () => {
    const result = AskHumanSchema.safeParse({
      question: "Should I proceed?",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.question).toBe("Should I proceed?");
      expect(result.data.urgency).toBe("normal");
    }
  });

  it("should validate full input", () => {
    const result = AskHumanSchema.safeParse({
      question: "Should I proceed?",
      context: "We are at a critical junction",
      options: ["Option A", "Option B"],
      urgency: "high",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.question).toBe("Should I proceed?");
      expect(result.data.context).toBe("We are at a critical junction");
      expect(result.data.options).toEqual(["Option A", "Option B"]);
      expect(result.data.urgency).toBe("high");
    }
  });

  it("should reject missing question", () => {
    const result = AskHumanSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("should reject invalid urgency", () => {
    const result = AskHumanSchema.safeParse({
      question: "Test",
      urgency: "critical",
    });

    expect(result.success).toBe(false);
  });
});

describe("ASK_HUMAN_TOOL", () => {
  it("should have correct name", () => {
    expect(ASK_HUMAN_TOOL.name).toBe("ask_human");
  });

  it("should have description", () => {
    expect(ASK_HUMAN_TOOL.description).toBeTruthy();
    expect(ASK_HUMAN_TOOL.description.length).toBeGreaterThan(50);
  });

  it("should have valid Zod params shape", () => {
    // AskHumanParamsShape is a Zod shape object with all required properties
    expect(AskHumanParamsShape.question).toBeDefined();
    expect(AskHumanParamsShape.context).toBeDefined();
    expect(AskHumanParamsShape.options).toBeDefined();
    expect(AskHumanParamsShape.urgency).toBeDefined();
  });
});
