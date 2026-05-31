import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Faça login para agendar." }, { status: 401 });
  }

  const { fieldId, date, startHour, endHour, hours, totalValue, platformFee, grandTotal } = await request.json();
  const userId = session.user.id as string;

  const field = await prisma.field.findUnique({ where: { id: fieldId } });
  if (!field) return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });

  const startDate = new Date(date + "T12:00:00");
  startDate.setHours(startHour, 0, 0, 0);

  const conflicting = await prisma.booking.findFirst({
    where: {
      fieldId,
      date: startDate,
      status: { in: ["PENDING", "CONFIRMED"] },
      startHour: { lt: endHour },
      endHour: { gt: startHour },
    },
  });
  if (conflicting) {
    return NextResponse.json({ error: "Horário já reservado." }, { status: 409 });
  }

  const paymentDeadline48h = new Date(startDate);
  paymentDeadline48h.setHours(paymentDeadline48h.getHours() - 48);

  const minDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const paymentDeadline = paymentDeadline48h > minDeadline ? paymentDeadline48h : minDeadline;

  const shareLinkId = nanoid(12);

  const booking = await prisma.booking.create({
    data: {
      fieldId,
      userId,
      date: startDate,
      startHour,
      endHour,
      hours,
      totalValue: grandTotal ?? totalValue,
      platformFee: platformFee ?? 0,
      paidValue: 0,
      shareLinkId,
      shareLink: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reservar/${shareLinkId}`,
      paymentDeadline,
      participants: {
        create: { userId, shareValue: grandTotal ?? totalValue },
      },
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
