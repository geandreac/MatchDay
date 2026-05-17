import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const userId = session.user.id as string;
  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      field: {
        select: {
          id: true, name: true, city: true, address: true,
          pricePerHour: true, startHour: true, endHour: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const userId = session.user.id as string;
  const { fieldId } = await request.json();

  if (!fieldId) {
    return NextResponse.json({ error: "ID do campo é obrigatório." }, { status: 400 });
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_fieldId: { userId, fieldId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, fieldId } });
  return NextResponse.json({ favorited: true }, { status: 201 });
}
