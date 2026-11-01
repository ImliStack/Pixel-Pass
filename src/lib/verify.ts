// Mock verification service. Replace with your API call.
// NOTE: per-digit feedback leaks information — only expose it in demo mode or behind strict rate limits.

export const DEMO_CODE = '1985';
export const MASKED_PHONE = '•••• 4821';

export async function verifyDigits(digits: string[]): Promise<boolean[]> {
  await new Promise((r) => setTimeout(r, 120));
  return digits.map((d, i) => d === DEMO_CODE[i]);
}
