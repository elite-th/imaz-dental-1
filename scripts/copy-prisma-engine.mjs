// scripts/copy-prisma-engine.mjs
// Copies the Prisma client + generated engine into the Next.js standalone
// output so the production server can actually load @prisma/client.
//
// Runs automatically via `postbuild` and as the last step of `build:standalone`.
//
// Why this is needed:
//   Next.js `output: "standalone"` traces dependencies, but Prisma's query
//   engine binary (node_modules/.prisma/client/*.node) is often missed by
//   the tracer. Without this copy, the standalone server crashes at boot
//   with: "@prisma/client did not initialize yet".

import { existsSync, mkdirSync, cpSync, rmSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const STANDALONE_DIR = join(projectRoot, ".next", "standalone");
const STANDALONE_NM = join(STANDALONE_DIR, "node_modules");

const PRISMA_CLIENT_SRC = join(projectRoot, "node_modules", "@prisma", "client");
const PRISMA_CLIENT_DST = join(STANDALONE_NM, "@prisma", "client");

const PRISMA_ENGINE_SRC = join(projectRoot, "node_modules", ".prisma");
const PRISMA_ENGINE_DST = join(STANDALONE_NM, ".prisma");

const PRISMA_SCHEMA_SRC = join(projectRoot, "prisma");
const PRISMA_SCHEMA_DST = join(STANDALONE_DIR, "prisma");

function info(msg) {
  console.log(`[copy-prisma-engine] ${msg}`);
}

function copyTree(src, dst) {
  if (!existsSync(src)) {
    info(`SKIP: source does not exist: ${src}`);
    return false;
  }
  rmSync(dst, { recursive: true, force: true });
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst, { recursive: true });
  // Count files for the log message.
  let count = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name));
      else count++;
    }
  };
  walk(dst);
  info(`copied ${count} file(s) → ${dst}`);
  return true;
}

function main() {
  if (!existsSync(STANDALONE_DIR)) {
    info(`No standalone output found at ${STANDALONE_DIR}`);
    info("This script only matters after `next build`. Nothing to do.");
    return;
  }

  info(`Project root: ${projectRoot}`);
  info(`Standalone:   ${STANDALONE_DIR}`);

  // 1. @prisma/client (the JS wrapper)
  copyTree(PRISMA_CLIENT_SRC, PRISMA_CLIENT_DST);

  // 2. .prisma (the generated client + native engine binary)
  copyTree(PRISMA_ENGINE_SRC, PRISMA_ENGINE_DST);

  // 3. prisma schema (needed by some Prisma operations at runtime)
  copyTree(PRISMA_SCHEMA_SRC, PRISMA_SCHEMA_DST);

  // 4. If a local SQLite db exists, copy it too (dev/preview only —
  //    in real production you'd use a managed MySQL).
  const sqliteDb = join(PRISMA_SCHEMA_SRC, "dev.db");
  if (existsSync(sqliteDb)) {
    cpSync(sqliteDb, join(PRISMA_SCHEMA_DST, "dev.db"));
    info(`copied dev.db → ${join(PRISMA_SCHEMA_DST, "dev.db")}`);
  }

  info("Done.");
}

main();
