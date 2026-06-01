import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const fields = await prisma.field.findMany({
    where: { ownerId: session.user.id },
    include: { bookings: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(fields);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      cep, name, address, city, state,
      latitude, longitude,
      description, capacity, gameFormat, pricePerHour,
      startHour, endHour,
    } = body;

    if (!name || !address || !city || !pricePerHour || startHour === undefined || endHour === undefined) {
      return NextResponse.json({ error: "Campos obrigatórios faltando." }, { status: 400 });
    }

    const field = await prisma.field.create({
      data: {
        owner: { connect: { id: session.user.id! } },
        cep: cep ?? null,
        name,
        address,
        city,
        state: state ?? null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: description ?? null,
        capacity: capacity ? parseInt(capacity) : 10,
        gameFormat: gameFormat ?? null,
        pricePerHour: parseFloat(pricePerHour),
        startHour: parseInt(startHour),
        endHour: parseInt(endHour),
        availableDays: {
          create: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ dayOfWeek: day })),
        },
      },
      include: { availableDays: true },
    });

    return NextResponse.json(field, { status: 201 });
  } catch (error) {
    console.error("Create field error:", error);
    return NextResponse.json({ error: "Erro ao criar campo." }, { status: 500 });
  }
}
