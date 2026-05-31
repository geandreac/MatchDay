import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { criarPixPayment } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Faça login para pagar." }, { status: 401 });
  }

  const { bookingId, amount, useCredits } = await request.json();
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

  // Se usar créditos
  if (useCredits) {
    const availableCredits = await prisma.credit.findMany({
      where: { userId, used: false },
    });
    const totalCredits = availableCredits.reduce((s, c) => s + c.amount, 0);

    if (totalCredits < amount) {
      return NextResponse.json({ error: "Saldo de créditos insuficiente." }, { status: 400 });
    }

    let remainingAmount = amount;
    for (const credit of availableCredits) {
      if (remainingAmount <= 0) break;
      const useAmount = Math.min(credit.amount, remainingAmount);
      remainingAmount -= useAmount;

      await prisma.credit.update({
        where: { id: credit.id },
        data: { used: true },
      });
    }

    // Marca como pago via crédito
    await prisma.paymentContribution.create({
      data: { bookingId, userId, amount, paid: true, paidAt: new Date() },
    });

    const newPaidValue = Number(booking.paidValue) + amount;
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paidValue: newPaidValue,
        status: newPaidValue >= Number(booking.totalValue) ? "CONFIRMED" : "PENDING",
      },
    });

    return NextResponse.json({ paid: true, method: "credits" }, { status: 200 });
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
  } catch (error) {
    console.error("PIX error:", error);
    return NextResponse.json({ error: "Erro ao gerar PIX. Tente novamente." }, { status: 500 });
  }
}
