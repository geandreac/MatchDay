import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadFieldPhoto(
  fieldId: string,
  fileBase64: string,
  index: number
): Promise<string> {
  const buffer = Buffer.from(fileBase64.split(",")[1] ?? fileBase64, "base64");
  const fileName = `fields/${fieldId}/${index}-${Date.now()}.png`;

  const { data, error } = await supabase.storage
    .from("matchday")
    .upload(fileName, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage
    .from("matchday")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
