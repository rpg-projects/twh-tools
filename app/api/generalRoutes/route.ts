import DocsService from "@/lib/docsService";
import { NextResponse } from "next/server";

const service = new DocsService();

export async function GET() {
  try {
    const players = await service.getPlayerNames();
    return NextResponse.json({ players });
  } catch (err) {
    console.error("ERRO NO GET /api/generalRoutes:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const data = await service.getPlayersChars(name);

  return NextResponse.json(data);
}
