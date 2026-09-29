import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateRawSync } from "node:zlib";
import { verifyBuild } from './verify_build.mjs';
await verifyBuild();
const root = fileURLToPath(new URL("../publish/", import.meta.url));
const destination = path.resolve(
  process.argv[2] ??
    fileURLToPath(new URL("../release/ATLAS_Netlify.zip", import.meta.url)),
);
const files = [];
async function walk(dir = "") {
  for (const e of await fs.readdir(path.join(root, dir), {
    withFileTypes: true,
  })) {
    if (e.isSymbolicLink()) continue;
    const p = path.posix.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else files.push(p);
  }
}
await walk();
const table = Array.from({ length: 256 }, (_, i) => {
  let n = i;
  for (let b = 0; b < 8; b++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const chunks = [],
  directory = [];
let offset = 0;
for (const file of files.sort()) {
  const body = await fs.readFile(path.join(root, file)),
    name = Buffer.from(file),
    compressed = deflateRawSync(body),
    local = Buffer.alloc(30),
    central = Buffer.alloc(46);
  let crc = 0xffffffff;
  for (const b of body) crc = table[(crc ^ b) & 255] ^ (crc >>> 8);
  crc = (crc ^ 0xffffffff) >>> 0;
  local.writeUInt32LE(0x04034b50);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x800, 6);
  local.writeUInt16LE(8, 8);
  local.writeUInt16LE(0x5d38, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(compressed.length, 18);
  local.writeUInt32LE(body.length, 22);
  local.writeUInt16LE(name.length, 26);
  central.writeUInt32LE(0x02014b50);
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
end.writeUInt32LE(0x06054b50);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(central.length, 12);
end.writeUInt32LE(offset, 16);
await fs.mkdir(path.dirname(destination), { recursive: true });
await fs.writeFile(destination, Buffer.concat([...chunks, central, end]));
console.log(
  JSON.stringify({
    path: destination,
    files: files.length,
    bytes: (await fs.stat(destination)).size,
  }),
);
