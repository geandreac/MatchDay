import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const field = await prisma.field.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!field) {
    return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });
  }

  const { date, startHour, endHour } = await request.json();

  if (!date || startHour === undefined || endHour === undefined) {
    return NextResponse.json({ error: "Data, hora início e fim são obrigatórios." }, { status: 400 });
  }

  const shareLinkId = nanoid(12);
  const startDate = new Date(date + "T12:00:00");
  startDate.setHours(startHour, 0, 0, 0);

  const conflicting = await prisma.booking.findFirst({
    where: {
      fieldId: field.id,
      date: startDate,
      status: { in: ["PENDING", "CONFIRMED"] },
      startHour: { lt: endHour },
      endHour: { gt: startHour },
    },
  });
  if (conflicting) {
    return NextResponse.json({ error: "Horário já reservado." }, { status: 409 });
  }

  const hours = endHour > startHour ? endHour - startHour : 24 - startHour + endHour;
  const totalValue = hours * Number(field.pricePerHour);
  const platformFee = totalValue * 0.05;
  const grandTotal = totalValue + platformFee;

  const paymentDeadline48h = new Date(startDate);
  paymentDeadline48h.setHours(paymentDeadline48h.getHours() - 48);
  const minDeadline = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const paymentDeadline = paymentDeadline48h > minDeadline ? paymentDeadline48h : minDeadline;

  const booking = await prisma.booking.create({
    data: {
      fieldId: field.id,
      userId: session.user.id!,
      date: startDate,
      startHour,
      endHour,
      hours,
      totalValue: grandTotal,
      platformFee,
      paidValue: 0,
      shareLinkId,
      shareLink: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reservar/${shareLinkId}`,
      paymentDeadline,
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
