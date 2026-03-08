import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { MonstroDB } from "@/types/monstros";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    const monstros = await db
      .collection<MonstroDB>("bestiario")
      .find({})
      .sort({ nome: 1 })
      .toArray();

    return NextResponse.json(monstros);
  } catch (err) {
    console.error("Error fetching bestiario:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
