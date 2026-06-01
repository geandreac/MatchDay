import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "all";
  const now = new Date();

  let dateFilter: Record<string, unknown> = {};
  if (period === "month") {
    dateFilter = {
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), 1),
        lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
    };
  } else if (period === "week") {
    const d = now.getDay();
    dateFilter = {
      createdAt: {
        gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - d),
      },
    };
  }

  const [totalUsers, totalFields, totalBookings, totalRevenue, platformFees, ledgerFees, ledgerPayouts, refunds] =
    await Promise.all([
      prisma.user.count(),
      prisma.field.count(),
      prisma.booking.count(),
      prisma.booking.aggregate({ _sum: { paidValue: true } }),
      prisma.booking.aggregate({ _sum: { platformFee: true } }),
      prisma.transactionLedger.aggregate({
        where: { type: "PLATFORM_FEE", ...dateFilter },
        _sum: { amount: true },
      }),
      prisma.transactionLedger.aggregate({
        where: { type: "OWNER_PAYOUT", ...dateFilter },
        _sum: { amount: true },
      }),
      prisma.transactionLedger.aggregate({
        where: { type: "REFUND_PLATFORM", ...dateFilter },
        _sum: { amount: true },
      }),
    ]);

  const recentLedgers = await prisma.transactionLedger.findMany({
    where: { type: "PLATFORM_FEE", ...dateFilter },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const commissions = recentLedgers.map((l) => ({
    id: l.id,
    amount: l.amount,
    description: l.description,
    bookingId: l.bookingId,
    date: l.createdAt,
  }));

  return NextResponse.json({
    totalUsers,
    totalFields,
    totalBookings,
    totalRevenue: totalRevenue._sum.paidValue ?? 0,
    platformFees: platformFees._sum.platformFee ?? 0,
    ledgerFees: ledgerFees._sum.amount ?? 0,
    ownerPayouts: ledgerPayouts._sum.amount ?? 0,
    refundedFees: refunds._sum.amount ?? 0,
    netPlatformRevenue: (ledgerFees._sum.amount ?? 0) + (refunds._sum.amount ?? 0),
    commissions,
  });
}
