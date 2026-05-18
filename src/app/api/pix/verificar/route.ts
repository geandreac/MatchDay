import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buscarPagamento } from "@/lib/mercadopago";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { contributionId } = await request.json();
  if (!contributionId) {
    return NextResponse.json({ error: "ID da contribuição obrigatório." }, { status: 400 });
  }

  const contribution = await prisma.paymentContribution.findUnique({
    where: { id: contributionId },
    include: { booking: true },
  });

  if (!contribution) {
    return NextResponse.json({ error: "Contribuição não encontrada." }, { status: 404 });
  }

  if (contribution.paid) {
    return NextResponse.json({ paid: true, message: "Pagamento já confirmado." });
  }

  if (!contribution.paymentId) {
    return NextResponse.json({ paid: false, message: "Pagamento ainda não processado." });
  }

  try {
    const paymentInfo = await buscarPagamento(Number(contribution.paymentId));

    if (paymentInfo.status === "approved") {
      await prisma.paymentContribution.update({
        where: { id: contributionId },
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

      return NextResponse.json({ paid: true, message: "Pagamento confirmado!" });
    }

    return NextResponse.json({ paid: false, message: `Status: ${paymentInfo.status}` });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ paid: false, message: "Erro ao verificar pagamento." }, { status: 500 });
  }
}
