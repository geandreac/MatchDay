import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const field = await prisma.field.findUnique({
    where: { id, active: true },
    include: {
      owner: { select: { name: true } },
      ratings: true,
      bookings: {
        where: { status: { in: ["PENDING", "CONFIRMED"] } },
        select: { date: true, startHour: true, endHour: true },
      },
    },
  });

  if (!field) {
    return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });
  }

  const ratings = field.ratings as { score: number }[];
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((a: number, r: { score: number }) => a + r.score, 0) / ratings.length
      : null;

  const photos = JSON.parse(field.photos);
  const availableDays = JSON.parse(field.availableDays);

  return NextResponse.json({
    ...field,
    avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    totalRatings: ratings.length,
    photos,
    availableDays,
    activeBookings: field.bookings,
    ratings: undefined,
    bookings: undefined,
  });
}
