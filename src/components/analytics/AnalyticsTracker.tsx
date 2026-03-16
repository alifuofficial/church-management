'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/store';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAppStore();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: fullPath,
            referrer: document.referrer || '',
            userAgent: navigator.userAgent,
            userId: user?.id || null,
          }),
        });
      } catch (error) {
        // Silently fail to not interrupt user experience
        console.warn('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [pathname, searchParams, user?.id]);

  return null;
}
