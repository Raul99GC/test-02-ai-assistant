import { checkContentSafety } from '@/lib/content-safety';
import { generateText } from 'ai';

jest.mock('ai', () => ({
    generateText: jest.fn(),
}));

jest.mock('@openrouter/ai-sdk-provider', () => ({
    createOpenRouter: jest.fn(() => jest.fn((modelId: string) => modelId)),
}));

jest.mock('@/features/chat/prompts/guardrail', () => ({
    HEALTH_GUARDRAIL_POLICY: 'Mocked HEALT_GUARDRAIL_POLICY for testing',
}));

describe("checkContentSafety", () => {
    const model = "nvidia/nemotron-3.5-content-safety:free";
    const systemPrompt = "Mocked HEALT_GUARDRAIL_POLICY for testing";

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("Result: safe message", () => {
        it("should return true if the model returns \"safe\"", async () => {
            const message = "¿Es normal tener dolor de cabeza leve?";
            (generateText as jest.Mock).mockResolvedValue({ text: "PASS: safe" });

            const result = await checkContentSafety(message);

            expect(result).toBe(true);
        });

        it("should return true for responses without \":unsafe\"", async () => {
            const message = "Hola! ¿Cómo estás? 😊👋";
            (generateText as jest.Mock).mockResolvedValue({ text: "OK: allowed topic" });

            const result = await checkContentSafety(message);

            expect(result).toBe(true);
        });
    });

    describe("Result: unsafe message", () => {
        it("should return false if the model returns \"unsafe\"", async () => {
            const message = "¿Cómo puedo hacerme daño?";
            (generateText as jest.Mock).mockResolvedValue({ text: "FAIL: unsafe" });

            const result = await checkContentSafety(message);

            expect(result).toBe(false);
        });

        it("should return false if it contains \":unsafe\" in any format", async () => {
            const message = "Quiero comprar drogas";
            (generateText as jest.Mock).mockResolvedValue({ text: "Response: unsafe - topic not allowed" });

            const result = await checkContentSafety(message);

            expect(result).toBe(false);
        });

        it("should handle uppercase unsafe flag", async () => {
            const message = "¿Pastillas para adelgazar rápido?";
            (generateText as jest.Mock).mockResolvedValue({ text: "WARNING: UNsafe" });

            const result = await checkContentSafety(message);

            expect(result).toBe(false);
        });
    });

    describe("Messages with emojis and special characters (passed to model)", () => {
        it("should pass full emojis to the prompt", async () => {
            const message = "Hola! ¿Cómo estás? 😊👋";
            (generateText as jest.Mock).mockResolvedValue({ text: "PASS: safe" });

            await checkContentSafety(message);

            expect(generateText).toHaveBeenCalledWith(
                expect.objectContaining({
                    prompt: message,
                })
            );
        });

        it("should evaluate unicode messages correctly", async () => {
            const message = "¿Dolor de cabeza? ⚡️ ™ © ®";
            (generateText as jest.Mock).mockResolvedValue({ text: "PASS: safe" });

            const result = await checkContentSafety(message);

            expect(result).toBe(true);
        });
    });

    describe("Verification of generateText arguments", () => {
        it("should call generateText with the correct model", async () => {
            const message = "Tengo gripe";
            (generateText as jest.Mock).mockResolvedValue({ text: "PASS: safe" });

            await checkContentSafety(message);

            expect(generateText).toHaveBeenCalledWith(
                expect.objectContaining({
                    model: model,
                })
            );
        });

        it("should use HEALTH_GUARDRAIL_POLICY as system prompt", async () => {
            const message = "Tengo fiebre";
            (generateText as jest.Mock).mockResolvedValue({ text: "PASS: safe" });

            await checkContentSafety(message);

            expect(generateText).toHaveBeenCalledWith(
                expect.objectContaining({
                    system: systemPrompt,
                })
            );
        });

        it("should pass the user message as prompt", async () => {
            const message = "¿Qué medicamento es bueno para el resfriado?";
            (generateText as jest.Mock).mockResolvedValue({ text: "PASS: safe" });

            await checkContentSafety(message);

            expect(generateText).toHaveBeenCalledWith(
                expect.objectContaining({
                    prompt: message,
                })
            );
        });
    });

    describe("Errors", () => {
        it("should propagate errors if generateText fails", async () => {
            const message = "Hola";
            const error = new Error("OpenRouter API is down");
            (generateText as jest.Mock).mockRejectedValue(error);

            await expect(checkContentSafety(message)).rejects.toThrow("OpenRouter API is down");
        });

        it("should return true if response does not contain \":unsafe\"", async () => {
            const message = "Tengo fiebre";
            (generateText as jest.Mock).mockResolvedValue({ text: "No unsafe content detected" });

            const result = await checkContentSafety(message);

            expect(result).toBe(true);
        });
    });
});