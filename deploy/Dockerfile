# ATLAS 11 예약 실행기 컨테이너 — 저장소 뿌리에서:  docker build -f deploy/Dockerfile -t atlas11-scheduler .
# 실행은 deploy/docker-compose.yml 로 (reports/ · public/data/ 를 밖에 붙여야 기록이 남는다)
FROM node:22-slim

ENV NODE_ENV=production \
    TZ=Asia/Seoul

# zip/unzip: package.mjs(배포 묶음) 용 · tzdata: Asia/Seoul · ca-certificates: https
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates tzdata zip unzip \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /opt/atlas11

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .
RUN mkdir -p reports/atlas11/operations public/data public/downloads \
 && chown -R node:node /opt/atlas11

USER node

# heartbeat 가 2분 넘게 안 바뀌면 이상(데몬은 60초마다 적는다)
HEALTHCHECK --interval=60s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "const s=require('fs').statSync('reports/atlas11/operations/scheduler-heartbeat.json');process.exit(Date.now()-s.mtimeMs<180000?0:1)"

CMD ["node", "scripts/atlas11/scheduler.mjs"]
