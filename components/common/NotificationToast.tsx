import React from 'react';
import { XMarkIcon, BellIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { InAppNotification } from '../../hooks/useNotifications';

interface NotificationToastProps {
  toast: InAppNotification | null;
  onClose: () => void;
  onClick: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toast, onClose, onClick }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 select-none animate-slide-down">
      <div 
        onClick={onClick}
        className="cursor-pointer bg-gray-900/95 backdrop-blur-xl border border-yellow-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex items-start space-x-3 hover:border-yellow-500/50 transition-all duration-300 transform active:scale-95"
      >
        <div className={`p-2.5 rounded-xl ${toast.type === 'validated' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'} flex-shrink-0`}>
          {toast.type === 'validated' ? <TrophyIcon className="w-5 h-5 animate-bounce" /> : <BellIcon className="w-5 h-5 animate-pulse" />}
        </div>
        
        <div className="flex-grow min-w-0 pr-4 text-left">
          <p className="text-xs font-black text-white uppercase tracking-tight line-clamp-1">{toast.title}</p>
          <p className="text-[11px] text-gray-300 mt-1 font-medium leading-relaxed">{toast.body}</p>
          <span className="text-[8.5px] text-yellow-500 font-black tracking-widest uppercase mt-2 block">
            Cliquez pour voir
          </span>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition flex-shrink-0"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      <style>{`
        @keyframes slideDown {
          0% { transform: translate(-50%, -100%); opacity: 0; }
          60% { transform: translate(-50%, 10px); }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
