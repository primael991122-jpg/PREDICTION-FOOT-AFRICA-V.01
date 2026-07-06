
import React from 'react';
import type { User } from '../../types';
import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import { Page } from '../../App';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  title: string;
  currentUser: User;
  navigate: (page: Page) => void;
  backPage: Page;
}

export const Header: React.FC<HeaderProps> = ({ title, currentUser, navigate, backPage }) => {
  return (
    <header className="bg-gray-800 py-2 px-4 shadow-lg sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(backPage)} className="p-2 rounded-full hover:bg-gray-700 transition">
            <ChevronLeftIcon className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          <span className="text-white hidden sm:block text-sm">{currentUser.name}</span>
          <img
            src={currentUser.profilePictureUrl}
            alt="Profil"
            className="w-8 h-8 rounded-full border-2 border-yellow-400"
          />
        </div>
      </div>
    </header>
  );
};
