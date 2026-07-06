
import React from 'react';
import type { User, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { TrophyIcon, GlobeAltIcon, UserGroupIcon } from '@heroicons/react/24/solid';

interface AboutProps {
  navigate: (page: Page) => void;
  currentUser: User;
  ads: Ad[];
  settings?: AppSettings;
}

export const About: React.FC<AboutProps> = ({ navigate, currentUser, ads, settings }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header title="À Propos" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <AdBanner pageName="about" settings={settings} className="mb-8" />
        
        <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-700">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 text-center">
                    <div className="bg-gray-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <TrophyIcon className="w-12 h-12 text-yellow-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Prediction Foot Africa</h2>
                    <p className="text-gray-900 font-bold opacity-75">Le concours de pronostics n°1</p>
                </div>
                
                <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-start">
                        <GlobeAltIcon className="w-8 h-8 text-yellow-500 mr-4 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Notre Mission</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Réunir les passionnés de football africain et international autour d'une compétition amicale et excitante. 
                                Testez vos connaissances, défiez vos amis et grimpez au classement !
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start">
                         <UserGroupIcon className="w-8 h-8 text-blue-500 mr-4 flex-shrink-0 mt-1" />
                         <div>
                            <h3 className="text-xl font-bold text-white mb-2">La Communauté</h3>
                            <p className="text-gray-400 leading-relaxed">
                                Plus qu'un jeu, c'est un espace d'échange. Utilisez le forum pour débattre des matchs, partager vos analyses et vivre votre passion à 100%.
                            </p>
                         </div>
                    </div>
                </div>
                
                <div className="bg-gray-900/50 p-6 text-center border-t border-gray-700">
                    <p className="text-sm text-gray-500">Version de l'application : 2.1.0</p>
                    <p className="text-xs text-gray-600 mt-1">© 2025 Prediction Foot Africa. Tous droits réservés.</p>
                </div>
            </div>
        </div>

        <div className="mt-16 pt-4 border-t border-white/5">
          <AdCarousel ads={ads} />
        </div>
      </main>
    </div>
  );
};
