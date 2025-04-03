import { getModel } from "./client";
import { prompts, PromptType } from "./prompts";

export async function analyzeContent(
  type: PromptType,
  text: string
): Promise<
  { success: true; data: string } | { success: false; error: string }
> {
  if (!text?.trim()) {
    console.log("Analysis failed: Empty content provided");
    return { success: false, error: "Empty content provided" };
  }

  if (!type || !prompts[type]) {
    console.log(`Invalid analysis type: ${type}`);
    return { success: false, error: "Invalid analysis type" };
  }

  try {
    const model = getModel();
    const prompt = `${prompts[type]}\n\nContent to analyze:\n${text}`;
    const result = await model.generateContent([prompt]);

    if (result && result.response) {
      const generatedText = await result.response.text();
      return {
        success: true,
        data: generatedText,
      };
    }

    return {
      success: false,
      error: "No response from the model",
    };
  } catch (error) {
    console.error("Content analysis failed:", error);
    return {
      success: false,
      error: "Content analysis failed",
    };
  }
}
