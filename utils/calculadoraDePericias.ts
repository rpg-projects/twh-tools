import { apigateway } from "googleapis/build/src/apis/apigateway";
import { BONUS_DEUSES } from "./bonusDeuses";

const PERICIAS_COMBATE = [
  "arcanismo",
  "armas brancas",
  "arqueirismo",
  "arremessáveis",
  "combate desarmado",
  "laminas curtas",
];

function normalizar(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Extrai número dentro de parênteses: (+3) → 3
function extrairBonus(str: string): number {
  const match = str.match(/\(([-+]?\d+)\)/);
  return match ? Number(match[1]) : 0;
}

// Extrai o atributo da perícia: "ARCANISMO (ESP)" → "ESP"
function extrairAtributoDaPericia(nome: string): string {
  const match = nome.match(/\((.*?)\)/);
  return match ? match[1].trim() : "";
}

// Extrai bônus principal da perícia: "0/30 (+3)" → 3
function extrairBonusPericia(valor: string): number {
  return extrairBonus(valor);
}

function extrairBonusAprim(str: string): number | null {
  if (!str) return null;

  // captura apenas números POSITIVOS dentro dos parênteses
  const match = str.match(/\((?:.*?)(\+?\d+)(?:.*?)\)/);

  if (!match) return null;

  const valor = Number(match[1]);

  // se tiver "-" em qualquer lugar da área interna → ignorar
  if (str.includes("(-") || /\(-?\d/.test(str)) return null;

  // garante que não veio zero ou negativo por engano
  if (valor <= 0) return null;

  return valor;
}

// Extrai valor total do atributo: "+8 (+2)" → 8 + 2
function extrairTotalAtributo(valor: string): number {
  const partes = valor.split(" ");
  const base = Number(partes[0]) || 0; // +8
  const bonus = extrairBonus(valor); // +2
  return base + bonus;
}

export function calcularDados({
  nomePericia,
  pericias,
  atributoAlternativo,
  atributos,
  aprimoramentos,
  nivel,
  deus,
}: {
  nomePericia: string;
  pericias: Record<string, string>; // antes era Pericia, agora string
  atributoAlternativo?: string | null;
  atributos: Record<string, string>; // antes era Atributo, agora string
  aprimoramentos: string[];
  nivel: number;
  deus: string;
}) {
  const valorPericia = pericias[nomePericia];
  if (!valorPericia) return "";

  // 1 — Atributo associado à perícia ("ESP")
  const atributoSiglaOriginal = extrairAtributoDaPericia(nomePericia);

  const atributoParaUsar = atributoAlternativo?.trim() || atributoSiglaOriginal;

  // 2 — Encontra o atributo correspondente pelo nome incluído
  // Exemplo: atributoSigla: "ESP" → pega "ESPÍRITO"
  const nomeAtributo = Object.keys(atributos).find((a) =>
    a.startsWith(atributoParaUsar)
  );

  if (!nomeAtributo) return "";

  // 3 — Extrai valores
  const totalAtributo = extrairTotalAtributo(atributos[nomeAtributo]);

  const bonusPericia = extrairBonusPericia(valorPericia);

  // 4 — Verifica aprimoramentos
  let bonusAprimoramentos = 0;
  const detalhesAprim: string[] = [];

  const nomePericiaFormatado = nomePericia
    .replace(/\(.*?\)/g, "") // remove (ESP) (FOR) etc
    .trim()
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase()); // primeira letra maiúscula

  const periciaEhDeCombate = PERICIAS_COMBATE.includes(
    nomePericiaFormatado.toLowerCase()
  );

  const totalAprimoramentos = [];
  for (const apr of aprimoramentos) {
    // Procura match por nome da perícia ou por atributo
    const contemPericia = apr
      .toLowerCase()
      .includes(nomePericiaFormatado.toLowerCase());

    const ehSobreDano = apr.toLowerCase().includes("dano");
    const ehSobreConjuracao = apr.toLowerCase().includes("conjuração");

    const EhSobrePericia = [
      apr.toLowerCase().includes("luta desarmada") &&
        nomePericiaFormatado.toLowerCase() === "combate desarmado",
      apr.toLowerCase().includes("disparo") &&
        nomePericiaFormatado.toLowerCase() === "arqueirismo",
    ];

    const contemAtributo = apr
      .toLowerCase()
      .includes(atributoParaUsar.toLowerCase());

    if (
      (contemPericia || contemAtributo || EhSobrePericia.some((i) => i)) &&
      !ehSobreDano &&
      !ehSobreConjuracao
    ) {
      const valor = extrairBonusAprim(apr);

      if (valor !== 0 && valor) {
        totalAprimoramentos.push(`${apr.split("(")[0].trim()}: ${valor} `);
        bonusAprimoramentos += valor;
        detalhesAprim.push(`${apr.trim()}: ${valor > 0 ? "+" : ""}${valor}`);
      }
    }
  }

  //4.5 - Soma da lista de deuses
  let bonusDaLista = 0;

  let totalDaLista = [];
  let listaCondicional = [];

  if (deus && BONUS_DEUSES[deus.toLowerCase().trim()]) {
    const bonusDoDeus = BONUS_DEUSES[deus.toLowerCase().trim()];

    // controla substituições
    const titulosIgnorados = new Set<string>();

    for (const bonus of bonusDoDeus) {
      if (nivel < bonus.nivelMin) continue;

      if (bonus.substitui) {
        titulosIgnorados.add(normalizar(bonus.substitui));
      }
    }

    for (const bonus of bonusDoDeus) {
      if (nivel < bonus.nivelMin) continue;

      if (titulosIgnorados.has(normalizar(bonus.titulo))) {
        continue;
      }

      const periciaNormalizada = normalizar(nomePericiaFormatado);

      const aplicaPorPericia =
        bonus.pericia &&
        (normalizar(bonus.pericia) === periciaNormalizada ||
          normalizar(bonus.pericia) === "todas");

      const aplicaPorAtaque = bonus.ataque === true && periciaEhDeCombate;

      if (!aplicaPorPericia && !aplicaPorAtaque) continue;

      bonus.condicional ? (bonusDaLista += 0) : (bonusDaLista += bonus.valor);

      bonus.condicional
        ? listaCondicional.push(
            `${bonus.titulo}: ${bonus.valor > 0 ? "+" : ""}${bonus.valor} ${
              bonus.condicional ? `(${bonus.condicional})` : ""
            }`
          )
        : totalDaLista.push(
            `${bonus.titulo}: ${bonus.valor > 0 ? "+" : ""}${bonus.valor}`
          );
    }
  }

  // 5 — Total final
  const totalFinal =
    totalAtributo + bonusPericia + bonusAprimoramentos + bonusDaLista;

  return (
    `${nomePericiaFormatado}: ${totalFinal} [` +
    `${nomeAtributo.toLowerCase()}: ${totalAtributo} | ` +
    `${nomePericiaFormatado.toLowerCase()}: ${valorPericia}` +
    (bonusAprimoramentos ? ` | ${totalAprimoramentos.join(" | ")}` : "") +
    (totalDaLista.length > 0 ? ` | ${totalDaLista.join(" | ")}]` : "]") +
    (listaCondicional.length > 0
      ? ` \n\n Extras (some à parte, se tiver) => \n ◦ ${listaCondicional.join(
          " \n ◦ "
        )}`
      : "")
  ).replace(/\s+\]/, "]");
}
