'use client';

import { useEffect } from 'react';
import clarity from '@microsoft/clarity';

const PRODUCTION_HOSTS = new Set(['windyroad.com.au', 'www.windyroad.com.au']);

export function shouldRecordClarity(hostname: string) {
  return PRODUCTION_HOSTS.has(hostname);
}

export default function Clarity({ projectId }: { projectId: string }) {
  useEffect(() => {
    if (!shouldRecordClarity(window.location.hostname)) return;
    clarity.init(projectId);
  }, [projectId]);

  return null;
}
