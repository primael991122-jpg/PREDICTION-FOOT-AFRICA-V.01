
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
    <div className="w-full overflow-hidden relative py-4 bg-gray-950/80 border-y-2 border-yellow-500/20 shadow-2xl backdrop-blur-md">
      {/* Label indicateur de sponsoring */}
      <div className="absolute top-1 left-4 z-10 text-[9px] uppercase tracking-widest font-bold text-yellow-500/60 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">
        Partenaires Officiels
      </div>
      
      <div 
        className="flex space-x-5 w-max animate-ad-scroll py-2 mt-2"
        style={{ animationDuration: `${duration}s` }}
      >
        {displayAds.map((ad, index) => (
          <a 
            href={ad.url || '#'} 
            key={`${ad.id}-${index}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-shrink-0 w-80 bg-gray-900 rounded-xl shadow-xl border border-white/10 overflow-hidden group transform hover:scale-[1.03] hover:border-yellow-500/30 hover:shadow-yellow-500/5 transition-all duration-300 flex items-center h-24"
          >
            <div className="h-full w-28 overflow-hidden bg-black flex-shrink-0 border-r border-white/5 relative">
                <img 
                    src={ad.imageUrl} 
                    alt={ad.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-1 left-1 text-[8px] bg-black/70 text-gray-400 px-1 py-0.5 rounded font-mono uppercase">
                  AD
                </span>
            </div>
            <div className="px-4 py-2 flex-grow min-w-0 flex flex-col justify-between h-full">
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black text-white truncate group-hover:text-yellow-400 uppercase tracking-wide leading-snug">
                  {ad.name}
                </h3>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <p className="text-base sm:text-lg font-black text-yellow-400">
                  {ad.price}
                </p>
                <span className="text-[9px] font-black uppercase text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/30 group-hover:bg-yellow-500 group-hover:text-black transition-colors duration-300">
                  Profiter
                </span>
              </div>
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
