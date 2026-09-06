import type { ServerEnv } from "../env";

export type SendSmsResult = {
  ok: boolean;
  mocked?: boolean;
  error?: string;
  status?: number;
};

function authHeaders(env: ServerEnv): Record<string, string> {
  if (env.SMS_GATEWAY_TOKEN) {
    return { Authorization: `Bearer ${env.SMS_GATEWAY_TOKEN}` };
  }
  const user = env.SMS_GATEWAY_USER ?? "";
  const password = env.SMS_GATEWAY_PASSWORD ?? "";
  if (user || password) {
    const encoded = btoa(`${user}:${password}`);
    return { Authorization: `Basic ${encoded}` };
  }
  return {};
}

function messagesUrl(base: string): string {
  const trimmed = base.replace(/\/$/, "");
  if (/\/messages$/i.test(trimmed) || /\/3rdparty\/v1\/messages/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed}/3rdparty/v1/messages`;
}

/**
 * Send SMS via android-sms-gateway style POST.
 * When SMS_GATEWAY_URL is missing, logs and returns mocked failure so local
 * dev keeps working (caller still inserts otp_send_log).
 */
export async function sendSms(
  env: ServerEnv,
  opts: { to: string; message: string },
): Promise<SendSmsResult> {
  const gatewayUrl = env.SMS_GATEWAY_URL?.trim();
  if (!gatewayUrl) {
    console.warn(
      "[sms] SMS_GATEWAY_URL not set — mocking send to",
      opts.to,
    );
    return { ok: false, mocked: true };
  }

  const url = messagesUrl(gatewayUrl);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(env),
      },
      body: JSON.stringify({
        textMessage: { text: opts.message },
        phoneNumbers: [opts.to],
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[sms] gateway error:", res.status, body);
      return {
        ok: false,
        status: res.status,
        error: body || `SMS gateway returned ${res.status}`,
      };
    }

    return { ok: true, status: res.status };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sms] send failed:", message);
    return { ok: false, error: message };
  }
}
