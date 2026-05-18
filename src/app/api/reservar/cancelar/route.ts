import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reembolsarPagamento } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;
    const userId = session.user.id as string;

    if (!bookingId) {
      return NextResponse.json({ error: "ID da reserva é obrigatório." }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { contributions: true, participants: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
    }

    console.log(`Cancel attempt: bookingId=${bookingId}, status=${booking.status}, userId=${userId}, ownerId=${booking.userId}`);

    if (booking.status !== "PENDING") {
      return NextResponse.json({ error: `Reserva não pode ser cancelada. Status atual: ${booking.status}.` }, { status: 400 });
    }

    const isOwner = booking.userId === userId;
    const isParticipant = booking.contributions.some((c) => c.userId === userId) || booking.participants.some((p) => p.userId === userId);

    if (!isOwner && !isParticipant) {
      return NextResponse.json({ error: `Você não pode cancelar esta reserva.` }, { status: 403 });
    }

    const hasPaid = booking.contributions.some((c) => c.paid);
    if (!isOwner && hasPaid) {
      return NextResponse.json({ error: "Já há pagamentos nesta reserva. Peça ao dono do campo para cancelar." }, { status: 400 });
    }

    // Se o dono está cancelando, reembolsa todos os pagamentos via Mercado Pago
    if (isOwner && hasPaid) {
      const paidContributions = booking.contributions.filter((c) => c.paid && c.paymentId);
      for (const c of paidContributions) {
        await reembolsarPagamento(Number(c.paymentId));
      }

      await prisma.$transaction(
        booking.contributions.map((c) =>
          prisma.paymentContribution.update({
            where: { id: c.id },
            data: { paid: false, paidAt: null },
          })
        )
      );
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", paidValue: 0 },
    });

    return NextResponse.json({ message: "Reserva cancelada com sucesso." });
  } catch (error) {
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Erro interno ao cancelar." }, { status: 500 });
  }
}
