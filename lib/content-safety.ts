import { HEALTH_GUARDRAIL_POLICY } from "@/lib/prompts/guardrail";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const systemPrompt = HEALTH_GUARDRAIL_POLICY;

const messageSchema = z.string().min(1, "message no puede estar vacío");

export async function checkContentSafety(message: string): Promise<boolean> {
  // Validamos la entrada con zod
  const parsedMessage = messageSchema.parse(message);

  const { text } = await generateText({
    system: systemPrompt,
    model: openrouter("nvidia/nemotron-3.5-content-safety:free"),
    prompt: parsedMessage,
  });

  const isUnsafe = /:\s*unsafe/i.test(text);

  const pass = !isUnsafe;

  return pass;
}