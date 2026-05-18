import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const userId = session.user.id as string;

  const ratedBookingIds = (
    await prisma.rating.findMany({
      where: { userId },
      select: { bookingId: true },
    })
  ).map((r) => r.bookingId);

  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ userId }, { participants: { some: { userId } } }],
      status: "COMPLETED",
      id: { notIn: ratedBookingIds },
    },
    select: {
      id: true,
      fieldId: true,
      field: { select: { name: true } },
      date: true,
    },
    take: 10,
  });

  return NextResponse.json(bookings);
}
