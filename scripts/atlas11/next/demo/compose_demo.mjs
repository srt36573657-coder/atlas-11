/**
 * 60초 시연 영상 — 소리와 영상 합치기(사장님 2026-10-18 order-0015 [11] 5 · 일꾼 D1)
 *   synth()      글상자 글을 espeak-ng 한국어(기계 목소리)로 읽어 WAV 로 만듦 — 읽는 글 = 화면 글상자 글 그대로
 *   mixTrack()   읽기 WAV 들을 그 장면이 시작한 때에 놓고 누르는 소리(톡)를 얹어 한 줄 WAV 로 합침
 *   makeClock()  기다림 구간을 빨리 감는 시계(눌림은 빨리 감지 않음) — 시계 시간(ms) → 영상 시간(초)
 *   encodeFrames() 찍은 그림(JPEG)을 찍힌 때(시계 시간) 그대로 놓아 소리를 입혀 H.264 + AAC mp4 로 — Playwright recordVideo 는 바쁜 기계에서 영상 시계가 실제보다 7 ~ 13% 느리게 가서 소리와 안 맞아 이 길로 바꿈
 *   numKo()      세는 말(한 · 두 · 세 … 열한 · 스물두) — 글상자 글에 쓰는 숫자
 */
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import fs from 'node:fs/promises';

const run = promisify(execFile);
const SR = 22050;

/** 번 앞에 오는 세는 말 1 ~ 39 (한 번 · 두 번 · 세 번 · 네 번 … 열한 번 · 스무 번 · 스물한 번) */
export function numKo(n) {
  const ones = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
  if (!Number.isInteger(n) || n < 1 || n > 39) return String(n);
  if (n === 20) return '스무';
  const tens = n >= 30 ? '서른' : n >= 20 ? '스물' : n >= 10 ? '열' : '';
  return tens + ones[n % 10];
}

/** espeak-ng 한국어 · 속도는 낱말 수/분(기본 175 — 천천히 150 안팎이 또렷함) */
export async function synth(text, wavPath, {speed = 150, pitch = 50, voice = 'ko'} = {}) {
  await run('espeak-ng', ['-v', voice, '-s', String(speed), '-p', String(pitch), '-g', '3', '-w', wavPath, text]);
  const w = readWav(await fs.readFile(wavPath));
  const peak = w.samples.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
  let a = 0, b = w.samples.length - 1; // 말소리가 실제로 들리는 처음 · 끝(앞뒤 조용한 곳 빼고)
  while (a < b && Math.abs(w.samples[a]) < peak * 0.02) a++;
  while (b > a && Math.abs(w.samples[b]) < peak * 0.02) b--;
  return {wav: wavPath, text, sec: w.samples.length / w.rate, rate: w.rate, peak, speechStart: a / w.rate, speechEnd: (b + 1) / w.rate};
}

/** 16비트 PCM WAV → {rate, samples:Float32Array} (한 줄 소리) */
export function readWav(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') throw new Error('WAV 가 아님');
  let p = 12, fmt = null, data = null;
  while (p + 8 <= buf.length) {
    const id = buf.toString('ascii', p, p + 4); let size = buf.readUInt32LE(p + 4); const body = p + 8;
    if (id === 'fmt ') fmt = {tag: buf.readUInt16LE(body), ch: buf.readUInt16LE(body + 2), rate: buf.readUInt32LE(body + 4), bits: buf.readUInt16LE(body + 14)};
    if (id === 'data') { if (size === 0xFFFFFFFF || body + size > buf.length) size = buf.length - body; data = buf.subarray(body, body + size); break; }
    p = body + size + (size & 1);
  }
  if (!fmt || !data || fmt.tag !== 1 || fmt.bits !== 16) throw new Error('16비트 PCM WAV 만 읽음');
  const n = Math.floor(data.length / (2 * fmt.ch)), out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = data.readInt16LE(i * 2 * fmt.ch) / 32768; // 첫 소리 줄만
  return {rate: fmt.rate, samples: out};
}
function writeWav(path, samples, rate) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return fs.writeFile(path, b);
}

/** 한 줄 소리 합치기 — clips = [{wav, at(초)}] · ticks = [초] · length(초) · 읽기는 가장 큰 값을 0.8 로 맞춤 · 톡 소리는 작게 */
export async function mixTrack({clips, ticks = [], length, out}) {
  const mix = new Float32Array(Math.ceil(length * SR));
  for (const c of clips) {
    const w = readWav(await fs.readFile(c.wav));
    if (w.rate !== SR) throw new Error(`소리 ${w.rate} Hz — ${SR} Hz 여야 함`);
    const peak = w.samples.reduce((m, x) => Math.max(m, Math.abs(x)), 0) || 1, g = 0.8 / peak, at = Math.round(c.at * SR);
    for (let i = 0; i < w.samples.length; i++) { const j = at + i; if (j >= 0 && j < mix.length) mix[j] += w.samples[i] * g; }
  }
  const tick = new Float32Array(Math.round(0.09 * SR)); // 톡: 880 → 440 Hz 로 내려가며 사라지는 짧은 소리
  for (let i = 0; i < tick.length; i++) { const t = i / SR, f = 880 - 440 * (i / tick.length); tick[i] = 0.16 * Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 38); }
  for (const s of ticks) { const at = Math.round(s * SR); for (let i = 0; i < tick.length; i++) { const j = at + i; if (j >= 0 && j < mix.length) mix[j] += tick[i]; } }
  const peak = mix.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
  if (peak > 0.95) for (let i = 0; i < mix.length; i++) mix[i] *= 0.95 / peak;
  await writeWav(out, mix, SR);
  return {peak: Math.min(peak, 0.95), sec: mix.length / SR};
}

