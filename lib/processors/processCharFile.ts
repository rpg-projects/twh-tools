import { mapearParagrafos, parseDateAndGetAge } from "../utils";

export function processarConteudo(contentArray: any[]): {
  paragrafos: string[];
  images: string[];
} {
  const paragrafos: string[] = [];
  const images: string[] = [];
  let interromper = false;

  function processar(content: any) {
    if (!content || interromper) return;

    if (content.paragraph && content.endIndex - content.startIndex !== 1) {
      let texto = "";
      for (const el of content.paragraph.elements) {
        if (el.textRun?.content) texto += el.textRun.content;
        if (el.inlineObjectElement?.inlineObjectId) {
          images.push(el.inlineObjectElement.inlineObjectId);
        }
      }

      const textoTrimado = texto.trim();
      if (textoTrimado) {
        if (textoTrimado === "ATRIBUTOS") {
          interromper = true;
          return;
        }
        paragrafos.push(textoTrimado);
      }
    }

    if (content.table) {
      for (const row of content.table.tableRows) {
        if (interromper) return;
        for (const cell of row.tableCells) {
          for (const subContent of cell.content) {
            processar(subContent);
          }
        }
      }
    }

    if (Array.isArray(content)) {
      for (const item of content) {
        processar(item);
      }
    }
  }

  for (const content of contentArray) {
    if (interromper) break;
    if (content.endIndex - content.startIndex !== 1) {
      processar(content);
    }
  }

  return { paragrafos, images };
}

export async function readCharFile(doc: any) {
  const contentArray = doc.body.content;
  const inlineObjects = doc.inlineObjects || {};

  const { paragrafos, images } = processarConteudo(contentArray);

  const mapa = mapearParagrafos(paragrafos);
  if (mapa["-"]) {
    // ADES vai para perícias porque está no valor de "-"
    mapa["ADESTRAMENTO (CAR)"] = mapa["-"];
    delete mapa["-"];
  }

  const origin = mapa["CIDADE NATAL"] || "";
  const alignment = mapa["ALINHAMENTO"] || "";
  const nascimento = mapa["NASCIMENTO"] || "";
  const age = parseDateAndGetAge(nascimento, "21/07/2022");

  const avatar =
    [...images]
      .reverse()
      .map(
        (id) =>
          inlineObjects[id]?.inlineObjectProperties?.embeddedObject
            ?.imageProperties?.contentUri || null
      )
      .find((uri) => uri !== null) || "";

  return { origin, alignment, age, avatar, nascimento };
}

export function processarConteudoCompleto(contentArray: any[]): {
  paragrafos: string[];
  images: string[];
} {
  const paragrafos: string[] = [];
  const images: string[] = [];
  // let interromper = false;

  function processar(content: any) {
    // if (!content || interromper) return;

    if (content.paragraph && content.endIndex - content.startIndex !== 1) {
      let texto = "";
      for (const el of content.paragraph.elements) {
        if (el.textRun?.content) texto += el.textRun.content;
        if (el.inlineObjectElement?.inlineObjectId) {
          images.push(el.inlineObjectElement.inlineObjectId);
        }
      }

      const textoTrimado = texto.trim();
      if (textoTrimado) {
        // if (textoTrimado === "ATRIBUTOS") {
        //   interromper = true;
        //   return;
        // }
        paragrafos.push(textoTrimado);
      }
    }

    if (content.table) {
      for (const row of content.table.tableRows) {
        // if (interromper) return;
        for (const cell of row.tableCells) {
          for (const subContent of cell.content) {
            processar(subContent);
          }
        }
      }
    }

    if (Array.isArray(content)) {
      for (const item of content) {
        processar(item);
      }
    }
  }

  for (const content of contentArray) {
    // if (interromper) break;
    if (content.endIndex - content.startIndex !== 1) {
      processar(content);
    }
  }

  return { paragrafos, images };
}

// export async function readCharCompleteFile(doc: any) {
//   const contentArray = doc.body.content;
//   const inlineObjects = doc.inlineObjects || {};

//   const { paragrafos, images } = processarConteudoCompleto(contentArray);

//   const mapa = mapearParagrafos(paragrafos);
//   console.log("mapa :>> ", mapa);
//   const origin = mapa["CIDADE NATAL"] || "";
//   const alignment = mapa["ALINHAMENTO"] || "";
//   const nascimento = mapa["NASCIMENTO"] || "";
//   const age = parseDateAndGetAge(nascimento, "21/07/2020");

//   // função genérica para percorrer o mapa encadeado
//   function extrairSecao(
//     mapa: Record<string, string>,
//     inicio: string,
//     fimOpcional?: string[]
//   ): string[] {
//     const resultado: string[] = [];
//     let atual = inicio;

