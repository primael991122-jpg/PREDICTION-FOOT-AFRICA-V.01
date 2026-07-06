
import React from 'react';
import type { User, Rule, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { 
  TrophyIcon, 
  ClockIcon, 
  ShieldCheckIcon, 
  InformationCircleIcon, 
  ScaleIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface RulesProps {
  navigate: (page: Page) => void;
  currentUser: User;
  rules: Rule[];
  ads: Ad[];
  settings?: AppSettings;
}

export const Rules: React.FC<RulesProps> = ({ navigate, currentUser, rules, ads, settings }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header title="Règlement du Jeu" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      
      <main className="flex-grow container mx-auto p-4 sm:p-6 pb-20">
        <AdBanner pageName="rules" settings={settings} className="mb-6" />

        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* SECTION 1: LE BARÈME DES POINTS */}
          <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-yellow-500/30">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-4 flex items-center">
              <TrophyIcon className="w-6 h-6 text-black mr-2" />
              <h2 className="text-gray-900 font-black uppercase tracking-wider">Système de Points</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                <span className="block text-3xl font-black text-yellow-400 mb-1">3 PTS</span>
                <span className="text-xs font-bold text-gray-400 uppercase">Victoire Simple</span>
                <p className="text-[10px] text-gray-500 mt-2">Pronostic correct sur l'équipe 1 ou 2</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                <span className="block text-3xl font-black text-yellow-400 mb-1">2 PTS</span>
                <span className="text-xs font-bold text-gray-400 uppercase">Match Nul</span>
                <p className="text-[10px] text-gray-500 mt-2">Pronostic correct sur le résultat X</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                <span className="block text-3xl font-black text-yellow-400 mb-1">1 PT</span>
                <span className="text-xs font-bold text-gray-400 uppercase">Double Chance</span>
                <p className="text-[10px] text-gray-500 mt-2">Pronostic correct sur 1X ou X2</p>
              </div>
            </div>
          </div>

          {/* SECTION 2: VALIDATION & DÉLAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ClockIcon className="w-16 h-16 text-blue-400" />
              </div>
              <div className="flex items-center mb-4">
                <ClockIcon className="w-6 h-6 text-blue-400 mr-2" />
                <h3 className="text-lg font-bold text-white uppercase">Délais de Paris</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Les pronostics sont verrouillés automatiquement <strong className="text-white">1 heure avant</strong> le coup d'envoi officiel de chaque match. 
                Une fois ce délai passé, aucune modification n'est possible.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-lg relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <ScaleIcon className="w-16 h-16 text-green-400" />
              </div>
              <div className="flex items-center mb-4">
                <ScaleIcon className="w-6 h-6 text-green-400 mr-2" />
                <h3 className="text-lg font-bold text-white uppercase">Égalité au Classement</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                En cas d'égalité parfaite de points entre deux ou plusieurs joueurs, le système priorise <strong className="text-white">la date d'inscription</strong> (le joueur inscrit le plus tôt arrive devant).
              </p>
            </div>
          </div>

          {/* SECTION 3: RÈGLEMENT OFFICIEL */}
          <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <ShieldCheckIcon className="w-6 h-6 text-red-500 mr-2" />
                <h3 className="text-lg font-bold text-white uppercase">Conditions d'Utilisation</h3>
              </div>
              <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-700/50">
                {rules.length > 0 ? (
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {rules[0].content}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-4">Chargement du règlement officiel...</p>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: FAIR-PLAY FOOTER */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
            <CheckBadgeIcon className="w-12 h-12 text-blue-400" />
            <div>
                <h4 className="text-white font-bold uppercase text-sm">Engagement Fair-Play</h4>
                <p className="text-gray-400 text-xs mt-1">
                    Prediction Foot Africa est une plateforme de divertissement. Tout comportement irrespectueux sur le forum ou tentative de fraude entraînera un bannissement immédiat et définitif sans préavis.
                </p>
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
