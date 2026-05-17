import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const userId = session.user.id as string;
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        { userId },
        { participants: { some: { userId } } },
      ],
    },
    include: {
      field: { select: { name: true, city: true } },
      participants: { include: { user: { select: { name: true } } } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(bookings);
}
