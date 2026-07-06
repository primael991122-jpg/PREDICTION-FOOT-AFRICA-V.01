
import React, { useState, useRef, useEffect } from 'react';
import type { User, ContactMessage, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { 
  PaperAirplaneIcon, 
  PaperClipIcon, 
  XMarkIcon, 
  DocumentIcon, 
  ArrowDownTrayIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon,
  InformationCircleIcon
} from '@heroicons/react/24/solid';
import { formatTime } from '@/utils/dateUtils';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface ContactProps {
  navigate: (page: Page) => void;
  currentUser: User;
  messages: ContactMessage[];
  onSend: (msg: Omit<ContactMessage, 'id'>) => Promise<void>;
  adminUser: User;
  ads: Ad[];
  settings?: AppSettings;
}

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

export const Contact: React.FC<ContactProps> = ({ navigate, currentUser, messages, onSend, adminUser, ads, settings }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<{data: string, name: string, type: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userMessages = messages.filter(m => m.user.id === currentUser.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [userMessages]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Limit to 700KB to stay within Firestore's 1MB document limit (Base64 adds ~33% overhead)
      if (file.size > 700 * 1024) {
          alert("Fichier trop volumineux. La limite est de 700 Ko pour le support direct. Pour les fichiers plus gros, merci de les compresser.");
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

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' && !selectedFile) return;

    setIsUploading(true);
    const messageData: any = {
      user: currentUser,
      message: newMessage,
      timestamp: new Date().toISOString(),
      isFromAdmin: false
    };

    if (selectedFile) {
      messageData.fileUrl = selectedFile.data;
      messageData.fileName = selectedFile.name;
      messageData.fileType = selectedFile.type;
    }

    try {
        await onSend(messageData);
        setNewMessage('');
        handleRemoveFile(); 
    } catch (e: any) {
        let errorMsg = "Erreur d'envoi. Vérifiez votre connexion.";
        try {
            const errDetail = JSON.parse(e.message);
            if (errDetail.error.includes('PERMISSION_DENIED')) {
                errorMsg = "Erreur de permission Firestore. Contactez l'administrateur.";
            } else if (errDetail.error.includes('quota')) {
                errorMsg = "Limite de stockage atteinte (Quota).";
            }
        } catch (parseErr) {
            // Non-JSON error
            if (e.message?.includes('too large')) {
                errorMsg = "Le message (ou la pièce jointe) est trop volumineux pour Firestore (max 1Mo).";
            }
        }
        alert(errorMsg);
    } finally {
        setIsUploading(false);
    }
  };

  const renderAttachment = (msg: ContactMessage) => {
    if (!msg.fileUrl) return null;
    const isImage = msg.fileType?.startsWith('image/');
    if (isImage) {
        return (
            <div className="mt-2 rounded-xl overflow-hidden border border-white/10 shadow-inner bg-black/20">
                <img 
                    src={msg.fileUrl} 
                    alt={msg.fileName} 
                    className="max-w-full h-auto cursor-pointer hover:scale-[1.02] transition-transform" 
                    onClick={() => window.open(msg.fileUrl, '_blank')}
                />
            </div>
        );
    }
    return (
        <a 
            href={msg.fileUrl} 
            download={msg.fileName}
            className="mt-2 flex items-center p-3 bg-gray-900/50 hover:bg-gray-900/80 rounded-xl border border-white/5 transition-all group"
        >
            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                <DocumentIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{msg.fileName}</p>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Document</p>
            </div>
            <ArrowDownTrayIcon className="w-4 h-4 text-gray-500 ml-2" />
        </a>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Header title="Support Client" currentUser={currentUser} navigate={navigate} backPage={Page.DASHBOARD} />
      
      <main className="flex-grow container mx-auto px-4 py-4 flex flex-col overflow-hidden pb-24">
        <AdBanner pageName="contact" settings={settings} className="mb-4 flex-shrink-0" />
        
        {/* Chat Status Header */}
        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-3 mb-4 flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center">
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                        <ShieldCheckIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-950"></div>
                </div>
                <div className="ml-3">
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Admin Support</h4>
                    <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">En ligne</p>
                </div>
            </div>
            <InformationCircleIcon className="w-5 h-5 text-gray-600" />
        </div>

        {/* Messages Container */}
        <div className="flex-grow bg-gray-900/30 rounded-[2rem] p-4 space-y-4 overflow-y-auto border border-white/5 shadow-inner">
          {userMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <ChatBubbleLeftEllipsisIcon className="w-10 h-10 text-gray-600" />
                  </div>
                  <h3 className="text-white font-black uppercase text-sm mb-2">Besoin d'aide ?</h3>
                  <p className="text-gray-400 text-xs max-w-xs leading-relaxed">
                      Posez vos questions sur les paiements, les gains ou le fonctionnement du jeu ici.
                  </p>
              </div>
          )}
          
          {userMessages.map((msg, idx) => {
            const isMe = !msg.isFromAdmin;
            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''} animate-slideUp`}>
                {!isMe && <img src={getSafeImageUrl(adminUser.profilePictureUrl, 'https://picsum.photos/seed/admin/100')} className="w-8 h-8 rounded-full border border-gray-800 flex-shrink-0 mb-1" />}
                
                <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 shadow-xl ${
                      isMe 
                        ? 'bg-emerald-600 text-white rounded-[1.5rem] rounded-br-none' 
                        : 'bg-gray-800 text-gray-100 rounded-[1.5rem] rounded-bl-none border border-white/5'
                  }`}>
                    {msg.message && <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>}
                    {renderAttachment(msg)}
                  </div>
                  <span className="text-[9px] text-gray-600 font-black uppercase mt-1 px-2">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-2xl p-4 border-t border-white/5 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
        <div className="container mx-auto flex flex-col max-w-4xl">
          {selectedFile && (
              <div className="mb-3 p-2 bg-blue-500/10 rounded-2xl border border-blue-500/30 flex items-center animate-fadeIn">
                  <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden mr-3">
                      {selectedFile.type.startsWith('image/') ? (
                          <img src={selectedFile.data} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                          <DocumentIcon className="w-6 h-6 text-blue-400" />
                      )}
                  </div>
                  <div className="flex-grow overflow-hidden">
                      <p className="text-xs font-black text-white truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Prêt à envoyer</p>
                  </div>
                  <button onClick={handleRemoveFile} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                      <XMarkIcon className="w-6 h-6" />
                  </button>
              </div>
          )}

          <div className="flex items-center gap-3">
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-12 h-12 flex items-center justify-center bg-gray-800 text-gray-400 hover:text-yellow-400 rounded-2xl transition-all disabled:opacity-30 active:scale-90 border border-white/5"
            >
                <PaperClipIcon className="w-6 h-6" />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*, .pdf, .doc, .docx"
            />
            
            <div className="flex-grow relative">
              <textarea
                  rows={1}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Votre message..."
                  className="w-full bg-gray-800 border border-white/5 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all resize-none shadow-inner"
                  disabled={isUploading}
              />
            </div>
            
            <button
                onClick={handleSendMessage}
                disabled={isUploading || (newMessage.trim() === '' && !selectedFile)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all transform active:scale-90 shadow-lg ${
                    isUploading || (newMessage.trim() === '' && !selectedFile) 
                    ? 'bg-gray-800 text-gray-600' 
                    : 'bg-yellow-500 text-black hover:bg-yellow-400'
                }`}
            >
                {isUploading ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                    <PaperAirplaneIcon className="w-6 h-6" />
                )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
