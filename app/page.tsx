"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import greekBoy from "./images/greek-boy.png";
import PlayerSelector from "@/components/playerSelector";
import { useEffect, useState } from "react";
import next from "next";

export default function Home() {
  const [playerKey, setPlayerKey] = useState("none");

  useEffect(() => {
    const stored = localStorage.getItem("player") || "none";

    setPlayerKey(stored);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#f8f5f0] flex items-center justify-center p-6">
      {/* PLAYER SELECTOR envolve APENAS O MENU */}
      <PlayerSelector key={playerKey}>
        <div className="flex flex-col gap-4 w-full max-w-sm z-10 ">
          <Link href="/personagens">
            <button className="w-full px-4 py-3 text-base font-semibold bg-white shadow rounded-xl hover:bg-gray-100 transition">
              Meus chars
            </button>
          </Link>

          <Link href="/hp">
            <button className="w-full px-4 py-3 text-base font-semibold bg-white shadow rounded-xl hover:bg-gray-100 transition">
              Calculadora de HP
            </button>
          </Link>

          <Link href="/pp">
            <button className="w-full px-4 py-3 text-base font-semibold bg-white shadow rounded-xl hover:bg-gray-100 transition">
              Verificar disponibilidade de pp
            </button>
          </Link>

          <Link href="/loja">
            <button className="w-full px-4 py-3 text-base font-semibold bg-white shadow rounded-xl hover:bg-gray-100 transition">
              Fazer Compras
            </button>
          </Link>
        </div>
      </PlayerSelector>

      {/* IMAGEM NO CANTO */}
      <Image
        src={greekBoy}
        alt="Decoração grega"
        width={320}
        height={320}
        className="
          absolute bottom-0 
          pointer-events-none 
          opacity-100 
          w-64 md:w-96

          left-1/2 -translate-x-1/2   /* 🔥 CENTRALIZA NO MOBILE */

          md:left-auto md:right-0 md:translate-x-0  /* 🔥 VOLTA PRO CANTO NO DESKTOP */
        "
      />
    </main>
  );
}
