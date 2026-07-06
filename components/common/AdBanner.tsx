
import React, { useEffect, useState, useRef } from 'react';
import type { AppSettings } from '../../types';

interface AdBannerProps {
  pageName: keyof AppSettings['adSenseSlots'];
  settings?: AppSettings;
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ pageName, settings, className = "" }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const adRef = useRef<boolean>(false);

  // Safely extract config
  const clientId = settings?.adSenseClientId || "";
  const slotId = settings?.adSenseSlots?.[pageName] || "";
  
  // A valid client ID should start with 'ca-pub-' and not be the placeholder
  const isValidClient = clientId && clientId.startsWith('ca-pub-') && clientId !== 'ca-pub-XXXXXXXXXXXXXXXX';
  const isConfigured = isValidClient && slotId;

  useEffect(() => {
    if (!isValidClient) return;

    // Check if script already exists
    const existingScript = document.querySelector(`script[src*="adsbygoogle.js"][src*="${clientId}"]`);
    
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, [clientId, isValidClient]);

  useEffect(() => {
    // Only push if configured, script is loaded, and we haven't pushed for this specific instance mount
    if (isConfigured && isScriptLoaded && !adRef.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adRef.current = true;
      } catch (err: any) {
        console.debug("AdSense push error:", err?.message || "Blocked by browser");
      }
    }
  }, [isConfigured, isScriptLoaded, pageName]);

  // Render nothing if configuration is missing
  if (!isConfigured) {
    return null;
  }

  return (
    <div className={`w-full flex justify-center py-2 overflow-hidden bg-black/5 rounded-xl border border-white/5 ${className}`}>
      <div className="text-center w-full flex flex-col items-center" style={{ minHeight: '90px' }}>
        <span className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Sponsorisé</span>
        <ins className="adsbygoogle"
          style={{ display: 'block', width: '100%' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true">
        </ins>
      </div>
    </div>
  );
};
