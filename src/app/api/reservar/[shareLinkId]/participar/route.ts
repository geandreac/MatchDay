import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ shareLinkId: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Faça login para participar." }, { status: 401 });
  }

  const { shareLinkId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { shareLinkId },
    include: { participants: true },
  });

  if (!booking) {
    return NextResponse.json({ error: "Reserva não encontrada." }, { status: 404 });
  }

  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Esta reserva não está mais disponível." }, { status: 400 });
  }

  const userId = session.user.id as string;
  const alreadyJoined = booking.participants.some((p) => p.userId === userId);
  if (alreadyJoined) {
    return NextResponse.json({ error: "Você já está participando desta reserva." }, { status: 409 });
  }

  const totalPlayers = booking.participants.length + 1;
  const shareValue = Math.ceil(Number(booking.totalValue) / totalPlayers);

  const participant = await prisma.participant.create({
    data: {
      bookingId: booking.id,
      userId,
      shareValue,
    },
  });

  return NextResponse.json({ participant, shareValue }, { status: 201 });
}
