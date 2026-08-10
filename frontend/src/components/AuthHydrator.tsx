"use client";

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// Mounted once in the root layout so every page (auth pages included)
// attempts a silent session restore from the HttpOnly refresh cookie on
// first load - this is what keeps you logged in across a page refresh.
export function AuthHydrator() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
