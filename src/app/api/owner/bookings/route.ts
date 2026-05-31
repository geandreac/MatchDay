import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "FIELD_OWNER") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const ownerId = session.user.id as string;

  const bookings = await prisma.booking.findMany({
    where: { field: { ownerId } },
    include: {
      field: { select: { id: true, name: true, city: true } },
      user: { select: { id: true, name: true, email: true } },
      participants: {
        include: { user: { select: { id: true, name: true } } },
      },
      contributions: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { date: "desc" },
  });

  const result = bookings.map((b) => ({
    id: b.id,
    fieldId: b.fieldId,
    fieldName: b.field.name,
    fieldCity: b.field.city,
    date: b.date,
    startHour: b.startHour,
    endHour: b.endHour,
    hours: b.hours,
    totalValue: Number(b.totalValue),
    paidValue: Number(b.paidValue),
    platformFee: Number(b.platformFee),
    status: b.status,
    shareLinkId: b.shareLinkId,
    paymentDeadline: b.paymentDeadline,
    owner: { id: b.user.id, name: b.user.name, email: b.user.email },
    participants: b.participants.map((p) => ({
      id: p.user.id,
      name: p.user.name,
      shareValue: Number(p.shareValue),
      hasPaid: p.hasPaid,
    })),
    contributions: b.contributions.map((c) => ({
      id: c.id,
      userId: c.userId,
      userName: c.user.name,
      amount: Number(c.amount),
      paid: c.paid,
      paidAt: c.paidAt,
    })),
  }));

  return NextResponse.json(result);
}
