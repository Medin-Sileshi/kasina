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
  /** Anthropic API key for Melak chat pilot (Vision M1). */
  ANTHROPIC_API_KEY?: string;
};

export type AppVariables = {
  user: {
    id: string;
    email: string;
    name: string;
    role: "student" | "teacher" | "admin";
  } | null;
};
