import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const fields = await prisma.field.findMany({
    orderBy: { createdAt: "desc" },
    include: { owner: { select: { name: true } }, _count: { select: { bookings: true } } },
  });

  return NextResponse.json(fields);
}
