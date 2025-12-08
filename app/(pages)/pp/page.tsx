"use client";
import { useRouter } from "next/navigation";

export default function PPPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[#f8f5f0] p-6 flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 px-4 py-2 bg-white shadow rounded-xl text-sm hover:bg-gray-100 transition"
      >
        ← Voltar
      </button>

      <h1 className="text-2xl font-bold mt-20 mb-6">Disponibilidade de PP</h1>

      <div className="w-full max-w-md bg-white rounded-xl shadow p-4">
        {/* Conteúdo */}
        <p className="text-gray-600">
          Verifique aqui quando o PP está liberado.
        </p>
      </div>
    </main>
  );
}
