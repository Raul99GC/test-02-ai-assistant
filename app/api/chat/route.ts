import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
	streamText,
	convertToModelMessages,
	createUIMessageStream,
	createUIMessageStreamResponse,
	type UIMessage,
} from "ai";
import { z } from "zod";
import { checkContentSafety } from "@/lib/content-safety";
import { MEDICAL_MENTOR_PROMPT } from "@/lib/prompts/mentor";

const openrouter = createOpenRouter({
	apiKey: process.env.OPENROUTER_API_KEY,
});

const uiMessageSchema = z.object({
	id: z.string().optional(),
	role: z.enum(["user", "assistant", "system"]),
	parts: z.array(z.any()).optional(),
	content: z.string().optional(),
});

const bodySchema = z.object({
	messages: z.array(uiMessageSchema).min(1, "messages no puede estar vacío"),
});

function streamGuardrailMessage(text: string) {
	const stream = createUIMessageStream({
		execute: async ({ writer }) => {
			writer.write({ type: "text-start", id: "guardrail" });
			writer.write({ type: "text-delta", id: "guardrail", delta: text });
			writer.write({ type: "text-end", id: "guardrail" });
		},
	});

	return createUIMessageStreamResponse({ stream });
}

export async function POST(req: Request) {
	let body: unknown;

	try {
		body = await req.json();
	} catch {
		return new Response(JSON.stringify({ error: "JSON inválido" }), {
			status: 400,
		});
	}

	const parsed = bodySchema.safeParse(body);

	if (!parsed.success) {
		return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
			status: 400,
		});
	}

	const { messages } = parsed.data;

	const lastUserMessage = messages.filter((m) => m.role === "user").at(-1);
	const lastUserText =
		lastUserMessage?.parts
			?.filter((p: any) => p.type === "text")
			.map((p: any) => p.text)
			.join(" ") ??
		lastUserMessage?.content ??
		"";

	let safety;
	try {
		safety = await checkContentSafety(lastUserText);
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: "No se pudo validar el mensaje en este momento, intenta de nuevo.",
			}),
			{ status: 500 }
		);
	}

	if (!safety.safe) {
		return streamGuardrailMessage(safety.message);
	}

	try {
		const modelMessages = await convertToModelMessages(messages as UIMessage[]);

		const result = streamText({
			model: openrouter(process.env.OPENROUTER_MODEL_NAME!),
			system: MEDICAL_MENTOR_PROMPT,
			messages: modelMessages,
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		return new Response(JSON.stringify({ error: "Error interno" }), {
			status: 500,
		});
	}
}