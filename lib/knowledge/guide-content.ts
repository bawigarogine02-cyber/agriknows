const GUIDE_CONTENT_FORMAT = "agriknowledge-step-guide-v1";

interface SerializedGuideContent {
  format: typeof GUIDE_CONTENT_FORMAT;
  steps: string[];
}

export function serializeGuideSteps(steps: string[]): string {
  const content: SerializedGuideContent = {
    format: GUIDE_CONTENT_FORMAT,
    steps: steps.map((step) => step.trim()),
  };
  return JSON.stringify(content);
}

export function parseGuideSteps(body: string): string[] | null {
  try {
    const content: unknown = JSON.parse(body);
    if (
      typeof content !== "object" ||
      content === null ||
      !("format" in content) ||
      content.format !== GUIDE_CONTENT_FORMAT ||
      !("steps" in content) ||
      !Array.isArray(content.steps) ||
      content.steps.length === 0 ||
      !content.steps.every((step) => typeof step === "string" && step.trim())
    ) {
      return null;
    }

    return content.steps;
  } catch {
    return null;
  }
}
