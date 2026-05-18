import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { bookingId } = await request.json();
  const userId = session.user.id as string;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { contributions: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
  }

  const isOwner = booking.userId === userId;
  const isParticipant = booking.contributions.some((c) => c.userId === userId);

  if (!isOwner && !isParticipant) {
    return NextResponse.json({ error: "Você não pode cancelar esta reserva." }, { status: 403 });
  }

  if (booking.status === "CONFIRMED" || booking.status === "COMPLETED" || booking.status === "REFUNDED") {
    return NextResponse.json({ error: "Esta reserva não pode mais ser cancelada." }, { status: 400 });
  }

  const hasPaid = booking.contributions.some((c) => c.paid);
  if (hasPaid) {
    return NextResponse.json({ error: "Já há pagamentos nesta reserva. Entre em contato com o suporte para cancelar." }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json({ message: "Reserva cancelada com sucesso." });
}
