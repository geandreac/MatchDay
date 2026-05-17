import { prisma } from "./prisma";

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
    return prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });
  }

  await prisma.$transaction(
    booking.payments.map((p) =>
      prisma.payment.update({
        where: { id: p.id },
        data: { status: "REFUNDED", refunded: true },
      })
    )
  );

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "REFUNDED", paidValue: 0 },
  });
}
