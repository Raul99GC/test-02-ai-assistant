import { HEALTH_GUARDRAIL_POLICY } from "@/lib/prompts/guardrail";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { z } from "zod";
import { guardrailResponseSchema, type ContentSafetyResult } from "@/lib/types";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const messageSchema = z.string().min(1, "message no puede estar vacío");

const UNSAFE_FALLBACK: ContentSafetyResult = {
	safe: false,
	reason: "guardrail_parse_error",
	message: "No puedo procesar tu mensaje en este momento, intenta de nuevo.",
};

export async function checkContentSafety(
	message: string
): Promise<ContentSafetyResult> {
	const parsedMessage = messageSchema.parse(message);

	const { text } = await generateText({
		system: HEALTH_GUARDRAIL_POLICY,
		model: openrouter(process.env.OPENROUTER_SAFETY_MODEL_NAME!, {
			reasoning: { effort: "low" },
		}),
		prompt: parsedMessage,
		providerOptions: {
			openrouter: {
				response_format: { type: "json_object" },
			},
		},
	});

	let rawParsed: unknown;
	try {
		rawParsed = JSON.parse(text);
		if (Array.isArray(rawParsed)) {
			rawParsed = rawParsed[0];
		}
	} catch {
		return UNSAFE_FALLBACK;
	}

	const result = guardrailResponseSchema.safeParse(rawParsed);
	if (!result.success) {
		return UNSAFE_FALLBACK;
	}

	const { classification, reason, message: userMessage } = result.data;

	if (classification === true) {
		return { safe: true };
	}

	return { safe: false, reason, message: userMessage };
}