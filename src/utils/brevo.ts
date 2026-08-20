const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || '';
const BREVO_LIST_ID = Number(import.meta.env.VITE_BREVO_LIST_ID) || 6;
const BREVO_TEMPLATE_ID = Number(import.meta.env.VITE_BREVO_TEMPLATE_ID) || 4;

/**
 * Adds contact to Brevo list and triggers the transactional welcome email immediately
 */
export const syncWithBrevo = async (email: string): Promise<void> => {
  if (!BREVO_API_KEY) {
    console.warn('[Brevo]: No API key provided');
    return;
  }

  try {
    // 1. Add / Update Contact in Brevo List
    await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        listIds: [BREVO_LIST_ID],
        updateEnabled: true,
      }),
    }).catch((e) => console.warn('[Brevo Contact Sync Warn]:', e));

    // 2. Directly Send Styled Welcome Template
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        templateId: BREVO_TEMPLATE_ID,
        to: [{ email: email }],
      }),
    }).catch((e) => console.warn('[Brevo SMTP Send Warn]:', e));
  } catch (err) {
    console.warn('[Brevo Service Error]:', err);
  }
};
