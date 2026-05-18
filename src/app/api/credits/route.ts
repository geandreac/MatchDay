import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const userId = session.user.id as string;
  const credits = await prisma.credit.findMany({
    where: { userId, used: false },
  });

  const total = credits.reduce((s, c) => s + c.amount, 0);

  return NextResponse.json({ credits, total });
}
