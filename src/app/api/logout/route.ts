// src/app/api/logout/route.ts
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  const res = Response.json({ ok: true });
  res.headers.set("Set-Cookie", clearSessionCookie());
  return res;
}
