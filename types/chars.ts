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

export interface PlayerBank {
  pontos: string | null | undefined;
  dracmas: string | null | undefined;
  kleos: string | null | undefined;
}
