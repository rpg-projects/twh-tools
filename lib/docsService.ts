import { getAuthService } from "./googleAuth";
import { mapearParagrafos, normalizeGoogleDocLink } from "./utils";
import {
  readCharFile,
  readCharCompleteFile,
  processarConteudoCompleto,
  getCharsHPComponents,
} from "./processors/processCharFile";
import { Char, PlayerBank } from "@/types/chars";

export default class DocsService {
  async getPlayerNames() {
    const { sheets } = await getAuthService();

    const mainSheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID!,
    });

    const sheetNames =
      mainSheet.data.sheets
        ?.filter((s) => !s.properties?.hidden)
        .map((s) => s.properties?.title!) ?? [];

    return sheetNames.slice(5, -1);
  }

  //[{ name, summer, god, level, fileLink }]
  async getPlayersChars(name: string) {
    return this.getPlayersSheet(name);
  }

  async getPlayersSheet(name: string) {
    const { sheets } = await getAuthService();

    const mainSheet = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID!,
    });

    const playerSheet = mainSheet.data.sheets?.find(
      (s) => s.properties?.title === name
    );

    if (!playerSheet) return { playerBank: {}, chars: [] };

    const data = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID!,
      ranges: [name],
      includeGridData: true,
    });

    const rows = data.data.sheets?.[0]?.data?.[0]?.rowData ?? [];

    const pontos = rows[1]?.values?.[2]?.formattedValue;
    const dracmas = rows[2]?.values?.[2]?.formattedValue;
    const kleos = rows[3]?.values?.[2]?.formattedValue;

    const playerBank = { pontos, dracmas, kleos };

    const chars: any[] = [];
    let summer = "0";
    let isInstructor = false;

    for (let i = 6; i < rows.length; i++) {
      const row = rows[i];
      if (!row?.values?.[1]) continue;

      const cell = row.values[1];
      const rawName = cell.userEnteredValue?.stringValue;
      if (!rawName) continue;

      if (rawName.startsWith("INSTRUTOR") || rawName.startsWith("INSTRUTORA")) {
        isInstructor = true;
        continue;
      }

      if (rawName.startsWith("VERÃO")) {
        summer = rawName.split(" ")[2];
        isInstructor = false;
        continue;
      }

      let name = rawName.endsWith("*") ? rawName.split(" *")[0] : rawName;

      let fileLink = undefined;

      if (cell.hyperlink) fileLink = normalizeGoogleDocLink(cell.hyperlink);
      if (cell.textFormatRuns?.[0]?.format?.link?.uri)
        fileLink = cell.textFormatRuns[0].format.link.uri;

      chars.push({
        summer,
        name,
        fileLink,
        god: row.values[2]?.userEnteredValue?.stringValue ?? "",
        level: row.values[3]?.userEnteredValue?.numberValue ?? 0,
      });
    }

    return { playerBank, chars };
  }

  async getCharsFilesByPlayer(name: string, chars: Char[]) {
    const { docs } = await getAuthService();

    const charsArray = typeof chars === "string" ? JSON.parse(chars) : chars;

    const promises = charsArray.map(async (char: Char) => {
      if (!char.fileLink) {
        return { ...char, avatar: "", alignment: "", age: 0, origin: "" };
      }

      try {
        const documentId = char.fileLink.split("/d/")[1].split("/")[0];

        const docData = await docs.documents.get({ documentId });
        const doc = docData.data;

        const { origin, alignment, age, avatar, nascimento } =
          await readCharFile(doc);

        return { ...char, origin, alignment, age, avatar, nascimento };
      } catch (error: any) {
        console.error(error.message);
        return { ...char, avatar: "", alignment: "", age: 0, origin: "" };
      }
    });

    return await Promise.all(promises);
  }

  async getCompleteFile(name: string, char: Char) {
    const { docs } = await getAuthService();

    // const charsArray = typeof chars === "string" ? JSON.parse(chars) : chars;

    if (!char.fileLink) {
      return { ...char, avatar: "", alignment: "", age: 0, origin: "" };
    }

    try {
      const documentId = char.fileLink.split("/d/")[1].split("/")[0];
      const docData = await docs.documents.get({ documentId });
      const doc = docData.data;

      const {
        hp,
        dp,
        de,
        origin,
        alignment,
        age,
        avatar,
        atributos,
        // bifurcacoes,
        pericias,
        aprimoramentos,
        equipamentos,
        itens,
      } = await readCharCompleteFile(doc);

      return {
        ...char,
        hp,
        dp,
        de,
        origin,
        alignment,
        age,
        avatar,
        atributos,
        // bifurcacoes,
        pericias,
        aprimoramentos: aprimoramentos.map((a) => a.slice(1)),
        equipamentos,
        itens,
      };
    } catch (error: any) {
      console.error(error.message);
      return { ...char, avatar: "", alignment: "", age: 0, origin: "" };
    }
  }

  async searchInDoc(fileLink: string, termo: string) {
    const { docs } = await getAuthService();

    // Extrai ID do documento
    const documentId = fileLink.split("/d/")[1]?.split("/")[0];
    if (!documentId) throw new Error("ID do documento inválido.");

    const docData = await docs.documents.get({ documentId });
    const doc = docData.data;

    // converte o conteúdo do Docs em uma lista de parágrafos
    const { paragrafos } = processarConteudoCompleto(doc.body?.content || []);

    // Busca simples (pode melhorar depois com regex, score etc.)
    const termoLower = termo.toLowerCase();

    for (const p of paragrafos) {
      if (p.toLowerCase().includes(termoLower)) {
        return {
          found: true,
          paragraph: p,
        };
      }
    }

    return {
      found: false,
      paragraph: null,
    };
  }

  parseAtributo(valor: string | undefined): number {
    if (!valor) return 0;

    // pega somente o primeiro número encontrado (com + ou -)
    const match = valor.match(/[+-]?\d+/);
    return match ? Number(match[0]) : 0;
  }

  getVigorBonus(aprimoramentos: string[]): number {
    for (const a of aprimoramentos) {
      // remove o "● " do começo e deixa minúsculo
      const clean = a.replace("● ", "").trim().toLowerCase();

      if (clean.includes("vigor")) {
        // extrai o número dentro de "(+10 HP)"
        const match = a.match(/\+?(\d+)\s*hp/i);
        return match ? Number(match[1]) : 0;
      }
    }

    return 0; // não encontrou vigor
  }

  calcularHP({
    god,
    level,
    CON,
    ESP,
    vigorBonus,
    possuiResilienciaMortal,
  }: {
    god: string;
    level: number;
    CON: number;
    ESP: number;
    vigorBonus: number;
    possuiResilienciaMortal: boolean;
  }): number {
    const godLower = god.toLowerCase();

    // ⭐ REGRA 1 — Nêmesis nível ≥ 5
    if (godLower === "nêmesis" && level >= 5) {
      return (10 + CON + ESP) * 2 + (level - 1) * (5 + CON) + vigorBonus;
    }

    // ⭐ REGRA 2 — Thanatos ≥ 3
    if (godLower === "thanatos" && level >= 3 && !possuiResilienciaMortal) {
      return (10 + CON) * 2 + (level - 1) * (5 + CON + ESP / 2) + vigorBonus;
    }

    // ⭐ REGRA 3 — Thanatos com Resiliência Mortal
    if (godLower === "thanatos" && possuiResilienciaMortal) {
      return (10 + CON) * 2 + (level - 1) * (5 + CON + ESP) + vigorBonus;
    }

    console.log("CON :>> ", CON);
    console.log("level :>> ", level);
    console.log("vigorBonus :>> ", vigorBonus);

    // ⭐ REGRA 4 — Qualquer outro char
    return (10 + CON) * 2 + (level - 1) * (5 + CON) + vigorBonus;
  }

  async checkHPErrors(char: Char) {
    const { docs } = await getAuthService();

    // const charsArray = typeof chars === "string" ? JSON.parse(chars) : chars;

    if (!char.fileLink) {
      return { ...char, avatar: "", alignment: "", age: 0, origin: "" };
    }

    try {
      const documentId = char.fileLink.split("/d/")[1].split("/")[0];
      const docData = await docs.documents.get({ documentId });
      const doc = docData.data;

      console.log("char.name :>> ", char.name);
      const { hp, dp, de, atributos, bifurcacoes, aprimoramentos } =
        await getCharsHPComponents(doc);

      const baseHp = Number(hp.split(" ")[0]);

      const CONS = this.parseAtributo(atributos["CONSTITUIÇÃO"]);
      const ESP = this.parseAtributo(atributos["ESPÍRITO"]);

      console.log("aprimoramentos :>> ", aprimoramentos);
      const vigorBonus = this.getVigorBonus(aprimoramentos);

      const hasResilienciaMortal =
        char.god.toLowerCase() === "thanatos" &&
        bifurcacoes.some((b: string) =>
          b.toLowerCase().includes("resiliência mortal")
        );

      const hpCorreto = this.calcularHP({
        god: char.god,
        level: char.level,
        CON: CONS,
        ESP: ESP,
        vigorBonus,
        possuiResilienciaMortal: hasResilienciaMortal,
      });

      return {
        hasErrors: baseHp !== hpCorreto,
        hpAtual: baseHp,
        hpCorreto,
        charName: char.name,
        fileLink: char.fileLink,
      };
    } catch (error: any) {
      console.error(error.message);
      return { ...char, avatar: "", alignment: "", age: 0, origin: "" };
    }
  }
}

//name, summer, god, level, fileLink
// async getPlayersChars(name: string) {
//   const { docs } = await getAuthService();

//   const { chars } = await this.getPlayersSheet(name);

//   console.log("chars :>> ", chars);

//   return chars;

//   const promises = chars.map(async (char) => {
//     if (!char.fileLink) {
//       return { ...char, avatar: "", alignment: "", age: 0, origin: "" };
//     }

//     try {
//       const documentId = char.fileLink.split("/d/")[1].split("/")[0];
//       console.time(`doc-${char.name}`);
//       const docData = await docs.documents.get({ documentId });
//       console.timeEnd(`doc-${char.name}`);
//       const doc = docData.data;

//       const { origin, alignment, age, avatar } = await readCharFile(doc);

//       return { ...char, origin, alignment, age, avatar };
//     } catch (error: any) {
//       console.error(error.message);
//       return { ...char, avatar: "", alignment: "", age: 0, origin: "" };
//     }
//   });

//   return await Promise.all(promises);
// }
