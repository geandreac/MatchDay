import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const [totalUsers, totalFields, totalBookings, totalRevenue, platformFees] = await Promise.all([
    prisma.user.count(),
    prisma.field.count(),
    prisma.booking.count(),
    prisma.booking.aggregate({ _sum: { paidValue: true } }),
    prisma.booking.aggregate({ _sum: { platformFee: true } }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalFields,
    totalBookings,
    totalRevenue: totalRevenue._sum.paidValue ?? 0,
    platformFees: platformFees._sum.platformFee ?? 0,
  });
}
