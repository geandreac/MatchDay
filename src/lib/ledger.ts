import { prisma } from "./prisma";

export async function recordLedgerOnConfirm(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      field: { select: { ownerId: true, name: true } },
    },
  });

  if (!booking || booking.status !== "CONFIRMED") return;

  const total = Number(booking.totalValue);
  const fee = Number(booking.platformFee);
  const ownerPayout = total - fee;

  const existingCount = await prisma.transactionLedger.count({
    where: { bookingId, type: "PLATFORM_FEE" },
  });

  if (existingCount > 0) return;

  await prisma.transactionLedger.createMany({
    data: [
      {
        bookingId,
        fieldId: booking.fieldId,
        type: "PLATFORM_FEE",
        amount: fee,
        description: `Taxa 5% - ${booking.field.name} - ${booking.shareLinkId}`,
      },
      {
        bookingId,
        fieldId: booking.fieldId,
        type: "OWNER_PAYOUT",
        amount: ownerPayout,
        description: `Liquido - ${booking.field.name} - ${booking.shareLinkId}`,
      },
    ],
  });
}

export async function recordLedgerOnRefund(bookingId: string, userId: string, amount: number) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { field: { select: { ownerId: true, name: true } } },
  });

  if (!booking) return;

  const feeRefund = amount * 0.05;
  const ownerRefund = amount - feeRefund;

  await prisma.transactionLedger.createMany({
    data: [
      {
        bookingId,
        fieldId: booking.fieldId,
        userId,
        type: "REFUND_OWNER",
        amount: -ownerRefund,
        description: `Estorno dono - ${booking.field.name}`,
      },
      {
        bookingId,
        fieldId: booking.fieldId,
        type: "REFUND_PLATFORM",
        amount: -feeRefund,
        description: `Estorno taxa - ${booking.field.name}`,
      },
    ],
  });
}

export async function recordLedgerCreditUser(bookingId: string, userId: string, amount: number) {
  await prisma.transactionLedger.create({
    data: {
      bookingId,
      userId,
      type: "CREDIT_USER",
      amount,
      description: `Credito ao usuario por cancelamento - booking ${bookingId}`,
    },
  });
}
