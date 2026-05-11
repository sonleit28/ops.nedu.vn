import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { enableMocking } from './mocks/init';
import { AppRouter } from './routes';
import { analytics } from '@shared/analytics';
import { refreshTokens } from '@shared/config/auth-central-client';
import {
  scheduleProactiveRefresh,
  setRefreshFn,
} from '@shared/config/proactive-refresh';
import { tokenStorage } from '@shared/config/token-storage';
import './index.css';

async function bootstrap() {
  await enableMocking();
  analytics.init();

  // Wire proactive refresh: inject refreshTokens (avoid circular import).
  setRefreshFn(refreshTokens);

  // BH-5: access token memory-only — cleared on every page reload.
  // Bootstrap re-mint access từ refresh nếu user có session active
  // (localStorage có refresh token). Tránh 401-then-retry race cho first
  // API call sau reload.
  //
  // Failure mode: refresh expired/revoked → silent fail → user click action
  // → reactive 401 → redirect login. Acceptable UX (rare since BH-1 sliding
  // 7d refresh).
  if (tokenStorage.hasRefresh() && !tokenStorage.has()) {
    await refreshTokens().catch(() => {
      // Silent — reactive 401 sẽ handle khi user gọi API
    });
  }

  // Schedule rotation nếu memory access populated (sau bootstrap refresh
  // hoặc page reload with valid refresh). Decode jwt.exp + fire 60s trước
  // expire.
  scheduleProactiveRefresh();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  );
}

bootstrap();
