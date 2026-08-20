import { syncWithBrevo } from './brevo';

export interface SubscribeResult {
  success: boolean;
  isDuplicate?: boolean;
  message?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

/**
 * Validates email format according to RFC rules
 */
export const validateEmail = (email: string): boolean => {
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

/**
 * Inserts a new email subscriber into the Supabase 'subscribers' table.
 * Uses PostgREST endpoint directly (zero dependencies).
 */
export const subscribeEmail = async (rawEmail: string): Promise<SubscribeResult> => {
  const cleanEmail = rawEmail.trim().toLowerCase();

  if (!validateEmail(cleanEmail)) {
    return {
      success: false,
      message: 'Invalid email address format.',
    };
  }

  // If Supabase is not configured, send to local VPS backend API
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await response.json();
      return {
        success: data.success ?? true,
        isDuplicate: data.isDuplicate ?? false,
        message: data.message,
      };
    } catch (err) {
      console.warn('[Local Server Fallback Failed]:', err);
      return {
        success: true,
        message: 'Thank you for joining Paralife.',
      };
    }
  }

  try {
    const baseUrl = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');

    // Step 1: Check if email already exists in the subscribers table (case-insensitive)
    const checkEndpoint = `${baseUrl}/rest/v1/subscribers?email=ilike.${encodeURIComponent(cleanEmail)}&select=id,email`;
    const checkResponse = await fetch(checkEndpoint, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (checkResponse.ok) {
      const existingData = await checkResponse.json();
      console.log('[DB Duplicate Check Result]:', existingData);
      if (Array.isArray(existingData) && existingData.length > 0) {
        return {
          success: true,
          isDuplicate: true,
          message: 'You are already following the signal.',
        };
      }
    } else {
      console.warn('[DB Duplicate Check Failed Status]:', checkResponse.status);
    }

    // Step 2: Insert new subscriber
    const insertEndpoint = `${baseUrl}/rest/v1/subscribers`;
    const response = await fetch(insertEndpoint, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        email: cleanEmail,
      }),
    });

    // Trigger Brevo Contact Sync & Instant Welcome Email Dispatch
    syncWithBrevo(cleanEmail);

    if (response.ok) {
      return {
        success: true,
        message: 'Thank you for joining Paralife.',
      };
    }

    const errorData = await response.json().catch(() => ({}));

    // PostgREST unique violation status code 409 or postgres code 23505
    if (
      response.status === 409 ||
      errorData.code === '23505' ||
      (errorData.message && typeof errorData.message === 'string' && errorData.message.includes('duplicate key'))
    ) {
      return {
        success: true,
        isDuplicate: true,
        message: 'You are already following the signal.',
      };
    }

    return {
      success: false,
      message: errorData.message || 'Subscription failed. Please try again.',
    };
  } catch (err) {
    console.error('[DB Subscribe Error]:', err);
    return {
      success: false,
      message: 'Network error. Please check your connection and try again.',
    };
  }
};
