import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const userId = session.user.id as string;

  const bookings = await prisma.booking.findMany({
    where: { userId },
    include: { field: { select: { name: true } } },
    orderBy: { date: "desc" },
  });

  const headers = ["Data", "Campo", "Horario", "Valor Total", "Valor Pago", "Status"];
  const rows = bookings.map((b) => [
    new Date(b.date).toLocaleDateString("pt-BR"),
    b.field.name,
    `${String(b.startHour).padStart(2, "0")}h - ${String(b.endHour).padStart(2, "0")}h`,
    `R$ ${Number(b.totalValue).toFixed(2)}`,
    `R$ ${Number(b.paidValue).toFixed(2)}`,
    b.status,
  ]);

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, `""`)}"`).join(",")).join("\n");
  const bom = "\uFEFF";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="matchday-reservas-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
