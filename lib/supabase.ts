import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // importante!
);

export async function uploadImageToSupabase(
  imageUrl: string,
  fileName: string,
) {
  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();

  const { data, error } = await supabase.storage
    .from("twh-tools") // nome do bucket
    .upload(`monstros/${fileName}.png`, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error("Erro upload:", error);
    return null;
  }

  const { data: publicUrl } = supabase.storage
    .from("twh-tools")
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
