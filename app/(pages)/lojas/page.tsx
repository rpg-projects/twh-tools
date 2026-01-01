"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loja, StoreAprimoramentos } from "@/types/loja";
import { MOCK_LOJAS } from "@/lib/mocks";
import { titleFont } from "@/app/fonts";

export default function LojaPage() {
  const router = useRouter();
  // const [lojas, setLojas] = useState<Loja[]>([]);

  const [isLogged, setIsLogged] = useState(true);

  const [aprimoramentos, setAprimoramentos] = useState<StoreAprimoramentos>([]);

  const [loading, setLoading] = useState(true);

  const [player, setPlayer] = useState("");
  const [playerChars, setPlayerChars] = useState<{ name: string }[]>([]);
  const [selectedChar, setSelectedChar] = useState<string>("");

  const [playerBank, setPlayerBank] = useState<{
    pontos?: number;
    dracmas?: number;
    kleos?: number;
  }>({});

  const [activeTab, setActiveTab] = useState<
    "aprimoramentos" | "conquistas" | "arsenal" | "boticario"
  >("aprimoramentos");
  const [activeCategoria, setActiveCategoria] = useState<
    "OFENSIVOS" | "DEFENSIVOS" | "UTILITARIOS" | "MAGICOS" | "COTIDIANOS"
  >("OFENSIVOS");

  useEffect(() => {
    async function loadLojas() {
      try {
        setLoading(true);

        const res = await fetch("/api/getStores", {
          cache: "no-store",
        });

        const data = await res.json();

        setAprimoramentos(data.aprimoramentos ?? []);
      } catch (err) {
        console.error("Erro ao carregar lojas", err);
      } finally {
        setLoading(false);
      }
    }

    async function loadPlayerBank() {
      const playerName = localStorage.getItem("player");
      const savedChars = localStorage.getItem("playerChars");
      const playerBank = localStorage.getItem("playerBank");

      if (!playerName || !savedChars || !playerBank) {
        setIsLogged(false);
        localStorage.setItem("visitedBy", "lojas");

        return;
      }

      const parsedBank = JSON.parse(playerBank);
      setPlayerBank({
        pontos: Number(parsedBank.pontos),
        dracmas: Number(parsedBank.dracmas),
        kleos: Number(parsedBank.kleos),
      });

      let parsedChars = JSON.parse(savedChars);
      // parsedChars = parsedChars.map((char: any) => char.name.trim());
      setPlayerChars(parsedChars);
      console.log("parsedChars :>> ", parsedChars);

      setPlayer(playerName);
    }

    loadLojas();
    loadPlayerBank();
  }, []);

  const tabs = [
    { id: "aprimoramentos", label: "Aprimoramentos" },
    { id: "conquistas", label: "Conquistas" },
    { id: "arsenal", label: "Arsenal" },
    { id: "boticario", label: "Boticário" },
  ];

  const categorias = [
    { id: "OFENSIVOS", label: "Ofensivos" },
    { id: "DEFENSIVOS", label: "Defensivos" },
    { id: "UTILITÁRIOS", label: "Utilitários" },
    { id: "MÁGICOS", label: "Mágicos" },
    { id: "COTIDIANOS", label: "Cotidianos" },
  ];

  // const lojasFiltradas = lojas.filter((loja) => loja.slug === activeTab);
  const aprimoramentosFiltrados = aprimoramentos.filter((grupo) =>
    grupo.categoria.toUpperCase().includes(activeCategoria)
  );

  return (
    <main className="relative min-h-screen bg-[#f8f5f0] p-4 flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="absolute top-2 md:top-6 left-2 md:left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>
      {/* Banco do Olimpo */}
      <div className="fixed top-14 md:top-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-yellow-700/30 rounded-2xl shadow-md px-5 py-3">
        <h2 className="text-xs font-semibold tracking-wide text-yellow-900/80 mb-2 flex items-center gap-1">
          🏛️ Meu banco do Olimpo
        </h2>
        {!isLogged ? (
          <div className="text-xs text-gray-600 flex flex-col gap-2">
            <p>Faça login para ver seus números.</p>

            <button
              onClick={() => router.push("/")}
              className="self-start px-3 py-1.5 rounded-lg bg-[#ba9963] text-white text-xs hover:bg-[#9e7f4f] transition"
            >
              Ir para login
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6 text-sm">
            {/* Pontos */}
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  Pontos
                </p>
                <p className="font-semibold text-gray-900">
                  {playerBank.pontos ?? 0}
                </p>
              </div>
            </div>

            {/* Dracmas */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🪙</span>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  Dracmas
                </p>
                <p className="font-semibold text-gray-900">
                  {playerBank.dracmas ?? 0}
                </p>
              </div>
            </div>

            {/* Kleos */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  Kleos
                </p>
                <p className="font-semibold text-gray-900">
                  {playerBank.kleos ?? 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Escolha char para comprar */}
      {isLogged && (
        <div className="fixed top-[9.5rem] md:top-[7.5rem] right-6 z-40 bg-white/90 backdrop-blur-md border border-yellow-700/20 rounded-2xl shadow-sm px-5 py-4 w-[260px]">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            🧙 Para quem você está comprando?
          </label>

          <select
            value={selectedChar}
            onChange={(e) => setSelectedChar(e.target.value)}
            className="w-full text-sm rounded-lg border border-gray-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#ba9963]"
          >
            {playerChars.map((char) => (
              <option className="text-black" key={char.name} value={char.name}>
                {char.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <h1
        className={`${titleFont.className} text-2xl text-[1.8rem] font-bold mt-12 md:mt-8 mb-6`}
      >
        Lojas
      </h1>
      {/* Abas das lojas */}
      <div className="flex flex-wrap justify-center gap-2 mb-8 md:mt-0 mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition
        ${
          activeTab === tab.id
            ? "bg-[#ab8a54] text-white shadow"
            : "bg-white text-gray-700 hover:bg-gray-100"
        }
      `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="mt-24 md:mt-20 text-gray-600 text-lg">
          Carregando lojas...
        </p>
      ) : activeTab === "aprimoramentos" ? (
        <>
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoria(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition
          ${
            activeCategoria === cat.id
              ? "bg-[#7a5c2e] text-white shadow"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }
        `}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="w-full max-w-5xl flex flex-col gap-10">
            {aprimoramentosFiltrados.map((grupo, index) => (
              <section key={`${grupo.categoria}-${grupo.nivel}-${index}`}>
                {/* Categoria + nível */}
                <h2
                  className={`${titleFont.className} text-lg mb-3 text-[#7a5c2e]`}
                >
                  Nível {grupo.nivel}
                </h2>

                {/* Itens */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {grupo.itens.map((item, i) => (
                    <div
                      key={`${item.nome}-${i}`}
                      className="bg-white rounded-xl shadow-sm border border-yellow-700/20 p-4 flex flex-col gap-2"
                    >
                      <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
                        <h3 className="font-semibold text-sm text-gray-900">
                          {item.nome}
                        </h3>

                        {item.nome === "REGENERAÇÃO DE MANA" ? (
                          <span className="text-xs font-bold text-[#8b6a34] whitespace-nowrap">
                            {item.custo.split(" / ")[0]}
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-[#8b6a34] whitespace-nowrap">
                            {item.custo}
                          </span>
                        )}
                      </div>

                      {item.nome === "REGENERAÇÃO DE MANA" && (
                        <span className="text-xs font-bold text-red-400 whitespace-nowrap">
                          {item.custo.split(" / ")[1]}
                        </span>
                      )}

                      {item.descricao && (
                        <p className="text-xs text-gray-600 text-justify hyphens-auto leading-snug">
                          {item.descricao}
                        </p>
                      )}

                      <button className="mt-auto self-end px-3 py-1.5 text-xs rounded-lg bg-[#ba9963] text-white hover:bg-[#9e7f4f] transition">
                        Adicionar ao carrinho
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-20 text-gray-500 text-sm">Trabalhando nesta loja!</p>
      )}
    </main>
  );
}
