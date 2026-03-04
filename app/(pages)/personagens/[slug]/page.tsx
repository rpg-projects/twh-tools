"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CompleteChar, CompleteCharFile } from "@/types/chars";
import { useParams } from "next/navigation";
import Image from "next/image";

import { ModalSimularDados } from "@/components/RollSimulation";
import { calcularDados } from "@/utils/calculadoraDePericias";

export default function PersonagemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug: string = params.slug as string;

  const [playerName, setPlayerName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("player") : "",
  );
  const [char, setChar] = useState<CompleteChar | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<
    "stats" | "chale" | "equipamentos" | "bifurcações"
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

  async function loadChar(playerName: string, char: CompleteChar) {
    const res = await fetch("/api/charCompleteFile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName, char }),
    });
    const data: CompleteCharFile = await res.json();

    return data;
  }

  useEffect(() => {
    if (!slug) return;

    async function fetchCharacter() {
      setLoading(true);

      try {
        const playerName = slug.split("-")[0].toUpperCase();

        const storedChars = localStorage.getItem("playerChars");
        if (!storedChars) {
          router.push("/personagens");
          return;
        }

        const chars = JSON.parse(storedChars);

        const foundChar = chars.find((c: any) => {
          const generatedSlug = `${localStorage
            .getItem("player")
            ?.toLowerCase()}-${c.name.split(" ")[0].toLowerCase()}`;

          return generatedSlug === slug;
        });

        if (!foundChar) {
          router.push("/personagens");
          return;
        }

        const data = await loadChar(playerName, foundChar);
        setChar(data);
        setStats({ ...data, showOnlyNonZeroPericias: true });
        setPlayerName(playerName);
      } catch (error) {
        console.log("error :>> ", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCharacter();
  }, [slug]);

  // Faz fetch quando char e playerName estão disponíveis
  useEffect(() => {
    if (!char || !playerName) return; // só executa quando temos ambos

    async function fetchTabData(playerName: string, char: CompleteChar) {
      setLoadingTab(true);

      try {
        if (activeTab === "stats") {
          const data = await loadChar(playerName, char);

          setStats({ ...data, showOnlyNonZeroPericias: true });
        } else if (activeTab === "equipamentos") {
          const res = await fetch("/api/charCompleteFile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: playerName, char }),
          });
          const data = await res.json();
          setItems({ equipamentos: data.equipamentos, itens: data.itens });
        }
        // else if (activeTab === "chale") {
        // const res = await fetch(`/api/getRelations?char=${char.name}`);
        // const data = await res.json();
        // setRelations(data);
        // }
      } catch (err) {
        console.error("Erro ao carregar aba:", err);
      } finally {
        setLoadingTab(false);
      }
    }

    fetchTabData(playerName, char);
  }, [activeTab]);

  function normalizarNivel(nivel: string) {
    return nivel.replace(" (EXTRA)", "");
  }

  function agruparBifurcacoes(lista: string[]) {
    const grupos: { nivel: string; itens: string[] }[] = [];
    let atual: { nivel: string; itens: string[] } | null = null;

    for (const item of lista) {
      if (item.startsWith("NÍVEL")) {
        const nivelBase = normalizarNivel(item);

        // 🔹 se for o mesmo nível base, não cria novo grupo
        if (atual && normalizarNivel(atual.nivel) === nivelBase) {
          continue;
        }

        atual = { nivel: nivelBase, itens: [] };
        grupos.push(atual);
      } else if (item !== "-" && atual) {
        atual.itens.push(item);
      }
    }

    return grupos;
  }

  console.log("stats.bifurcacoes :>> ", stats.bifurcacoes);

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
        onClick={() => router.push("/personagens")}
        className="absolute top-6 left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>

      <div className="flex flex-col md:flex-row gap-6 mt-16 md:mt-10">
        {/* ====================== CARD ESQUERDA ====================== */}
        <div className="bg-white rounded-xl shadow p-6 w-full md:w-72 h-fit flex flex-col items-center">
          {/* <img
            src={char.avatar}
            alt={char.name}
            className="w-32 h-32 object-cover rounded-full border-2 border-blue-300"
          /> */}
          <Image
            src={char.avatar}
            alt={char.name}
            width={96}
            height={96}
            className="rounded-full border-2 border-blue-300"
            placeholder="blur"
            blurDataURL="/images/avatar-fallback.png"
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
            <p>
              Idade: {char.age} | Nasceu em: {char.nascimento}
            </p>
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
              onClick={() => setActiveTab("bifurcações")}
              className={`w-full px-3 py-2 rounded-lg font-semibold text-sm ${
                activeTab === "bifurcações"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              BIFURCAÇÕES
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

            {/* <button
              onClick={() => setActiveTab("chale")}
              className={`w-full px-3 py-2 rounded-lg font-semibold text-sm ${
                activeTab === "chale"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              CHALÉ
            </button> */}
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
                    Calculadora de perícias
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
                  atributoAlternativo?: string | null,
                ) => {
                  return calcularDados({
                    nomePericia,
                    atributoAlternativo: atributoAlternativo || null,
                    pericias: stats?.pericias,
                    atributos: stats?.atributos,
                    aprimoramentos: stats?.aprimoramentos ?? [],
                    nivel: char.level,
                    deus: char.god,
                  });
                }}
              />

              <div className="flex flex-col gap-6">
                {/* --- HP / DP / DE em cards --- */}
                <div
                  className={`grid gap-3 ${
                    stats?.mp ? "grid-cols-4" : "grid-cols-3"
                  }`}
                >
                  {/* HP */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-bold text-blue-700">HP</p>
                    <p className="text-xl font-semibold text-blue-900">
                      {stats?.hp ?? 50}
                    </p>
                  </div>

                  {/* MP (condicional) */}
                  {stats?.mp && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-1 py-3 md:p-3 text-center">
                      <p className="text-xs text-center font-bold text-blue-700">
                        MANA
                      </p>
                      <p className="text-xl font-semibold text-blue-900">
                        {stats.mp}
                      </p>
                    </div>
                  )}

                  {/* DP */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-bold text-blue-700">DP</p>
                    <p className="text-xl font-semibold text-blue-900">
                      {stats?.dp ?? 30}
                    </p>
                  </div>

                  {/* DE */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <p className="text-xs font-bold text-blue-700">DE</p>
                    <p className="text-xl font-semibold text-blue-900">
                      {stats?.de ?? 5}
                    </p>
                  </div>
                </div>

                {/* --- Atributos em tabela --- */}
                <div>
                  <h3 className="font-semibold mb-2 text-blue-600">
                    Atributos
                  </h3>

                  {/* MOBILE: grid responsivo */}
                  <div className="block md:hidden grid grid-cols-2 gap-3">
                    {Object.entries((stats?.atributos as string[]) || {}).map(
                      ([key, val]) => (
                        <div
                          key={key}
                          className="border border-gray-300 rounded-lg p-2 text-center bg-gray-50"
                        >
                          <p className="font-bold text-gray-700 text-sm">
                            {key}
                          </p>
                          <p className="text-gray-600">{val}</p>
                        </div>
                      ),
                    )}
                  </div>

                  {/* DESKTOP: tabela normal */}
                  <table className="hidden md:table w-full text-sm border border-gray-300 rounded-lg overflow-hidden mt-3">
                    <tbody>
                      <tr className="bg-gray-50">
                        {Object.entries(
                          (stats?.atributos as string[]) || {},
                        ).map(([key, val]) => (
                          <td
                            key={key}
                            className="px-3 py-2 border border-gray-300 text-center"
                          >
                            <p className="font-bold text-gray-700">{key}</p>
                            <p className="text-gray-600">{val}</p>
                          </td>
                        ))}
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
                      Object.entries(stats.pericias as string[])
                        .sort((a, b) => {
                          const getVal = (v: string) =>
                            parseInt(v.split("/")[0]);
                          return getVal(b[1]) - getVal(a[1]);
                        })
                        .filter(([_, val]) =>
                          stats.showOnlyNonZeroPericias
                            ? !val.startsWith("0/")
                            : true,
                        )
                        .map(([key, val], index) => (
                          <li
                            key={key}
                            className="px-1 md:px-4 py-2 bg-gray-50 rounded-md border border-gray-200"
                            style={
                              index < 4 && !val.startsWith("0/30")
                                ? { border: "2px solid #d3caadff" }
                                : {}
                            }
                          >
                            <span className="font-semibold text-gray-700 text-xs md:text-base">
                              {key}
                            </span>
                            : <span className="text-gray-800">{val}</span>
                          </li>
                        ))}
                  </ul>
                </div>

                {/* --- Aprimoramentos --- */}
                {stats.aprimoramentos.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-600">
                      Aprimoramentos
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {stats?.aprimoramentos?.map((a: string, i: number) => {
                        return (
                          <div
                            key={i}
                            className="px-1 md:px-3 py-2 text-sm md:text-base bg-yellow-50 border border-yellow-200 rounded-md text-gray-800"
                          >
                            {a}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* --- feiticos --- */}
                {stats.feiticos && stats.feiticos.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-blue-600">
                      FEITIÇOS / PONTOS ARCANOS: {stats.pontosArcanos}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {stats?.feiticos?.map((a: string, i: number) => {
                        return (
                          <div
                            key={i}
                            className="px-1 md:px-3 py-2 text-sm md:text-base bg-yellow-50 border border-yellow-200 rounded-md text-gray-800"
                          >
                            {a}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
          ) : activeTab === "bifurcações" ? (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold mb-2 text-blue-600">
                  Bifurcações
                </h3>

                <div className="flex flex-col gap-3">
                  {agruparBifurcacoes(stats?.bifurcacoes || []).map(
                    (grupo, i) => (
                      <div key={i}>
                        <h4 className="font-semibold text-sm text-gray-700 mb-1">
                          {grupo.nivel}
                        </h4>

                        {grupo.itens.length > 0 ? (
                          <ul className="flex flex-col gap-1">
                            {grupo.itens.map((item, j) => (
                              <li
                                key={j}
                                className="px-3 py-2 bg-gray-50 rounded-md border border-gray-200"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-400 italic">—</p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-blue-600">
                  Habilidade Exclusiva
                </h3>

                {stats.habExclusiva && (
                  <p className="flex flex-col gap-1">
                    {stats.habExclusiva
                      .split("\n")
                      .map((line: string, i: number) => (
                        <span key={i}>
                          {line}
                          <br />
                        </span>
                      ))}
                  </p>
                )}
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
