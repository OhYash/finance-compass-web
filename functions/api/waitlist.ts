// Cloudflare Pages Function: POST /api/waitlist
interface Env {
  RESEND_API_KEY?: string;
  RESEND_SEGMENT_ID?: string;
  RESEND_AUDIENCE_ID?: string;
  RESEND_FROM_EMAIL?: string;
  NOTIFY_ADMIN_EMAIL?: string;
}

export const onRequestOptions = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const contentType = context.request.headers.get('content-type') || '';
    let email = '';
    let source = 'landing';

    if (contentType.includes('application/json')) {
      const data = (await context.request.json().catch(() => ({}))) as { email?: string; source?: string };
      email = data.email?.trim().toLowerCase() || '';
      source = data.source || 'landing';
    } else {
      const formData = await context.request.formData();
      email = ((formData.get('email') as string) || '').trim().toLowerCase();
      source = (formData.get('source') as string) || 'landing';
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address.' }),
        { status: 400, headers }
      );
    }

    const apiKey = context.env.RESEND_API_KEY;

    if (!apiKey) {
      // In development or when key is not yet set in Cloudflare dashboard
      console.warn('RESEND_API_KEY is not configured in environment. Mocking successful submission.');
      return new Response(
        JSON.stringify({
          success: true,
          message: "You're on the list! (Staging mode: configure RESEND_API_KEY in Cloudflare for live emails)",
        }),
        { status: 200, headers }
      );
    }

    // 1. Create Global Contact and attach to Segment if configured
    const segmentId = context.env.RESEND_SEGMENT_ID || context.env.RESEND_AUDIENCE_ID;
    try {
      const contactRes = await fetch('https://api.resend.com/contacts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'finance-compass-web/1.0',
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
        }),
      });

      if (contactRes.ok) {
        const contactData = (await contactRes.json().catch(() => ({}))) as { id?: string };
        if (segmentId && contactData?.id) {
          await fetch(`https://api.resend.com/contacts/${contactData.id}/segments`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'User-Agent': 'finance-compass-web/1.0',
            },
            body: JSON.stringify({ segmentId }),
          }).catch((segErr) => console.warn('Failed to add contact to segment:', segErr));
        }
      } else if (segmentId) {
        // Fallback for accounts on legacy audiences endpoint
        await fetch(`https://api.resend.com/audiences/${segmentId}/contacts`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        }).catch(() => {});
      }
    } catch (contactErr) {
      console.warn('Resend contact handling warning:', contactErr);
    }

    // 2. Send welcome email to subscriber (defaults to onboarding@resend.dev if no custom domain yet)
    const fromEmail = context.env.RESEND_FROM_EMAIL || 'INR Finance Compass <onboarding@resend.dev>';
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: 'You are on the INR Finance Compass early access list',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; color: #111827; line-height: 1.6;">
            <div style="margin-bottom: 24px;">
              <span style="display: inline-block; background-color: #059669; color: white; padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 14px;">INR Finance Compass</span>
            </div>
            <h2 style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin-bottom: 16px; color: #0f172a;">Welcome to Sovereign Personal Finance</h2>
            <p style="font-size: 16px; color: #374151; margin-bottom: 14px;">
              Thanks for joining the early access waitlist. We are building the sovereign, private personal finance OS designed specifically for Indian realities.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
              <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #047857;">What you can expect:</h4>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.7;">
                <li>Step-by-step self-hosting guides (Docker & BYOS Supabase).</li>
                <li>Zero-surveillance offline bank statement parsing.</li>
                <li>Mathematical ledger balance derivations with anchor reconciliation.</li>
                <li>First access when preview release builds are ready.</li>
              </ul>
            </div>
            <p style="font-size: 14px; color: #64748b;">
              Have questions or want to request support for a specific Indian bank/brokerage? Just reply directly to this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin: 0;">
              Zero telemetry. Zero advertising. Zero data harvesting.<br />
              INR Finance Compass &middot; Sovereign Indian Wealth OS
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend API response error:', errText);
    }

    // 3. Optional Admin Notification
    if (context.env.NOTIFY_ADMIN_EMAIL) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [context.env.NOTIFY_ADMIN_EMAIL],
            subject: `[Waitlist Signup] New subscriber (${source}): ${email}`,
            text: `New waitlist signup from source "${source}": ${email}`,
          }),
        });
      } catch (notifyErr) {
        console.warn('Failed to send admin notification:', notifyErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "You're on the list! Check your inbox for confirmation.",
      }),
      { status: 200, headers }
    );
  } catch (err: any) {
    console.error('Waitlist submission handler error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to process waitlist request. Please try again.' }),
      { status: 500, headers }
    );
  }
};
