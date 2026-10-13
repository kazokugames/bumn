import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hapusSesi } from "../../../../lib/auth.mjs";
import { NAMA_COOKIE } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

export async function POST() {
  const c = await cookies();
  const t = c.get(NAMA_COOKIE)?.value;
  if (t) hapusSesi(t);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(NAMA_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
