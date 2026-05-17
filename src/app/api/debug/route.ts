import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export async function GET() {
  const results: any = {};

  // Test 1: DNS
  const dns4 = await fetch(`https://dns.google/resolve?name=db.jyhmhumvlcltuzqadblf.supabase.co&type=A`).then(r => r.json());
  const dns6 = await fetch(`https://dns.google/resolve?name=db.jyhmhumvlcltuzqadblf.supabase.co&type=AAAA`).then(r => r.json());
  results.dns = { ipv4: dns4, ipv6: dns6 };

  // Test 2: Database connection
  try {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
    const prisma = new PrismaClient({ adapter });
    await prisma.$connect();
    const count = await prisma.user.count();
    results.db = { connected: true, userCount: count };
    await prisma.$disconnect();
  } catch (e: any) {
    results.db = { connected: false, error: e.message, code: e.code };
  }

  return NextResponse.json(results);
}
