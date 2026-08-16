export type HyperdriveBinding = {
  connectionString: string;
};

export type ServerEnv = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  DATABASE_URL?: string;
  /** Present on Cloudflare Workers when Hyperdrive is bound. */
  HYPERDRIVE?: HyperdriveBinding;
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
