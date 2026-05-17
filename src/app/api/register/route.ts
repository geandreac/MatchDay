import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validarCPF, validarIdade } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const { name, email, cpf, birthDate, password, role } = await request.json();

    if (!name || !email || !cpf || !birthDate || !password) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (!validarCPF(cpfLimpo)) {
      return NextResponse.json({ error: "CPF inválido." }, { status: 400 });
    }

    const idade = validarIdade(new Date(birthDate));
    if (!idade.valido) {
      return NextResponse.json({ error: idade.mensagem }, { status: 400 });
    }

    const emailExistente = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (emailExistente) {
      return NextResponse.json({ error: "Email já cadastrado." }, { status: 409 });
    }

    const cpfExistente = await prisma.user.findUnique({ where: { cpf: cpfLimpo } });
    if (cpfExistente) {
      return NextResponse.json({ error: "CPF já cadastrado." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        cpf: cpfLimpo,
        birthDate: new Date(birthDate),
        password: hashedPassword,
        role: role === "FIELD_OWNER" ? "FIELD_OWNER" : "CLIENT",
      },
    });

    return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
