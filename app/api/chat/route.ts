import { anthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

export async function POST(req: Request) {
  // TODO: Extraer los mensajes del body de la request
  // const { messages } = await req.json();

  // TODO: Llamar a streamText con el modelo de Anthropic y tu system prompt
  // const result = streamText({
  //   model: anthropic("claude-3-5-haiku-latest"),
  //   system: "Tu system prompt aquí",
  //   messages,
  // });

  // TODO: Retornar la respuesta en streaming
  // return result.toDataStreamResponse();
}
