"use client";
import { CompleteChar } from "@/types/chars";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function PersonagensPage() {
  const router = useRouter();

  const [chars, setChars] = useState<CompleteChar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const playerName = localStorage.getItem("player");
    const savedChars = localStorage.getItem("playerChars");

    if (!savedChars) {
      router.push("/");
      return;
    }

    async function loadChars() {
      try {
        const res = await fetch("/api/charDetailRoutes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: playerName, chars: savedChars }),
        });

        const details: CompleteChar[] = await res.json();
        setChars(details); // só atualiza depois que os dados chegam
      } catch (error) {
        console.error("Erro ao carregar chars:", error);
      } finally {
        setLoading(false);
      }
    }

    loadChars();
  }, []);

  return (
    <main className="relative min-h-screen bg-[#f0f8ff] p-4 flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold mt-12 md:mt-8 mb-6">
        Meus Personagens
      </h1>

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
            <div className="absolute bottom-0 left-0 w-full bg-blue-400 opacity-70 animate-fill"></div>
          </div>
          <p className="mt-4 text-gray-600 text-lg">
            Carregando personagens...
          </p>
        </div>
      ) : chars.length === 0 ? (
        <p className="text-gray-600 mt-20 text-lg">
          Nenhum personagem encontrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-4 w-full max-w-7xl">
          {chars.map((char, i) => (
            <div
              key={i}
              onClick={() => {
                localStorage.setItem("selectedChar", JSON.stringify(char));
                router.push(
                  `/personagens/${encodeURIComponent(
                    `${localStorage
                      .getItem("player")
                      ?.toLowerCase()}-${char.name.split(" ")[0].toLowerCase()}`
                  )}`
                );
              }}
              className="flex gap-2 p-4 bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer min-w-64"
            >
              <div className="flex flex-col items-center">
                <Image
                  src={char.avatar}
                  alt={char.name}
                  width={96}
                  height={96}
                  className="rounded-full border-2 border-blue-300"
                  placeholder="blur"
                  blurDataURL="/images/avatar-fallback.png"
                />
                <span className="mt-2 px-3 py-1 text-xs font-semibold text-white bg-blue-400 rounded-full">
                  {char.god}
                </span>
              </div>
              <div className="flex flex-col gap-[.8px] flex-1">
                <p className="font-bold text-lg">{char.name}</p>
                <p className="flex flex-wrap text-sm">
                  <span>Nível: {char.level}</span>
                  <span className="mx-2"> </span>
                  <span>Verão: {char.summer}</span>
                </p>
                <p className="text-sm text-gray-600">{char.origin}</p>
                <p className="text-sm text-gray-600">{char.alignment}</p>
                <p className="text-sm text-gray-600"></p>
                <p className="flex flex-wrap text-sm text-gray-600">
                  <span>Idade: {char.age}</span>
                  <span className="mx-2"> </span>
                  <span>Nasceu em: {char.nascimento}</span>
                </p>
              </div>
            </div>
          ))}
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
          height: 0;
          animation: fill 2s ease-in-out forwards;
          z-index: 5; /* atrás do tridente se ele tiver z-10 */
        }
      `}</style>
    </main>
  );
}
