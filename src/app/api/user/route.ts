import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validarSenha } from "@/lib/validations";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { name, email, phone } = await request.json();
    const data: Record<string, string> = {};
    if (name) data.name = name;
    if (email) {
      const emailLower = email.toLowerCase();
      const existing = await prisma.user.findUnique({ where: { email: emailLower } });
      if (existing && existing.id !== session.user.id) {
        return NextResponse.json({ error: "Email já cadastrado por outro usuário." }, { status: 409 });
      }
      data.email = emailLower;
    }
    if (phone !== undefined) data.phone = phone;

    const user = await prisma.user.update({
      where: { id: session.user.id as string },
      data,
      select: { id: true, name: true, email: true, phone: true },
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar perfil." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Senha atual e nova são obrigatórias." }, { status: 400 });
    }
    const senhaCheck = validarSenha(newPassword);
    if (!senhaCheck.valido) {
      return NextResponse.json({ error: senhaCheck.mensagem }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id as string } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return NextResponse.json({ message: "Senha alterada com sucesso." });
  } catch {
    return NextResponse.json({ error: "Erro ao alterar senha." }, { status: 500 });
  }
}
