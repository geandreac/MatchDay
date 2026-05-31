import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimitIP } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { validarSenha } from "@/lib/validations";

export async function POST(request: Request) {
  const rl = await checkRateLimitIP(request, 15 * 60 * 1000, 10);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
  }
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Todos os campos sao obrigatorios." }, { status: 400 });
    }

    const senha = validarSenha(password);
    if (!senha.valido) {
      return NextResponse.json({ error: senha.mensagem }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.identifier !== email.toLowerCase()) {
      return NextResponse.json({ error: "Link invalido ou expirado." }, { status: 400 });
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json({ error: "Link expirado. Solicite uma nova recuperacao." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { email: email.toLowerCase() },
        data: { password: hashedPassword },
      });

      await tx.verificationToken.deleteMany({
        where: { identifier: email.toLowerCase() },
      });
    });

    return NextResponse.json({ message: "Senha alterada com sucesso." }, { status: 200 });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
