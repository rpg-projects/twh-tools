import BestiarioService from "@/lib/bestiarioServices";
import { getAuthService } from "@/lib/googleAuth";
import { NextResponse } from "next/server";

const service = new BestiarioService();

// GET opcional
export async function GET() {
  const { docs } = await getAuthService();

  try {
    const [aereos, aquaticos, submundanos, terrestres] = await Promise.all([
      service.getMonstrosFromFile(
        "https://docs.google.com/document/d/1AXt_vY4tn_SJlbufgVmlOfWGVpqjaE5ODgRt9vYMzcM/preview?tab=t.0",
        "ANEMOI THUELLAI",
        docs,
      ),
      service.getMonstrosFromFile(
        "https://docs.google.com/document/d/1QyC9YWtVKDlgmdEH_sk-krpF03mPZHv4lsW6q-hbR_s/preview?tab=t.0",
        "CARCINO & CARCINO REI",
        docs,
      ),
      service.getMonstrosFromFile(
        "https://docs.google.com/document/d/1BLtAkBAFMBsDFIkKuF9kXq3dkWRKFxXbFkwsFabMD7g/preview?tab=t.0",
        "ARA",
        docs,
      ),
      service.getMonstrosFromFile(
        "https://docs.google.com/document/d/1_GM-URb3RsA5c012UxfATg_Woy8OPHwDZ19mhNAk1Fs/preview?tab=t.0",
        "APRÓSOPO",
        docs,
      ),
    ]);

    const monstros = [
      ...aereos.map((m) => ({ ...m, tipo: "AEREO" })),
      ...aquaticos.map((m) => ({ ...m, tipo: "AQUATICO" })),
      ...submundanos.map((m) => ({ ...m, tipo: "SUBMUNDANO" })),
      ...terrestres.map((m) => ({ ...m, tipo: "TERRESTRE" })),
    ];

    return NextResponse.json(monstros);
  } catch (err) {
    console.error("Error in stores route:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
