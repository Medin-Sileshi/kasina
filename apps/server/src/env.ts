export type HyperdriveBinding = {
  connectionString: string;
};

/** Minimal R2 binding shape (full types via `wrangler types` optional). */
export type TextbooksBucket = {
  get(key: string): Promise<{
    body: ReadableStream | null;
    size?: number;
    httpEtag?: string;
    writeHttpMetadata(headers: Headers): void;
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
};

export type AppVariables = {
  user: {
    id: string;
    email: string;
    name: string;
    role: "student" | "teacher" | "admin";
  } | null;
};
