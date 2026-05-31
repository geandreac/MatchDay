import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { criarPixPayment } from "@/lib/mercadopago";

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

  const externalRef = `${booking.shareLinkId}-${userId}-${Date.now()}`;
  const pix = await criarPixPayment(amount, `MatchDay - ${booking.shareLinkId}`, externalRef);

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId,
      amount,
      method: "PIX",
      status: "PENDING",
      pixCode: pix.qrCode,
      pixQrCode: pix.qrCodeBase64,
    },
  });

  await prisma.paymentContribution.create({
    data: {
      bookingId: booking.id,
      userId,
      amount,
      pixCode: pix.qrCode,
      pixQrCode: pix.qrCodeBase64,
      paymentId: String(pix.id),
    },
  });

  return NextResponse.json({ pix, amount }, { status: 201 });
}
