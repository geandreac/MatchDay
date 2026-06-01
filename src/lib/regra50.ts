import { prisma } from "./prisma";
import { recordLedgerOnConfirm } from "./ledger";

export async function verificarRegra50(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payments: true },
  });

  if (!booking) return null;
  if (booking.status !== "PENDING") return booking;
  if (new Date() < booking.paymentDeadline) return booking;

  const totalValue = Number(booking.totalValue);
  const paidValue = Number(booking.paidValue);
  const minRequired = totalValue * 0.5;

  if (paidValue >= minRequired) {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });
    await recordLedgerOnConfirm(bookingId);
    return updated;
  }

  return prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { bookingId, status: { not: "REFUNDED" } },
      data: { status: "REFUNDED", refunded: true },
    });

    return tx.booking.update({
      where: { id: bookingId },
      data: { status: "REFUNDED", paidValue: 0 },
    });
  });
}
