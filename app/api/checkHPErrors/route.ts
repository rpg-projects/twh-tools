// app/api/docs/search/route.ts
import { NextResponse } from "next/server";
import DocsService from "@/lib/docsService";

const service = new DocsService();

export async function POST(req: Request) {
  try {
    const { char } = await req.json();

    if (!char) {
      return NextResponse.json({ error: "Envie o char." }, { status: 400 });
    }

    const data = await service.checkHPErrors(char);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("ERRO NO POST /api/docs/search:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
