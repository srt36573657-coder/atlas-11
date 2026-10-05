// Portable ZIP packaging using only Node.js built-ins. No network or credentials.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import { verifyBuild } from './verify_build.mjs';
await verifyBuild();
const root = fileURLToPath(new URL("..", import.meta.url));
const files = new Set([
  "index.html",
  "package.json",
  "package-lock.json",
  "vite.config.mjs",
  "netlify.toml",
  "server.mjs",
  "README.md",
  "VALIDATION.md",
  "ATLAS_Stock_Equations.md",
  "NEWS_INPUT.md",
  "engine/data/prices.json",
  "engine/data/events.json",
  "engine/data/universe.json",
  "engine/research/reconciled_naver.json",
]);
const activeSources = [
  "rolling.tsx",
  "rolling.css",
  "completion-status.tsx",
  "completion-status.css",
  "factor36.tsx",
  "factor36.css",
  "factor36-theme.css",
  "workspace.css",
  "fonts.css",
  "legacy-support.css",
  "sealed-study.tsx",
  "sealed-study.css",
  "learned-design.css",
  "studio.css",
  "focus.css",
  "clarity.css",
  "atelier-brand.css",
  "atelier-layout.css",
  "atelier-charts.css",
  "atelier-panels.css",
  "atlas.tsx",
  "breaking.tsx",
  "breaking.css",
  "evolution.tsx",
  "evolution.css",
  "workbench.tsx",
  "insights.tsx",
  "fomo.tsx",
  "movement.tsx",
  "news-wave.tsx",
  "forecast-pulse.tsx",
  "forecast-pulse.css",
  "equal-start.tsx",
  "equal-start.css",
  "cycles.tsx",
  "main.tsx",
  "globals.css",
  "design365-brand.css",
  "design365-shell.css",
  "design365-charts.css",
  "design365-evidence.css",
  "design365-responsive.css",
  "design365-accessibility.css",
  "design365-dialogs.css",

  "storage.mjs",
  "worker.mjs",
];
activeSources.forEach((f) => files.add("src/" + f));
async function walk(relative) {
  for (const entry of await fs.readdir(path.join(root, relative), {
    withFileTypes: true,
  })) {
    const name = relative + "/" + entry.name;
    if (
      entry.isSymbolicLink() ||
      name.endsWith(".zip") ||
      entry.name === "__pycache__"
    )
      continue;
    if (entry.isDirectory()) await walk(name);
    else files.add(name);
  }
}
for (const folder of [
  "lib",
  "netlify",
  "scripts",
  "tests",
  "public",
  "publish",
  "reports",
  "news-research",
])
  await walk(folder);
const crcTable = Array.from({ length: 256 }, (_, i) => {
  let n = i;
  for (let b = 0; b < 8; b++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(buffer) {
  let c = 0xffffffff;
  for (const b of buffer) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
const chunks = [],
  directory = [];
let offset = 0;
for (const file of [...files].sort()) {
  let body;
  try {
    body = await fs.readFile(path.join(root, file));
  } catch (e) {
    if (e.code === "ENOENT" && file === "VALIDATION.md") continue;
    throw e;
  }
  const name = Buffer.from(file),
    compressed = deflateRawSync(body),
    crc = crc32(body),
    local = Buffer.alloc(30),
    central = Buffer.alloc(46);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(0x5d38, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(body.length, 22);
  local.writeUInt16LE(name.length, 26);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x800, 8);
  central.writeUInt16LE(8, 10);
  central.writeUInt16LE(0x5d38, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(compressed.length, 20);
  central.writeUInt32LE(body.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(offset, 42);
  chunks.push(local, name, compressed);
  directory.push(central, name);
  offset += local.length + name.length + compressed.length;
}
const central = Buffer.concat(directory),
  end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(directory.length / 2, 8);
end.writeUInt16LE(directory.length / 2, 10);
end.writeUInt32LE(central.length, 12);
end.writeUInt32LE(offset, 16);
const destination = path.join(
  root,
  "publish/downloads/ATLAS_Program_Source.zip",
);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, Buffer.concat([...chunks, central, end]));
console.log(`Source ZIP: ${directory.length / 2} files`);
