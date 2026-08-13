import { z } from "zod";

export const guardrailResponseSchema = z.object({
  classification: z.boolean(), // true = SAFE, false = UNSAFE
  reason: z.string(),
  message: z.string(), // vacío si classification === true
});

export type GuardrailResponse = z.infer<typeof guardrailResponseSchema>;

export type ContentSafetyResult =
  | { safe: true }
  | { safe: false; reason: string; message: string };

export type MessagePart = { type: string; text?: string };