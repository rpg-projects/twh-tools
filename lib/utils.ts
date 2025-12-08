export function parseDateAndGetAge(
  birthStr: string,
  referenceStr: string
): number {
  const [birthDay, birthMonth, birthYear] = birthStr.split("/").map(Number);
  const [refDay, refMonth, refYear] = referenceStr.split("/").map(Number);

  const birthDate = new Date(birthYear, birthMonth - 1, birthDay);
  const referenceDate = new Date(refYear, refMonth - 1, refDay);

  let age = refYear - birthYear;

  const birthdayPassed =
    refMonth > birthMonth || (refMonth === birthMonth && refDay >= birthDay);

  if (!birthdayPassed) age--;

  return age;
}

export function mapearParagrafos(paragrafos: string[]): Record<string, string> {
  const mapa: Record<string, string> = {};
  for (let i = 0; i < paragrafos.length - 1; i++) {
    mapa[paragrafos[i]] = paragrafos[i + 1];
  }
  return mapa;
}

export function normalizeGoogleDocLink(link: string): string {
  if (!link) return "";

  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const documentId = match?.[1];

  if (!documentId) return "";

  return `https://docs.google.com/document/d/${documentId}/preview`;
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

// function extrairBonusAprim(str: string): number | null {
//   if (!str) return null;

//   // pega algo como: +2, -1, +20, -2  (com ou sem texto depois)
//   const match = str.match(/\((?:.*?)([+]?\d+)(?:.*?)\)/);

//   return match ? Number(match[1]) : null;
// }

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
}: {
  nomePericia: string;
  pericias: Record<string, string>; // antes era Pericia, agora string
  atributoAlternativo?: string | null;
  atributos: Record<string, string>; // antes era Atributo, agora string
  aprimoramentos: string[];
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

  const totalAprimoramentos = [];
  for (const apr of aprimoramentos) {
    // Procura match por nome da perícia ou por atributo
    const contemPericia = apr
      .toLowerCase()
      .includes(nomePericiaFormatado.toLowerCase());

    // console.log("nomePericiaFormatado :>> ", nomePericiaFormatado);
    const contemAtributo = apr
      .toLowerCase()
      .includes(atributoParaUsar.toLowerCase());
    // console.log("atributoParaUsar :>> ", atributoParaUsar);

    if (contemPericia || contemAtributo) {
      console.log("apr :>> ", apr);
      const valor = extrairBonusAprim(apr);
      console.log("valor :>> ", valor);
      if (valor !== 0 && valor) {
        totalAprimoramentos.push(`${apr.split("(")[0].trim()}: ${valor} `);
        bonusAprimoramentos += valor;
        detalhesAprim.push(`${apr.trim()}: ${valor > 0 ? "+" : ""}${valor}`);
      }
    }
  }
  // 5 — Total final
  const totalFinal = totalAtributo + bonusPericia + bonusAprimoramentos;

  return (
    `${nomePericiaFormatado}: ${totalFinal} [` +
    `${nomeAtributo.toLowerCase()}: ${totalAtributo} | ` +
    `${nomePericiaFormatado.toLowerCase()}: ${bonusPericia}` +
    (bonusAprimoramentos ? ` | ${totalAprimoramentos.join(" | ")}` : "") +
    `]`
  ).replace(/\s+\]/, "]");
}
