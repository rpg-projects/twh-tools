export type Moeda = "pontos" | "dracmas" | "kleos";

export interface LojaItem {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  moeda: Moeda;
}

export interface Loja {
  slug: "aprimoramentos" | "conquistas" | "arsenal" | "boticario";
  nome: string;
  descricao?: string;
  itens: LojaItem[];
}

// types/aprimoramento.ts

export type StoreAprimoramentos = {
  categoria: string;
  nivel: number;
  itens: {
    nome: string;
    custo: string;
    descricao: string;
  }[];
}[];

// export type AprimoramentoCategoria =
//   | "ofensivo"
//   | "defensivo"
//   | "utilitario"
//   | "magico"
//   | "cotidiano";

// export interface Aprimoramento {
//   id: string;
//   nome: string;
//   descricao: string;

//   // regras do sistema
//   nivel: number;
//   custo: number;

//   categoria: AprimoramentoCategoria;

//   // restrições
//   requerNivelMinimo?: number;
//   requerAprimoramentos?: string[];
//   exclusivoParaDeuses?: string[];
//   bloqueadoParaDeuses?: string[];
// }

// export interface LojaAprimoramentos {
//   categorias: {
//     tipo: AprimoramentoCategoria;
//     label: string;
//     descricao?: string;
//     aprimoramentos: Aprimoramento[];
//   }[];
// }
