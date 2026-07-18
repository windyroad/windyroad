'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

const PRODUCTION_HOSTS = new Set(['windyroad.com.au', 'www.windyroad.com.au']);
const ANALYTICS_OPT_OUT_KEY = 'windyroad.analytics.optedOut';

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function shouldRecordClarity(hostname: string) {
  return PRODUCTION_HOSTS.has(hostname);
}

export function applyAnalyticsPreference(
  url: URL,
  storage: PreferenceStorage,
) {
  const preference = url.searchParams.get('analytics');

  if (preference === 'off') {
    try {
      storage.setItem(ANALYTICS_OPT_OUT_KEY, '1');
      url.searchParams.delete('analytics');
    } catch {
      // Keep the URL preference so a refresh remains opted out.
    }
    return false;
  }

  if (preference === 'on') {
    try {
      storage.removeItem(ANALYTICS_OPT_OUT_KEY);
      url.searchParams.delete('analytics');
    } catch {
      // Keep the URL preference so a refresh retries the change.
    }
    return true;
  }

  try {
    return storage.getItem(ANALYTICS_OPT_OUT_KEY) !== '1';
  } catch {
    return true;
  }
}

export default function Clarity({ projectId }: { projectId: string }) {
  useEffect(() => {
    if (!shouldRecordClarity(window.location.hostname)) return;

    const url = new URL(window.location.href);
    const originalUrl = url.toString();
    const analyticsAllowed = applyAnalyticsPreference(url, window.localStorage);

    if (url.toString() !== originalUrl) {
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }

    if (!analyticsAllowed) return;
    clarity.init(projectId);
  }, [projectId]);

  return null;
}
