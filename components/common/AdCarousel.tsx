
import React from 'react';
import type { Ad } from '../../types';

interface AdCarouselProps {
  ads: Ad[];
}

export const AdCarousel: React.FC<AdCarouselProps> = ({ ads }) => {
  // Filtrer les pubs qui n'ont pas d'image
  const validAds = ads.filter(ad => ad && ad.imageUrl);

  if (!validAds || validAds.length === 0) return null;

  // Pour un défilement fluide, on répète la liste plusieurs fois si elle est courte
  // pour s'assurer qu'elle dépasse largement la largeur de l'écran.
  const displayAds = validAds.length < 5 
    ? [...validAds, ...validAds, ...validAds, ...validAds] 
    : [...validAds, ...validAds];

  // Durée du défilement : ~5 secondes par publicité
  const duration = Math.max(15, validAds.length * 5);

  return (
    <div className="w-full overflow-hidden relative py-1 bg-gray-900/40 border-y border-white/5 shadow-inner">
      <div 
        className="flex space-x-3 w-max animate-ad-scroll py-1"
        style={{ animationDuration: `${duration}s` }}
      >
        {displayAds.map((ad, index) => (
          <a 
            href={ad.url || '#'} 
            key={`${ad.id}-${index}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-shrink-0 w-48 bg-gray-950 rounded-lg shadow-md border border-white/10 overflow-hidden group transform hover:scale-[1.02] transition-all duration-300 flex items-center h-12"
          >
            <div className="h-full w-14 overflow-hidden bg-black flex-shrink-0">
                <img 
                    src={ad.imageUrl} 
                    alt={ad.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                />
            </div>
            <div className="px-2 py-1 flex-grow min-w-0 flex flex-col justify-center leading-tight">
              <h3 className="text-[10px] font-bold text-gray-300 truncate group-hover:text-yellow-400 uppercase tracking-tight">{ad.name}</h3>
              <p className="text-[11px] font-black text-yellow-500">{ad.price}</p>
            </div>
          </a>
        ))}
      </div>
       <style>{`
        @keyframes ad-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); } 
        }
        .animate-ad-scroll {
          animation-name: ad-scroll;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        .animate-ad-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
