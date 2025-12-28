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
  const [playerBank, setPlayerBank] = useState<{
    pontos?: number;
    dracmas?: number;
    kleos?: number;
  }>({});

  const [activeTab, setActiveTab] = useState<
    "aprimoramentos" | "conquistas" | "arsenal" | "boticario"
  >("aprimoramentos");

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

      //  const chars = JSON.parse(playerBank);
      // setChars(chars);

      console.log("playerName :>> ", playerName);
      console.log("playerBank :>> ", playerBank);
      // {"pontos":"5370","dracmas":"2910","kleos":"3642"}

      setPlayer(playerName);

      // 🔥 PRELOAD DO PLAYER SHEET
      // try {
      //   const res = await fetch("/api/generalRoutes", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ name: final }),
      //   });

      //   // aqui é seguro chamar .json()
      //   const data = await res.json();

      //   localStorage.setItem("playerChars", JSON.stringify(data.chars));
      //   localStorage.setItem("playerBank", JSON.stringify(data.playerBank));
      // } catch (err) {
      //   console.error("save error:", err);
      // }
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

  // const lojasFiltradas = lojas.filter((loja) => loja.slug === activeTab);

  return (
    <main className="relative min-h-screen bg-[#f8f5f0] p-4 flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>

      {/* Banco do Olimpo */}
      <div className="fixed top-6 right-6 z-50 bg-white/90 backdrop-blur-md border border-yellow-700/30 rounded-2xl shadow-md px-5 py-3">
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

      <h1
        className={`${titleFont.className} text-2xl text-[1.8rem] font-bold mt-12 md:mt-8 mb-6`}
      >
        Lojas
      </h1>

      {/* Abas das lojas */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
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

      {/* {loading ? (
        <p className="mt-20 text-gray-600 text-lg">Carregando lojas...</p>
      ) : lojasFiltradas.length === 0 ? (
        <p className="mt-20 text-gray-500 text-sm">
          Nenhuma loja disponível nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
          {lojasFiltradas.map((loja) => (
            <div
              key={loja.slug}
              className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col gap-3"
            >
              <div>
                <h2 className="text-lg font-bold">{loja.nome}</h2>
                <p className="text-sm text-gray-600">{loja.descricao}</p>
              </div>

              <div className="flex flex-col gap-2">
                {loja.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      {item.descricao && (
                        <p className="text-xs text-gray-500">
                          {item.descricao}
                        </p>
                      )}
                    </div>

                    <span className="text-sm font-semibold">
                      {item.preco} {item.moeda}
                    </span>
                  </div>
                ))}
              </div>

              <button className="mt-auto px-3 py-2 text-sm rounded-lg bg-[#ba9963] text-white hover:bg-gray-800 transition">
                Acessar loja
              </button>
            </div>
          ))}
        </div>
      )} */}

      {loading ? (
        <p className="mt-20 text-gray-600 text-lg">Carregando lojas...</p>
      ) : activeTab === "aprimoramentos" ? (
        <div className="w-full max-w-5xl flex flex-col gap-10">
          {aprimoramentos.map((grupo, index) => (
            <section key={`${grupo.categoria}-${grupo.nivel}-${index}`}>
              {/* Categoria + nível */}
              <h2
                className={`${titleFont.className} text-lg mb-3 text-[#7a5c2e]`}
              >
                {grupo.categoria} · Nível {grupo.nivel}
              </h2>

              {/* Itens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grupo.itens.map((item, i) => (
                  <div
                    key={`${item.nome}-${i}`}
                    className="bg-white rounded-xl shadow-sm border border-yellow-700/20 p-4 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-semibold text-sm text-gray-900">
                        {item.nome}
                      </h3>

                      <span className="text-xs font-bold text-[#8b6a34] whitespace-nowrap">
                        {item.custo}
                      </span>
                    </div>

                    {item.descricao && (
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {item.descricao}
                      </p>
                    )}

                    <button className="mt-2 self-end px-3 py-1.5 text-xs rounded-lg bg-[#ba9963] text-white hover:bg-[#9e7f4f] transition">
                      Adicionar ao carrinho
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-20 text-gray-500 text-sm">
          Nenhuma loja disponível nesta categoria.
        </p>
      )}

      {/* {loading ? (
        <p className="mt-20 text-gray-600 text-lg">Carregando lojas...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl">
          {lojas.map((loja) => (
            <div
              key={loja.slug}
              className="p-4 bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col gap-3"
            >
              <div>
                <h2 className="text-lg font-bold">{loja.nome}</h2>
                <p className="text-sm text-gray-600">{loja.descricao}</p>
              </div>

              <div className="flex flex-col gap-2">
                {loja.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      {item.descricao && (
                        <p className="text-xs text-gray-500">
                          {item.descricao}
                        </p>
                      )}
                    </div>

                    <span className="text-sm font-semibold">
                      {item.preco} {item.moeda}
                    </span>
                  </div>
                ))}
              </div>

              <button className="mt-auto px-3 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition">
                Acessar loja
              </button>
            </div>
          ))}
        </div>
      )} */}
    </main>
  );
}
