'use client';

import './globals.css';
import { Toaster } from 'react-hot-toast';
import AppInitializer from '@/components/AppInitializer';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppInitializer />
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}