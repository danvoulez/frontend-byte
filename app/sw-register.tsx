'use client';
import { useEffect } from 'react';

export default function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
      });
    }
    // Best-effort to minimize URL bar in Safari by scrolling a pixel
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => setTimeout(() => window.scrollTo(0, 1), 250));
    }
  }, []);
  return null;
}
