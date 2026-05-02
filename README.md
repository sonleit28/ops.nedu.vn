# ops.nedu.vn

Portal vận hành (**ops dashboard**) cho platform NEDU — React 19 + Vite 8 + TypeScript.

Gọi [`nedu-backend`](../../NLH-NEDU-CORE/nedu-backend/) để lấy data; auth qua [`auth-central`](../../NLH-CORE/auth-central/) (SSO).

---

## 1. Stack

- **React 19** + **Vite 8** + TypeScript (strict)
- **TanStack Query 5** (server state) + **Zustand 5** (client state)
- **React Router 7**
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **MSW 2** — mock API cho dev mode (bật/tắt bằng `VITE_ENABLE_MOCKING`)
- Deploy: **Cloudflare Workers** (primary, qua `@cloudflare/vite-plugin`) + **Vercel** (optional/parallel, xem `vercel.json`)

---

## 2. Prerequisites

- Node.js ≥ 20
- npm ≥ 10

Optional (khi chạy live thay vì mock):
- [`nedu-backend`](../../NLH-NEDU-CORE/nedu-backend/) chạy sẵn ở `VITE_API_URL`
- [`auth-central`](../../NLH-CORE/auth-central/) chạy sẵn ở `VITE_AUTH_CENTRAL_URL`

---

## 3. Setup

```bash
# 1. Vào thư mục
cd NLH-NEDU-LABS/ops.nedu.vn

# 2. Cài dependencies
npm install

# 3. Copy env template
cp .env.example .env
#   → edit .env theo mục 5

# 4. Start dev server
npm run dev
```

Mặc định chạy ở `http://localhost:5173`. Vite in port chính xác ra terminal nếu 5173 bị chiếm.

---

## 4. Scripts

| Lệnh | Mục đích |
|------|----------|
| `npm run dev` | Dev server (Vite + HMR) |
| `npm run build` | Type check (`tsc -b`) + build production → `dist/` |
| `npm run preview` | Preview bản build local |
| `npm run lint` | ESLint |

---

## 5. Env vars

File [.env.example](.env.example):

```
VITE_API_URL=http://localhost:8080          # URL của nedu-backend
VITE_AUTH_CENTRAL_URL=http://localhost:4000 # URL của auth-central
VITE_ENABLE_MOCKING=true                    # true ⇒ dùng MSW mock, false ⇒ gọi backend thật
VITE_GA4_ID=                                # Google Analytics 4 Measurement ID (G-XXXX) — rỗng = disable
VITE_CLARITY_ID=                            # Microsoft Clarity Project ID — rỗng = disable
```

- Khi `VITE_ENABLE_MOCKING=true`: **không cần** chạy backend/auth-central, MSW sẽ intercept request. Handler mock nằm ở `src/mocks/`.
- Khi `VITE_ENABLE_MOCKING=false`: cần `nedu-backend` + `auth-central` chạy sẵn ở URL đã config.
- Mọi biến phải prefix `VITE_` mới được expose ra client (rule của Vite).

---

## 5b. Analytics (GA4 + Microsoft Clarity)

Module: [src/shared/analytics/](src/shared/analytics/). Public API: `analytics.init()`, `analytics.pageView()`, `analytics.identify()`, `analytics.reset()`, `analytics.track()`.

**Khi nào tracking thực sự chạy:**
- `import.meta.env.PROD === true` (production build), **VÀ**
- `window.location.hostname === 'ops.nedu.vn'`, **VÀ**
- env var tương ứng (`VITE_GA4_ID` / `VITE_CLARITY_ID`) có giá trị.

Mọi case khác (dev, vercel preview, `*.workers.dev`, `nedu-ops-dev`, hostname custom) → no-op. Set `VITE_CLARITY_ID` ở Cloudflare `nedu-ops-prod` Build Variables (xem Section 6) cho production; không cần ghi vào `.env` local.

**Identify:** sau khi user login, store gọi `analytics.identify(person_id, { role })`. KHÔNG truyền email / full_name / phone.

**Track event mới:**
1. Thêm key + shape params vào `EventMap` trong [src/shared/analytics/events.ts](src/shared/analytics/events.ts).
2. Ở consumer: `analytics.track('event_name', { ...params })`.
3. Quy tắc params: snake_case, **chỉ ID — không PII**.

**Privacy / PII (Clarity):**
- Mặc định nên set Mask Mode = **Strict** trong Clarity dashboard.
- Khi cần unmask element an toàn (label, button text...), thêm attribute `data-clarity-unmask="true"` ở element đó.
- Khi cần che PII trong DOM mà chưa được mask sẵn, thêm `data-clarity-mask="true"`.
- Tham khảo: <https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking>.

