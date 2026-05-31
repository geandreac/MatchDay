import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

function getAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !key) {
    throw new Error("SUPABASE_URL or SUPABASE_SERVICE_ROLE not configured");
  }
  adminClient = createClient(url, key);
  return adminClient;
}

const VALID_IMAGE_HEADERS: Record<string, string> = {
  "89504e47": "image/png",
  "ffd8ffe0": "image/jpeg",
  "ffd8ffe1": "image/jpeg",
  "ffd8ffe2": "image/jpeg",
  "52494646": "image/webp",
};

function detectMimeFromBase64(base64: string): string | null {
  const raw = base64.split(",")[1] ?? base64;
  const buffer = Buffer.from(raw, "base64");
  const header = buffer.slice(0, 4).toString("hex");
  for (const [prefix, mime] of Object.entries(VALID_IMAGE_HEADERS)) {
    if (header.startsWith(prefix)) return mime;
  }
  return null;
}

function getExtension(mime: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
  };
  return map[mime] ?? "png";
}

export async function uploadFieldPhoto(
  fieldId: string,
  fileBase64: string,
  index: number
): Promise<string> {
  const raw = fileBase64.split(",")[1] ?? fileBase64;
  const buffer = Buffer.from(raw, "base64");

  const mime = detectMimeFromBase64(fileBase64);
  if (!mime) {
    throw new Error("Formato de imagem invalido. Use PNG, JPEG ou WebP.");
  }

  const ext = getExtension(mime);
  const fileName = `fields/${fieldId}/${index}-${Date.now()}.${ext}`;

  const client = getAdminClient();
  const { error } = await client.storage
    .from("matchday")
    .upload(fileName, buffer, {
      contentType: mime,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/matchday/${fileName}`;

  return publicUrl;
}
