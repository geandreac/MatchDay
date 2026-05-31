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
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  const skip = (page - 1) * limit;

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

  const [fields, total] = await Promise.all([
    prisma.field.findMany({
      where,
      select: {
        id: true, name: true, city: true, address: true,
        pricePerHour: true, startHour: true, endHour: true,
        capacity: true, latitude: true, longitude: true,
        owner: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.field.count({ where }),
  ]);

  let result: FieldWithDistance[] = fields.map((f) => ({ ...f, distanciaKm: undefined }));

  if (lat && lng) {
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    result = result
      .map((f) => {
        if (f.latitude == null || f.longitude == null) return f;
        const dist = calcularDistancia(userLat, userLng, f.latitude, f.longitude);
        return { ...f, distanciaKm: Math.round(dist * 10) / 10 };
      })
      .sort((a, b) => {
        if (a.distanciaKm == null && b.distanciaKm == null) return 0;
        if (a.distanciaKm == null) return 1;
        if (b.distanciaKm == null) return -1;
        return a.distanciaKm - b.distanciaKm;
      });
  }

  return NextResponse.json({
    fields: result,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
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
