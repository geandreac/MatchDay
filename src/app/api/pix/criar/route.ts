import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { criarPixPayment } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Faça login para pagar." }, { status: 401 });
  }

  const { bookingId, amount } = await request.json();
  const userId = session.user.id as string;

  if (!bookingId || !amount || amount < 0.01) {
    return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking || booking.status !== "PENDING") {
    return NextResponse.json({ error: "Reserva não disponível." }, { status: 400 });
  }

  const remaining = Number(booking.totalValue) - Number(booking.paidValue);
  if (amount > remaining) {
    return NextResponse.json({ error: "Valor excede o restante." }, { status: 400 });
  }

  const externalRef = `${booking.shareLinkId}-${userId}-${Date.now()}`;

  try {
    const pix = await criarPixPayment(amount, `MatchDay - ${booking.shareLinkId}`, externalRef);

    const contribution = await prisma.paymentContribution.create({
      data: {
        bookingId,
        userId,
        amount,
        pixCode: pix.qrCode,
        pixQrCode: pix.qrCodeBase64,
        paymentId: String(pix.id),
      },
    });

    return NextResponse.json({ contribution, pix }, { status: 201 });
  } catch (error: any) {
    console.error("PIX error:", error);
    return NextResponse.json({ error: "Erro ao gerar PIX. Tente novamente." }, { status: 500 });
  }
}
