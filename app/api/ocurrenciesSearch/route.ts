// app/api/docs/search/route.ts
import { NextResponse } from "next/server";
import DocsService from "@/lib/docsService";

const service = new DocsService();

export async function POST(req: Request) {
  try {
    const { fileLink, termo } = await req.json();

    if (!fileLink || !termo) {
      return NextResponse.json(
        { error: "Envie fileLink e termo." },
        { status: 400 }
      );
    }

    const data = await service.searchInDoc(fileLink, termo);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("ERRO NO POST /api/docs/search:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