//     while (atual && (!fimOpcional || !fimOpcional.includes(atual))) {
//       const proximo = mapa[atual];
//       if (!proximo) break;

//       // inclui valores "úteis" (como +n, ●, textos)
//       if (
//         !Object.keys(mapa).includes(proximo) ||
//         proximo.includes("(") ||
//         proximo.startsWith("●") ||
//         /\d/.test(proximo)
//       ) {
//         resultado.push(proximo);
//       } else if (
//         ![
//           "ATRIBUTOS",
//           "BIFURCAÇÕES",
//           "ADESTRAMENTO (CAR)",
//           "APRIMORAMENTOS",
//           "EQUIPAMENTOS",
//           "ITENS",
//         ].includes(proximo)
//       ) {
//         resultado.push(proximo);
//       }

//       atual = proximo;
//     }

//     return resultado;
//   }

//   // extrai cada seção
//   const atributos = extrairSecao(mapa, "FORÇA", ["CARISMA"]);
//   const bifurcacoes = extrairSecao(mapa, "BIFURCAÇÕES", ["ADESTRAMENTO (CAR)"]);
//   const pericias = extrairSecao(mapa, "ADESTRAMENTO (CAR)", ["APRIMORAMENTOS"]);
//   const aprimoramentos = extrairSecao(mapa, "APRIMORAMENTOS", ["EQUIPAMENTOS"]);
//   const equipamentos = extrairSecao(mapa, "EQUIPAMENTOS", ["ITENS"]);
//   const itens = extrairSecao(mapa, "ITENS", ["EXTRAS"]);

//   const avatar =
//     [...images]
//       .reverse()
//       .map(
//         (id) =>
//           inlineObjects[id]?.inlineObjectProperties?.embeddedObject
//             ?.imageProperties?.contentUri || null
//       )
//       .find((uri) => uri !== null) || "";

//   return {
//     origin,
//     alignment,
//     age,
//     avatar,
//     atributos,
//     bifurcacoes,
//     pericias,
//     aprimoramentos,
//     equipamentos,
//     itens,
//   };
// }

function extrairAtributos(
  mapa: Record<string, string>
): Record<string, string> {
  const chaves = [
    "FORÇA",
    "DESTREZA",
    "ESPÍRITO",
    "CONSTITUIÇÃO",
    "INTELIGÊNCIA",
    "CARISMA",
  ];
  const resultado: Record<string, string> = {};

  for (let i = 0; i < chaves.length; i++) {
    const chave = chaves[i];
    let valor = mapa[chave];

    // seguir o encadeamento até encontrar algo que contenha número ou '+'
    while (valor && Object.keys(mapa).includes(valor)) {
      if (/[+\d]/.test(valor)) break;
      valor = mapa[valor];
    }

    if (valor) resultado[chave] = valor;
  }

  return resultado;
}

function extrairPericias(mapa: Record<string, string>): Record<string, string> {
  const chaves = [
    "ADESTRAMENTO (CAR)",
    "ARCANISMO (ESP)",
    "ARMAS BRANCAS (FOR)",
    "ARQUEIRISMO (DES)",
    "ARREMESSÁVEIS (DES)",
    "ATLETISMO (FOR)",
    "BOTÂNICA (INT)",
    "COMBATE DESARMADO (FOR)",
    "COMPUTAÇÃO (INT)",
    "CONDUÇÃO (DES)",
    "ENGANAÇÃO (CAR)",
    "FURTIVIDADE (DES)",
    "HISTÓRIA (INT)",
    "INTIMIDAÇÃO (CAR)",
    "INTUIÇÃO (ESP)",
    "INVESTIGAÇÃO (INT)",
    "LÂMINAS CURTAS (DES)",
    "LINGUAGENS (INT)",
    "MECÂNICA (INT)",
    "MEDICINA (INT)",
    "OFÍCIOS (INT)",
    "PERCEPÇÃO (INT)",
    "PERFORMANCE (CAR)",
    "PERSUASÃO (CAR)",
    "PRESTIDIGITAÇÃO (DES)",
    "RELIGIÃO (ESP)",
    "SOBREVIVÊNCIA (INT)",
  ];

  const resultado: Record<string, string> = {};

  for (const chave of chaves) {
    let valor = mapa[chave];

    // seguir o encadeamento até encontrar algo que contenha números ou barra (ex: 0/30)
    while (valor && Object.keys(mapa).includes(valor)) {
      if (/\d+\/\d+/.test(valor)) break;
      valor = mapa[valor];
    }

    if (valor) resultado[chave] = valor;
  }

  return resultado;
}

