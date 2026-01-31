import {
  verifyAdminPassword,
  signSession,
  buildSessionCookie,
} from "@/lib/auth";

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

  const exp = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days
  const token = signSession({ admin: true, exp });

  const res = Response.json({ ok: true });
  res.headers.set("Set-Cookie", buildSessionCookie(token));
  return res;
}
