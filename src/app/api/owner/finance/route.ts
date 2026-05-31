import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "FIELD_OWNER") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const ownerId = session.user.id as string;
  const { searchParams } = new URL(request.url);
  const fieldId = searchParams.get("fieldId");
  const period = searchParams.get("period") ?? "month";
  const dateStart = searchParams.get("dateStart");
  const dateEnd = searchParams.get("dateEnd");
  const dayOfWeek = searchParams.get("dayOfWeek");
  const hourRange = searchParams.get("hourRange");

  const now = new Date();
  let start: Date, end: Date, prevStart: Date, prevEnd: Date;

  switch (period) {
    case "day":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(start.getTime() + 86400000);
      prevStart = new Date(start.getTime() - 86400000);
      prevEnd = start;
      break;
    case "week":
      const d = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d);
      end = new Date(start.getTime() + 7 * 86400000);
      prevStart = new Date(start.getTime() - 7 * 86400000);
      prevEnd = start;
      break;
    case "year":
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear() + 1, 0, 1);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = start;
  }

  if (dateStart) start = new Date(dateStart + "T00:00:00");
  if (dateEnd) end = new Date(dateEnd + "T23:59:59");

  const fieldWhereBase = {
    ownerId,
    ...(fieldId ? { id: fieldId } : {}),
  };

  const ownerFields = await prisma.field.findMany({
    where: fieldWhereBase,
    select: { id: true, name: true, startHour: true, endHour: true, capacity: true },
  });

  const fieldIds = ownerFields.map((f) => f.id);

  const bookingWhere = {
    fieldId: { in: fieldIds },
    date: { gte: start, lt: end },
    ...(dayOfWeek ? {} : {}),
    ...(hourRange ? {
      startHour: { gte: parseInt(hourRange.split("-")[0]) },
      endHour: { lte: parseInt(hourRange.split("-")[1]) },
    } : {}),
  };

  const prevBookingWhere = {
    fieldId: { in: fieldIds },
    date: { gte: prevStart, lt: prevEnd },
  };

  const [bookings, prevBookings] = await Promise.all([
    prisma.booking.findMany({
      where: bookingWhere,
      include: {
        field: { select: { id: true, name: true } },
        contributions: { select: { amount: true, paid: true } },
      },
    }),
    prisma.booking.findMany({
      where: prevBookingWhere,
      include: {
        field: { select: { id: true, name: true } },
        contributions: { select: { amount: true, paid: true } },
      },
    }),
  ]);

  function calcMetrics(bs: typeof bookings) {
    const confirmed = bs.filter((b) => b.status === "CONFIRMED" || b.status === "COMPLETED");
    const cancelled = bs.filter((b) => b.status === "CANCELLED" || b.status === "REFUNDED");
    const pending = bs.filter((b) => b.status === "PENDING");
    const total = bs.length || 1;

    const grossRevenue = bs.reduce((s, b) => s + Number(b.totalValue), 0);
    const paidRevenue = bs.reduce((s, b) => s + Number(b.paidValue), 0);
    const refundedRevenue = cancelled.reduce((s, b) => s + Number(b.paidValue), 0);
    const netRevenue = paidRevenue - refundedRevenue;
    const platformFees = bs.reduce((s, b) => s + Number(b.platformFee), 0);

    const avgTicket = confirmed.length > 0 ? paidRevenue / confirmed.length : 0;
    const cancelRate = total > 0 ? (cancelled.length / total) * 100 : 0;
    const pendingRate = total > 0 ? (pending.length / total) * 100 : 0;

    return {
      totalBookings: bs.length,
      confirmedBookings: confirmed.length,
      cancelledBookings: cancelled.length,
      pendingBookings: pending.length,
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      paidRevenue: Math.round(paidRevenue * 100) / 100,
      refundedRevenue: Math.round(refundedRevenue * 100) / 100,
      netRevenue: Math.round(netRevenue * 100) / 100,
      platformFees: Math.round(platformFees * 100) / 100,
      avgTicket: Math.round(avgTicket * 100) / 100,
      cancelRate: Math.round(cancelRate * 100) / 100,
      pendingRate: Math.round(pendingRate * 100) / 100,
    };
  }

  const current = calcMetrics(bookings);
  const previous = calcMetrics(prevBookings);

  function variation(cur: number, prev: number): number {
    if (prev === 0) return cur > 0 ? 100 : 0;
    return Math.round(((cur - prev) / prev) * 10000) / 100;
  }

  const occupancyByField = ownerFields.map((f) => {
    const fieldBookings = bookings.filter((b) => b.fieldId === f.id && (b.status === "CONFIRMED" || b.status === "COMPLETED" || b.status === "PENDING"));
    const hoursPerDay = f.endHour > f.startHour ? f.endHour - f.startHour : 24 - f.startHour + f.endHour;
    const daysInPeriod = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const totalSlots = hoursPerDay * daysInPeriod;
    const bookedSlots = fieldBookings.reduce((s, b) => s + b.hours, 0);
    const occupancy = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 10000) / 100 : 0;

    const revPAH = totalSlots > 0
      ? Math.round((fieldBookings.reduce((s, b) => s + Number(b.paidValue), 0) / totalSlots) * 100) / 100
      : 0;

    return {
      fieldId: f.id,
      fieldName: f.name,
      totalSlots,
      bookedSlots,
      occupancy,
      revPAH,
    };
  });

  const byDayOfWeek = [0, 1, 2, 3, 4, 5, 6].map((dow) => {
    const dowBookings = bookings.filter((b) => new Date(b.date).getDay() === dow);
    const rev = dowBookings.reduce((s, b) => s + Number(b.paidValue), 0);
    return {
      dayOfWeek: dow,
      label: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"][dow],
      bookings: dowBookings.length,
      revenue: Math.round(rev * 100) / 100,
    };
  });

  const byHourRange = [8, 10, 12, 14, 16, 18, 20, 22].map((h) => {
    const rangeBookings = bookings.filter((b) => b.startHour >= h && b.startHour < h + 2);
    const rev = rangeBookings.reduce((s, b) => s + Number(b.paidValue), 0);
    return {
      hour: `${String(h).padStart(2, "0")}h-${String(h + 2).padStart(2, "0")}h`,
      startHour: h,
      bookings: rangeBookings.length,
      revenue: Math.round(rev * 100) / 100,
    };
  });

  const alerts: string[] = [];
  if (current.cancelRate > 20) alerts.push("Taxa de cancelamento acima de 20% no periodo.");
  if (current.pendingRate > 30) alerts.push("Mais de 30% das reservas estao com pagamento pendente.");
  if (occupancyByField.some((f) => f.occupancy < 30)) alerts.push("Algum campo esta com ocupacao abaixo de 30%.");

  return NextResponse.json({
    period: { start: start.toISOString(), end: end.toISOString() },
    fields: ownerFields,
    kpis: {
      current,
      previous,
      variations: {
        grossRevenue: variation(current.grossRevenue, previous.grossRevenue),
        netRevenue: variation(current.netRevenue, previous.netRevenue),
        bookings: variation(current.totalBookings, previous.totalBookings),
        avgTicket: variation(current.avgTicket, previous.avgTicket),
        cancelRate: variation(current.cancelRate, previous.cancelRate),
      },
    },
    occupancyByField,
    byDayOfWeek,
    byHourRange,
    alerts,
  });
}
