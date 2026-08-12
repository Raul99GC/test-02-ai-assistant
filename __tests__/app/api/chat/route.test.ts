import { POST } from '@/app/api/chat/route';
import { checkContentSafety } from '@/lib/content-safety';
import { streamText, convertToModelMessages } from 'ai';

jest.mock("ai", () => ({
    streamText: jest.fn(),
    convertToModelMessages: jest.fn(async (msgs) => msgs),
}));

jest.mock('@openrouter/ai-sdk-provider', () => ({
    createOpenRouter: jest.fn(() => jest.fn((modelId: string) => modelId)),
}));

jest.mock('@/lib/content-safety', () => ({
    checkContentSafety: jest.fn(),
}));

describe('API Route: /api/chat', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (checkContentSafety as jest.Mock).mockResolvedValue(true);
    });

    // Return 400 if the body doesn’t have messages or is empty.
    it('Return 400 if the body doesn’t have messages.', async () => {
        const req = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
    });

    // Return 400 if messages is not a string
    it('return 400 if messages is not an array', async () => {
        const req = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: "hola" }), // ya NO es válido
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
    });

    it('Call streamText with the model and the converted messages', async () => {
        const uiMessages = [{ role: 'user', parts: [{ type: 'text', text: 'Hola' }] }];

        (streamText as jest.Mock).mockReturnValue({
            toUIMessageStreamResponse: () => new Response('stream'),
        })

        const req = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: uiMessages }),
        });

        await POST(req);

        expect(convertToModelMessages).toHaveBeenCalledWith(uiMessages);
        expect(streamText).toHaveBeenCalledWith(
            expect.objectContaining({
                model: 'google/gemma-4-26b-a4b-it:free',
                system: expect.any(String),
            })
        );
    });

    // response 400 if an user message doesn't pass guardrails prompt
    it("response 400 if an user message doesn't pass guardrails prompt", async () => {
        (checkContentSafety as jest.Mock).mockResolvedValue(false);

        const req = new Request('http://localhost:3000/api/chat', {
            method: 'POST',
            body: JSON.stringify({
                messages: [{ role: 'user', parts: [{ type: 'text', text: 'contenido inseguro' }] }],
            }),
        });

        const res = await POST(req);
        const json = await res.json();

        expect(checkContentSafety).toHaveBeenCalled();
        expect(res.status).toBe(400);
        expect(json.error).toBeDefined();
        expect(streamText).not.toHaveBeenCalled();
    })

    it('return the streaming awser in UI message format', async () => {
        const fakeResponse = new Response('chunk-de-stream');
        (streamText as jest.Mock).mockReturnValue({
            toUIMessageStreamResponse: () => fakeResponse,
        });

        const req = new Request('http://localhost/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: [{ role: 'user', parts: [{ type: 'text', text: 'hola' }] }] }),
        });

        const res = await POST(req);

        expect(res).toBe(fakeResponse);
    });

    it('responds 500 if streamText throws an error', async () => {
        (streamText as jest.Mock).mockImplementation(() => {
            throw new Error('OpenRouter caído');
        });

        const req = new Request('http://localhost/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: [{ role: 'user', parts: [{ type: 'text', text: 'hola' }] }] }),
        });

        const res = await POST(req);

        expect(res.status).toBe(500);
    });

    it('response 400 if the body is not valid JSON', async () => {
        const req = new Request('http://localhost/api/chat', {
            method: 'POST',
            body: '{ esto no es json',
        });

        const res = await POST(req);

        expect(res.status).toBe(400);
    });


});