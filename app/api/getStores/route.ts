import DocsService from "@/lib/docsService";
import { NextResponse } from "next/server";

const service = new DocsService();

// GET opcional
export async function GET() {
  try {
    // Loja de Aprimoramentos (já existe)
    const response = await service.getAprimoramentosStore(
      "https://docs.google.com/document/d/1xf3dexCjCjU6Z5f65jgeRTmUcWKDPas6YBGKjIQ0NA8/preview?tab=t.0"
    );

    return NextResponse.json({ aprimoramentos: response });
  } catch (err) {
    console.error("Error in stores route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST principal
// export async function POST(req: Request) {
//   try {
//     // const { docs } = await req.json();

//     // if (!docs?.guiaJogador) {
//     //   return NextResponse.json(
//     //     { error: "Missing 'docs.guiaJogador' in request body" },
//     //     { status: 400 }
//     //   );
//     // }

//     // const response: GameStoresResponse = {
//     //   aprimoramentos: null,
//     //   conquistas: null,
//     //   itens: null,
//     //   reliquias: null,
//     //   favoresDivinos: null,
//     // };

//     // Loja de Aprimoramentos (já existe)
//     const response = await service.getAprimoramentosStore(
//       "https://docs.google.com/document/d/1xf3dexCjCjU6Z5f65jgeRTmUcWKDPas6YBGKjIQ0NA8/preview?tab=t.0"
//     );

//     console.log("response :>> ", response);

//     // Futuro:
//     // response.conquistas = await getConquistasStore(...)
//     // response.itens = await getItensStore(...)
//     // response.reliquias = await getReliquiasStore(...)
//     // response.favoresDivinos = await getFavoresDivinosStore(...)

//     return NextResponse.json(response);
//   } catch (err) {
//     console.error("Error in stores route:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
