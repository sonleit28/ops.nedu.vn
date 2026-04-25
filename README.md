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
- Deploy: **Vercel** (xem `vercel.json`)

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
```

- Khi `VITE_ENABLE_MOCKING=true`: **không cần** chạy backend/auth-central, MSW sẽ intercept request. Handler mock nằm ở `src/mocks/`.
- Khi `VITE_ENABLE_MOCKING=false`: cần `nedu-backend` + `auth-central` chạy sẵn ở URL đã config.
- Mọi biến phải prefix `VITE_` mới được expose ra client (rule của Vite).

---

## 5b. Analytics

Module: [src/shared/analytics/](src/shared/analytics/). Public API: `analytics.init()`, `analytics.pageView()`, `analytics.identify()`, `analytics.reset()`, `analytics.track()`.

Hiện tích hợp **GA4** qua `gtag.js`. Microsoft Clarity là stub no-op, sẽ được wire ở commit kế tiếp.

**Khi nào tracking thực sự chạy:**
- `import.meta.env.PROD === true` (production build), **VÀ**
- `window.location.hostname === 'ops.nedu.vn'`, **VÀ**
- `VITE_GA4_ID` có giá trị.

Mọi case khác (dev, vercel preview, hostname custom) → no-op. Set env trong Vercel project settings cho `Production` environment, không cần ghi vào `.env` local.

**Identify:** sau khi user login, store gọi `analytics.identify(person_id, { role })`. KHÔNG truyền email / full_name / phone.

**Track event mới:**
1. Thêm key + shape params vào `EventMap` trong [src/shared/analytics/events.ts](src/shared/analytics/events.ts).
2. Ở consumer: `analytics.track('event_name', { ...params })`.
3. Quy tắc params: snake_case, **chỉ ID — không PII**.

---

## 6. Deploy (Vercel)

- Framework preset: **Vite**
- Build command: `npm run build`
- Output dir: `dist`
- `vercel.json` đã cấu hình rewrite cho SPA routing
- Env vars: set trong Vercel project settings (không commit `.env`)

---

## 7. Lưu ý cho team

- **Commit rule riêng cho portal `NLH-NEDU-LABS/*`:** được phép commit trực tiếp trên `main`, không cần branch / PR (xem [../../CLAUDE.md](../../CLAUDE.md)).
- Không thêm state lib mới (Redux, Jotai, ...) — Zustand + TanStack Query đã đủ cho use case hiện tại.
- Khi thêm route mới: đăng ký trong router, thêm MSW handler song song để team khác dev không phụ thuộc backend.
- Tailwind 4 dùng config-less mode (`@import "tailwindcss"` trong CSS) — xem `src/index.css`.
- Kiến trúc tổng: [architecture.md](architecture.md)
