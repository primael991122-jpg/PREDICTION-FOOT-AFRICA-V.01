import React, { useState, useRef, useEffect } from 'react';
import type { User, ForumMessage, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { 
  PaperAirplaneIcon,
  PaperClipIcon,
  XMarkIcon,
  DocumentIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/solid';
import { formatTime } from '@/utils/dateUtils';
import { getSafeImageUrl } from '@/utils/imageUtils';

// Fonction de compression d'image pour optimiser le stockage Firestore
const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = () => resolve(base64Str);
    });
};

const emojiCategories = [
  {
    id: 'sports',
    name: 'Foot/Sport',
    icon: '⚽',
    emojis: ['⚽', '🏆', '🥇', '👟', '🥅', '🏟️', '📣', '🏃‍♂️', '🔥', '💪', '👑', '🥇', '🥈', '🥉']
  },
  {
    id: 'express',
    name: 'Réactions',
    icon: '😃',
    emojis: ['😂', '😍', '😎', '😮', '😢', '😡', '👍', '👎', '👏', '🙌', '❤️', '🎉', '💥', '🌟', '🧠', '🤣', '🤔']
  },
  {
    id: 'flags',
    name: 'Drapeaux',
    icon: '🌍',
    emojis: [
      '🇸🇳', '🇲🇦', '🇩🇿', '🇨🇮', '🇨🇲', '🇹🇳', '🇪🇬', '🇳🇬', '🇬🇭', '🇲🇱',
      '🇬🇳', '🇧🇫', '🇨🇬', '🇨🇩', '🇬🇦', '🇦', '🇿🇦', '🇫🇷', '🇧🇪', '🇵🇹', '🇪🇸'
    ]
  }
];

interface ForumProps {
  navigate: (page: Page) => void;
  currentUser: User;
  messages: ForumMessage[];
  onSend: (msg: Omit<ForumMessage, 'id'>) => Promise<void>;
  ads: Ad[];
  settings?: AppSettings;
}

