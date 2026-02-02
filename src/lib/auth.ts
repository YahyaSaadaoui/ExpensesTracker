// src/lib/auth.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseServer } from "@/lib/supabaseServer";

const COOKIE_NAME = "et_session";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw new Error("SESSION_SECRET is missing");

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const sb = supabaseServer();

  const { data, error } = await sb
    .from("users")
    .select("password_hash")
    .eq("username", "admin")
    .single();

  if (error || !data?.password_hash) return false;

  return bcrypt.compare(password, data.password_hash);
}

export function signSession(payload: { admin: boolean }) {
  // exp should be seconds since epoch for JWT standard
  const expSeconds = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days
  return jwt.sign({ ...payload, exp: expSeconds }, SESSION_SECRET);
}

export function buildSessionCookie(token: string) {
  const isProd = process.env.NODE_ENV === "production";

  // IMPORTANT: cookie name = et_session (same as middleware)
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${
    isProd ? "; Secure" : ""
  }`;
}

export function clearSessionCookie() {
  const isProd = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    isProd ? "; Secure" : ""
  }`;
}