**Clarity SDK:** dùng package chính chủ [`@microsoft/clarity`](https://www.npmjs.com/package/@microsoft/clarity) (MIT, 0 deps, ~7 KB) — không tự inject snippet thủ công.

---

## 6. Deploy

> Reference đầy đủ cho cả workspace: [`/DEPLOY-CLOUDFLARE.md`](../../DEPLOY-CLOUDFLARE.md). Section dưới chỉ note ngắn cho ops.nedu.vn.
>
> **Quan trọng:** Worker name **thực tế** trên CF = top-level `name` trong `wrangler.jsonc` (`nedu-ops`). Block `env.{dev,production}.name` (`nedu-ops-dev` / `nedu-ops-prod`) giữ làm declaration; tách 2 worker dev/prod thực sự dựa vào `--name nedu-ops-dev` / `--name nedu-ops-prod` ở `deploy:dev` / `deploy:prod` scripts.

### 6.1 Cloudflare Workers (primary)

**Lần đầu (làm 1 lần ở local):**

```bash
# 1. Cài deps mới
npm install

# 2. Login Cloudflare CLI (chỉ chạy 1 lần / 1 máy)
npx wrangler login
npx wrangler whoami            # verify đúng account NLH

# 3. Deploy dev → tạo Worker `nedu-ops-dev`
npm run deploy:dev
#   → mở https://nedu-ops-dev.<account>.workers.dev và smoke test

# 4. Deploy prod → tạo Worker `nedu-ops-prod`
npm run deploy:prod
#   → mở https://nedu-ops-prod.<account>.workers.dev và smoke test
```

**Sau đó cấu hình trên Cloudflare dashboard:**

1. **Workers & Pages → `nedu-ops-dev` / `nedu-ops-prod` → Source · Connect to Git**
   - Repo `ops.nedu.vn` (hoặc tên repo tương ứng).
   - `nedu-ops-dev`: branch `develop` (hoặc `staging`).
   - `nedu-ops-prod`: branch `main`.
   - Build command: `npm run cf:build`.
   - Deploy command: `npx wrangler deploy --name nedu-ops-dev` (hoặc `--name nedu-ops-prod`).

2. **Settings · Variables and Secrets** (build-time, vì Vite bake vào bundle)
   - `VITE_API_URL` — URL `nedu-backend` tương ứng env (prod / staging).
   - `VITE_AUTH_CENTRAL_URL` — URL `auth-central` tương ứng env.
   - `VITE_ENABLE_MOCKING` — `false` cho cả 2 env (mock chỉ chạy ở `npm run dev` local).
   - `VITE_CLARITY_ID` — chỉ set ở **prod** (analytics chỉ chạy trên `ops.nedu.vn`).

3. **Settings · Domains & Routes**
   - `nedu-ops-prod`: gắn custom domain `ops.nedu.vn`.
   - `nedu-ops-dev`: gắn `ops-dev.nedu.vn` (hoặc giữ subdomain `*.workers.dev`).

### 6.2 Vercel (optional/parallel)

- Framework preset: **Vite**
- Build command: `npm run build`
- Output dir: `dist`
- `vercel.json` đã cấu hình rewrite cho SPA routing
- Env vars: set trong Vercel project settings (không commit `.env`)
- Giữ Vercel config song song để team có thể deploy preview branch nhanh khi cần.

### 6.3 Quy tắc

- **Không** đổi top-level `name` trong `wrangler.jsonc` (đã pin `nedu-ops`). Worker dev/prod tách qua `--name` flag, không phải env block.
- **Không** commit `.wrangler/`, `.dev.vars` (đã `.gitignore`).
- Thay đổi `wrangler.jsonc` (thêm binding R2/KV) → deploy local 1 lần test trước, rồi mới merge.
- SPA fallback đã handle qua `assets.not_found_handling: "single-page-application"` — không cần worker code custom.

---

## 7. Lưu ý cho team

- **Commit rule riêng cho portal `NLH-NEDU-LABS/*`:** được phép commit trực tiếp trên `main`, không cần branch / PR (xem [../../CLAUDE.md](../../CLAUDE.md)).
- Không thêm state lib mới (Redux, Jotai, ...) — Zustand + TanStack Query đã đủ cho use case hiện tại.
- Khi thêm route mới: đăng ký trong router, thêm MSW handler song song để team khác dev không phụ thuộc backend.
- Tailwind 4 dùng config-less mode (`@import "tailwindcss"` trong CSS) — xem `src/index.css`.
- Kiến trúc tổng: [architecture.md](architecture.md)
