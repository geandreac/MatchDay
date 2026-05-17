import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarRegra50 } from "@/lib/regra50";

export async function GET(request: Request, { params }: { params: Promise<{ shareLinkId: string }> }) {
  const { shareLinkId } = await params;

  let booking = await prisma.booking.findUnique({
    where: { shareLinkId },
    include: {
      field: { select: { name: true, address: true, city: true, pricePerHour: true } },
      participants: { include: { user: { select: { id: true, name: true, image: true } } } },
      user: { select: { name: true } },
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
  }

  await verificarRegra50(booking.id);
  booking = (await prisma.booking.findUnique({
    where: { id: booking.id },
    include: {
      field: { select: { name: true, address: true, city: true, pricePerHour: true } },
      participants: { include: { user: { select: { id: true, name: true, image: true } } } },
      user: { select: { name: true } },
    },
  }))!;

  const totalPlayers = booking.participants.length;
  const shareValue = totalPlayers > 0 ? Math.ceil(Number(booking.totalValue) / totalPlayers) : Number(booking.totalValue);

  return NextResponse.json({
    ...booking,
    totalValue: Number(booking.totalValue),
    paidValue: Number(booking.paidValue),
    shareValue,
    totalPlayers,
  });
}
