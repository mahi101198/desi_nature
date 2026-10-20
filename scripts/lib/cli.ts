import fs from "node:fs";
import path from "node:path";

export function args(argv = process.argv.slice(2)) {
  const flags = new Set(argv.filter((a) => a.startsWith("--") && !a.includes("=")));
  const values = new Map(
    argv.filter((a) => a.startsWith("--") && a.includes("=")).map((a) => a.slice(2).split("=", 2) as [string, string]),
  );
  const positional = argv.filter((a) => !a.startsWith("--"));
  return { flags, values, positional };
}

export function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

export function writeFile(file: string, content: string) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, content);
}

export function rel(file: string): string {
  return path.relative(process.cwd(), file);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Exclusive lock file so two scheduled runs cannot overlap. A lock older than
 * `staleMs` is assumed to be from a crashed run and is replaced.
 */
export function acquireLock(file: string, staleMs = 2 * 60 * 60 * 1000): () => void {
  ensureDir(path.dirname(file));
  try {
    fs.writeFileSync(file, JSON.stringify({ pid: process.pid, at: new Date().toISOString() }), { flag: "wx" });
  } catch {
    const age = Date.now() - fs.statSync(file).mtimeMs;
    if (age < staleMs) throw new Error(`Another run holds ${rel(file)} (started ${Math.round(age / 60000)} min ago).`);
    fs.writeFileSync(file, JSON.stringify({ pid: process.pid, at: new Date().toISOString(), replacedStale: true }));
  }
  return () => fs.rmSync(file, { force: true });
}
