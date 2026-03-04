"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { titleFont } from "@/app/fonts";
import { Monstro } from "@/types/monstros";
import Image from "next/image";

export default function BestiarioPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [monstros, setMonstros] = useState<Monstro[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "TODOS" | "AEREO" | "AQUATICO" | "SUBMUNDANO" | "TERRESTRE"
  >("TODOS");
  const [openNome, setOpenNome] = useState<string | null>(null);

  useEffect(() => {
    async function loadBestiario() {
      try {
        setLoading(true);
        const res = await fetch("/api/getBestiario", { cache: "no-store" });
        const data = await res.json();
        setMonstros(data ?? []);
      } catch (err) {
        console.error("Erro ao carregar bestiário", err);
      } finally {
        setLoading(false);
      }
    }

    loadBestiario();
  }, []);

  const tabs = [
    { id: "TODOS", label: "Todos" },
    { id: "AEREO", label: "Aéreos" },
    { id: "AQUATICO", label: "Aquáticos" },
    { id: "SUBMUNDANO", label: "Submundanos" },
    { id: "TERRESTRE", label: "Terrestres" },
  ];

  const monstrosFiltrados = monstros
    .filter((c) => (activeTab === "TODOS" ? true : c.tipo === activeTab))
    .filter((c) => c.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="relative min-h-screen bg-[#f8f5f0] p-4 flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="absolute top-2 md:top-6 left-2 md:left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>

      <h1
        className={`${titleFont.className} text-[1.9rem] md:text-[2.2rem] font-bold mt-12 md:mt-8 mb-6 text-[#7a5c2e]`}
      >
        🐉 Bestiário
      </h1>

      {/* Barra de pesquisa */}
      <div className="w-full max-w-xl mb-8">
        <input
          type="text"
          placeholder="Buscar monstro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-xl border border-yellow-700/30 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ba9963]"
        />
      </div>

      {/* Abas */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition
              ${
                activeTab === tab.id
                  ? "bg-[#ab8a54] text-white shadow"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex flex-col items-center justify-center mt-20">
          {/* Tritão */}
          <div className="relative w-40 h-40 overflow-hidden">
            <Image
              src="/images/tridente.webp"
              alt="Tridente"
              width={160}
              height={160}
              className="object-contain z-10 relative"
            />
            {/* Água animada subindo */}
            <div className="absolute bottom-0 left-0 w-full bg-blue-400 opacity-70 animate-fill h-0 z-0"></div>
          </div>
          <p className="mt-4 text-gray-600 text-lg">Carregando criaturas...</p>
        </div>
      ) : (
        <div className="w-full max-w-8xl grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-7">
          {monstrosFiltrados.map((monstro, i) => {
            const isOpen = openNome === monstro.nome;

            return (
              <div
                key={`${monstro.nome}-${i}`}
                className="bg-white rounded-xl shadow-sm border border-yellow-700/20 transition"
              >
                {/* RESUMO (CARD SUPERIOR) */}
                <button
                  onClick={() => setOpenNome(isOpen ? null : monstro.nome)}
                  className="w-full text-left p-4 transition hover:bg-gray-50"
                >
                  <div className="flex gap-6">
                    {monstro.imagem ? (
                      <div className="w-[250px] h-[320px] shrink-0 overflow-hidden rounded-lg bg-gray-200 relative">
                        <Image
                          src={monstro.imagem}
                          alt={monstro.nome}
                          width={250}
                          height={320}
                          className="object-cover w-full h-full"
                          unoptimized
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center -z-10 text-gray-400 text-xs">
                          Imagem indisponível
                        </div>
                      </div>
                    ) : (
                      <div className="w-[250px] h-[320px] shrink-0 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        Sem imagem
                      </div>
                    )}

                    <div className="flex flex-col flex-1 justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900 leading-tight">
                            {monstro.nome}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {monstro.encontradoEm}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                            {monstro.tipo}
                          </span>
                          <span className="text-xs text-gray-400">
                            {isOpen ? "▲" : "▼"}
                          </span>
                        </div>
                      </div>

                      {/* Status de Batalha (Resumo no Card) */}
                      <div className="flex flex-col gap-2 mt-4">
                        {monstro.graus
                          ?.filter((g) => g.batalha !== "-" && g.batalha)
                          .map((g, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 rounded-lg px-3 py-2"
                            >
                              <p className="text-sm font-semibold text-gray-800">
                                Grau {g.grau}: {g.batalha}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </button>

                {/* DETALHES (ACORDEÃO ABERTO) */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-3 flex flex-col gap-4 border-t border-yellow-700/10 bg-yellow-50/40">
                    {/* Descrição Principal */}
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                      {monstro.descricao}
                    </p>

                    {/* SEÇÃO DE ATRIBUTOS PARA TESTES (Nova Seção) */}
                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-bold text-[#7a5c2e] uppercase tracking-wider">
                        Atributos para Testes
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {monstro.graus
                          ?.filter((g) => g.atributos !== "-" && g.atributos)
                          .map((g, idx) => (
                            <div
                              key={idx}
                              className="text-[11px] bg-white/60 p-2 rounded border border-yellow-700/10 text-gray-700"
                            >
                              <span className="font-bold">Grau {g.grau}:</span>{" "}
                              {g.atributos}
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Dados Técnicos */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 border-t border-yellow-700/10 pt-3">
                      <p>
                        <strong>Rank:</strong> {monstro.rank}
                      </p>
                      <p>
                        <strong>Temperamento:</strong> {monstro.temperamento}
                      </p>
                      <p>
                        <strong>Racionalidade:</strong> {monstro.racionalidade}
                      </p>
                      <p>
                        <strong>Fraquezas:</strong> {monstro.fraquezas}
                      </p>
                      <p className="col-span-2">
                        <strong>Espólios:</strong> {monstro.espolios}
                      </p>
                    </div>

                    {/* Habilidades */}
                    {monstro.habilidades?.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold text-[#7a5c2e]">
                          Habilidades
                        </h4>
                        {monstro.habilidades.map((hab, index) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-lg border border-yellow-200 shadow-sm"
                          >
                            <p className="font-semibold text-sm">{hab.nome}</p>
                            <p className="text-[11px] text-[#8b6a34] mb-1 italic">
                              {hab.tipo}
                            </p>
                            <p className="text-xs text-gray-700 leading-relaxed">
                              {hab.descricao}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes fill {
          0% {
            height: 0;
          }
          100% {
            height: 100%;
          }
        }
        .animate-fill {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          animation: fill 2s ease-in-out infinite; /* mudei para infinite para ficar mais legal */
          z-index: 5;
        }
      `}</style>
    </main>
  );
}
