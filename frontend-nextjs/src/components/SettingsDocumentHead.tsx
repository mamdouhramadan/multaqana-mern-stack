import { useEffect } from 'react';
import { useSettings } from '@/providers/SettingsProvider';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? '';

/** Build full URL for asset path (e.g. /img/settings/logo.png) */
function assetUrl(path: string): string {
  if (!path || typeof path !== 'string') return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return base ? `${base}${path.startsWith('/') ? '' : '/'}${path}` : path;
}

/**
 * Updates document head (favicon, title) from public settings.
 * Renders nothing; must be used inside SettingsProvider.
 */
export function SettingsDocumentHead() {
  const { getString, isLoading } = useSettings();
  const favicon = getString('favicon');
  const title = getString('site_title');

  useEffect(() => {
    if (isLoading) return;
    if (favicon) {
      const href = assetUrl(favicon);
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = href;
    }
    if (title) {
      document.title = title;
    }
  }, [isLoading, favicon, title]);

  return null;
}
