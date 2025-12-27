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
