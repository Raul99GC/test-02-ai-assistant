import { checkContentSafety } from '@/lib/content-safety';
import { generateText } from 'ai';

jest.mock('ai', () => ({
  generateText: jest.fn(),
}));

jest.mock('@openrouter/ai-sdk-provider', () => ({
  createOpenRouter: jest.fn(() => jest.fn((modelId: string) => modelId)),
}));

jest.mock('@/lib/prompts/guardrail', () => ({
  HEALTH_GUARDRAIL_POLICY: 'Mocked HEALTH_GUARDRAIL_POLICY for testing',
}));

const mockResponse = (obj: unknown) =>
  (generateText as jest.Mock).mockResolvedValue({ text: JSON.stringify(obj) });

describe('checkContentSafety', () => {
  const systemPrompt = 'Mocked HEALTH_GUARDRAIL_POLICY for testing';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Resultado: mensaje seguro', () => {
    it('debe devolver safe: true cuando classification es true', async () => {
      mockResponse({ classification: true, reason: 'topic allowed', message: '' });

      const result = await checkContentSafety('¿Es normal tener dolor de cabeza leve?');

      expect(result).toEqual({ safe: true });
    });
  });

  describe('Resultado: mensaje inseguro', () => {
    it('debe devolver safe: false con reason y message cuando classification es false', async () => {
      mockResponse({
        classification: false,
        reason: 'self-harm content',
        message: 'No puedo ayudarte con eso, por favor busca ayuda profesional.',
      });

      const result = await checkContentSafety('¿Cómo puedo hacerme daño?');

      expect(result).toEqual({
        safe: false,
        reason: 'self-harm content',
        message: 'No puedo ayudarte con eso, por favor busca ayuda profesional.',
      });
    });
  });

  describe('Validación de entrada', () => {
    it('debe lanzar un error si el mensaje está vacío', async () => {
      await expect(checkContentSafety('')).rejects.toThrow();
    });
  });

  describe('Manejo de respuestas inválidas del modelo (fail-safe)', () => {
    it('debe devolver safe: false si el JSON no es parseable', async () => {
      (generateText as jest.Mock).mockResolvedValue({ text: 'esto no es json' });

      const result = await checkContentSafety('Hola');

      expect(result.safe).toBe(false);
    });

    it('debe devolver safe: false si falta el campo classification', async () => {
      mockResponse({ reason: 'missing classification', message: '' });

      const result = await checkContentSafety('Hola');

      expect(result.safe).toBe(false);
    });

    it('debe devolver safe: false si classification no es boolean', async () => {
      (generateText as jest.Mock).mockResolvedValue({
        text: JSON.stringify({ classification: 'SAFE', reason: '', message: '' }),
      });

      const result = await checkContentSafety('Hola');

      expect(result.safe).toBe(false);
    });

    it('debe devolver el fallback seguro cuando el modelo responde con texto corrupto y no parseable (caso real observado)', async () => {
      // Texto real y defectuoso devuelto por el modelo en producción:
      // no es JSON válido (backticks sueltos, comillas sin escapar, estructura rota).
      const textoCorrupto =
        `[{"analysis":"texto con backticks sueltos y comillas sin escapar ` +
        '\n\t\t\n' +
        '???...... "algo" ...\n' +
        '}]';

      (generateText as jest.Mock).mockResolvedValue({ text: textoCorrupto });

      const result = await checkContentSafety('ayudame con algo');

      expect(result).toEqual({
        safe: false,
        reason: 'guardrail_parse_error',
        message: 'No puedo procesar tu mensaje en este momento, intenta de nuevo.',
      });
    });

    it('debe devolver safe: true cuando el modelo envuelve la respuesta válida en un array (caso real observado)', async () => {
      // Caso real observado: el modelo a veces devuelve un JSON válido pero
      // envuelto en [] en vez del objeto plano esperado. Se verificó contra la
      // implementación real que este caso SÍ se resuelve correctamente a safe: true.
      const textoEnArray =
        '[{\n' +
        '  "classification": true,\n' +
        '  "reason": "User greeted with a simple hello.",\n' +
        '  "message": ""\n' +
        '}]';

      (generateText as jest.Mock).mockResolvedValue({ text: textoEnArray });

      const result = await checkContentSafety('hola');

      expect(result).toEqual({ safe: true });
    });
  });

  describe('Mensajes con emojis y caracteres especiales', () => {
    it('debe pasar el mensaje completo con emojis al prompt', async () => {
      mockResponse({ classification: true, reason: 'ok', message: '' });

      await checkContentSafety('Hola! ¿Cómo estás? 😊👋');

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({ prompt: 'Hola! ¿Cómo estás? 😊👋' })
      );
    });
  });

  describe('Verificación de argumentos de generateText', () => {
    it('debe usar HEALTH_GUARDRAIL_POLICY como system prompt', async () => {
      mockResponse({ classification: true, reason: 'ok', message: '' });

      await checkContentSafety('Tengo fiebre');

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({ system: systemPrompt })
      );
    });

    it('debe pedir response_format json_object', async () => {
      mockResponse({ classification: true, reason: 'ok', message: '' });

      await checkContentSafety('Tengo fiebre');

      expect(generateText).toHaveBeenCalledWith(
        expect.objectContaining({
          providerOptions: expect.objectContaining({
            openrouter: expect.objectContaining({
              response_format: { type: 'json_object' },
            }),
          }),
        })
      );
    });
  });

  describe('Errores', () => {
    it('debe propagar el error si generateText falla', async () => {
      const error = new Error('OpenRouter API is down');
      (generateText as jest.Mock).mockRejectedValue(error);

      await expect(checkContentSafety('Hola')).rejects.toThrow('OpenRouter API is down');
    });
  });
});