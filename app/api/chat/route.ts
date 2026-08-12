import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
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
	const lastUserText = lastUserMessage?.parts
		?.filter((p: any) => p.type === "text")
		.map((p: any) => p.text)
		.join(" ") ?? lastUserMessage?.content ?? "";

	const isSafe = await checkContentSafety(lastUserText);

	if (!isSafe) {
		return new Response(
			JSON.stringify({ error: "El mensaje no cumple con las políticas de contenido" }),
			{ status: 400 }
		);
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