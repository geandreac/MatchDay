import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buscarPagamento } from "@/lib/mercadopago";
import { recordLedgerOnConfirm } from "@/lib/ledger";
import crypto from "crypto";

function verifyMPSignature(request: Request, rawBody: string): boolean {
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");
  if (!signature || !requestId) return false;

  const parts = signature.split(",").reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split("=");
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return false;

  const manifest = `${ts}\n${requestId}\n${rawBody}`;
  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
  return v1 === hash;
}

export async function POST(request: Request) {
  const rawBody = await request.text();

  if (!verifyMPSignature(request, rawBody)) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody);
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
        const currentBooking = await prisma.booking.findUnique({
          where: { id: contribution.bookingId },
          select: { paidValue: true, totalValue: true },
        });
        if (!currentBooking) return NextResponse.json({ received: true });

        const nPaidValue = Number(currentBooking.paidValue) + Number(contribution.amount);
        const tValue = Number(currentBooking.totalValue);

        await prisma.$transaction(async (tx) => {
          await tx.paymentContribution.update({
            where: { id: contribution.id },
            data: { paid: true, paidAt: new Date() },
          });

          await tx.booking.update({
            where: { id: contribution.bookingId },
            data: {
              paidValue: nPaidValue,
              paidAt: new Date(),
              status: nPaidValue >= tValue ? "CONFIRMED" : "PENDING",
            },
          });
        });
        if (nPaidValue >= tValue) {
          await recordLedgerOnConfirm(contribution.bookingId);
        }
      }
    }

    if (paymentInfo.status === "refunded") {
      const contribution = await prisma.paymentContribution.findFirst({
        where: { paymentId: String(paymentId) },
      });
      if (contribution) {
        await prisma.credit.deleteMany({
          where: { bookingId: contribution.bookingId, userId: contribution.userId, used: false },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
