import { POST } from "@/app/api/chat/route";
import { checkContentSafety } from "@/lib/content-safety";


// - Retorna 400 cuando el JSON del body no se puede parsear
// - Retorna 400 cuando falta el campo messages
// - Retorna 400 cuando messages es un arreglo vacío
// - Retorna 400 cuando un mensaje tiene un role inválido
// - Acepta mensajes que usan el campo content en vez de parts
// - Acepta mensajes que usan el campo parts con segmentos de texto
// - Ignora partes que no son de texto al extraer el último mensaje del usuario
// - Usa un string vacío cuando no hay ningún mensaje del usuario
// - Toma el último mensaje del usuario cuando hay varios
// - Retorna el stream del guardrail cuando el contenido no es seguro
// - Escribe los eventos text-start, text-delta y text-end con el mensaje del
// - No llama a convertToModelMessages cuando el contenido no es seguro
// - Llama a streamText con el prompt del sistema del mentor y los mensajes convertidos
// - Construye el modelo usando la variable de entorno OPENROUTER_MODEL_NAME
// - Retorna la respuesta producida por toUIMessageStreamResponse
// - Retorna 500 cuando convertToModelMessages lanza un error
// - Retorna 500 cuando streamText lanza un error
// - Retorna 500 cuando checkContentSafety rechaza (rejects)


jest.mock("@/lib/content-safety", () => ({
  checkContentSafety: jest.fn(),
}));

jest.mock("@/lib/prompts/mentor", () => ({
  MEDICAL_MENTOR_PROMPT: "PROMPT_DE_PRUEBA",
}));

jest.mock("@openrouter/ai-sdk-provider", () => ({
  createOpenRouter: jest.fn(() => jest.fn((modelName: string) => ({ modelName }))),
}));

const mockToUIMessageStreamResponse = jest.fn();
const mockStreamText = jest.fn();
const mockConvertToModelMessages = jest.fn();
const mockCreateUIMessageStream = jest.fn();
const mockCreateUIMessageStreamResponse = jest.fn();

jest.mock("ai", () => ({
  streamText: (...args: any[]) => mockStreamText(...args),
  convertToModelMessages: (...args: any[]) => mockConvertToModelMessages(...args),
  createUIMessageStream: (...args: any[]) => mockCreateUIMessageStream(...args),
  createUIMessageStreamResponse: (...args: any[]) =>
    mockCreateUIMessageStreamResponse(...args),
}));


const mockedCheckContentSafety = checkContentSafety as jest.MockedFunction<
  typeof checkContentSafety
>;

function buildRequest(body: unknown): Request {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

function buildInvalidJsonRequest(): Request {
  return {
    json: async () => {
      throw new SyntaxError("Unexpected token");
    },
  } as unknown as Request;
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.OPENROUTER_MODEL_NAME = "modelo-de-prueba";
  process.env.OPENROUTER_API_KEY = "clave-de-prueba";

  mockConvertToModelMessages.mockResolvedValue([
    { role: "user", content: "hola" },
  ]);
  mockStreamText.mockReturnValue({
    toUIMessageStreamResponse: mockToUIMessageStreamResponse,
  });
  mockToUIMessageStreamResponse.mockReturnValue(
    new Response(null, { status: 200 })
  );
  mockCreateUIMessageStreamResponse.mockReturnValue(
    new Response(null, { status: 200 })
  );
  mockedCheckContentSafety.mockResolvedValue({ safe: true });
});


