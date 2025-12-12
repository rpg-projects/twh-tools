"use client";
import { Char, ErrorsReportData } from "@/types/chars";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function PersonagensPage() {
  const router = useRouter();

  const [players, setPlayers] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Record<string, Char[]>>(
    {}
  );
  const [sumErrorsResults, setSumErrorsResults] = useState<
    Record<string, ErrorsReportData[]>
  >({});

  const [loadingPlayers, setLoadingPlayers] = useState(true);

  const [playerIndex, setPlayerIndex] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showErrorsModal, setShowErrorsModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [scanning, setScanning] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [currentChar, setCurrentChar] = useState("");
  const [charStatus, setCharStatus] = useState<
    "searching" | "found" | "not-found" | null
  >(null);

  useEffect(() => {
    setPlayerIndex(0);
    setTotalPlayers(players.length);
  }, [players]);

  const abortRef = useRef(false);

  useEffect(() => {
    async function loadPlayers() {
      try {
        const res = await fetch("/api/generalRoutes");
        const data = await res.json();
        setPlayers(data.players || []);
      } finally {
        setLoadingPlayers(false);
      }
    }
    loadPlayers();
  }, []);

  async function scanPlayers(
    callbackPerChar: (char: Char) => Promise<any>,
    target: "search" | "errors"
  ) {
    setPlayerIndex(0);
    setScanning(true);
    abortRef.current = false;
    setSearchResults({});
    setSumErrorsResults({});

    try {
      for (const player of players) {
        setPlayerIndex((i) => i + 1);
        if (abortRef.current) break;

        setCurrentPlayer(player);

        const res = await fetch("/api/generalRoutes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: player }),
        });
        const data = await res.json();
        const chars: Char[] = data.chars || [];
        const found: Char[] = [];
        const errors: any[] = [];

        for (const char of chars) {
          if (abortRef.current) break;
          if (!char.fileLink) continue;

          setCurrentChar(char.name);
          setCharStatus("searching");

          if (target === "search") {
            const ok = await callbackPerChar(char);

            setCharStatus(ok ? "found" : "not-found");
            await new Promise((r) => setTimeout(r, 250));

            if (ok) found.push(char);
          } else if (target === "errors") {
            const data: ErrorsReportData = await callbackPerChar(char);

            if (data.hasErrorsOnHPSum || data.hasErrorsOnAttSum)
              errors.push(data);
          }
        }

        if (target === "search") {
          setSearchResults((prev) => ({
            ...prev,
            [player]: found,
          }));
        } else {
          setSumErrorsResults((prev) => ({
            ...prev,
            [player]: errors,
          }));
        }
      }
    } catch (err) {
      console.error("Erro na varredura:", err);
    } finally {
      setScanning(false);
      setCurrentPlayer("");
      setCurrentChar("");
      setCharStatus(null);
    }
  }

  async function startSearchScan() {
    if (!searchTerm.trim()) return alert("Digite um termo.");
    setShowSearchModal(false);

    await scanPlayers(async (char) => {
      const res = await fetch("/api/ocurrenciesSearch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileLink: char.fileLink,
          termo: searchTerm,
        }),
      });

      const data = await res.json();
      return data.found;
    }, "search");
  }

  async function startErrorScan() {
    setShowErrorsModal(false);

    await scanPlayers(async (char) => {
      const res = await fetch("/api/checkForErrors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ char }),
      });

      const data: ErrorsReportData = await res.json();
      return data;

      // console.log("data :>> ", data);
    }, "errors");
  }

  function cancelScan() {
    abortRef.current = true;
  }

  function copyResults() {
    let text = "";
    for (const player of players) {
      text += `Jogador: ${player}\n`;
      const listSearch = searchResults[player] || [];
      const listErrors = sumErrorsResults[player] || [];

      if (listSearch.length === 0 && listErrors.length === 0) {
        text += "  Nenhuma ocorrência.\n\n";
        continue;
      } else if (listSearch.length > 0) {
        for (const c of listSearch) {
          text += `  - ${c.name} — ${c.fileLink}\n`;
        }
      } else {
        for (const c of listErrors) {
          text += `  - ${c.charName} — ${c.fileLink}`;

          const textPartTwo = c.hasErrorsOnHPSum
            ? c.hpAtual &&
              c.hpCorreto &&
              `\n   Hp => atual: ${c.hpAtual} e Hp correto: ${c.hpCorreto}`
            : "";
          const textPartThree = c.hasErrorsOnAttSum
            ? c.somaAtual &&
              c.somaCorreta &&
              `\n   Atributos => Soma atual: ${c.somaAtual} e soma correta: ${c.somaCorreta} \n`
            : "\n";
          text += textPartTwo;
          text += textPartThree;
        }
      }
      text += "\n";
    }
    navigator.clipboard.writeText(text);
    alert("Copiado com sucesso!");
  }

  // ------------------------------------------
  //            PROGRESS BAR
  // ------------------------------------------

  const progress =
    totalPlayers > 0 ? Math.round((playerIndex / totalPlayers) * 100) : 0;

  return (
    <main className="relative min-h-screen bg-[#f0f8ff] p-6 flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>

      <h1 className="text-3xl font-bold mt-12 md:mt-8 mb-6">Administração</h1>

      <div className="flex gap-4 mb-10">
        <button
          onClick={() => setShowSearchModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
        >
          🔎 Fazer busca
        </button>

        <button
          onClick={() => setShowErrorsModal(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-xl shadow hover:bg-red-700 transition"
        >
          ⚠️ Buscar erros de somatório
        </button>
      </div>

      {/* --- LOADER TEMÁTICO + BARRA --- */}
      {scanning && (
        <div className="flex flex-col items-center mt-10">
          {/* Aura */}
          <div className="w-32 h-32 rounded-full bg-blue-200 opacity-40 blur-xl absolute"></div>

          {/* Loader + runa */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* Loader original */}
            <div className="w-24 h-24 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>

            {/* Runa girando no centro */}
            <div className="absolute text-blue-600 text-3xl font-bold animate-spin-slow">
              ϟ
            </div>
          </div>

          <p className="mt-6 text-gray-700 text-lg font-medium">
            Varredura em andamento...
          </p>

          {currentPlayer && (
            <p className="mt-2 text-gray-800">
              Jogador atual: <b>{currentPlayer}</b>
            </p>
          )}

          {currentChar && (
            <p className="mt-2 text-gray-600 text-sm">
              🔍 Checando personagem: <b>{currentChar}</b>
            </p>
          )}

          {charStatus === "searching" && (
            <p className="text-blue-600 font-semibold mt-1">Procurando...</p>
          )}
          {charStatus === "found" && (
            <p className="text-green-600 font-semibold mt-1">✓ Encontrado!</p>
          )}
          {charStatus === "not-found" && (
            <p className="text-red-600 font-semibold mt-1">✗ Não encontrado</p>
          )}

          {/* progress bar */}
          <div className="w-64 h-3 bg-gray-300 rounded-full mt-6 overflow-hidden shadow-inner">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="mt-2 text-gray-700 text-sm">
            {playerIndex}/{totalPlayers} concluídos ({progress}%)
          </p>

          <button
            onClick={cancelScan}
            className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-xl shadow hover:bg-gray-700 transition"
          >
            Cancelar busca
          </button>

          {/* animação da runa */}
          <style jsx>{`
            .animate-spin-slow {
              animation: spin 4s linear infinite;
            }
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}

      {!scanning && !loadingPlayers && players.length > 0 && (
        <>
          <button
            onClick={copyResults}
            className="mb-6 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700 transition"
          >
            Copiar Resultado
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-7xl">
            {players.map((player, i) => (
              <div key={i} className="p-4 bg-white rounded-xl shadow">
                <h2 className="font-bold">{player}</h2>

                {/* ----------------------- */}
                {/* RESULTADOS DE BUSCA 🔎 */}
                {/* ----------------------- */}
                {searchResults[player] && (
                  <>
                    {searchResults[player].length > 0 ? (
                      <ul className="mt-2 text-sm text-gray-700 space-y-1">
                        {searchResults[player].map((char) => (
                          <li key={char.name}>
                            • {char.name}{" "}
                            <a
                              href={char.fileLink}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              abrir arquivo
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mt-2 text-sm">
                        Nenhuma ocorrência.
                      </p>
                    )}
                  </>
                )}

                {/* --------------------------- */}
                {/* RESULTADOS DE ERROS ⚠️ */}
                {/* --------------------------- */}
                {sumErrorsResults[player] && (
                  <>
                    {sumErrorsResults[player].length > 0 ? (
                      <ul className="mt-4 text-sm space-y-3 border-t pt-3">
                        {sumErrorsResults[player].map((char, idx) => (
                          <li
                            key={idx}
                            className="p-3 bg-red-50 rounded border border-red-200 text-red-800"
                          >
                            <p className="font-bold">⚠️ {char.charName}</p>
                            <p className="font-bold">{char.god}</p>
                            {char.hasErrorsOnHPSum && (
                              <>
                                <p>
                                  <b>Erro na conta do HP</b>
                                </p>

                                {char.possuiResilienciaMortal && (
                                  <p className="font-base">
                                    resiliência mortal
                                  </p>
                                )}

                                {char.hpAtual && (
                                  <p>
                                    <b>HP Atual:</b> {char.hpAtual}
                                  </p>
                                )}

                                {char.hpCorreto && (
                                  <p>
                                    <b>HP Correto:</b> {char.hpCorreto}
                                  </p>
                                )}
                              </>
                            )}

                            {char.hasErrorsOnAttSum && (
                              <>
                                <p>
                                  <b>Erro na soma de atributos</b>
                                </p>
                                <p>
                                  <b>Soma atual:</b> {char.somaAtual}
                                </p>
                                <p>
                                  <b>Soma correta:</b> {char.somaCorreta}
                                </p>
                              </>
                            )}

                            <a
                              href={char.fileLink}
                              target="_blank"
                              className="text-blue-600 underline"
                            >
                              abrir arquivo
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 mt-2 text-sm">
                        Nenhum erro de hp ou soma de atributos.
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* MODAL BUSCA */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-xl">
            <h2 className="font-bold text-xl mb-4">Buscar em todos os docs</h2>

            <input
              className="w-full p-2 border rounded mb-4"
              placeholder="Digite o termo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-2 bg-gray-300 rounded"
                onClick={() => setShowSearchModal(false)}
              >
                Cancelar
              </button>

              <button
                className="px-3 py-2 bg-blue-600 text-white rounded"
                onClick={startSearchScan}
              >
                Fazer varredura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ERROS */}
      {showErrorsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-72 md:w-102 shadow-xl">
            <h2 className="font-bold text-xl mb-4">
              Buscar erros de somatório
            </h2>

            <p className="text-gray-700 mb-4 text-sm">
              Esta varredura verifica possíveis erros nos cálculos de:
              <br />• HP total
              <br />• Somatório de atribitos
              {/* <br />• DP total */}
              {/* <br />• DE total */}
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-3 py-2 bg-gray-300 rounded"
                onClick={() => setShowErrorsModal(false)}
              >
                Cancelar
              </button>

              <button
                className="px-3 py-2 bg-red-600 text-white rounded"
                onClick={startErrorScan}
              >
                Iniciar varredura
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
