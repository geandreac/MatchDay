import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reembolsarPagamento } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "FIELD_OWNER") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const { bookingId, motivo } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ error: "ID da reserva obrigatorio." }, { status: 400 });
    }

    const ownerId = session.user.id as string;

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, field: { ownerId } },
      include: {
        field: { select: { name: true } },
        contributions: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva nao encontrada ou acesso negado." }, { status: 404 });
    }

    if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
      return NextResponse.json({ error: "Reserva ja foi cancelada." }, { status: 400 });
    }

    console.log(
      `[Audit] Owner ${ownerId} cancelled booking ${bookingId} (field: ${booking.field.name}, status: ${booking.status}, motivo: ${motivo ?? "nao informado"})`,
    );

    const hasPaid = booking.contributions.some((c) => c.paid);

    if (hasPaid) {
      await prisma.$transaction(async (tx) => {
        for (const c of booking.contributions.filter((c) => c.paid)) {
          await tx.credit.create({
            data: {
              userId: c.userId,
              bookingId: booking.id,
              amount: c.amount,
              expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            },
          });
        }

        await tx.paymentContribution.updateMany({
          where: { bookingId: booking.id },
          data: { paid: false },
        });

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED", paidValue: 0 },
        });
      });

      for (const c of booking.contributions.filter((c) => c.paid)) {
        if (c.paymentId) {
          reembolsarPagamento(Number(c.paymentId)).catch(() => {
            console.error(`Falha ao reembolsar paymentId=${c.paymentId}`);
          });
        }
      }
    } else {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED", paidValue: 0 },
      });
    }

    return NextResponse.json({ message: "Reserva cancelada com sucesso." });
  } catch (error) {
    console.error("Owner cancel error:", error);
    return NextResponse.json({ error: "Erro ao cancelar reserva." }, { status: 500 });
  }
}
