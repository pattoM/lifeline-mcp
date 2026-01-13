import { describe, it, expect } from "vitest";
import { formatMessage } from "../src/slack/messages.ts";

describe("formatMessage", () => {
  it("should format a simple question", () => {
    const result = formatMessage(
      { question: "Should I proceed with option A or B?" },
      []
    );

    expect(result.text).toContain("Should I proceed with option A or B?");
    expect(result.blocks).toHaveLength(4); // header, question, divider, context
  });

  it("should include user mentions", () => {
    const result = formatMessage(
      { question: "Test question" },
      ["U123", "U456"]
    );

    expect(result.text).toContain("<@U123>");
    expect(result.text).toContain("<@U456>");

    const questionBlock = result.blocks.find(
      (b) => b.type === "section" && "text" in b && b.text.text.includes("Question")
    );
    expect(questionBlock).toBeDefined();
    if (questionBlock && "text" in questionBlock) {
      expect(questionBlock.text.text).toContain("<@U123>");
      expect(questionBlock.text.text).toContain("<@U456>");
    }
  });

  it("should include context when provided", () => {
    const result = formatMessage(
      {
        question: "Test question",
        context: "This is additional context",
      },
      []
    );

    expect(result.blocks).toHaveLength(5); // header, question, context, divider, context instructions

    const contextBlock = result.blocks.find(
      (b) => b.type === "section" && "text" in b && b.text.text.includes("Context")
    );
    expect(contextBlock).toBeDefined();
    if (contextBlock && "text" in contextBlock) {
      expect(contextBlock.text.text).toContain("This is additional context");
    }
  });

  it("should include options when provided", () => {
    const result = formatMessage(
      {
        question: "Test question",
        options: ["Option A", "Option B", "Option C"],
      },
      []
    );

    const optionsBlock = result.blocks.find(
      (b) => b.type === "section" && "text" in b && b.text.text.includes("Suggested options")
    );
    expect(optionsBlock).toBeDefined();
    if (optionsBlock && "text" in optionsBlock) {
      expect(optionsBlock.text.text).toContain("1. Option A");
      expect(optionsBlock.text.text).toContain("2. Option B");
      expect(optionsBlock.text.text).toContain("3. Option C");
    }
  });

  it("should show urgency emoji for high urgency", () => {
    const result = formatMessage(
      {
        question: "Urgent question",
        urgency: "high",
      },
      []
    );

    expect(result.text).toContain(":rotating_light:");

    const headerBlock = result.blocks.find((b) => b.type === "header");
    expect(headerBlock).toBeDefined();
    if (headerBlock && "text" in headerBlock) {
      expect(headerBlock.text.text).toContain(":rotating_light:");
    }
  });

  it("should not show urgency emoji for low/normal urgency", () => {
    const lowResult = formatMessage({ question: "Low urgency", urgency: "low" }, []);
    const normalResult = formatMessage({ question: "Normal urgency", urgency: "normal" }, []);

    expect(lowResult.text).not.toContain(":rotating_light:");
    expect(normalResult.text).not.toContain(":rotating_light:");
  });
});
