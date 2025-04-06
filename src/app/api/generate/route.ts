import { GoogleGenerativeAI } from "@google/generative-ai";
//import { Ratelimit } from "@upstash/ratelimit";
//import { kv } from "@vercel/kv";
import { match } from "ts-pattern";

// IMPORTANT! Set the runtime to edge: https://vercel.com/docs/functions/edge-functions/edge-runtime
export const runtime = "edge";

export async function POST(req: Request): Promise<Response> {
  // Check if the GEMINI_API_KEY is set, if not return 400
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "") {
    return new Response(
      "Missing GEMINI_API_KEY - make sure to add it to your .env file.",
      {
        status: 400,
      }
    );
  }
  /*
  // Rate limiting implementation
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    const ip = req.headers.get("x-forwarded-for");
    const ratelimit = new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(50, "1 d"),
    });

    const { success, limit, reset, remaining } = await ratelimit.limit(`novel_ratelimit_${ip}`);

    if (!success) {
      return new Response("You have reached your request limit for the day.", {
        status: 429,
        headers: {
          "X-RateLimit-Limit": limit.toString(),
          "X-RateLimit-Remaining": remaining.toString(),
          "X-RateLimit-Reset": reset.toString(),
        },
      });
    }
  }
*/
  const { prompt, option, command } = await req.json();

  // Initialize Google Generative AI with API key
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  let systemPrompt = "";
  let userPrompt = "";

  // Match patterns for different options
  match(option)
    .with("continue", () => {
      systemPrompt =
        "You are an AI writing assistant that continues existing text based on context from prior text. " +
        "Give more weight/priority to the later characters than the beginning ones. " +
        "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
        "Use Markdown formatting when appropriate.";
      userPrompt = prompt;
    })
    .with("improve", () => {
      systemPrompt =
        "You are an AI writing assistant that improves existing text. " +
        "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
        "Use Markdown formatting when appropriate.";
      userPrompt = `The existing text is: ${prompt}`;
    })
    .with("shorter", () => {
      systemPrompt =
        "You are an AI writing assistant that shortens existing text. " +
        "Use Markdown formatting when appropriate.";
      userPrompt = `The existing text is: ${prompt}`;
    })
    .with("longer", () => {
      systemPrompt =
        "You are an AI writing assistant that lengthens existing text. " +
        "Use Markdown formatting when appropriate.";
      userPrompt = `The existing text is: ${prompt}`;
    })
    .with("fix", () => {
      systemPrompt =
        "You are an AI writing assistant that fixes grammar and spelling errors in existing text. " +
        "Limit your response to no more than 200 characters, but make sure to construct complete sentences." +
        "Use Markdown formatting when appropriate.";
      userPrompt = `The existing text is: ${prompt}`;
    })
    .with("zap", () => {
      systemPrompt =
        "You are an AI writing assistant that generates text based on a prompt. " +
        "You take an input from the user and a command for manipulating the text. " +
        "Use Markdown formatting when appropriate.";
      userPrompt = `For this text: ${prompt}. You have to respect the command: ${command}`;
    })
    .run();

  try {
    // Create a chat session
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
        topP: 1,
      },
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [
            { text: "I understand my role and will follow your instructions." },
          ],
        },
      ],
    });

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(userPrompt);

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    return new Response(`Error processing your request: ${error}`, {
      status: 500,
    });
  }
}
