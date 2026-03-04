import { Monstro } from "@/types/monstros";
import { getAuthService } from "./googleAuth";
import { processarConteudo } from "./processors/processCharFile";

export default class BestiarioService {
  extrairSecaoBestiario(paragrafos: string[], inicio: string, fim?: string) {
    const startIndex = paragrafos.findIndex((p) =>
      p.toUpperCase().includes(inicio.toUpperCase()),
    );

    if (startIndex === -1) return [];

    const endIndex = fim
      ? paragrafos.findIndex(
          (p, i) =>
            i > startIndex && p.toUpperCase().includes(fim.toUpperCase()),
        )
      : -1;

    return paragrafos.slice(startIndex, endIndex !== -1 ? endIndex : undefined);
  }

  parseMonstros(raw: string[]) {
    const monstros: any[] = [];
    let i = 0;

    while (i < raw.length) {
      if (!raw[i] || raw[i].trim() === "") {
        i++;
        continue;
      }

      const nome = raw[i];
      i++;

      const monstro: any = {
        nome,
        encontradoEm: "",
        rank: "",
        temperamento: "",
        espolios: "",
        fraquezas: "",
        racionalidade: "",
        graus: [],
        descricao: "",
        habilidades: [],
      };

      while (i < raw.length) {
        const linha = raw[i];

        // Se encontrou próximo monstro (nome novo seguido de ENCONTRADO EM:)
        if (raw[i + 1] === "ENCONTRADO EM:" && linha !== "HABILIDADES") {
          break;
        }

        if (linha === "ENCONTRADO EM:") {
          monstro.encontradoEm = raw[i + 1] ?? "";
          i += 2;
          continue;
        }

        if (linha === "RANK:") {
          monstro.rank = raw[i + 1] ?? "";
          i += 2;
          continue;
        }

        if (linha === "TEMPERAMENTO:") {
          monstro.temperamento = raw[i + 1] ?? "";
          i += 2;
          continue;
        }

        if (linha === "ESPÓLIOS:") {
          monstro.espolios = raw[i + 1] ?? "";
          i += 2;
          continue;
        }

        if (linha === "FRAQUEZAS:") {
          monstro.fraquezas = raw[i + 1] ?? "";
          i += 2;
          continue;
        }

        if (linha === "RACIONALIDADE:") {
          monstro.racionalidade = raw[i + 1] ?? "";
          i += 2;
          continue;
        }

        // GRAUS
        // if (linha.startsWith("GRAU")) {
        //   const grau = Number(linha.split(" ")[1]);
        //   i++;

        //   let batalha = "-";
        //   let atributos = "-";

        //   // batalha
        //   if (
        //     i < raw.length &&
        //     !raw[i].startsWith("GRAU") &&
        //     !raw[i].startsWith("DESCRIÇÃO") &&
        //     raw[i] !== "HABILIDADES"
        //   ) {
        //     batalha = raw[i];
        //     i++;
        //   }

        //   // atributos
        //   if (
        //     i < raw.length &&
        //     !raw[i].startsWith("GRAU") &&
        //     !raw[i].startsWith("DESCRIÇÃO") &&
        //     raw[i] !== "HABILIDADES"
        //   ) {
        //     atributos = raw[i];
        //     i++;
        //   }

        //   monstro.graus.push({
        //     grau,
        //     batalha,
        //     atributos,
        //   });

        //   continue;
        // }

        if (linha.startsWith("GRAU")) {
          const grauNumero = Number(linha.split(" ")[1]);
          i++;

          // Verifica se já adicionamos esse grau para este monstro
          let grauExistente = monstro.graus.find(
            (g: Monstro["graus"][number]) => g.grau === grauNumero,
          );

          let info = "-";
          if (
            i < raw.length &&
            !raw[i].startsWith("GRAU") &&
            !raw[i].startsWith("DESCRIÇÃO") &&
            raw[i] !== "HABILIDADES"
          ) {
            info = raw[i];
            i++;
          }

          if (grauExistente) {
            // Se o grau já existe, a segunda vez que ele aparece é o "Atributos para Testes"
            grauExistente.atributos = info;
          } else {
            // Se é a primeira vez, é o atributo de "Batalha"
            monstro.graus.push({
              grau: grauNumero,
              batalha: info,
              atributos: "-", // Inicializa vazio para ser preenchido na próxima iteração do GRAU X
            });
          }

          continue;
        }

        // DESCRIÇÃO
        if (linha.startsWith("DESCRIÇÃO")) {
          i++;
          let descricao = "";

          while (
            i < raw.length &&
            raw[i]?.trim().toUpperCase() !== "HABILIDADES"
          ) {
            descricao += raw[i] + " ";
            i++;
          }

          monstro.descricao = descricao.trim();
          continue;
        }

        // HABILIDADES
        if (linha === "HABILIDADES") {
          i++;

          while (
            i < raw.length &&
            raw[i + 1] &&
            raw[i + 1].startsWith("HABILIDADE")
          ) {
            const nomeHab = raw[i];
            const tipo = raw[i + 1];
            const descricao = raw[i + 2] ?? "";

            monstro.habilidades.push({
              nome: nomeHab,
              tipo,
              descricao,
            });

            i += 3;
          }

          continue;
        }

        i++;
      }

      monstros.push(monstro);
    }

    return monstros;
  }

  async getMonstrosFromFile(
    fileLink: string,
    palavraInicioSecao: string,
    docs: any,
  ): Promise<Monstro[]> {
    const documentId = fileLink.split("/d/")[1]?.split("/")[0];
    if (!documentId) throw new Error("Link de documento inválido");

    const docData = await docs.documents.get({
      documentId,
      fields: "body,inlineObjects",
    });
    const content = docData.data.body?.content || [];
    const inlineObjects = docData.data.inlineObjects || {};

    let { paragrafos, images } = processarConteudo(content);

    let monstros = this.extrairSecaoBestiario(paragrafos, palavraInicioSecao);
    const result = this.parseMonstros(monstros);

    // const imagensResolvidas = images
    //   .map(
    //     (id) =>
    //       inlineObjects[id]?.inlineObjectProperties?.embeddedObject
    //         ?.imageProperties?.contentUri || null,
    //   )
    //   .filter((uri): uri is string => Boolean(uri))
    //   .slice(1);

    // const monstrosComImagem = result.map((m, index) => ({
    //   ...m,
    //   imagem: imagensResolvidas[index] ?? null,
    // }));
    const monstrosComImagem = result.map((monstro, index) => {
      const imageId = images[index + 1]; // +1 pula a capa
      return {
        ...monstro,
        imagem:
          inlineObjects[imageId]?.inlineObjectProperties?.embeddedObject
            ?.imageProperties?.contentUri || null,
      };
    });

    return monstrosComImagem;
  }
}
