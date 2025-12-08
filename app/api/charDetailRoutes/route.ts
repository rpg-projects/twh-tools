import DocsService from "@/lib/docsService";
import { CompleteChar } from "@/types/chars";
import { NextResponse } from "next/server";

const service = new DocsService();

// GET opcional
export async function GET() {
  return NextResponse.json({ ok: true });
}

// POST principal
export async function POST(req: Request) {
  try {
    const { name, chars } = await req.json();

    if (!name || !chars) {
      return NextResponse.json(
        { error: "Missing 'name' in request body" },
        { status: 400 }
      );
    }

    const data: CompleteChar[] = await service.getCharsFilesByPlayer(
      name,
      chars
    );

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error in playerCharsDetails:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
