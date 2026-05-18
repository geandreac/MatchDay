import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { fieldId, bookingId, score, comment } = await request.json();
  const userId = session.user.id as string;

  if (!fieldId || !bookingId || !score || score < 1 || score > 5) {
    return NextResponse.json({ error: "Nota inválida (1-5)." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.status !== "COMPLETED") {
    return NextResponse.json({ error: "Reserva não concluída." }, { status: 400 });
  }

  const existing = await prisma.rating.findUnique({
    where: { userId_bookingId: { userId, bookingId } },
  });

  if (existing) {
    return NextResponse.json({ error: "Você já avaliou esta partida." }, { status: 409 });
  }

  const rating = await prisma.rating.create({
    data: { fieldId, userId, bookingId, score, comment },
  });

  return NextResponse.json(rating, { status: 201 });
}
