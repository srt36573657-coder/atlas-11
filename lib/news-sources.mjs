import {normalizeEvent,scopeOf,scopeErrors,scopeKey,stableValue} from "./news-scope.mjs";
// Public, structured schedules. These parsers never infer the content of a future release.
export const CATEGORIES = {
  CPI: {
    name: "미국 소비자물가 발표",
    channel: "물가 → 금리 기대·할인율·환율",
    provider: "BLS",
  },
  PPI: {
    name: "미국 생산자물가 발표",
    channel: "생산 원가 → 기업 이익·물가 기대",
    provider: "BLS",
  },
  JOBS: {
    name: "미국 고용 발표",
    channel: "고용·임금 → 소비 수요·금리 기대",
    provider: "BLS",
  },
  JOLTS: {
    name: "미국 구인·이직 발표",
    channel: "노동 수요 → 경기·금리 기대",
    provider: "BLS",
  },
  FOMC: {
    name: "미국 연준 금리 결정",
    channel: "달러 금리 → 자금 흐름·환율·할인율",
    provider: "FED",
  },
  BOK: {
    name: "한국은행 금리 결정",
    channel: "국내 금리 → 금융 비용·소비·투자",
    provider: "BOK",
  },
};
export const URLS = {
  BLS: (year) => `https://www.bls.gov/schedule/${year}/`,
  FED: "https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm",
  FED_ANNOUNCEMENT:
    "https://www.federalreserve.gov/newsevents/pressreleases/monetary20240809a.htm",
  BOK: (year) =>
    `https://www.bok.or.kr/portal/singl/crncyPolicyDrcMtg/listYear.do?menuNo=200755&mtgSe=A&pYear=${year}`,
  BOK_ANNOUNCEMENT:
    "https://www.bok.or.kr/portal/bbs/B0000502/view.do?menuNo=201265&nttId=10094300",
};
const clean = (s) =>
  s
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
const iso = (s) => {
  // These are local calendar dates, not instants in the server's timezone.
  const names=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const match=String(s).match(/\b([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})\b/);
  if(!match)return null;
  const month=names.findIndex(n=>n.toLowerCase()===match[1].toLowerCase()),day=Number(match[2]),year=Number(match[3]);
  if(month<0)return null;
  const date=new Date(Date.UTC(year,month,day));
  return date.getUTCMonth()===month&&date.getUTCDate()===day?date.toISOString().slice(0,10):null;
};
export function impactDate(date, country, sessions) {
  return (
    sessions.find((d) => (country === "US" ? d > date : d >= date)) ?? null
  );
}
function event(kind, date, sessions, extra) {
  const category = CATEGORIES[kind],
    country = kind === "BOK" ? "KR" : "US";
  return {
    kind,
    name: category.name,
    channel: category.channel,
    provider: category.provider,
    announcementDate: date,
    targetDate: impactDate(date, country, sessions),
    timeZone: country === "US" ? "America/New_York" : "Asia/Seoul",
    releaseTime:
      kind === "FOMC"
        ? "14:00"
        : kind === "JOLTS"
          ? "10:00"
          : kind === "BOK"
            ? null
            : "08:30",
    target: "all",
    scope: {type:"market"},
    status: "scheduled",
    condition: "공식 일정대로 발표되는 경우",
    ...extra,
  };
}
export function parseBLS(html, year, sessions, observedAt) {
  const events = [];
  const kinds = {
    "Consumer Price Index": "CPI",
    "Producer Price Index": "PPI",
    "Employment Situation": "JOBS",
    "Job Openings and Labor Turnover Survey": "JOLTS",
  };
  // Each annual-page table is followed by that month's modification date.
  for (const block of html.matchAll(
    /<table\b[^>]*class=["']release-list["'][^>]*>([\s\S]*?)<\/table>([\s\S]*?)(?=<table\b[^>]*class=["']release-list|$)/gi,
  )) {
    const modified = iso(
      clean(block[2]).match(
        /Last Modified Date:\s*([A-Za-z]+ \d{1,2}, \d{4})/,
      )?.[1] ?? "",
    );
    for (const row of block[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(
        (m) => clean(m[1]),
      );
      const match = Object.entries(kinds).find(([title]) =>
        cells[2]?.startsWith(title + " for "),
      );
      if (!match) continue;
      const date = iso(cells[0]);
      if (!date || !date.startsWith(String(year))) continue;
      const kind = match[1],
        reference = cells[2].slice(match[0].length + 5);
      const source = `https://www.bls.gov/schedule/${year}/${date.slice(5, 7)}_sched.htm`;
      events.push(
        event(kind, date, sessions, {
          id: `BLS:${kind}:${reference.replaceAll(" ", "-")}`,
          reference,
          availableAt: modified ? modified + "T23:59:59Z" : observedAt,
          availabilityBasis: modified
            ? "공식 월별 일정의 최종 수정일 · 당시 원본 보관본 아님"
            : "최초 수집 시각",
          observedAt,
          sources: [
            {
              name: "미국 노동통계국",
              url: source,
              retrievedAt: observedAt,
              modifiedAt: modified,
            },
          ],
        }),
      );
    }
  }
  if (
    events.length < 20 ||
    new Set(events.map((e) => e.announcementDate.slice(5, 7))).size !== 12
  )
    throw Error("BLS 일정 구조 변경 또는 불완전 응답");
  return events;
}
export function parseFED(html, sessions, observedAt) {
  const events = [],
    sections = [
      ...html.matchAll(
        /(\d{4}) FOMC Meetings<\/a>([\s\S]*?)(?=\d{4} FOMC Meetings<\/a>|$)/g,
      ),
    ];
  for (const section of sections) {
    const year = Number(section[1]);
    if (year < 2024 || year > 2026) continue;
    for (const m of section[2].matchAll(
      /class="[^"]*fomc-meeting__month[^\"]*"[^>]*>([\s\S]*?)<\/div>\s*<div class="[^"]*fomc-meeting__date[^\"]*"[^>]*>([\s\S]*?)<\/div>/g,
    )) {
      // Strategy notation votes are not regular rate-setting meetings.
      if (!/\d+\s*[-–]\s*\d+/.test(clean(m[2]))) continue;
      const month = clean(m[1]).split("/").at(-1),
        day = clean(m[2]).match(/\d+/g)?.at(-1);
      const date = iso(`${month} ${day}, ${year}`);
      if (!date) continue;
      const published = year >= 2025 ? "2024-08-09T17:30:00Z" : null;
      events.push(
        event("FOMC", date, sessions, {
          id: `FED:FOMC:${date.slice(0, 7)}`,
          availableAt: published ?? observedAt,
          availabilityBasis: published
            ? "2024-08-09 연준 공식 일정 발표"
            : "과거 발표일의 사후 확인",
          observedAt,
          sources: [
            {
              name: "미국 연준 회의 일정",
              url: URLS.FED,
              retrievedAt: observedAt,
            },
            ...(published
              ? [
                  {
                    name: "일정 발표 원문",
                    url: URLS.FED_ANNOUNCEMENT,
                    publishedAt: published,
                  },
                ]
              : []),
          ],
        }),
      );
    }
  }
  if (events.length < 16) throw Error("연준 일정 구조 변경 또는 불완전 응답");
  return events;
}
export function parseBOK(html, year, sessions, observedAt) {
  const events = [];
  for (const m of html.matchAll(
    /<th\b[^>]*scope="row"[^>]*>\s*(\d{1,2})월\s*(\d{1,2})일[\s\S]*?<\/th>/g,
  )) {
    const date = `${year}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
    const published =
      year === 2026 ? "2025-10-30T23:59:59+09:00" : "2024-10-31T23:59:59+09:00";
    events.push(
      event("BOK", date, sessions, {
        id: `BOK:RATE:${date.slice(0, 7)}`,
        availableAt: published,
        availabilityBasis: "한국은행 연간 일정 보도자료",
        observedAt,
        sources: [
          {
            name: "한국은행 결정회의 일정",
            url: URLS.BOK(year),
            retrievedAt: observedAt,
          },
          {
            name: "연간 일정 발표",
            url:
              year === 2026
                ? URLS.BOK_ANNOUNCEMENT
                : "https://www.bok.or.kr/portal/bbs/B0000502/view.do?menuNo=201265&nttId=10087747",
            publishedAt: published,
          },
        ],
      }),
    );
  }
  if (events.length !== 8)
    throw Error("한국은행 일정 구조 변경 또는 불완전 응답");
  return events;
}
// Existing releases keep their original publication evidence. Changed schedules become new revisions.
export function mergeNews(input, incoming, scopes, observedAt, {completeRecords=false}={}) {
  const next = structuredClone(input),
    revisions = (next.newsRevisions ??= []);
  const signature = (e) =>
    JSON.stringify([
      e.kind,
      e.announcementDate,
      e.targetDate,
      e.status,
      e.name,
      scopeKey(e),
      (e.sources??[]).map(({retrievedAt,observedAt,lastVerifiedAt,...evidence})=>JSON.stringify(stableValue(evidence))).sort(),
      e.reference, e.releaseTime, e.timeZone, e.timezone, e.publicationDate, e.publishedAt,
      stableValue(e.reviewEvidence),stableValue(e.materialityEvidence),
      stableValue(e.throughSubsidiary),e.economicEventId,e.underlyingEventId,
      e.referencePeriod,e.referenceId,e.originalVintageVerified,
      e.phase,e.phaseId,
    ]);
  for (const e of incoming) {
    const old = next.events.find((x) => x.id === e.id);
    if (!old) {
      const added={
        ...e,
        availableAt: observedAt,
        availabilityBasis: "운영 중 최초 수집 시각",
      };
      next.events.push(added);
      revisions.push({at:observedAt,id:e.id,before:null,after:structuredClone(added),reason:'운영 중 최초 수집'});
      continue;
    }
    if (signature(old) !== signature(e)) {
      const before=structuredClone(old);
      // Parsers provide partial fields; preserve separately curated evidence.
      // Callers providing full snapshots must explicitly request replacement.
      if(completeRecords)for(const key of Object.keys(old))delete old[key];
      Object.assign(old, structuredClone(e), {
        availableAt: observedAt,
        availabilityBasis: "운영 중 일정 변경 확인 시각",
      });
      revisions.push({ at: observedAt, id: e.id, before, after: structuredClone(old) });
    } else {
      old.lastVerifiedAt = observedAt;
    }
  }
  for (const old of next.events) {
    if (
      !scopes.some(
        (s) =>
          old.provider === s.provider &&
          old.announcementDate?.startsWith(s.year),
      ) ||
      old.targetDate <= observedAt.slice(0, 10) ||
      old.status === "withdrawn"
    )
      continue;
    if (!incoming.some((e) => e.id === old.id)) {
      const before=structuredClone(old);
      old.status = "withdrawn";
      old.availableAt = observedAt;
      revisions.push({
        at: observedAt,
        id: old.id,
        before,
        after:structuredClone(old),
        reason: "공식 일정에서 삭제됨",
      });
    }
  }
  return next;
}
export async function collectNews(
  input,
  { now = new Date(), fetcher = fetch, feedUrl } = {},
) {
  const observedAt = now.toISOString(),
    year = Number(input.end.slice(0, 4)),
    sessions = input.calendar.sessions;
  const sources = [
    {
      provider: "BLS",
      year: String(year),
      url: URLS.BLS(year),
      parse: (h) => parseBLS(h, year, sessions, observedAt),
    },
    {
      provider: "FED",
      year: String(year),
      url: URLS.FED,
      parse: (h) => parseFED(h, sessions, observedAt),
    },
    {
      provider: "BOK",
      year: String(year),
      url: URLS.BOK(year),
      parse: (h) => parseBOK(h, year, sessions, observedAt),
    },
  ];
  if (feedUrl) {
    if (new URL(feedUrl).protocol !== "https:")
      throw Error("기업 뉴스 피드는 HTTPS 주소여야 합니다.");
    sources.push({
      provider: "EXTERNAL",
      year: String(year),
      url: feedUrl,
      parse: (text) => {
        const data = JSON.parse(text);
        if (!Array.isArray(data.events))
          throw Error("기업 뉴스 피드에 events 배열이 없습니다.");
        return data.events.map((e) => {
          if (
            typeof e.id !== "string" ||
            !e.kind ||
            !e.name ||
            !/^\d{4}-\d{2}-\d{2}$/.test(e.announcementDate) ||
            !Number.isFinite(Date.parse(e.availableAt)) ||
            !Array.isArray(e.sources) ||
            !e.sources.some(
              (s) => typeof s.url === "string" && s.url.startsWith("https://"),
            )
          )
            throw Error("기업 뉴스 피드의 날짜·공개 시각·출처 오류");
          const errors=scopeErrors(e,input.assets,observedAt);
          if(errors.length)throw Error(errors.join(" · "));
          if (!sessions.includes(e.targetDate))
            throw Error("기업 뉴스 피드의 한국 반영일 오류");
          return {
            ...normalizeEvent(e),
            id: "FEED:" + e.id,
            provider: "EXTERNAL",
            observedAt,
            availabilityBasis: "관리자가 연결한 근거 피드 · 원문 확인 필요",
          };
        });
      },
    });
  }
  const incoming = [],
    scopes = [],
    logs = [];
  await Promise.all(
    sources.map(async (s) => {
      try {
        let parsed,
          attempts = 0;
        for (let attempt = 0; attempt < 2; attempt++) {
          attempts++;
          try {
            const r = await fetcher(s.url, {
              signal: AbortSignal.timeout(25000),
            });
            if (!r.ok) throw Error("HTTP " + r.status);
            parsed = s.parse(await r.text());
            if (
              s.provider === "FED" &&
              parsed.filter((e) => e.announcementDate.startsWith(String(year)))
                .length !== 8
            )
              throw Error("올해 정기 금리회의 8건 확인 실패");
            break;
          } catch (e) {
            if (attempt === 1) throw e;
          }
        }
        incoming.push(...parsed);
        scopes.push(s);
        logs.push({
          provider: s.provider,
          url: s.url,
          ok: true,
          count: parsed.length,
          attempts,
        });
      } catch (e) {
        logs.push({
          provider: s.provider,
          url: s.url,
          ok: false,
          error: e.message,
        });
      }
    }),
  );
  const next = mergeNews(input, incoming, scopes, observedAt);
  next.newsCheckedAt = observedAt;
  next.newsCollection = {
    at: observedAt,
    success: logs.filter((l) => l.ok).length,
    total: sources.length,
    items: logs,
  };
  return { input: next, log: next.newsCollection };
}
