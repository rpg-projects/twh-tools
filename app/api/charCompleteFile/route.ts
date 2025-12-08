import DocsService from "@/lib/docsService";
import { NextResponse } from "next/server";

const service = new DocsService();

export async function GET() {
  const players = await service.getPlayerNames();
  return NextResponse.json({ players });
}

export async function POST(req: Request) {
  const { name, char } = await req.json();
  const data = await service.getCompleteFile(name, char);

  return NextResponse.json(data);
}
