
import React, { useState } from 'react';
import { useLanguage, ALL_LANGUAGES } from '../../contexts/LanguageContext';
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface LanguageSelectorProps {
  variant?: 'icon' | 'full';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'icon', className = '' }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredLanguages = ALL_LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`flex items-center justify-center rounded-full transition-all hover:bg-white/10 ${className} ${variant === 'icon' ? 'w-10 h-10' : 'px-4 py-2 bg-gray-700 space-x-2'}`}
        title={t('settings.language')}
      >
        <span className="text-2xl leading-none">{language.flag}</span>
        {variant === 'full' && (
             <span className="text-white text-sm font-bold uppercase">{language.code}</span>
        )}
      </button>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-2xl border border-gray-700 animate-fadeIn">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">{t('settings.language')}</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700">
                    <XMarkIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Search */}
            <div className="p-4 pb-2">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 absolute left-3 top-3" />
                    <input 
                        type="text" 
                        placeholder={t('search.placeholder')} 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2.5 pl-10 text-white focus:ring-2 focus:ring-yellow-400 outline-none"
                    />
                </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto p-2 flex-grow">
                <div className="grid grid-cols-1 gap-1">
                    {filteredLanguages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                setLanguage(lang);
                                setIsOpen(false);
                            }}
                            className={`flex items-center px-4 py-3 rounded-xl transition-all ${language.code === lang.code ? 'bg-yellow-500/20 border border-yellow-500/50' : 'hover:bg-gray-700'}`}
                        >
                            <span className="text-3xl mr-4">{lang.flag}</span>
                            <div className="text-left">
                                <span className={`block font-bold ${language.code === lang.code ? 'text-yellow-400' : 'text-white'}`}>
                                    {lang.name}
                                </span>
                                <span className="text-xs text-gray-500 uppercase">{lang.code}</span>
                            </div>
                            {language.code === lang.code && (
                                <div className="ml-auto w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
                            )}
                        </button>
                    ))}
                    {filteredLanguages.length === 0 && (
                        <p className="text-center text-gray-500 py-4">Aucune langue trouvée.</p>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
