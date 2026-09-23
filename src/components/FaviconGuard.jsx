'use client';

import { useEffect } from 'react';
import api from '../lib/api';

export default function FaviconGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setFavicon = (url) => {
      if (!url) return;

      let iconLink = document.querySelector("link[rel='icon']") || document.querySelector("link[rel='shortcut icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = url;

      const appleLink = document.querySelector("link[rel='apple-touch-icon']");
      if (appleLink) {
        appleLink.href = url;
      }
    };

    const fetchLogoFavicon = async () => {
      try {
        const res = await api.get('/public/logo-favicon');
        if (res.data && res.data.success && res.data.settings) {
          const { logoUrl: logo, faviconUrl: fav } = res.data.settings;
          const targetFavicon = fav || logo;

          if (targetFavicon) {
            setFavicon(targetFavicon);
          } else {
            setFavicon('/logo.jpeg');
          }

          if (logo) {
            window.siteCustomLogoUrl = logo;
            window.dispatchEvent(new CustomEvent('site-logo-updated', { detail: logo }));
          }
        } else {
          setFavicon('/logo.jpeg');
        }
      } catch (err) {
        setFavicon('/logo.jpeg');
      }
    };

    fetchLogoFavicon();
  }, []);

  return null;
}
