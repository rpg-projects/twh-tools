export interface Char {
  summer: string;
  name: string;
  fileLink: string;
  god: string;
  level: number;
}

export interface CompleteChar {
  summer: string;
  name: string;
  fileLink: string;
  god: string;
  level: number;
  age: number;
  nascimento: string;
  alignment: string;
  origin: string;
  avatar: string;
}

export interface CompleteCharFile {
  name: string;
  avatar: string;
  fileLink: string;

  age: number;
  nascimento: string;
  origin: string;
  alignment: string;
  god: string;

  level: number;
  summer: string;

  hp: string;
  mp?: string;
  dp: string;
  de: string;

  atributos?: Record<string, any>;
  pericias?: Record<string, any>;

  aprimoramentos: string[];
  equipamentos: string[];
  itens: string[];
  pontosArcanos?: string;
  feiticos?: string[];
}

export interface PlayerBank {
  pontos: string | null | undefined;
  dracmas: string | null | undefined;
  kleos: string | null | undefined;
}

export interface ErrorsReportData {
  charName: string;
  god: string;
  hasErrorsOnHPSum: boolean;
  hpAtual: number;
  hpCorreto: number;
  fileLink: string;
  possuiResilienciaMortal: boolean;
  hasErrorsOnAttSum: boolean;
  somaAtual: number;
  somaCorreta: number;
}
