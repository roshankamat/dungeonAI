import { promises as fs } from "node:fs";
import path from "node:path";
import { SPEAKING_ORDER } from "@/lib/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

/**
 * Lists which council portraits exist in /public/characters so the client can
 * render photos when available and rune glyphs otherwise, with no config file.
 */
export async function GET() {
  const dir = path.join(process.cwd(), "public", "characters");
  let files: string[] = [];
  try {
    files = await fs.readdir(dir);
  } catch {
    /* folder missing: no portraits */
  }
  const lower = new Map(files.map((f) => [f.toLowerCase(), f]));
  const art: Record<string, string> = {};
  for (const name of SPEAKING_ORDER) {
    for (const ext of EXTENSIONS) {
      const match = lower.get(`${name.toLowerCase()}.${ext}`);
      if (match) {
        art[name] = `/characters/${match}`;
        break;
      }
    }
  }
  return Response.json(art, { headers: { "Cache-Control": "no-store" } });
}
