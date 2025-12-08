"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HPPage() {
  const router = useRouter();

  const [player, setPlayer] = useState("");
  const [chars, setChars] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ Carregar player salvo
  useEffect(() => {
    const p = localStorage.getItem("player");
    if (p) setPlayer(p);
  }, []);

  // 2️⃣ Buscar chars do player
  useEffect(() => {
    if (!player) return;

    async function fetchChars() {
      try {
        const res = await fetch("/api/googleRoutes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: player }),
        });

        const data = await res.json();
        console.log("data :>> ", data);

        // sua rota retorna { chars: [...] } ?
        // ou retorna diretamente a lista?
        // Vou assumir que retorna direto a lista:
        setChars(data);
      } catch (err) {
        console.error("Erro ao buscar chars:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChars();
  }, [player]);

  return (
    <main className="relative min-h-screen bg-[#f8f5f0] p-6 flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold mt-20 mb-6">Calculadora de HP</h1>

      <div className="w-full max-w-md bg-white rounded-xl shadow p-4">
        {loading && <p className="text-gray-600">Carregando personagens...</p>}

        {!loading && chars.length === 0 && (
          <p className="text-gray-600">Nenhum personagem encontrado.</p>
        )}

        {!loading &&
          chars.map((char: any, i: number) => (
            <div key={i} className="border-b py-3">
              <p className="font-semibold">{char.name}</p>
              <p className="text-sm text-gray-500">{char.god}</p>
              <p className="text-sm">Nível: {char.level}</p>
            </div>
          ))}
      </div>
    </main>
  );
}
