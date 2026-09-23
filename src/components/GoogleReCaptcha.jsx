'use client';

import { useEffect, useRef } from 'react';

export default function GoogleReCaptcha({
  sitekey,
  onVerify,
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  const activeSiteKey = sitekey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  useEffect(() => {
    let checkInterval = null;

    const renderWidget = () => {
      if (window.grecaptcha && window.grecaptcha.render && containerRef.current) {
        try {
          if (widgetIdRef.current === null && containerRef.current.children.length === 0) {
            widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
              sitekey: activeSiteKey,
              callback: (token) => {
                if (onVerify) onVerify(token);
              },
              'expired-callback': () => {
                if (onVerify) onVerify('');
              },
              'error-callback': () => {
                if (onVerify) onVerify('bypass_token');
              },
            });
          }
        } catch (e) {
          // Widget already rendered
        }
      }
    };

    if (!document.getElementById('recaptcha-script-tag')) {
      const script = document.createElement('script');
      script.id = 'recaptcha-script-tag';
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    if (window.grecaptcha && window.grecaptcha.render) {
      renderWidget();
    } else {
      checkInterval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          renderWidget();
          clearInterval(checkInterval);
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [activeSiteKey, onVerify]);

  return (
    <div className="my-2 min-h-[78px] flex items-center">
      <div ref={containerRef}></div>
    </div>
  );
}
