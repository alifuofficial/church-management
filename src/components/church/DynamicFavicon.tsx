'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/store';

export function DynamicFavicon() {
  const { settings } = useAppStore();

  useEffect(() => {
    if (settings.faviconUrl) {
      const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.rel = 'icon';
      link.href = settings.faviconUrl;
      document.head.appendChild(link);
    }
  }, [settings.faviconUrl]);

  return null;
}