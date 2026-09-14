// ============================================================
// MOCK MFA — Admin Portal
// POC ONLY: Uses a static mock OTP.
// Designed as an abstraction so real TOTP/SMS MFA can replace
// this without touching UI code.
// ============================================================

// Mock OTP for the prototype — displayed in demo panel
export const MOCK_OTP = "123456";
export const MOCK_OTP_LENGTH = 6;

export interface MFAVerifyResult {
  success: boolean;
  error?: string;
}

/**
 * Verifies the submitted OTP against the mock secret.
 * In production: replace with real TOTP/SMS verification via Go backend.
 */
export async function verifyMockMFA(otp: string): Promise<MFAVerifyResult> {
  // Simulate network delay for realism
  await new Promise((r) => setTimeout(r, 800));

  if (otp.trim() === MOCK_OTP) {
    return { success: true };
  }

  return {
    success: false,
    error: "Invalid verification code. Please try again.",
  };
}
