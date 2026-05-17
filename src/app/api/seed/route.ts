import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const password = await bcrypt.hash("123456", 12);

    const owner1 = await prisma.user.upsert({
      where: { email: "dono@email.com" },
      update: {},
      create: {
        name: "Carlos Dono", email: "dono@email.com",
        cpf: "52998224725", birthDate: new Date("1990-05-15"),
        password, role: "FIELD_OWNER",
      },
    });

    const owner2 = await prisma.user.upsert({
      where: { email: "joao@email.com" },
      update: {},
      create: {
        name: "João Silva", email: "joao@email.com",
        cpf: "11122233344", birthDate: new Date("1988-03-22"),
        password, role: "FIELD_OWNER",
      },
    });

    await prisma.user.upsert({
      where: { email: "jogador@email.com" },
      update: {},
      create: {
        name: "Pedro Jogador", email: "jogador@email.com",
        cpf: "55566677788", birthDate: new Date("2000-07-10"),
        password, role: "CLIENT",
      },
    });

    const campos = [
      { ownerId: owner1.id, name: "Arena Show de Bola", address: "Rua das Flores, 123", city: "São Paulo", state: "SP", capacity: 14, pricePerHour: 180, startHour: 17, endHour: 23, latitude: -23.5505, longitude: -46.6333 },
      { ownerId: owner1.id, name: "Campo do Barril", address: "Av. Paulista, 1000", city: "São Paulo", state: "SP", capacity: 10, pricePerHour: 120, startHour: 18, endHour: 2, latitude: -23.5610, longitude: -46.6560 },
      { ownerId: owner2.id, name: "Arena Fênix", address: "Rua Augusta, 500", city: "São Paulo", state: "SP", capacity: 16, pricePerHour: 250, startHour: 17, endHour: 3, latitude: -23.5450, longitude: -46.6400 },
      { ownerId: owner2.id, name: "Campo da Vila", address: "Praça da Sé, 50", city: "São Paulo", state: "SP", capacity: 12, pricePerHour: 150, startHour: 16, endHour: 22, latitude: -23.5480, longitude: -46.6330 },
      { ownerId: owner1.id, name: "Arena Parque", address: "Rua do Parque, 200", city: "Campinas", state: "SP", capacity: 20, pricePerHour: 200, startHour: 17, endHour: 1, latitude: -22.9068, longitude: -47.0590 },
    ];

    for (const campo of campos) {
      await prisma.field.create({ data: campo });
    }

    return NextResponse.json({
      message: "Seed completo!",
      users: ["dono@email.com / 123456", "joao@email.com / 123456", "jogador@email.com / 123456"],
      fields: campos.length,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Erro ao executar seed." }, { status: 500 });
  }
}
