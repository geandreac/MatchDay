import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const field = await prisma.field.findUnique({
    where: { id, active: true },
    include: {
      owner: { select: { name: true } },
      ratings: true,
      photos: { orderBy: { position: "asc" } },
      availableDays: true,
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { date: true, startHour: true, endHour: true },
      },
    },
  });

  if (!field) {
    return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });
  }

  const fieldRatings = field.ratings;
  const avgRating =
    fieldRatings.length > 0
      ? fieldRatings.reduce((a, r) => a + r.score, 0) / fieldRatings.length
      : null;

  return NextResponse.json({
    ...field,
    avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    totalRatings: fieldRatings.length,
    availableDays: field.availableDays.map((d) => d.dayOfWeek),
    activeBookings: field.bookings,
    ratings: undefined,
    bookings: undefined,
  });
}
