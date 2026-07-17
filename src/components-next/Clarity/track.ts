import clarity from '@microsoft/clarity';

export function trackEvent(name: string, tags?: Record<string, string>) {
  if (typeof window === 'undefined') return;

  try {
    if (tags) {
      for (const [key, value] of Object.entries(tags)) {
        clarity.setTag(key, value);
      }
    }
    clarity.event(name);
  } catch {
    return;
  }
}
