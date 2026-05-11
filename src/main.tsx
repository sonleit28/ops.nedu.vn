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
import './index.css';

async function bootstrap() {
  await enableMocking();
  analytics.init();

  // Wire proactive refresh: inject refreshTokens (avoid circular import) +
  // schedule rotation nếu reload page khi đã có token (tab refresh / mở
  // bookmark). Token đã expired → schedule fire ngay, refreshTokens()
  // recover trước khi user thấy 401.
  setRefreshFn(refreshTokens);
  scheduleProactiveRefresh();

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  );
}

bootstrap();
