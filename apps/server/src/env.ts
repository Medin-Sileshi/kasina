export type HyperdriveBinding = {
  connectionString: string;
};

/** Grade 12 textbooks as markdown chapters and (for scanned books) page images. */
export type TextbooksBucket = {
  get(key: string): Promise<{
    body: ReadableStream | Uint8Array | string | null;
    size?: number;
  } | null>;
};

export type ServerEnv = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  DATABASE_URL?: string;
  /** Present on Cloudflare Workers when Hyperdrive is bound. */
  HYPERDRIVE?: HyperdriveBinding;
  /** Grade 12 MoE textbooks (and future curriculum PDFs). */
  TEXTBOOKS?: TextbooksBucket;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  APP_URL: string;
  /**
   * @deprecated Unused — Melak online uses MELAK_LLM_* (self-hosted VPS).
   * Kept optional for transition; do not wire new code to this.
   */
  ANTHROPIC_API_KEY?: string;
  /** Shared access code required for POST /teacher/signup (pilot schools only). */
  TEACHER_SIGNUP_SECRET?: string;
  /** android-sms-gateway style base or messages endpoint URL. */
  SMS_GATEWAY_URL?: string;
  SMS_GATEWAY_USER?: string;
  SMS_GATEWAY_PASSWORD?: string;
  /** Prefer over Basic auth when set (Bearer token). */
  SMS_GATEWAY_TOKEN?: string;
  /** OpenAI-compatible chat/completions base (e.g. http://vps:8080/v1). */
  MELAK_LLM_BASE_URL?: string;
  MELAK_LLM_API_KEY?: string;
  MELAK_LLM_MODEL?: string;
  /**
   * Full URL to LM Studio native chat (demo bridge / Cloudflare tunnel).
   * Example: https://….trycloudflare.com/api/v1/chat
   * Prefer this over MELAK_LLM_BASE_URL when set. Do not commit live tunnel URLs.
   */
  MELAK_CLOUD_ENDPOINT?: string;
  /**
   * When "true", trust localhost origins even if APP_URL is production.
   * Local Node/dev should rely on APP_URL=http://localhost:3000 instead.
   */
  ALLOW_LOCAL_ORIGINS?: string;
};

export type AppVariables = {
  user: {
    id: string;
    email: string;
    name: string;
    role: "student" | "teacher" | "admin" | "school_admin";
  } | null;
};
