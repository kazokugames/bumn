import { NextResponse } from "next/server";
import { userSaatIni } from "../../../../lib/session.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ user: await userSaatIni() });
}
