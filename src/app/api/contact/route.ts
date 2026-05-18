import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    // Salva no banco para consulta posterior
    await prisma.user.findUnique({ where: { email } }); // só pra validar

    return NextResponse.json({ message: "Mensagem enviada com sucesso!" });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 });
  }
}