export const Forum: React.FC<ForumProps> = ({ navigate, currentUser, messages, onSend, ads, settings }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<{data: string, name: string, type: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiTab, setActiveEmojiTab] = useState('sports');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit to 700KB to stay within Firestore's 1MB document limit
      if (file.size > 700 * 1024) {
          alert("Fichier trop volumineux. La limite est de 700 Ko pour préserver Firestore.");
          return;
      }
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        let fileData = event.target?.result as string;
        if (file.type.startsWith('image/')) {
            fileData = await compressImage(fileData);
        }
        setSelectedFile({ data: fileData, name: file.name, type: file.type });
      };
      reader.onerror = () => {
          alert("Erreur lors de la lecture du fichier.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && !selectedFile) return;

    setIsUploading(true);
    const messageData: any = {
      user: currentUser,
      message: newMessage,
      timestamp: new Date().toISOString(),
    };

    if (selectedFile) {
      messageData.fileUrl = selectedFile.data;
      messageData.fileName = selectedFile.name;
      messageData.fileType = selectedFile.type;
    }

    const tempMessage = newMessage;
    const tempFile = selectedFile;

    setNewMessage(''); // Optimistic clear
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowEmojiPicker(false);

    try {
        await onSend(messageData);
    } catch (e: any) {
        setNewMessage(tempMessage); // Restore on error
        setSelectedFile(tempFile);
        let errorMsg = "Erreur lors de l'envoi du message.";
        try {
            const errDetail = JSON.parse(e.message);
            if (errDetail.error.includes('PERMISSION_DENIED')) {
                errorMsg = "Vous n'avez pas la permission de poster dans le forum.";
            } else if (errDetail.error.includes('quota')) {
                errorMsg = "Limite de stockage atteinte (Quota).";
            }
        } catch (parseErr) {
            if (e.message?.includes('too large')) {
                errorMsg = "Le message ou l'image jointe est trop volumineux pour Firestore (max 1Mo).";
            }
        }
        alert(errorMsg);
    } finally {
        setIsUploading(false);
    }
  };

  const renderAttachment = (msg: ForumMessage) => {
    if (!msg.fileUrl) return null;
    const isImage = msg.fileType?.startsWith('image/');
    if (isImage) {
        return (
            <div className="mt-2 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black/20 max-w-full">
                <img 
                    src={msg.fileUrl} 
                    alt={msg.fileName} 
                    className="max-h-60 max-w-full object-contain cursor-pointer hover:scale-[1.01] transition-transform rounded" 
                    onClick={() => window.open(msg.fileUrl, '_blank')}
                    referrerPolicy="no-referrer"
                />
            </div>
        );
    }
    return (
        <a 
            href={msg.fileUrl} 
            download={msg.fileName}
            className="mt-2 flex items-center p-2 bg-gray-900/50 hover:bg-gray-900/80 rounded-xl border border-white/5 transition-all group max-w-full overflow-hidden text-left"
        >
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center mr-2 group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                <DocumentIcon className="w-5 h-5 text-green-400" />
            </div>
            <div className="flex-grow min-w-0">
                <p className="text-[11px] font-bold text-white truncate text-ellipsis">{msg.fileName}</p>
                <p className="text-[8px] text-gray-400 uppercase tracking-widest font-black">Document</p>
            </div>
            <ArrowDownTrayIcon className="w-4 h-4 text-gray-400 ml-2 hover:text-white flex-shrink-0 transition-colors" />
        </a>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 pb-36">
      <Header title="Forum" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      <main className="flex-grow container mx-auto p-4 flex flex-col overflow-hidden">
        <AdBanner pageName="forum" settings={settings} className="mb-4 flex-shrink-0" />
        <div className="flex-grow bg-gray-800 rounded-2xl shadow-lg p-4 space-y-4 overflow-y-auto min-h-[50vh]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.user.id === currentUser.id ? 'flex-row-reverse' : ''}`}>
              <img src={getSafeImageUrl(msg.user.profilePictureUrl, 'https://picsum.photos/seed/user/100')} alt={msg.user.name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
              <div className={`p-3 rounded-xl max-w-xs md:max-w-md ${msg.user.id === currentUser.id ? 'bg-green-700 font-medium' : 'bg-gray-700 font-medium'}`}>
                <div className="flex items-center space-x-2 mb-1">
                   <span className="font-semibold text-sm">{msg.user.name}</span>
                   <span className="text-[10px] text-gray-300">{formatTime(msg.timestamp)}</span>
                </div>
                {msg.message && <p className="text-white break-words text-sm leading-relaxed">{msg.message}</p>}
                {renderAttachment(msg)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
         <div className="mt-2 flex-shrink-0">
            <AdCarousel ads={ads} />
         </div>
      </main>

      <footer className="fixed bottom-20 left-0 right-0 bg-gray-900/95 backdrop-blur-md p-4 border-t border-gray-800 z-50">
        <div className="container mx-auto flex flex-col max-w-4xl relative">
          
          {/* Menu Emoji Floppant */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-16 right-0 md:right-16 bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl p-3 w-72 h-72 flex flex-col z-50 transition-all animation-fade-in text-left"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ajouter un Emoji</span>
                <button 
                  onClick={() => setShowEmojiPicker(false)} 
                  className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex border-b border-gray-750 mb-2 gap-1 text-[10px] font-bold text-gray-400">
                {emojiCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveEmojiTab(cat.id)}
                    className={`pb-1 px-1.5 transition-all outline-none ${activeEmojiTab === cat.id ? 'border-b-2 border-yellow-500 text-yellow-500' : 'hover:text-gray-200'}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
              <div className="flex-grow overflow-y-auto grid grid-cols-6 gap-1.5 p-1 scrollbar-thin">
                {emojiCategories.find(c => c.id === activeEmojiTab)?.emojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddEmoji(emoji)}
                    className="text-xl p-1 hover:bg-gray-700/50 rounded transition hover:scale-110 active:scale-95"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lanceur de ficher caché */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />

          {/* Aperçu de la pièce jointe en attente d'envoi */}
          {selectedFile && (
            <div className="flex items-center justify-between bg-gray-800 border border-gray-750 p-2 rounded-xl mb-3 animate-slide-in">
              <div className="flex items-center min-w-0">
                {selectedFile.type.startsWith('image/') ? (
                  <img src={selectedFile.data} className="w-8 h-8 rounded object-cover mr-2 border border-gray-700" alt="Aperçu" referrerPolicy="no-referrer" />
                ) : (
                  <DocumentIcon className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" />
                )}
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white truncate max-w-[200px] md:max-w-md">{selectedFile.name}</p>
                  <p className="text-[9.5px] text-gray-400">Prêt à être envoyé</p>
                </div>
              </div>
              <button 
                onClick={handleRemoveFile} 
                className="p-1 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-400 hover:text-white transition"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-gray-800 text-gray-400 hover:text-white rounded-full border border-gray-700 hover:bg-gray-750 transition flex-shrink-0"
              title="Joindre un fichier"
              disabled={isUploading}
            >
              <PaperClipIcon className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className="p-2.5 bg-gray-800 text-yellow-500 hover:text-yellow-400 rounded-full border border-gray-700 hover:bg-gray-750 transition flex-shrink-0 text-md leading-none"
              title="Ajouter un emoji"
            >
              😀
            </button>

            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isUploading ? "Envoi en cours..." : "Racontez votre pronostic..."}
              disabled={isUploading}
              className="flex-grow bg-gray-800 border border-gray-700 rounded-full px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm focus:border-transparent"
            />
            
            <button
              onClick={handleSendMessage}
              disabled={isUploading}
              className={`p-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 rounded-full text-white shadow-md transition flex-shrink-0 duration-200 active:scale-95 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <PaperAirplaneIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
