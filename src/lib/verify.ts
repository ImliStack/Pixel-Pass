// Mock verification service. Replace with your API call.

export const DEMO_CODE = '1985';
export const MASKED_PHONE = '•••• 4821';

/** Whole-code check, like a real OTP API: right or wrong, never which digit. */
export async function verifyCode(digits: string[]): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 120));
  return digits.join('') === DEMO_CODE;
}
