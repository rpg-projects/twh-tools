import clientPromise from "@/lib/mongodb";
import BestiarioService from "./bestiarioServices";
import { Monstro, MonstroDB } from "@/types/monstros";

const service = new BestiarioService();

export async function syncBestiario() {
  const client = await clientPromise;
  const db = client.db();

  const collection = db.collection<MonstroDB>("bestiario");
  const dbData: MonstroDB[] = await collection.find({}).toArray();

  const dbMap = new Map(dbData.map((m) => [m.nome, m]));

  const googleData: Monstro[] = await service.getBestiarioFromGoogle(dbMap);

  const operations: any[] = [];

  for (const monstro of googleData) {
    const existing = dbMap.get(monstro.nome);

    if (!existing) {
      operations.push({
        insertOne: { document: monstro },
      });
      continue;
    }

    const { _id, updatedAt, ...existingClean } = existing;

    if (JSON.stringify(existingClean) !== JSON.stringify(monstro)) {
      operations.push({
        updateOne: {
          filter: { nome: monstro.nome },
          update: { $set: monstro },
        },
      });
    }
  }

  const googleNames = new Set(googleData.map((m) => m.nome));

  for (const monstro of dbData) {
    if (!googleNames.has(monstro.nome)) {
      operations.push({
        deleteOne: {
          filter: { nome: monstro.nome },
        },
      });
    }
  }

  if (operations.length > 0) {
    await collection.bulkWrite(operations);
  }

  return {
    totalGoogle: googleData.length,
    operations: operations.length,
  };
}
