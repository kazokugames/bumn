import { NextResponse } from "next/server";
import { db } from "../../../lib/db.mjs";

export const dynamic = "force-dynamic";

// Untuk pemantau uptime / load balancer: memastikan aplikasi hidup dan database bisa dibaca.
export async function GET() {
  try {
    const n = db().prepare("SELECT COUNT(*) AS n FROM users").get().n;
    return NextResponse.json({ ok: true, user: n });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
