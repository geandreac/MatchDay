import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

interface FieldWithDistance {
  id: string; name: string; city: string; address: string;
  pricePerHour: number; startHour: number; endHour: number;
  capacity: number; latitude: number | null; longitude: number | null;
  owner: { name: string }; distanciaKm?: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  const where: Prisma.FieldWhereInput = { active: true };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { city: { contains: q } },
    ];
  }

  if (city) {
    where.city = { contains: city };
  }

  const fields = await prisma.field.findMany({
    where,
    select: {
      id: true, name: true, city: true, address: true,
      pricePerHour: true, startHour: true, endHour: true,
      capacity: true, latitude: true, longitude: true,
      owner: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let result: FieldWithDistance[] = fields.map((f) => ({ ...f, distanciaKm: undefined }));

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    result = result
      .filter((f) => f.latitude != null && f.longitude != null)
      .map((f) => {
        const dist = calcularDistancia(userLat, userLng, f.latitude!, f.longitude!);
        return { ...f, distanciaKm: Math.round(dist * 10) / 10 };
      })
      .filter((f) => (f.distanciaKm ?? Infinity) <= 5)
      .sort((a, b) => (a.distanciaKm ?? Infinity) - (b.distanciaKm ?? Infinity));
  }

  return NextResponse.json(result);
}

function calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