describe("POST /api/chat", () => {
  describe("request body validation", () => {
    it("returns 400 when the JSON body cannot be parsed", async () => {
      const req = buildInvalidJsonRequest();

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("JSON inválido");
    });

    it("returns 400 when messages field is missing", async () => {
      const req = buildRequest({});

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBeDefined();
    });

    it("returns 400 when messages is an empty array", async () => {
      const req = buildRequest({ messages: [] });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBeDefined();
    });

    it("returns 400 when a message has an invalid role", async () => {
      const req = buildRequest({
        messages: [{ role: "villano", content: "hola" }],
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBeDefined();
    });

    it("accepts messages using the content field instead of parts", async () => {
      const req = buildRequest({
        messages: [{ role: "user", content: "hola, tengo una duda" }],
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      expect(mockedCheckContentSafety).toHaveBeenCalledWith(
        "hola, tengo una duda"
      );
    });

    it("accepts messages using the parts field with text segments", async () => {
      const req = buildRequest({
        messages: [
          {
            role: "user",
            parts: [
              { type: "text", text: "primera parte" },
              { type: "text", text: "segunda parte" },
            ],
          },
        ],
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      expect(mockedCheckContentSafety).toHaveBeenCalledWith(
        "primera parte segunda parte"
      );
    });

    it("ignores non-text parts when extracting the last user message", async () => {
      const req = buildRequest({
        messages: [
          {
            role: "user",
            parts: [
              { type: "image", url: "http://imagen.test/foto.png" },
              { type: "text", text: "solo el texto cuenta" },
            ],
          },
        ],
      });

      await POST(req);

      expect(mockedCheckContentSafety).toHaveBeenCalledWith(
        "solo el texto cuenta"
      );
    });

    it("uses an empty string when there is no user message at all", async () => {
      const req = buildRequest({
        messages: [{ role: "assistant", content: "respuesta previa" }],
      });

      await POST(req);

      expect(mockedCheckContentSafety).toHaveBeenCalledWith("");
    });

    it("picks the last user message when there are several", async () => {
      const req = buildRequest({
        messages: [
          { role: "user", content: "pregunta antigua" },
          { role: "assistant", content: "respuesta del asistente" },
          { role: "user", content: "pregunta mas reciente" },
        ],
      });

      await POST(req);

      expect(mockedCheckContentSafety).toHaveBeenCalledWith(
        "pregunta mas reciente"
      );
    });
  });

  describe("content safety guardrail", () => {
    it("returns the guardrail stream when the content is not safe", async () => {
      mockedCheckContentSafety.mockResolvedValue({
        safe: false,
        reason: "contenido_no_seguro",
        message: "No puedo ayudarte con eso",
      });

      const req = buildRequest({
        messages: [{ role: "user", content: "contenido peligroso" }],
      });

      const response = await POST(req);

      expect(mockCreateUIMessageStream).toHaveBeenCalledTimes(1);
      expect(mockCreateUIMessageStreamResponse).toHaveBeenCalledTimes(1);
      expect(mockStreamText).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it("writes text-start, text-delta and text-end events with the guardrail message", async () => {
      mockedCheckContentSafety.mockResolvedValue({
        safe: false,
        reason: "contenido_no_seguro",
        message: "Consulta a un profesional de la salud",
      });

      const writerWrite = jest.fn();
      mockCreateUIMessageStream.mockImplementation(({ execute }: any) => {
        execute({ writer: { write: writerWrite } });
        return "stream-simulado";
      });

      const req = buildRequest({
        messages: [{ role: "user", content: "sintomas graves" }],
      });

      await POST(req);

      expect(writerWrite).toHaveBeenNthCalledWith(1, {
        type: "text-start",
        id: "guardrail",
      });
      expect(writerWrite).toHaveBeenNthCalledWith(2, {
        type: "text-delta",
        id: "guardrail",
        delta: "Consulta a un profesional de la salud",
      });
      expect(writerWrite).toHaveBeenNthCalledWith(3, {
        type: "text-end",
        id: "guardrail",
      });
    });

    it("does not call convertToModelMessages when content is unsafe", async () => {
      mockedCheckContentSafety.mockResolvedValue({
        safe: false,
        reason: "contenido_no_seguro",
        message: "bloqueado",
      });

      const req = buildRequest({
        messages: [{ role: "user", content: "algo prohibido" }],
      });

      await POST(req);

      expect(mockConvertToModelMessages).not.toHaveBeenCalled();
    });
  });

  describe("happy path", () => {
    it("calls streamText with the mentor system prompt and converted messages", async () => {
      const req = buildRequest({
        messages: [{ role: "user", content: "explicame la anatomia del corazon" }],
      });

      await POST(req);

      expect(mockConvertToModelMessages).toHaveBeenCalledWith([
        { role: "user", content: "explicame la anatomia del corazon" },
      ]);
      expect(mockStreamText).toHaveBeenCalledWith(
        expect.objectContaining({
          system: "PROMPT_DE_PRUEBA",
          messages: [{ role: "user", content: "hola" }],
        })
      );
    });

    it("builds the model using the OPENROUTER_MODEL_NAME environment variable", async () => {
      process.env.OPENROUTER_MODEL_NAME = "otro-modelo-especial";

      const req = buildRequest({
        messages: [{ role: "user", content: "duda medica" }],
      });

      await POST(req);

      expect(mockStreamText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: { modelName: "otro-modelo-especial" },
        })
      );
    });

    it("returns the response produced by toUIMessageStreamResponse", async () => {
      const req = buildRequest({
        messages: [{ role: "user", content: "duda medica" }],
      });

      const response = await POST(req);

      expect(mockToUIMessageStreamResponse).toHaveBeenCalledTimes(1);
      expect(response.status).toBe(200);
    });
  });

  describe("error handling", () => {
    it("returns 500 when convertToModelMessages throws", async () => {
      mockConvertToModelMessages.mockRejectedValue(
        new Error("fallo al convertir mensajes")
      );

      const req = buildRequest({
        messages: [{ role: "user", content: "algo" }],
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe("Error interno");
    });

    it("returns 500 when streamText throws", async () => {
      mockStreamText.mockImplementation(() => {
        throw new Error("fallo del proveedor de IA");
      });

      const req = buildRequest({
        messages: [{ role: "user", content: "algo" }],
      });

      const response = await POST(req);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toBe("Error interno");
    });

    it("returns 500 when checkContentSafety rejects", async () => {
      mockedCheckContentSafety.mockRejectedValue(
        new Error("fallo del servicio de seguridad")
      );

      const req = buildRequest({
        messages: [{ role: "user", content: "algo" }],
      });

      await expect(POST(req)).rejects.toThrow(
        "fallo del servicio de seguridad"
      );
    });
    
  });
});