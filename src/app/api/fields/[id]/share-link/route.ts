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
  const startDate = new Date(date);
  startDate.setHours(startHour, 0, 0, 0);
  const endDate = new Date(date);
  endDate.setHours(endHour, 0, 0, 0);

  const hours = endHour > startHour ? endHour - startHour : 24 - startHour + endHour;
  const totalValue = hours * Number(field.pricePerHour);

  const paymentDeadline = new Date(startDate);
  paymentDeadline.setDate(paymentDeadline.getDate() - 2);

  const booking = await prisma.booking.create({
    data: {
      fieldId: field.id,
      userId: session.user.id!,
      date: startDate,
      startHour,
      endHour,
      totalValue,
      shareLinkId,
      shareLink: `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reservar/${shareLinkId}`,
      paymentDeadline,
    },
  });

  return NextResponse.json(booking, { status: 201 });
}
