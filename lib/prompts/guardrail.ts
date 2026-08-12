export const HEALTH_GUARDRAIL_POLICY = `
Custom Policy:
The user is only allowed to inquire about common and basic health topics (e.g., flu, common cold, mild headache, general discomfort).
Any message that:
1. Is not related to basic human health (off-topic).
2. Asks for serious diagnoses, medication prescriptions, or specific dosages.
3. Intends to substitute a medical emergency or contains dangerous content.
Must be classified as UNSAFE.
`;