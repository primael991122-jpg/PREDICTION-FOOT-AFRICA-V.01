
import React from 'react';
import type { User, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

interface PrivacyPolicyProps {
  navigate: (page: Page) => void;
  currentUser: User;
  ads: Ad[];
  settings?: AppSettings;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ navigate, currentUser, ads, settings }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header title="Confidentialité" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      <main className="flex-grow container mx-auto p-4 sm:p-6">
        <AdBanner pageName="privacy" settings={settings} className="mb-8" />
        
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
            <div className="flex items-center mb-8 border-b border-gray-700 pb-4">
                <ShieldCheckIcon className="w-10 h-10 text-green-500 mr-4" />
                <h2 className="text-2xl font-bold text-white uppercase">Politique de Confidentialité</h2>
            </div>

            <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-yellow-400">
                <h3>1. Collecte des Données</h3>
                <p>
                    Nous collectons uniquement les données nécessaires au bon fonctionnement du jeu : votre nom d'utilisateur, votre adresse email (pour l'authentification), 
                    votre photo de profil et vos pronostics. Ces données sont stockées de manière sécurisée via Google Firebase.
                </p>

                <h3>2. Utilisation des Données</h3>
                <p>
                    Vos données sont utilisées pour :
                </p>
                <ul className="list-disc pl-5 space-y-2 text-gray-400">
                    <li>Gérer votre compte et votre connexion.</li>
                    <li>Calculer vos points et établir le classement général.</li>
                    <li>Afficher votre profil aux autres joueurs dans le classement.</li>
                    <li>Vous permettre de communiquer sur le forum.</li>
                </ul>

                <h3>3. Publicité et Cookies (Google AdSense)</h3>
                <p>
                    Nous utilisons Google AdSense pour diffuser des publicités. Google utilise des cookies pour diffuser des annonces basées sur vos visites antérieures sur notre site web 
                    ou sur d'autres sites web. Vous pouvez choisir de désactiver la publicité personnalisée dans les paramètres de votre compte Google.
                </p>

                <h3>4. Vos Droits</h3>
                <p>
                    Conformément à la réglementation RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. 
                    Pour exercer ce droit ou supprimer définitivement votre compte, veuillez nous contacter via la rubrique <strong>Contact</strong> de l'application.
                </p>

                <h3>5. Sécurité</h3>
                <p>
                    Nous mettons en œuvre toutes les mesures de sécurité nécessaires pour protéger vos données contre tout accès non autorisé. 
                    L'authentification est gérée par des services tiers sécurisés (Firebase Auth).
                </p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-700 text-center">
                <p className="text-sm text-gray-500">Dernière mise à jour : 10 Septembre 2025</p>
            </div>
        </div>

        <div className="mt-16 pt-4 border-t border-white/5">
          <AdCarousel ads={ads} />
        </div>
      </main>
    </div>
  );
};
