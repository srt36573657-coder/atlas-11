import fs from "node:fs/promises";
import { runStep } from "./deploy_steps.mjs";
import { checkNode } from "../public/DEPLOY_NETLIFY.mjs";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
const npm = process.platform === "win32" ? "npm.cmd" : "npm",
  npx = process.platform === "win32" ? "npx.cmd" : "npx";
const dry = process.argv.includes("--dry-run");
function run(exe, args, label) {
  return runStep(exe, args, label, { cwd: root, dry });
}
checkNode();
run(npm, ["ci"], "1/4 프로그램 구성 설치");
run(
  npx,
  ["--yes", "netlify-cli@27.9.0", "login"],
  "2/4 Netlify 계정 연결 — 열리는 브라우저에서 로그인하세요",
);
let key = "dry-run-placeholder";
if (!dry) {
  const dir = new URL("../.atlas/", import.meta.url);
  await fs.mkdir(dir, { recursive: true, mode: 0o700 });
  const file = new URL("admin-key.txt", dir);
  try {
    key = (await fs.readFile(file, "utf8")).trim();
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    key = randomBytes(32).toString("hex");
    await fs.writeFile(file, key + "\n", { mode: 0o600 });
  }
  if(!/^[a-f0-9]{64}$/i.test(key))throw Error("기존 관리자 키 파일 형식이 잘못되었습니다. 자동 생성한 64자리 키를 사용하세요.");
}
run(
  npx,
  [
    "--yes",
    "netlify-cli@27.9.0",
    "deploy",
    "--prod",
    "--context",
    "production",
    "--secret-env",
    "ATLAS_ADMIN_TOKEN=" + key,
  ],
  "3/4 화면·자동 갱신 함수 함께 배포 — 기존 프로젝트 선택 또는 새 프로젝트 생성",
);
console.log(
  "4/4 배포 결과의 사이트 주소를 여세요. 사이트의 ‘자료·운영 기록’에서 ‘운영 서버 연결’을 확인하세요.",
);
console.log("관리자 키: " + fileURLToPath(new URL("../.atlas/admin-key.txt", import.meta.url)) + " (공개 파일에는 포함하지 않습니다.)");
console.log(
  "Netlify Functions 화면에서 daily의 Scheduled 표시와 refresh-background를 확인하세요. 실제 예약 실행 결과는 첫 실행 뒤 기록됩니다.",
);
