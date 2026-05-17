import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function POST(request: Request, { params }: { params: Promise<{ shareLinkId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Faça login para pagar." }, { status: 401 });
  }

  const { shareLinkId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { shareLinkId },
    include: { participants: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
  }

  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Esta reserva não está mais disponível." }, { status: 400 });
  }

  const userId = session.user.id as string;
  const participant = booking.participants.find((p) => p.userId === userId);
  if (!participant) {
    return NextResponse.json({ error: "Você precisa entrar na reserva primeiro." }, { status: 400 });
  }

  if (participant.hasPaid) {
    return NextResponse.json({ error: "Você já pagou sua parte." }, { status: 409 });
  }

  const amount = Number(participant.shareValue);

  // Simulação de pagamento PIX
  const pixCode = nanoid(32);
  const pixQrCode = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" dominant-baseline="middle" font-family="monospace" font-size="10" fill="black">PIX SIMULADO</text><text x="100" y="120" text-anchor="middle" dominant-baseline="middle" font-family="monospace" font-size="8" fill="gray">${pixCode.slice(0, 20)}...</text></svg>`;

  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId,
      amount,
      method: "PIX",
      status: "PAID",
      pixCode,
      pixQrCode,
    },
  });

  await prisma.participant.update({
    where: { id: participant.id },
    data: { hasPaid: true },
  });

  const totalPaid = Number(booking.paidValue) + amount;
  await prisma.booking.update({
    where: { id: booking.id },
    data: { paidValue: totalPaid },
  });

  return NextResponse.json({ payment, amount, totalPaid }, { status: 200 });
}
