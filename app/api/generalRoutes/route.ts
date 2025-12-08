import DocsService from "@/lib/docsService";
import { NextResponse } from "next/server";

const service = new DocsService();

export async function GET() {
  console.log("oi");
  const players = await service.getPlayerNames();
  return NextResponse.json({ players });
}

export async function POST(req: Request) {
  const { name } = await req.json();
  const data = await service.getPlayersChars(name);

  return NextResponse.json(data);
}
