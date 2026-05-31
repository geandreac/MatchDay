import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "FIELD_OWNER") {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const ownerId = session.user.id as string;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "month";
  const now = new Date();

  let start: Date, end: Date;
  switch (period) {
    case "day": start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); end = new Date(start.getTime() + 86400000); break;
    case "week": const d = now.getDay(); start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - d); end = new Date(start.getTime() + 7 * 86400000); break;
    case "year": start = new Date(now.getFullYear(), 0, 1); end = new Date(now.getFullYear() + 1, 0, 1); break;
    default: start = new Date(now.getFullYear(), now.getMonth(), 1); end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  const bookings = await prisma.booking.findMany({
    where: { field: { ownerId }, date: { gte: start, lt: end } },
    include: { field: { select: { name: true } }, user: { select: { name: true, email: true } }, contributions: true },
    orderBy: { date: "desc" },
  });

  const h = ["Data", "Campo", "Criado por", "Horario", "Valor Total", "Valor Pago", "Status", "Pagamentos"];
  const rows = bookings.map((b) => [
    new Date(b.date).toLocaleDateString("pt-BR"),
    b.field.name,
    b.user.name,
    `${String(b.startHour).padStart(2, "0")}h-${String(b.endHour).padStart(2, "0")}h`,
    `R$ ${Number(b.totalValue).toFixed(2)}`,
    `R$ ${Number(b.paidValue).toFixed(2)}`,
    b.status,
    b.contributions.map((c) => `${c.userId}:R$${c.amount}${c.paid ? "✓" : ""}`).join("|"),
  ]);

  const csv = [h, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, `""`)}"`).join(",")).join("\n");
  return new NextResponse("\uFEFF" + csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="matchday-finance-${new Date().toISOString().split("T")[0]}.csv"` },
  });
}
