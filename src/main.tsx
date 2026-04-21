import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { enableMocking } from './mocks/init';
import { AppRouter } from './routes';
import './index.css';

async function bootstrap() {
  await enableMocking();
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppRouter />
    </StrictMode>,
  );
}

bootstrap();
