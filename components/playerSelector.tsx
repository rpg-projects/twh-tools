"use client";

import { titleFont } from "@/app/fonts";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function GreekLoader() {
  return (
    <div className="flex justify-center py-8">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function PlayerSelector({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [player, setPlayer] = useState(""); // 🔥 player escolhido
  const [inputValue, setInputValue] = useState(""); // 🔥 o texto digitado
  const [players, setPlayers] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carrega player salvo no localStorage
  useEffect(() => {
    async function loadPlayers() {
      try {
        const res = await fetch("/api/generalRoutes");

        const data = await res.json();
        setPlayers(data.players || []);
      } catch (e) {
        console.error("Erro ao buscar players:", e);
      } finally {
        setLoading(false);
      }
    }

    const saved = localStorage.getItem("player");
    if (saved) {
      setPlayer(saved);
      setLoading(false);
    } else {
      loadPlayers();
    }
  }, []);

  // Atualiza filtragem baseado no input, não no player
  useEffect(() => {
    if (!inputValue.trim()) {
      setFiltered(players);
      return;
    }
    const termo = inputValue.toLowerCase();
    setFiltered(players.filter((p) => p.toLowerCase().startsWith(termo)));
  }, [inputValue, players]);

  async function save(selected?: string) {
    const final = selected ?? inputValue;
    localStorage.setItem("player", final);

    setPlayer(final); // define o jogador oficial
    setInputValue(""); // limpa input
    setOpened(false);

    // 🔥 PRELOAD DO PLAYER SHEET
    try {
      const res = await fetch("/api/generalRoutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: final }),
      });

      // aqui é seguro chamar .json()
      const data = await res.json();

      localStorage.setItem("playerChars", JSON.stringify(data.chars));
      localStorage.setItem("playerBank", JSON.stringify(data.playerBank));

      const visitedBy = localStorage.getItem("visitedBy");
      if (visitedBy !== null) router.push(visitedBy);
    } catch (err) {
      console.error("save error:", err);
    }
  }

  async function resetPlayer() {
    setLoading(true);
    localStorage.removeItem("player");
    localStorage.removeItem("playerChars");
    localStorage.removeItem("playerBank");
    setPlayer("");
    setInputValue("");
    setOpened(false);

    try {
      const res = await fetch("/api/generalRoutes", { cache: "no-store" });
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (e) {
      console.error("Erro ao buscar players:", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <GreekLoader />;

  // Já escolheu player
  if (player) {
    const first = player[0];
    const rest = player.slice(1);

    return (
      <div className="-mt-48 md:-mt-36">
        <button
          onClick={resetPlayer}
          className="absolute top-4 left-4 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition z-50"
        >
          ← Trocar Player
        </button>

        <div className="relative flex flex-col items-center gap-4 w-full">
          <h2 className={`${titleFont.className} text-[1.6rem] font-bold`}>
            Olá, {first.toUpperCase() + rest.toLowerCase()}
          </h2>
          {children}
        </div>
      </div>
    );
  }

  // Seleção do player
  return (
    <div className="flex flex-col -mt-32 gap-2 w-80">
      <div className="relative">
        <input
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpened(true);
          }}
          placeholder="Seu nome de jogador"
          className="border px-3 py-2 rounded w-full"
        />

        {opened && filtered.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-white border rounded shadow max-h-48 overflow-auto z-50">
            {filtered.map((p) => (
              <li
                key={p}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => save(p)}
              >
                {p}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => save()}
        className="bg-blue-600 text-white px-3 py-2 rounded"
      >
        Entrar
      </button>
    </div>
  );
}
