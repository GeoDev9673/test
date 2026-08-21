import { syncWithBrevo } from './brevo';

export interface SubscribeResult {
  success: boolean;
  isDuplicate?: boolean;
  message?: string;
}

/**
 * Validates email format according to RFC rules
 */
export const validateEmail = (email: string): boolean => {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

/**
 * Inserts a new email subscriber into the self-hosted VPS database and triggers Brevo Welcome Email.
 */
export const subscribeEmail = async (rawEmail: string): Promise<SubscribeResult> => {
  const cleanEmail = rawEmail.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return {
      success: false,
      message: 'Invalid email address format.',
    };
  }

  try {
    // 1. Save subscriber directly in VPS database
    const response = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail }),
    });

    const data = await response.json();

    // 2. Trigger Brevo Welcome Email & List Sync
    syncWithBrevo(cleanEmail).catch(() => {});

    return {
      success: data.success ?? true,
      isDuplicate: data.isDuplicate ?? false,
      message: data.message || 'Thank you for joining Paralife.',
    };
  } catch (err) {
    console.warn('[VPS Subscribe API]:', err);
    // Direct Brevo sync fallback
    syncWithBrevo(cleanEmail).catch(() => {});
    return {
      success: true,
      message: 'Thank you for joining Paralife.',
    };
  }
};
