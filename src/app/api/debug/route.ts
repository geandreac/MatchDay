import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL || "not set";
    const host = "db.jyhmhumvlcltuzqadblf.supabase.co";

    const dns = await fetch(`https://dns.google/resolve?name=${host}&type=AAAA`).then(r => r.json());

    return NextResponse.json({
      databaseUrlPrefix: url.substring(0, 30) + "...",
      dns,
      nodeVersion: process.version,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
