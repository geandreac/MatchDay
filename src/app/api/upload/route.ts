import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadFieldPhoto } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const { fieldId, photos } = await request.json();

    if (!fieldId || !photos || !Array.isArray(photos) || photos.length > 8) {
      return NextResponse.json({ error: "Máximo de 8 fotos por campo." }, { status: 400 });
    }

    const field = await prisma.field.findFirst({
      where: { id: fieldId, ownerId: session.user.id as string },
    });

    if (!field) {
      return NextResponse.json({ error: "Campo não encontrado." }, { status: 404 });
    }

    const urls: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      const url = await uploadFieldPhoto(fieldId, photos[i], i);
      urls.push(url);
    }

    await prisma.$transaction(async (tx) => {
      await tx.fieldPhoto.deleteMany({ where: { fieldId } });
      for (let i = 0; i < urls.length; i++) {
        await tx.fieldPhoto.create({
          data: { fieldId, url: urls[i], position: i },
        });
      }
    });

    return NextResponse.json({ photos: urls }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro ao fazer upload." }, { status: 500 });
  }
}
