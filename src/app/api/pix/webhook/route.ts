import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buscarPagamento } from "@/lib/mercadopago";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action !== "payment.created" && action !== "payment.updated") {
      return NextResponse.json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const paymentInfo = await buscarPagamento(Number(paymentId));

    if (paymentInfo.status === "approved") {
      const contribution = await prisma.paymentContribution.findFirst({
        where: { paymentId: String(paymentId) },
        include: { booking: true },
      });

      if (contribution && !contribution.paid) {
        await prisma.paymentContribution.update({
          where: { id: contribution.id },
          data: { paid: true, paidAt: new Date() },
        });

        const newPaidValue = Number(contribution.booking.paidValue) + Number(contribution.amount);
        const totalValue = Number(contribution.booking.totalValue);

        await prisma.booking.update({
          where: { id: contribution.bookingId },
          data: {
            paidValue: newPaidValue,
            paidAt: new Date(),
            status: newPaidValue >= totalValue ? "CONFIRMED" : "PENDING",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
