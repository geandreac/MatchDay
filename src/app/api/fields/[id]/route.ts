import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const field = await prisma.field.findFirst({
    where: { id, ownerId: session.user.id },
    include: { bookings: { orderBy: { date: "desc" }, take: 20 } },
  });

  if (!field) {
    return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });
  }

  return NextResponse.json(field);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const field = await prisma.field.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!field) {
    return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const updated = await prisma.field.update({
      where: { id },
      data: {
        name: body.name ?? field.name,
        address: body.address ?? field.address,
        city: body.city ?? field.city,
        state: body.state ?? field.state,
        latitude: body.latitude !== undefined ? parseFloat(body.latitude) : field.latitude,
        longitude: body.longitude !== undefined ? parseFloat(body.longitude) : field.longitude,
        description: body.description ?? field.description,
        capacity: body.capacity ? parseInt(body.capacity) : field.capacity,
        gameFormat: body.gameFormat ?? field.gameFormat,
        pricePerHour: body.pricePerHour ? parseFloat(body.pricePerHour) : field.pricePerHour,
        startHour: body.startHour !== undefined ? parseInt(body.startHour) : field.startHour,
        endHour: body.endHour !== undefined ? parseInt(body.endHour) : field.endHour,
        active: body.active !== undefined ? body.active : field.active,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update field error:", error);
    return NextResponse.json({ error: "Erro ao atualizar campo." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const field = await prisma.field.findFirst({
    where: { id, ownerId: session.user.id },
  });

  if (!field) {
    return NextResponse.json({ error: "Campo nao encontrado." }, { status: 404 });
  }

  try {
    await prisma.field.delete({ where: { id } });
    return NextResponse.json({ message: "Campo excluido com sucesso." });
  } catch (error) {
    console.error("Delete field error:", error);
    return NextResponse.json({ error: "Erro ao excluir campo." }, { status: 500 });
  }
}
