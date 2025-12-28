export const MOCK_LOJAS = [
  {
    id: 1,
    slug: "aprimoramentos",
    nome: "Forja de Hefesto",
    descricao: "Aprimoramentos permanentes para o herói.",
    itens: [
      {
        id: "apr-1",
        nome: "Corpo Endurecido",
        descricao: "+5% de resistência física",
        preco: 500,
        moeda: "pontos",
      },
      {
        id: "apr-2",
        nome: "Mente Afiada",
        descricao: "+5% em testes mentais",
        preco: 800,
        moeda: "pontos",
      },
    ],
  },
  {
    id: 2,
    slug: "conquistas",
    nome: "Registro de Kleos",
    descricao: "Feitos que ecoam pelos salões do Olimpo.",
    itens: [
      {
        id: "con-1",
        nome: "Favor dos Deuses",
        descricao: "Reconhecimento divino",
        preco: 1200,
        moeda: "kleos",
      },
      {
        id: "con-2",
        nome: "Nome Gravado em Pedra",
        descricao: "Seu nome será lembrado",
        preco: 2000,
        moeda: "kleos",
      },
    ],
  },
  {
    id: 3,
    slug: "arsenal",
    nome: "Arsenal de Ares",
    descricao: "Armas e equipamentos de combate.",
    itens: [
      {
        id: "ars-1",
        nome: "Espada de Bronze Celestial",
        descricao: "Eficaz contra monstros",
        preco: 1500,
        moeda: "dracmas",
      },
      {
        id: "ars-2",
        nome: "Escudo Hoplita",
        descricao: "+2 Defesa",
        preco: 900,
        moeda: "dracmas",
      },
    ],
  },
  {
    id: 4,
    slug: "boticario",
    nome: "Boticário de Asclépio",
    descricao: "Poções e itens de suporte.",
    itens: [
      {
        id: "bot-1",
        nome: "Poção de Cura",
        descricao: "Restaura vitalidade",
        preco: 200,
        moeda: "dracmas",
      },
      {
        id: "bot-2",
        nome: "Essência Revigorante",
        descricao: "Remove fadiga",
        preco: 350,
        moeda: "dracmas",
      },
    ],
  },
];

// mocks/loja-aprimoramentos.ts
// import { LojaAprimoramentos } from "@/types/loja";

// export const lojaAprimoramentos: LojaAprimoramentos = {
//   categorias: [
//     {
//       tipo: "ofensivo",
//       label: "Aprimoramentos Ofensivos",
//       descricao: "Habilidades voltadas para dano, ataque e combate direto.",
//       aprimoramentos: [
//         {
//           id: "ataque-improvisado",
//           nome: "Ataque Improvisado",
//           descricao:
//             "Ao improvisar qualquer objeto como arma, o semideus recebe bônus de +3 de ataque.",
//           nivel: 1,
//           custo: 150,
//           categoria: "ofensivo",
//         },
//         {
//           id: "ambidestria",
//           nome: "Ambidestria",
//           descricao:
//             "Permite realizar dois ataques seguidos com duas armas ou uma arma de duas mãos. O segundo ataque causa metade do dano.",
//           nivel: 2,
//           custo: 400,
//           categoria: "ofensivo",
//         },
//         {
//           id: "potencia-armada",
//           nome: "Potência Armada",
//           descricao:
//             "Todo ataque efetivo causa +2 de dano, independentemente do tipo de arma.",
//           nivel: 3,
//           custo: 600,
//           categoria: "ofensivo",
//         },
//       ],
//     },
//   ],
// };
