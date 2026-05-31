import { NextResponse } from "next/server";
import { checkRateLimitIP } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = await checkRateLimitIP(request, 60 * 60 * 1000, 5);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Muitas requisições. Tente novamente mais tarde." }, { status: 429 });
  }

  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
    }

    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    if (name.length > 200 || email.length > 200 || message.length > 2000) {
      return NextResponse.json({ error: "Dados excedem o limite de caracteres." }, { status: 400 });
    }

    // TODO: Integrar com serviço de email (SendGrid, Resend, etc.)
    console.log(`[Contact] ${name} <${email}>: ${message}`);

    return NextResponse.json({ message: "Mensagem enviada com sucesso!" });
  } catch {
    return NextResponse.json({ error: "Erro ao enviar mensagem." }, { status: 500 });
  }
}
