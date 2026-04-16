import crypto from "crypto";
import { env } from "@/lib/env";

// Envelope format: AES-256-GCM with random IV.
// We keep fields separate in DB for easier rotation/migration.

function getKey(): Buffer {
  // Must be 32+ chars; we derive a 32-byte key.
  return crypto.createHash("sha256").update(env.DATA_ENCRYPTION_KEY).digest();
}

export type EncryptedPayload = {
  secretEnc: string;
  secretIv: string;
  secretTag: string;
};

export function encryptSecret(plaintext: string): EncryptedPayload {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    secretEnc: enc.toString("base64"),
    secretIv: iv.toString("base64"),
    secretTag: tag.toString("base64"),
  };
}

export function decryptSecret(payload: {
  secretEnc: string;
  secretIv: string;
  secretTag: string;
}): string {
  const key = getKey();
  const iv = Buffer.from(payload.secretIv, "base64");
  const tag = Buffer.from(payload.secretTag, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([
    decipher.update(Buffer.from(payload.secretEnc, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
