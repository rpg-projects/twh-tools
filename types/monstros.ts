import { ObjectId } from "mongodb";

export type MonstroDB = Monstro & {
  _id: ObjectId;
  updatedAt: Date;
  sourceModifiedTime?: string;
};

export type Monstro = {
  imagem: string;
  nome: string;
  encontradoEm: string;
  rank: string;
  temperamento: string;
  espolios: string;
  fraquezas: string;
  racionalidade: string;
  graus: {
    grau: number;
    batalha: string;
    atributos: string;
  }[];
  descricao: string;
  habilidades: {
    nome: string;
    tipo: string;
    descricao: string;
  }[];
  tipo: "TODOS" | "AEREO" | "AQUATICO" | "SUBMUNDANO" | "TERRESTRE";
};
