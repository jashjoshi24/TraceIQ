import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AppRoutes } from './routes';
import './index.css';

export const App: React.FC = () => {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    // Rehydrate session from HttpOnly cookie on initial load/refresh
    hydrate();
  }, [hydrate]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
