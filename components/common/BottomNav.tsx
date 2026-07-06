
import React from 'react';
import { Page } from '../../App';
import { HomeIcon, ChartBarIcon, TrophyIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { HomeIcon as HomeSolid, ChartBarIcon as ChartSolid, TrophyIcon as TrophySolid, ChatBubbleLeftRightIcon as ChatSolid } from '@heroicons/react/24/solid';

interface BottomNavProps {
  currentPage: Page;
  navigate: (page: Page) => void;
  notifications?: { predictions: number; forum: number; contact: number };
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, navigate, notifications }) => {
  const tabs = [
    { page: Page.DASHBOARD, label: 'Home', icon: HomeIcon, activeIcon: HomeSolid },
    { page: Page.PREDICTIONS, label: 'Pronos', icon: ChartBarIcon, activeIcon: ChartSolid, badge: notifications?.predictions },
    { page: Page.LEADERBOARD, label: 'Top', icon: TrophyIcon, activeIcon: TrophySolid },
    { page: Page.FORUM, label: 'Forum', icon: ChatBubbleLeftRightIcon, activeIcon: ChatSolid, badge: notifications?.forum },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-white/5 pb-[env(safe-area-inset-bottom)] z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-around items-center h-20">
        {tabs.map((tab) => {
          const isActive = currentPage === tab.page;
          const Icon = isActive ? tab.activeIcon : tab.icon;
          
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.page)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-all active:scale-90 ${isActive ? 'text-white' : 'text-gray-500'}`}
            >
              <div className="relative">
                <Icon className={`w-7 h-7 transition-all ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`} />
                {tab.badge && tab.badge > 0 && (
                   <span className="absolute -top-1 -right-1 flex h-4 w-4">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-gray-900 text-[8px] font-black items-center justify-center text-white">
                        {tab.badge > 9 ? '+' : tab.badge}
                     </span>
                   </span>
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-white' : 'text-gray-600'}`}>{tab.label}</span>
              {isActive && <div className="w-1 h-1 bg-yellow-400 rounded-full mt-0.5"></div>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
