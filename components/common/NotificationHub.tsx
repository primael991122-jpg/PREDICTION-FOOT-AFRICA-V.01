import React from 'react';
import { 
  XMarkIcon, 
  TrashIcon, 
  BellAlertIcon, 
  SparklesIcon,
  TrophyIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { InAppNotification } from '../../hooks/useNotifications';
import { formatTime } from '../../utils/dateUtils';

interface NotificationHubProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: InAppNotification[];
  notificationsEnabled: boolean;
  pushPermissionStatus: 'default' | 'granted' | 'denied' | 'unsupported';
  onToggleEnabled: (val: boolean) => void;
  onRequestPermission: () => Promise<boolean>;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification: (matchId?: string) => void;
}

export const NotificationHub: React.FC<NotificationHubProps> = ({
  isOpen,
  onClose,
  notifications,
  notificationsEnabled,
  pushPermissionStatus,
  onToggleEnabled,
  onRequestPermission,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none text-left">
      <div className="bg-gray-950 w-full max-w-md rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col max-h-[85vh] animate-zoom-in">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/60 rounded-t-[2.5rem]">
          <div className="flex items-center space-x-2">
            <BellIcon className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">Notifications</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all transform active:scale-95"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          
          {/* Section: Settings Preferences & Browser Permission */}
          <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Alertes Actives</p>
                <p className="text-[10px] text-gray-500">Activer ou couper toutes les notifications de l'application</p>
              </div>
              <button
                onClick={() => onToggleEnabled(!notificationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  notificationsEnabled ? 'bg-yellow-500' : 'bg-gray-800'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Browser push authorization block */}
            {pushPermissionStatus !== 'unsupported' && (
              <div className="pt-3 border-t border-white/5 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Notifications Navigateur</p>
                    <p className="text-[10px] text-gray-500">
                      {pushPermissionStatus === 'granted' ? 'Autorisé sur votre appareil ✅' : 
                       pushPermissionStatus === 'denied' ? 'Bloqué (Veuillez autoriser dans les paramètres de votre site) ❌' : 
                       'Alertez-moi même fermée !'}
                    </p>
                  </div>
                  {pushPermissionStatus === 'default' && (
                    <button
                      onClick={onRequestPermission}
                      className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black text-[9.5px] font-black uppercase tracking-widest rounded-lg transition-transform active:scale-95"
                    >
                      Autoriser
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          {notifications.length > 0 && (
            <div className="flex justify-between items-center text-[10.5px]">
              <button 
                onClick={onMarkAllAsRead} 
                className="text-gray-400 hover:text-white font-bold flex items-center space-x-1 uppercase transition-colors"
              >
                <CheckIcon className="w-3.5 h-3.5 mr-1" />
                Tout lire
              </button>
              <button 
                onClick={onClearAll} 
                className="text-red-400 hover:text-red-350 font-bold flex items-center space-x-1 uppercase transition-colors"
              >
                <TrashIcon className="w-3.5 h-3.5 mr-1" />
                Effacer l'historique
              </button>
            </div>
          )}

          {/* List */}
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center">
                <BellAlertIcon className="w-10 h-10 text-gray-600 mb-3 animate-pulse" />
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Aucune Alerte</p>
                <p className="text-[10px] text-gray-600 mt-1 max-w-xs leading-relaxed">
                  Vous serez informé ici dès que de nouveaux matchs sont ajoutés ou que des scores sont validés !
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkAsRead(notif.id);
                    onSelectNotification(notif.matchId);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group text-left ${
                    notif.read 
                      ? 'bg-gray-900/20 border-white/5 hover:border-white/10' 
                      : 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/45 shadow-[0_4px_20px_rgba(234,179,8,0.03)]'
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!notif.read && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-yellow-500 rounded-full animate-ping"></span>
                  )}

                  <div className="flex items-start space-x-3 pr-2">
                    <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                      notif.type === 'validated' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                    }`}>
                      {notif.type === 'validated' ? <TrophyIcon className="w-4 h-4" /> : <SparklesIcon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <p className="text-[11.5px] font-black text-white uppercase tracking-tight leading-none mb-1 text-left">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-gray-300 leading-relaxed text-left">
                        {notif.body}
                      </p>
                      <p className="text-[8.5px] text-gray-500 font-mono mt-2 uppercase text-left">
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-zoom-in {
          animation: zoomIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
};
