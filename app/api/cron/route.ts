import { syncBestiario } from "@/lib/bestiarioSync";
import { NextResponse } from "next/server";

export async function GET() {
  console.log("Iniciando sincronização...");

  try {
    const result = await syncBestiario();

    console.log("result :>> ", result);

    return Response.json({
      ok: true,
      message: "Sincronização concluída",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({ error: "sync failed" }, { status: 500 });
  }
}
