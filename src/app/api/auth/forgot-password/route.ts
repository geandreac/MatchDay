import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimitIP } from "@/lib/rate-limit";
import crypto from "crypto";

export async function POST(request: Request) {
  const rl = await checkRateLimitIP(request, 15 * 60 * 1000, 5);
  if (!rl.allowed) {
    return NextResponse.json(
      { message: "Se o email existir, um link de recuperacao foi enviado." },
      { status: 200 },
    );
  }
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ message: "Se o email existir, um link de recuperacao foi enviado." }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ message: "Se o email existir, um link de recuperacao foi enviado." }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    console.log(`[PasswordReset] Link para ${user.email}: ${resetUrl}`);

    return NextResponse.json({ message: "Se o email existir, um link de recuperacao foi enviado." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
