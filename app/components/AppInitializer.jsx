'use client';

import { useEffect } from 'react';

export default function AppInitializer() {
  useEffect(() => {
    // Initialize app on first load
    fetch('/api/init');
  }, []);

  return null; // This component renders nothing
}