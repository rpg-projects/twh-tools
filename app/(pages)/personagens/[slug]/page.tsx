"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompleteChar } from "@/types/chars";
import { useParams } from "next/navigation";

import { calcularDados } from "@/lib/utils";
import { ModalSimularDados } from "@/components/RollSimulation";

export default function PersonagemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const [playerName, setPlayerName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("player") : ""
  );
  const [char, setChar] = useState<CompleteChar | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "stats" | "chale" | "equipamentos"
  >("stats");
  const [stats, setStats] = useState<any>({
    showOnlyNonZeroPericias: true,
    atributos: {},
    pericias: {},
    aprimoramentos: [],
    hp: 50,
    dp: 30,
    de: 5,
  });
  const [diceModalOpen, setDiceModalOpen] = useState(false);

  const [relations, setRelations] = useState<any>(null);
  const [items, setItems] = useState<any>(null);
  const [loadingTab, setLoadingTab] = useState(false);

  // Carrega o personagem selecionado do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("selectedChar");
    if (!stored) {
      router.push("/personagens");
      return;
    }
    setChar(JSON.parse(stored));

    // Carrega playerName também, se ainda não tiver
    if (typeof window !== "undefined") {
      const storedPlayer = localStorage.getItem("player");
      setPlayerName(storedPlayer || "");
    }

    setLoading(false);
  }, []);

  // Faz fetch quando char e playerName estão disponíveis
  useEffect(() => {
    if (!char || !playerName) return; // só executa quando temos ambos

    async function fetchTabData() {
      setLoadingTab(true);
      try {
        if (activeTab === "stats") {
          const res = await fetch("/api/charCompleteFile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playerName, char }),
          });
          const data = await res.json();
          setStats({ ...data, showOnlyNonZeroPericias: true });
        } else if (activeTab === "equipamentos") {
          const res = await fetch("/api/charCompleteFile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playerName, char }),
          });
          const data = await res.json();
          setItems({ equipamentos: data.equipamentos, itens: data.itens });
        } else if (activeTab === "chale") {
          // const res = await fetch(`/api/getRelations?char=${char.name}`);
          // const data = await res.json();
          // setRelations(data);
        }
      } catch (err) {
        console.error("Erro ao carregar aba:", err);
      } finally {
        setLoadingTab(false);
      }
    }

    fetchTabData();
  }, [activeTab, char, playerName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f8ff]">
        <p className="text-gray-600 text-lg">Carregando personagem...</p>
      </div>
    );
  }

  if (!char) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f0f8ff]">
        <p className="text-gray-600 text-lg">Personagem não encontrado.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f0f8ff] p-6 relative">
      {/* BOTÃO VOLTAR */}
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>

      <div className="flex flex-col md:flex-row gap-6 mt-16 md:mt-10">
        {/* ====================== CARD ESQUERDA ====================== */}
        <div className="bg-white rounded-xl shadow p-6 w-full md:w-72 h-fit flex flex-col items-center">
          <img
            src={char.avatar}
            alt={char.name}
            className="w-32 h-32 object-cover rounded-full border-2 border-blue-300"
          />

          <span className="mt-3 px-4 py-1 bg-blue-400 text-white font-semibold rounded-full text-xs">
            {char.god}
          </span>

          <h1 className="text-xl font-bold mt-3 text-center">{char.name}</h1>

          <div className="text-xs text-gray-600 text-center space-y-1 mt-2">
            <p>
              Nível: {char.level} | Verão: {char.summer}
            </p>
            <p>Origem: {char.origin}</p>
            <p>Alinhamento: {char.alignment}</p>
            {/* <p>Idade: {char.age}</p> */}
          </div>

          {/* BOTÕES DE TABS DENTRO DO CARD */}
          <div className="flex flex-col gap-2 mt-4 w-full">
            <button
              onClick={() => setActiveTab("stats")}
              className={`w-full px-3 py-2 rounded-lg font-semibold text-sm ${
                activeTab === "stats"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              STATS
            </button>

            <button
              onClick={() => setActiveTab("equipamentos")}
              className={`w-full px-3 py-2 rounded-lg font-semibold text-sm ${
                activeTab === "equipamentos"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              EQUIPAMENTOS
            </button>

            <button
              onClick={() => setActiveTab("chale")}
              className={`w-full px-3 py-2 rounded-lg font-semibold text-sm ${
                activeTab === "chale"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              CHALÉ
            </button>
          </div>
        </div>

        {/* ====================== ÁREA DIREITA (CONTEÚDO) ====================== */}
        <div className="flex-1 bg-white rounded-xl shadow p-6">
          {loadingTab ? (
            <p className="text-gray-500 text-center">Carregando...</p>
          ) : activeTab === "stats" ? (
            <>
              {activeTab === "stats" && (
                <div className="w-full flex justify-end mb-4">
                  <button
                    onClick={() => setDiceModalOpen(true)}
                    className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg shadow hover:bg-green-600 transition"
                  >
                    Simular dados
                  </button>
                </div>
              )}

              <ModalSimularDados
                open={diceModalOpen}
                pericias={stats?.pericias}
                atributos={stats?.atributos}
                onClose={() => setDiceModalOpen(false)}
                onSelect={(
                  nomePericia: string,
                  atributoAlternativo?: string | null
                ) => {
                  return calcularDados({
                    nomePericia,
                    atributoAlternativo: atributoAlternativo || null,
                    pericias: stats?.pericias,
                    atributos: stats?.atributos,
                    aprimoramentos: stats?.aprimoramentos ?? [],
                  });
                }}
              />

              <div className="flex flex-col gap-6">
                {/* --- HP / DP / DE em cards --- */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-bold text-blue-700">HP</p>
                    <p className="text-xl font-semibold text-blue-900">
                      {stats?.hp || 50}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-bold text-blue-700">DP</p>
                    <p className="text-xl font-semibold text-blue-900">
                      {stats?.dp || 30}
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-bold text-blue-700">DE</p>
                    <p className="text-xl font-semibold text-blue-900">
                      {stats?.de || 5}
                    </p>
                  </div>
                </div>

                {/* --- Atributos em tabela --- */}
                <div>
                  <h3 className="font-semibold mb-2 text-blue-600">
                    Atributos
                  </h3>
                  <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
                    <tbody>
                      <tr className="bg-gray-50">
                        {Object.entries(stats?.atributos || {}).map(
                          ([key, val]) => (
                            <td
                              key={key}
                              className="px-3 py-2 border border-gray-300 text-center"
                            >
                              <p className="font-bold text-gray-700">{key}</p>
                              <p className="text-gray-600">{val}</p>
                            </td>
                          )
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* --- Perícias --- */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-blue-600">Perícias</h3>

                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={stats?.showOnlyNonZeroPericias}
                        onChange={() =>
                          setStats((prev: any) => ({
                            ...prev,
                            showOnlyNonZeroPericias:
                              !prev.showOnlyNonZeroPericias,
                          }))
                        }
                      />
                      Ocultar perícias com 0
                    </label>
                  </div>

                  <ul className="grid grid-cols-2 gap-1">
                    {stats?.pericias &&
                      Object.entries(stats.pericias)
                        .sort((a, b) => {
                          const getVal = (v: string) =>
                            parseInt(v.split("/")[0]);
                          return getVal(b[1]) - getVal(a[1]);
                        })
                        .filter(([_, val]) =>
                          stats.showOnlyNonZeroPericias
                            ? !val.startsWith("0/")
                            : true
                        )
                        .map(([key, val], index) => (
                          <li
                            key={key}
                            className="px-4 py-2 bg-gray-50 rounded-md border border-gray-200"
                            style={
                              index < 4 && !val.startsWith("0/30")
                                ? { border: "2px solid #d3caadff" }
                                : {}
                            }
                          >
                            <span className="font-semibold text-gray-700">
                              {key}
                            </span>
                            : <span className="text-gray-800">{val}</span>
                          </li>
                        ))}
                  </ul>
                </div>

                {/* --- Aprimoramentos --- */}
                <div>
                  <h3 className="font-semibold mb-2 text-blue-600">
                    Aprimoramentos
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {stats?.aprimoramentos?.map((a: string, i: number) => {
                      return (
                        <div
                          key={i}
                          className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-gray-800"
                        >
                          {a}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "equipamentos" ? (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-blue-600">
                  Equipamentos
                </h3>
                <ul className="flex flex-col gap-1">
                  {items?.equipamentos?.map((eq: string, i: number) => (
                    <li
                      key={i}
                      className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200"
                    >
                      {eq}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-blue-600">Itens</h3>
                <ul className="flex flex-col gap-1">
                  {items?.itens?.map((it: string, i: number) => (
                    <li
                      key={i}
                      className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : activeTab === "chale" ? (
            <div className="text-center text-gray-500 text-lg">VEM AÍ!</div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
