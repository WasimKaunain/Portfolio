import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const optionalUrl = z.preprocess(
  (val) => {
    if (typeof val !== "string") return val;
    const v = val.trim();
    return v.length ? v : undefined;
  },
  z.string().url().optional()
);

const optionalNonEmptyString = z.preprocess(
  (val) => {
    if (typeof val !== "string") return val;
    const v = val.trim();
    return v.length ? v : undefined;
  },
  z.string().min(1).optional()
);

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url().or(z.string().min(1)),
    ACCELERATE_URL: z.string().url().optional(),

    // NextAuth requires a stable secret in production and is also recommended in dev.
    NEXTAUTH_SECRET: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),

    // GitHub OAuth is required for admin sign-in.
    GITHUB_ID: z.string().min(1),
    GITHUB_SECRET: z.string().min(1),

    // Optional: GitHub PAT for higher API rate limits during repo sync.
    // Create one at https://github.com/settings/tokens (no scopes required for public repos).
    GITHUB_TOKEN: optionalNonEmptyString,

    OWNER_EMAIL: z.string().email().optional(),

    // Optional (rate limiting). Empty values should be treated as "unset".
    UPSTASH_REDIS_REST_URL: optionalUrl,
    UPSTASH_REDIS_REST_TOKEN: optionalNonEmptyString,

    // Optional: Contact form email delivery (Resend). Leave unset to disable server-side sending.
    RESEND_API_KEY: optionalNonEmptyString,
    CONTACT_TO_EMAIL: z.string().email().optional(),

    // Deployment Vault (encrypted secrets)
    // Allow unset in dev so the rest of the app can run without vault configured yet.
    // Vault-related endpoints should still hard-fail if these are missing.
    DATA_ENCRYPTION_KEY: optionalNonEmptyString,
    VAULT_REVEAL_PASSWORD_HASH: optionalNonEmptyString,
    VAULT_REVEAL_SIGNING_SECRET: optionalNonEmptyString,
  },
  client: {},
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    ACCELERATE_URL: process.env.ACCELERATE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GITHUB_ID: process.env.GITHUB_ID,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    OWNER_EMAIL: process.env.OWNER_EMAIL,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    DATA_ENCRYPTION_KEY: process.env.DATA_ENCRYPTION_KEY,
    VAULT_REVEAL_PASSWORD_HASH: process.env.VAULT_REVEAL_PASSWORD_HASH,
    VAULT_REVEAL_SIGNING_SECRET: process.env.VAULT_REVEAL_SIGNING_SECRET,
  },
  skipValidation: process.env.NODE_ENV === "test",
});
