
import React, { useState, useRef } from 'react';
import type { User, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { ArrowLeftOnRectangleIcon, ChartBarIcon, ClipboardDocumentListIcon, QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, InformationCircleIcon, UserGroupIcon, CameraIcon, XMarkIcon, ShieldCheckIcon, GlobeAltIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { LanguageSelector } from './common/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { getSafeImageUrl, getFlagUrl } from '@/utils/imageUtils';

interface DashboardProps {
  navigate: (page: Page) => void;
  onLogout: () => void;
  currentUser: User;
  ads: Ad[];
  settings?: AppSettings;
  actions?: any;
  onUpdateUser?: (data: Partial<User>) => void;
  notificationCounts?: {
      predictions: number;
      forum: number;
      contact: number;
      info: number;
  };
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  page: Page;
  colorClass: string;
  count?: number; 
  badgeColor?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  navigate, 
  onLogout, 
  currentUser, 
  ads, 
  settings, 
  actions, 
  onUpdateUser, 
  notificationCounts,
  onOpenNotifications,
  unreadNotificationsCount
}) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const menuItems: MenuItem[] = [
    { 
      label: t('menu.predictions'), 
      icon: ChartBarIcon, 
      page: Page.PREDICTIONS, 
      colorClass: 'bg-emerald-500 shadow-emerald-500/20',
      count: notificationCounts?.predictions,
      badgeColor: 'bg-red-500'
    },
    { 
      label: t('menu.leaderboard'), 
      icon: UserGroupIcon, 
      page: Page.LEADERBOARD, 
      colorClass: 'bg-amber-500 shadow-amber-500/20'
    },
    { 
      label: t('menu.rules'), 
      icon: ClipboardDocumentListIcon, 
      page: Page.RULES, 
      colorClass: 'bg-blue-500 shadow-blue-500/20'
    },
    { 
      label: t('menu.info'), 
      icon: InformationCircleIcon, 
      page: Page.INFORMATION, 
      colorClass: 'bg-cyan-500 shadow-cyan-500/20',
      count: notificationCounts?.info,
      badgeColor: 'bg-yellow-500'
    },
    { 
      label: t('menu.forum'), 
      icon: ChatBubbleLeftRightIcon, 
      page: Page.FORUM, 
      colorClass: 'bg-purple-500 shadow-purple-500/20',
      count: notificationCounts?.forum,
      badgeColor: 'bg-blue-500'
    },
    { 
      label: t('menu.contact'), 
      icon: QuestionMarkCircleIcon, 
      page: Page.CONTACT, 
      colorClass: 'bg-pink-500 shadow-pink-500/20',
      count: notificationCounts?.contact,
      badgeColor: 'bg-green-500'
    },
    { 
      label: t('menu.about'), 
      icon: GlobeAltIcon, 
      page: Page.ABOUT, 
      colorClass: 'bg-indigo-500 shadow-indigo-500/20'
    },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        if (file.size > 2 * 1024 * 1024) {
            alert("L'image est trop lourde (max 2Mo).");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedImage || !actions || !onUpdateUser) return;
    setSaving(true);
    try {
        await actions.updateUserProfile(currentUser.id, selectedImage);
        onUpdateUser({ profilePictureUrl: selectedImage });
        setIsProfileModalOpen(false);
        setSelectedImage(null);
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la mise à jour.");
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col selection:bg-yellow-400 selection:text-black">
      {/* Emergency Message Ticker */}
      {settings?.emergencyMessage && (
          <div className="bg-red-700 h-10 flex items-center overflow-hidden border-b border-red-900 z-50 shadow-lg">
              <div className="flex whitespace-nowrap animate-marquee items-center">
                  <span className="text-white font-black uppercase text-[11px] tracking-widest px-8 flex items-center">
                      <BellAlertIcon className="w-4 h-4 mr-2 animate-bounce" />
                      {settings.emergencyMessage}
                  </span>
                  <span className="text-white font-black uppercase text-[11px] tracking-widest px-8 flex items-center">
                      <BellAlertIcon className="w-4 h-4 mr-2 animate-bounce" />
                      {settings.emergencyMessage}
                  </span>
                  <span className="text-white font-black uppercase text-[11px] tracking-widest px-8 flex items-center">
                      <BellAlertIcon className="w-4 h-4 mr-2 animate-bounce" />
                      {settings.emergencyMessage}
                  </span>
              </div>
              <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.33%); }
                }
                .animate-marquee {
                    animation: marquee 15s linear infinite;
                }
              `}</style>
          </div>
      )}

      <header className="bg-gray-900/80 backdrop-blur-xl py-4 px-6 shadow-2xl border-b border-white/5 sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-yellow-400 uppercase tracking-tighter">
              {t('app.title')}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {onOpenNotifications && (
              <button 
                onClick={onOpenNotifications} 
                className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400 rounded-full transition-all active:scale-95 border border-white/5 relative"
                title="Notifications"
                id="dashboard-notifications-bell"
              >
                <BellAlertIcon className="w-5 h-5" />
                {unreadNotificationsCount !== undefined && unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-black leading-none text-white px-1.5 shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
            )}
            <LanguageSelector className="shadow-lg border border-white/10" />
            <button onClick={onLogout} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-all active:scale-90 border border-white/5">
              <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 flex flex-col items-center pb-24">
        <AdBanner pageName="home" settings={settings} className="mb-6 w-full max-w-lg" />

        <div className="w-full max-w-lg bg-gray-900/40 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 mb-8 border border-white/10 relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none"></div>
           
           <div className="relative flex flex-col items-center">
              <div className="relative cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                  <div className="rounded-full p-1.5 bg-white/5">
                    <img 
                        src={getSafeImageUrl(currentUser.profilePictureUrl, 'https://picsum.photos/seed/user/100')} 
                        alt="Profil" 
                        className="w-28 h-28 rounded-full border-4 border-gray-950 shadow-2xl object-cover transform transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-yellow-400 p-2 rounded-full shadow-lg border-2 border-gray-900 text-black text-[10px] font-black items-center justify-center">
                      <CameraIcon className="w-4 h-4" />
                  </div>
              </div>

              <div className="text-center mt-5">
                <h2 className="text-2xl font-black text-white flex items-center justify-center tracking-tight">
                    {currentUser.name}
                </h2>
                <div className="flex items-center justify-center space-x-2 mt-1.5">
                   <img 
                      src={getFlagUrl(currentUser.country?.code)} 
                      alt={currentUser.country?.name || 'Country'}
                      className="w-5 h-auto rounded-sm shadow-sm"
                   />
                   <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">{currentUser.country?.name || 'Inconnu'}</span>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center w-full bg-black/20 rounded-2xl py-4 border border-white/5">
                  <button onClick={() => navigate(Page.LEADERBOARD)} className="flex flex-col items-center px-16 hover:bg-white/5 transition-all">
                      <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">{t('dash.rank')}</span>
                      <span className="text-xl font-black text-yellow-500">#{currentUser.id ? 'TOP' : '-'}</span>
                  </button>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full max-w-lg">
            {menuItems.map((item, index) => (
                <button
                    key={index}
                    onClick={() => navigate(item.page)}
                    className={`${item.colorClass} relative p-6 rounded-[2rem] shadow-2xl transition-all transform hover:scale-[1.03] active:scale-95 flex flex-col items-center justify-center group overflow-hidden border border-white/10 h-32`}
                >
                    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>

                    {item.count !== undefined && item.count > 0 && (
                        <div className={`absolute top-4 right-4 ${item.badgeColor || 'bg-red-500'} text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg animate-bounce z-10`}>
                            {item.count}
                        </div>
                    )}
                    <item.icon className={`w-10 h-10 mb-2 drop-shadow-xl relative z-10 ${item.label === 'PREMIUM' ? 'text-black' : 'text-white'}`} />
                    <span className={`font-black text-[9px] uppercase tracking-widest text-center relative z-10 ${item.label === 'PREMIUM' ? 'text-black' : 'text-white'}`}>{item.label}</span>
                </button>
            ))}
        </div>

        <div className="mt-20 w-full max-w-lg pt-4 border-t border-white/5">
            <AdCarousel ads={ads} />
        </div>
      </main>

      {/* Profile Modal */}
      {isProfileModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-[3rem] w-full max-w-sm p-8 shadow-2xl border border-white/10 animate-zoomIn">
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Photo de Profil</h3>
                      <button onClick={() => setIsProfileModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                          <XMarkIcon className="w-6 h-6" />
                      </button>
                  </div>

                  <div className="flex flex-col items-center mb-8">
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-yellow-400/30 mb-6 bg-gray-950 shadow-2xl">
                          <img 
                              src={getSafeImageUrl(selectedImage || currentUser.profilePictureUrl, 'https://picsum.photos/seed/user/100')} 
                              alt="New Profile" 
                              className="w-full h-full object-cover"
                          />
                      </div>
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-full text-xs text-yellow-400 font-black uppercase tracking-widest transition-all"
                      >
                          Parcourir mes photos
                      </button>
                      <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          className="hidden" 
                          accept="image/*"
                      />
                  </div>

                  <button 
                      onClick={handleSaveProfile}
                      disabled={!selectedImage || saving}
                      className="w-full py-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale transition-all"
                  >
                      {saving ? "Sauvegarde..." : "Appliquer les changements"}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
