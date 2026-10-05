// Validate and restore the source before invoking the deployment guide.
// Each source archive gets its own folder; retrying never overwrites local data.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const crcTable = Array.from({ length: 256 }, (_, i) => {
  let n = i;
  for (let bit = 0; bit < 8; bit++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(data) {
  let n = 0xffffffff;
  for (const b of data) n = crcTable[(n ^ b) & 255] ^ (n >>> 8);
  return (n ^ 0xffffffff) >>> 0;
}
export function supportedNode(version) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) return false;
  const [major, minor, patch] = version.split(".").map(Number);
  return (major === 22 && (minor > 22 || (minor === 22 && patch >= 2))) ||
    (major === 24 && minor >= 15) || major >= 26;
}
export function checkNode(version = process.versions.node) {
  if (!supportedNode(version)) throw Error(
    `현재 Node.js ${version}은 지원하지 않습니다. Node.js 24.15 이상인 24 버전을 설치하세요: https://nodejs.org/`,
  );
}
export function readSourceZip(zip) {
  const bad = () => { throw Error("소스 ZIP이 손상되었습니다. ZIP을 다시 내려받아 모두 압축 해제하세요."); };
  if (zip.length < 22) bad();
  // The bundled source uses ordinary ZIP entries with sizes in local headers.
  const end = zip.length - 22;
  if (zip.readUInt32LE(end) !== 0x06054b50 || zip.readUInt16LE(end + 20) !== 0 ||
      zip.readUInt16LE(end + 4) !== 0 || zip.readUInt16LE(end + 6) !== 0) bad();
  const count = zip.readUInt16LE(end + 10), centralOffset = zip.readUInt32LE(end + 16);
  if (!count || zip.readUInt16LE(end + 8) !== count ||
      centralOffset + zip.readUInt32LE(end + 12) !== end) bad();
  const entries = [], names = new Set();
  let cursor = centralOffset;
  for (let i = 0; i < count; i++) {
    if (cursor + 46 > end || zip.readUInt32LE(cursor) !== 0x02014b50) bad();
    const flags = zip.readUInt16LE(cursor + 8), method = zip.readUInt16LE(cursor + 10),
      checksum = zip.readUInt32LE(cursor + 16), size = zip.readUInt32LE(cursor + 20),
      rawSize = zip.readUInt32LE(cursor + 24), nameLen = zip.readUInt16LE(cursor + 28),
      extraLen = zip.readUInt16LE(cursor + 30), commentLen = zip.readUInt16LE(cursor + 32),
      offset = zip.readUInt32LE(cursor + 42);
    const next = cursor + 46 + nameLen + extraLen + commentLen;
    if (next > end || flags & 9 || rawSize > 100_000_000 || offset + 30 > centralOffset) bad();
    const name = zip.subarray(cursor + 46, cursor + 46 + nameLen).toString("utf8");
    if (!name || name.includes("\\") || name.includes(":") || name.includes("\0") ||
        name.split("/").some(part => !part || part === "." || part === "..") || names.has(name.toLowerCase())) bad();
    names.add(name.toLowerCase());
    if (zip.readUInt32LE(offset) !== 0x04034b50 || zip.readUInt16LE(offset + 6) !== flags ||
        zip.readUInt16LE(offset + 8) !== method || zip.readUInt32LE(offset + 14) !== checksum ||
        zip.readUInt32LE(offset + 18) !== size || zip.readUInt32LE(offset + 22) !== rawSize ||
        zip.readUInt16LE(offset + 26) !== nameLen) bad();
    const start = offset + 30 + nameLen + zip.readUInt16LE(offset + 28);
    if (start + size > centralOffset ||
        zip.subarray(offset + 30, offset + 30 + nameLen).toString("utf8") !== name) bad();
    let data;
    try {
      const compressed = zip.subarray(start, start + size);
      data = method === 8 ? inflateRawSync(compressed, { maxOutputLength: 100_000_000 }) :
        method === 0 ? compressed : null;
    } catch { bad(); }
    if (!data || data.length !== rawSize || crc32(data) !== checksum) bad();
    entries.push({ name, data });
    cursor = next;
  }
  if (cursor !== end) bad();
  for (const required of ["package.json", "package-lock.json", "netlify.toml", "scripts/deploy_netlify.mjs", "public/data/atlas.json"]) {
    if (!entries.some(e => e.name === required)) throw Error(`소스 ZIP에 ${required}가 없습니다. 배포 ZIP 전체를 다시 받아 주세요.`);
  }
  return entries;
}
export async function prepareSource(here, { checkOnly = false } = {}) {
  const zip = await fs.readFile(path.join(here, "downloads", "ATLAS_Program_Source.zip"));
  const entries = readSourceZip(zip), hash = createHash("sha256").update(zip).digest("hex"),
    base = path.join(here, ".atlas-deploy"), destination = path.join(base, hash.slice(0, 16));
  if (checkOnly) return { destination, files: entries.length, restored: false };
  await fs.mkdir(base, { recursive: true });
  try {
    if ((await fs.readFile(path.join(destination, ".source-sha256"), "utf8")).trim() !== hash)
      throw Error("복원 폴더의 식별값이 다릅니다. 기존 자료 보호를 위해 덮어쓰지 않았습니다.");
    for (const file of ["package.json", "scripts/deploy_netlify.mjs", "public/data/atlas.json"])
      await fs.access(path.join(destination, file));
    return { destination, files: entries.length, restored: false };
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    try {
      await fs.access(destination);
      throw Error(`이전 복원 폴더가 불완전합니다. 자료는 보존했습니다: ${destination}`);
    } catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  const staging = await fs.mkdtemp(path.join(base, ".restoring-"));
  try {
    for (const { name, data } of entries) {
      const target = path.join(staging, name);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, data);
    }
    await fs.writeFile(path.join(staging, ".source-sha256"), hash + "\n");
    await fs.rename(staging, destination);
  } catch (e) {
    await fs.rm(staging, { recursive: true, force: true });
    throw e;
  }
  return { destination, files: entries.length, restored: true };
}
export async function main(here = path.dirname(fileURLToPath(import.meta.url)), args = process.argv.slice(2)) {
  const logFile = path.join(here, "ATLAS_RUN_LOG.jsonl");
  const record = async data => fs.appendFile(logFile, JSON.stringify({ at: new Date().toISOString(), ...data }) + "\n");
  let stage = "Node 버전 확인";
  try {
    checkNode();
    stage = "압축 파일과 소스 확인";
    const checkOnly = args.includes("--check") || args.includes("--dry-run");
    const restored = await prepareSource(here, { checkOnly });
    if (checkOnly) {
      console.log(`사전 점검 통과: Node.js ${process.versions.node}, 소스 ${restored.files}개 CRC 확인. 로그인·배포는 실행하지 않았습니다.`);
      await record({ stage, status: "checked", files: restored.files });
      return 0;
    }
    console.log(`${restored.restored ? "소스 복원 완료" : "이전 작업에서 계속합니다"}: ${restored.destination}`);
    await record({ stage, status: "ready", directory: restored.destination });
    stage = "설치·Netlify 로그인·배포";
    const result = spawnSync(process.execPath, [path.join(restored.destination, "scripts", "deploy_netlify.mjs")], {
      cwd: restored.destination, stdio: "inherit",
      env: { ...process.env, ATLAS_RUN_LOG_PATH: logFile },
    });
    if (result.error) throw result.error;
    const code = result.status ?? 1;
    await record({ stage, status: code === 0 ? "success" : "failed", exitCode: code, signal: result.signal });
    if (code !== 0) console.error("배포가 완료되지 않았습니다. 실행 창과 ATLAS_RUN_LOG.jsonl을 확인한 뒤 같은 실행기를 다시 실행하세요. 기존 자료는 보존됩니다.");
    return code;
  } catch (e) {
    const message = e.code === "ENOENT" ? "필수 파일을 찾지 못했습니다. ZIP 전체를 압축 해제한 폴더에서 실행하세요." : e.message;
    await record({ stage, status: "failed", error: message }).catch(() => {});
    console.error(`${stage} 실패: ${message}`);
    return 1;
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