/** 기다림 구간(speedups = [{from, to, speed}] 시계 ms)을 빨리 감는 시계 — out(w) = 시작(tOff)부터 w 까지 영상에서 걸리는 초 */
export function makeClock(tOff, speedups = []) {
  const sp = [...speedups].filter(x => x.to > x.from && x.speed > 1).sort((a, b) => a.from - b.from);
  return {
    speedups: sp,
    out(w) {
      const t = Math.max(w, tOff); let saved = 0;
      for (const x of sp) { const a = Math.max(x.from, tOff), b = Math.min(x.to, t); if (b > a) saved += (b - a) * (1 - 1 / x.speed); }
      return (t - tOff - saved) / 1000;
    },
  };
}

/** 찍은 그림들(frames = [{file, t(ms)}])을 찍힌 때대로 놓아 mp4 로 · tOff ~ tEnd 만 · 소리는 이미 합친 WAV · 그림 아래 왼쪽 끝 번호 칸(stage.mjs #seq)은 영상에서 지움 */
/** 화면 중계가 그림마다 적어 보낸 때는 앞뒤로 흔들림(바쁜 기계에서 수십 ~ 수백 ms) — 온 차례(= 찍은 차례)는 그대로 두고, 때만 커지는 쪽으로 고름(가장 덜 바꾸는 고르기 · pool-adjacent-violators) */
export function monotone(frames) {
  const blocks = []; // {sum, n, from, to}
  for (let i = 0; i < frames.length; i++) {
    blocks.push({sum: frames[i].t, n: 1, from: i, to: i});
    while (blocks.length > 1) {
      const b = blocks[blocks.length - 1], a = blocks[blocks.length - 2];
      if (a.sum / a.n <= b.sum / b.n) break;
      blocks.splice(blocks.length - 2, 2, {sum: a.sum + b.sum, n: a.n + b.n, from: a.from, to: b.to});
    }
  }
  const out = frames.map(f => ({...f}));
  for (const b of blocks) for (let i = b.from; i <= b.to; i++) out[i].t = b.sum / b.n;
  return out;
}

export async function encodeFrames({frames, tOff, tEnd, clock, audio, out, listPath, crf = 20}) {
  for (let i = 1; i < frames.length; i++) if (frames[i].t < frames[i - 1].t) throw new Error('그림 때가 거꾸로 — monotone() 을 먼저 거쳐야 해요');
  const lines = []; let sum = 0, used = 0;
  for (let i = 0; i < frames.length; i++) {
    const a = Math.max(frames[i].t, tOff), b = Math.min(i + 1 < frames.length ? frames[i + 1].t : tEnd, tEnd);
    const d = clock.out(b) - clock.out(a);
    if (b <= a || d < 0.0005) continue;
    lines.push(`file '${frames[i].file}'`, `duration ${d.toFixed(4)}`); sum += d; used++;
  }
  const lastFile = lines.length ? lines[lines.length - 2] : null;
  if (!lastFile) throw new Error('쓸 그림이 없음');
  if (Math.abs(sum - clock.out(tEnd)) > 0.05) throw new Error(`그림 길이 합 ${sum.toFixed(3)}초 ≠ 영상 길이 ${clock.out(tEnd).toFixed(3)}초 — 소리와 어긋날 수 있음`);
  lines.push(lastFile); // concat 규칙: 마지막 그림은 길이 없이 한 번 더
  await fs.writeFile(listPath, lines.join('\n') + '\n');
  const length = clock.out(tEnd);
  await run('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-i', audio, '-map', '0:v:0', '-map', '1:a:0',
    '-vf', 'drawbox=x=0:y=ih-8:w=56:h=8:color=0x101828:t=fill,fps=30,format=yuv420p', '-fps_mode', 'cfr', '-c:v', 'libx264', '-preset', 'medium', '-crf', String(crf), '-profile:v', 'high', '-movflags', '+faststart',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '44100', '-t', length.toFixed(3), out], {maxBuffer: 64 * 1024 * 1024});
  const p = await run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,duration', '-show_entries', 'format=duration,size', '-of', 'json', out]);
  return {info: JSON.parse(p.stdout), used, sum: +sum.toFixed(2), length: +length.toFixed(2)};
}
