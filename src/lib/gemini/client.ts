import { GoogleGenAI } from "@google/genai";
import { getImage, uploadImage } from "../queries/storage";

let genAIInstance: GoogleGenAI | null = null;

export const getGoogleAI = async () => {
  if (!genAIInstance) {
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    genAIInstance = new GoogleGenAI({
      apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    });
  }
  return genAIInstance;
};

// Function to generate and upload a high-quality image
export async function generateImage(
  prompt: string
): Promise<{ imageUrl: string | null }> {
  try {
    const genAI = await getGoogleAI();

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp-image-generation",
      contents: prompt,
      config: {
        responseModalities: ["Image", "Text"],
        temperature: 0.7,
      },
    });

    let imageData: string | null = null;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        imageData = part.inlineData.data ?? null;
        break;
      }
    }

    if (!imageData) {
      throw new Error("No image was generated");
    }

    const byteCharacters = atob(imageData);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/png" });

    const filename = `${Date.now()}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    const filePath = await uploadImage(file, "covers");
    const imageUrl = await getImage(filePath);

    return { imageUrl };
  } catch (error) {
    console.error("Image generation and upload error:", error);
    throw error;
  }
}