// função para extrair pares chave-valor
function extrairSecaoMap(
  mapa: Record<string, string>,
  inicio: string,
  fimOpcional?: string[]
): Record<string, string> {
  const resultado: Record<string, string> = {};
  let atual = inicio;

  while (atual && (!fimOpcional || !fimOpcional.includes(atual))) {
    const proximo = mapa[atual];
    if (!proximo) break;

    // considera pares chave-valor
    if (
      !Object.keys(mapa).includes(proximo) ||
      proximo.includes("(") ||
      proximo.startsWith("●") ||
      /\d/.test(proximo)
    ) {
      resultado[atual] = proximo;
    } else if (
      ![
        "ATRIBUTOS",
        "BIFURCAÇÕES",
        "ADESTRAMENTO (CAR)",
        "APRIMORAMENTOS",
        "EQUIPAMENTOS",
        "ITENS",
      ].includes(proximo)
    ) {
      resultado[atual] = proximo;
    }

    atual = proximo;
  }

  return resultado;
}

// função para extrair lista de valores simples (para bifurcações, aprimoramentos, equipamentos, itens)
function extrairSecaoList(
  mapa: Record<string, string>,
  inicio: string,
  fimOpcional?: string[]
): string[] {
  const resultado: string[] = [];
  let atual = inicio;

  while (atual && (!fimOpcional || !fimOpcional.includes(atual))) {
    const proximo = mapa[atual];
    if (!proximo) break;

    if (proximo && !Object.keys(mapa).includes(proximo)) {
      resultado.push(proximo);
    } else if (
      ![
        "ATRIBUTOS",
        "BIFURCAÇÕES",
        "ADESTRAMENTO (CAR)",
        "APRIMORAMENTOS",
        "EQUIPAMENTOS",
        "ITENS",
      ].includes(proximo)
    ) {
      resultado.push(proximo);
    }

    atual = proximo;
  }

  return resultado;
}

function extrairBifurcacoes(mapa: Record<string, string>): string[] {
  function extrairBloco(inicio: string): string[] {
    const bloco: string[] = [inicio]; // adiciona o início
    let atual = inicio;

    while (atual) {
      const proximo = mapa[atual];
      if (!proximo || proximo === "ADESTRAMENTO (CAR)") break;

      bloco.push(proximo);
      atual = proximo;
    }

    return bloco;
  }

  const blocoII = extrairBloco("NÍVEL II");
  const blocoVI = extrairBloco("NÍVEL VI");

  return [...blocoII, ...blocoVI];
}

export async function readCharCompleteFile(doc: any) {
  const contentArray = doc.body.content;
  const inlineObjects = doc.inlineObjects || {};

  const { paragrafos, images } = processarConteudoCompleto(contentArray);
  const mapa = mapearParagrafos(paragrafos);

  const hp = mapa["PTS. VIDA"] || "";
  const dp = mapa["DEF. PAS."] || "";
  const de = mapa["DEF. ESP."] || "";

  const origin = mapa["CIDADE NATAL"] || "";
  const alignment = mapa["ALINHAMENTO"] || "";
  const nascimento = mapa["NASCIMENTO"] || "";
  const age = parseDateAndGetAge(nascimento, "21/07/2020");

  const atributos = extrairAtributos(mapa);
  const bifurcacoes = extrairBifurcacoes(mapa);
  const pericias = extrairPericias(mapa);
  const aprimoramentos = extrairSecaoList(mapa, "APRIMORAMENTOS", [
    "EQUIPAMENTOS",
  ]).slice(0, -1);
  const equipamentos = extrairSecaoList(mapa, "EQUIPAMENTOS", ["ITENS"]);
  const itens = extrairSecaoList(mapa, "ITENS", ["EXTRAS"]);

  const avatar =
    [...images]
      .reverse()
      .map(
        (id) =>
          inlineObjects[id]?.inlineObjectProperties?.embeddedObject
            ?.imageProperties?.contentUri || null
      )
      .find((uri) => uri !== null) || "";

  return {
    hp,
    dp,
    de,
    origin,
    alignment,
    age,
    avatar,
    atributos,
    bifurcacoes,
    pericias,
    aprimoramentos,
    equipamentos,
    itens,
  };
}

export async function getCharsHPComponents(doc: any) {
  const contentArray = doc.body.content;

  const { paragrafos } = processarConteudoCompleto(contentArray);
  const mapa = mapearParagrafos(paragrafos);

  const hp = mapa["PTS. VIDA"] || "";
  // const dp = mapa["DEF. PAS."] || "";
  // const de = mapa["DEF. ESP."] || "";

  const atributos = extrairAtributos(mapa);
  const bifurcacoes = extrairBifurcacoes(mapa);

  const aprimoramentos = extrairSecaoList(mapa, "APRIMORAMENTOS", [
    "EQUIPAMENTOS",
  ]);

  return {
    hp,
    atributos,
    bifurcacoes,
    aprimoramentos,
  };
}
