
import React, { useState } from 'react';
import type { User, LeaderboardEntry, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { getFlagUrl, getSafeImageUrl } from '@/utils/imageUtils';

interface LeaderboardProps {
  navigate: (page: Page) => void;
  currentUser: User;
  leaderboard: LeaderboardEntry[];
  ads: Ad[];
  settings?: AppSettings;
}

const RankChangeIndicator: React.FC<{ change: 'up' | 'down' | 'same' }> = ({ change }) => {
  switch (change) {
    case 'up':
      return <ArrowUpIcon className="w-4 h-4 text-green-400" />;
    case 'down':
      return <ArrowDownIcon className="w-4 h-4 text-red-400" />;
    default:
      return <MinusIcon className="w-4 h-4 text-gray-500" />;
  }
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ navigate, currentUser, leaderboard, ads, settings }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeaderboard = leaderboard.filter(entry =>
    entry.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col">
      <Header title="Classement" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      <main className="flex-grow container mx-auto p-4 flex flex-col overflow-hidden">

        <AdBanner pageName="leaderboard" settings={settings} className="mb-4 flex-shrink-0" />

        <div className="mb-4 relative flex-shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg p-3 pl-10 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />
        </div>

        <div className="flex-1 bg-gray-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
           <div className="hidden md:flex bg-gray-700/50 p-4 font-bold text-gray-400 text-sm flex-shrink-0">
              <div className="w-1/4">Rang</div>
              <div className="w-1/2">Joueur</div>
              <div className="w-1/4 text-right">Points</div>
          </div>
          <ul className="divide-y divide-gray-700 overflow-y-auto">
            {filteredLeaderboard.length > 0 ? (
              filteredLeaderboard.map((entry) => (
                <li
                  key={entry.user.id}
                  className={`flex items-center p-4 transition-colors duration-300 ${entry.user.id === currentUser.id ? 'bg-green-500/10' : 'hover:bg-gray-700/50'}`}
                >
                  <div className="flex items-center space-x-3 w-1/4">
                      <span className="font-bold text-lg text-gray-400 w-8 text-center">{entry.rank}</span>
                      <RankChangeIndicator change={entry.rankChange} />
                  </div>

                  <div className="flex items-center space-x-3 w-1/2">
                    <img src={getSafeImageUrl(entry.user.profilePictureUrl, 'https://picsum.photos/seed/user/100')} alt={entry.user.name} className="w-12 h-12 rounded-full object-cover border-2 border-gray-600" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-semibold text-white truncate max-w-[120px] xs:max-w-none">{entry.user.name}</p>
                        {entry.badges && entry.badges.map((badge, idx) => (
                          <span 
                            key={idx} 
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 cursor-help transition ${badge.color}`}
                            title={badge.description}
                          >
                            <span>{badge.icon}</span>
                            <span className="hidden xs:inline">{badge.name}</span>
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        {entry.user.country?.code ? (
                          <img
                            src={`https://flagcdn.com/w40/${entry.user.country.code.toLowerCase()}.png`}
                            alt={entry.user.country?.name || ''}
                            className="w-5 h-3.5 object-cover rounded-sm border border-white/10 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs flex-shrink-0">🌍</span>
                        )}
                        <span className="text-xs text-gray-400 truncate">{entry.user.country?.name || 'Inconnu'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-1/4 text-right">
                    <span className="font-bold text-xl text-yellow-400">{entry.points}</span>
                    <span className="text-gray-400 text-sm"> pts</span>
                  </div>
                </li>
              ))
            ) : (
                <li className="p-8 text-center text-gray-400">
                    {searchQuery ? `Aucun joueur trouvé pour "${searchQuery}".` : "Aucun classement n'est disponible pour le moment."}
                </li>
            )}
          </ul>
        </div>
        <div className="mt-16 pt-4 border-t border-white/5 flex-shrink-0">
          <AdCarousel ads={ads} />
        </div>
      </main>
    </div>
  );
};
