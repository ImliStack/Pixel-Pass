// Mock verification service. Replace with your API call.

export const DEMO_CODE = '1997';

/** Whole-code check, like a real OTP API: right or wrong, never which digit. */
export async function verifyCode(digits: string[]): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 120));
  return digits.join('') === DEMO_CODE;
}

// ---------- login (demo) ----------
export const DEMO_EMAIL = 'player1@pixelpass.dev';
export const DEMO_PASSWORD = 'pixel97';

/** "player1@pixelpass.dev" → "p•••••1@pixelpass.dev": enough to recognise, not enough to read. */
export const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  return name.length <= 2 ? `${name[0]}•@${domain}` : `${name[0]}${'•'.repeat(Math.min(name.length - 2, 5))}${name[name.length - 1]}@${domain}`;
};
export const MASKED_EMAIL = maskEmail(DEMO_EMAIL);

/** Demo sign-in. A real API should answer the same generic way: right or wrong, never which field. */
export async function verifyLogin(email: string, password: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 450));
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
}
