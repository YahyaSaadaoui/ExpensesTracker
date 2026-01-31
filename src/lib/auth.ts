import crypto from "crypto";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "et_session";

function hmac(data: string) {
  const secret = process.env.SESSION_SECRET!;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function signSession(payload: object) {
  const json = JSON.stringify(payload);
  const b64 = Buffer.from(json).toString("base64url");
  const sig = hmac(b64);
  return `${b64}.${sig}`;
}

export function verifySession(token: string | undefined) {
  if (!token) return null;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;

  const expected = hmac(b64);
  if (sig !== expected) return null;

  try {
    const json = Buffer.from(b64, "base64url").toString("utf8");
    const data = JSON.parse(json) as { admin: boolean; exp: number };
    if (Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

export async function verifyAdminPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD!;
  if (!adminPassword) throw new Error("Missing ADMIN_PASSWORD");

  // personal app → acceptable
  const hash = await bcrypt.hash(adminPassword, 10);
  return bcrypt.compare(password, hash);
}

export function buildSessionCookie(token: string) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Strict; Secure`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
