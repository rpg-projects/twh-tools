import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("dev_db");

  console.log("Iniciando sincronização...");

  // exemplo de dados (depois você troca pela API real)
  //   const dados = [
  //     { slug: "minotauro", nome: "Minotauro" },
  //     { slug: "medusa", nome: "Medusa" },
  //   ];

  //   for (const item of dados) {
  //     await db
  //       .collection("conteudos")
  //       .updateOne({ slug: item.slug }, { $set: item }, { upsert: true });
  //   }

  return Response.json({
    ok: true,
    message: "Sincronização concluída",
  });
}
