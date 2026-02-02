// src/app/api/login/route.ts
import { verifyAdminPassword, signSession, buildSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (!password || typeof password !== "string") {
    return Response.json({ error: "Password required" }, { status: 400 });
  }

  const ok = await verifyAdminPassword(password);
  if (!ok) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = signSession({ admin: true });

  const res = Response.json({ ok: true });
  res.headers.set("Set-Cookie", buildSessionCookie(token));
  return res;
}
