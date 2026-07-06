
import React, { useState, useRef, useEffect } from 'react';
import type { User, ForumMessage, ContactMessage } from '../../types';
import { TrashIcon, NoSymbolIcon, PaperAirplaneIcon, XMarkIcon, DocumentIcon, ArrowDownTrayIcon, ShieldCheckIcon, UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { formatTime, getTimestamp } from '@/utils/dateUtils';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface UserManagementProps {
    forumMessages: ForumMessage[];
    contactMessages: ContactMessage[];
    users: User[];
    actions: any;
}

export const UserManagement: React.FC<UserManagementProps> = ({ forumMessages, contactMessages, users, actions }) => {
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isChatModalOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [contactMessages, isChatModalOpen]);

    const deleteForumMessage = async (id: string) => {
        if (window.confirm('Supprimer ce message ?')) {
            await actions.deleteForumMessage(id);
        }
    };

    const handleToggleAdmin = async (user: User) => {
        const newStatus = !user.isAdmin;
        const confirmMsg = newStatus 
            ? `Voulez-vous vraiment donner les droits ADMINISTRATEUR à ${user.name} ?` 
            : `Voulez-vous retirer les droits d'administration à ${user.name} ?`;
            
        if (window.confirm(confirmMsg)) {
            try {
                await actions.setUserAdminStatus(user.id, newStatus);
            } catch (e) {
                alert("Erreur lors de la modification des droits.");
            }
        }
    };

    const usersWithContactMessages = users.filter(user => 
        !user.isAdmin && contactMessages.some(msg => msg.user.id === user.id)
    );

    const filteredUsers = users
        .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
        .sort((a, b) => (a.isAdmin === b.isAdmin) ? 0 : a.isAdmin ? -1 : 1);

    const handleOpenChat = (user: User) => {
        setSelectedUser(user);
        setIsChatModalOpen(true);
    };

    const handleCloseChat = () => {
        setSelectedUser(null);
        setIsChatModalOpen(false);
        setReplyMessage('');
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim() || !selectedUser) return;
        const adminReply = {
            user: selectedUser,
            message: replyMessage,
            timestamp: new Date().toISOString(),
            isFromAdmin: true,
        };
        await actions.sendContactMessage(adminReply);
        setReplyMessage('');
    };

    const renderAttachment = (msg: ContactMessage) => {
        if (!msg.fileUrl) return null;
        const isImage = msg.fileType?.startsWith('image/');
        if (isImage) {
            return (
                <div className="mt-2 rounded overflow-hidden border border-white/5">
                    <img src={msg.fileUrl} alt={msg.fileName} className="max-w-full h-auto cursor-zoom-in" onClick={() => window.open(msg.fileUrl, '_blank')} />
                </div>
            );
        }
        return (
            <a href={msg.fileUrl} download={msg.fileName} className="mt-2 flex items-center p-2 bg-black/30 rounded border border-white/10 hover:bg-black/40 transition-colors">
                <DocumentIcon className="w-6 h-6 text-gray-400 mr-2" />
                <div className="flex-grow overflow-hidden">
                    <p className="text-[10px] font-bold text-white truncate">{msg.fileName}</p>
                </div>
                <ArrowDownTrayIcon className="w-3 h-3 text-gray-500 ml-1" />
            </a>
        );
    };

    return (
        <div className="space-y-10">
            {/* SECTION GESTION DES RÔLES */}
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h3 className="text-xl font-bold flex items-center">
                        <ShieldCheckIcon className="w-6 h-6 mr-2 text-yellow-500" />
                        Gestion des Comptes & Rôles
                    </h3>
                    <div className="relative w-full md:w-64">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un utilisateur..." 
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-yellow-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-gray-500 text-xs uppercase font-black border-b border-gray-700">
                                <th className="px-4 py-3">Utilisateur</th>
                                <th className="px-4 py-3">ID / Phone</th>
                                <th className="px-4 py-3 text-center">Rôle</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredUsers.slice(0, 20).map(user => (
                                <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center">
                                            <img src={getSafeImageUrl(user.profilePictureUrl, 'https://picsum.photos/seed/user/100')} className="w-8 h-8 rounded-full mr-3 border border-gray-600" />
                                            <div>
                                                <p className="text-sm font-bold text-white">{user.name}</p>
                                                <p className="text-[10px] text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-[10px] text-gray-400">
                                        <p>{user.shortId || user.id.slice(0,8)}</p>
                                        <p>{user.phone || 'N/A'}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-black uppercase ${user.isAdmin ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-gray-700 text-gray-400'}`}>
                                            {user.isAdmin ? <ShieldCheckIcon className="w-3 h-3 mr-1" /> : <UserIcon className="w-3 h-3 mr-1" />}
                                            {user.isAdmin ? 'Admin' : 'Joueur'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleToggleAdmin(user)}
                                            className={`text-[10px] font-black uppercase px-3 py-1 rounded transition-colors ${user.isAdmin ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-green-900/40 text-green-400 hover:bg-green-900/60'}`}
                                        >
                                            {user.isAdmin ? 'Destituer' : 'Promouvoir Admin'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length > 20 && (
                    <p className="text-center text-[10px] text-gray-500 mt-4 uppercase font-bold">Recherchez pour voir plus de résultats...</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4">Gestion du Forum</h3>
                    <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {forumMessages.map(msg => (
                            <div key={msg.id} className="p-2 border-b border-gray-700 flex justify-between items-start">
                                <div className="flex-grow min-w-0 pr-4">
                                    <div className="flex items-center space-x-2">
                                        <p className="font-bold">{msg.user.name}</p>
                                        {msg.fileUrl && (
                                            <span className="bg-blue-600 text-[8.5px] px-1.5 py-0.5 rounded uppercase font-black text-white">Fichier</span>
                                        )}
                                    </div>
                                    {msg.message && <p className="text-sm text-gray-300">{msg.message}</p>}
                                    {msg.fileUrl && (
                                        <div className="mt-1 flex items-center space-x-1 text-xs text-blue-400">
                                            <DocumentIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="hover:underline truncate max-w-xs">{msg.fileName || 'Fichier'}</a>
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button onClick={() => deleteForumMessage(msg.id)} className="p-2 text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                         {forumMessages.length === 0 && <p className="text-gray-400 text-center p-4">Aucun message dans le forum.</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4">Gestion du Chat Contact</h3>
                    <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {usersWithContactMessages.map(user => {
                            const lastMessage = contactMessages
                                .filter(msg => msg.user.id === user.id)
                                .sort((a, b) => getTimestamp(b.timestamp) - getTimestamp(a.timestamp))[0];
                            return (
                                 <div key={user.id} className="p-2 border-b border-gray-700">
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold">{user.name}</p>
                                        {lastMessage?.fileUrl && (
                                            <span className="bg-blue-600 text-[8px] px-1.5 py-0.5 rounded uppercase font-black">Fichier</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-300 truncate">{lastMessage?.message || (lastMessage?.fileUrl ? 'Pièce jointe' : 'Aucun message')}</p>
                                    <button onClick={() => handleOpenChat(user)} className="text-sm text-yellow-400 mt-1 hover:underline">Ouvrir la conversation</button>
                                </div>
                            )
                        })}
                         {usersWithContactMessages.length === 0 && <p className="text-gray-400 text-center p-4">Aucune conversation.</p>}
                    </div>
                </div>
            </div>
            
            {isChatModalOpen && selectedUser && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg w-full max-w-lg h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-gray-700">
                        <header className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                            <div className="flex items-center">
                                <img src={getSafeImageUrl(selectedUser.profilePictureUrl, 'https://picsum.photos/seed/user/100')} className="w-8 h-8 rounded-full mr-3 border border-gray-600" />
                                <div>
                                    <h4 className="text-sm font-bold text-white leading-tight">{selectedUser.name}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase">{selectedUser.phone || selectedUser.email}</p>
                                </div>
                            </div>
                            <button onClick={handleCloseChat} className="p-1 rounded-full hover:bg-gray-700">
                                <XMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                            </button>
                        </header>
                        <main className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-800/50">
                            {contactMessages
                                .filter(msg => msg.user.id === selectedUser.id)
                                .sort((a, b) => getTimestamp(a.timestamp) - getTimestamp(b.timestamp))
                                .map(msg => (
                                    <div key={msg.id} className={`flex items-start gap-3 ${msg.isFromAdmin ? 'flex-row-reverse' : ''}`}>
                                        <div className={`p-3 rounded-2xl max-w-[80%] ${msg.isFromAdmin ? 'bg-green-700 rounded-tr-none' : 'bg-gray-700 rounded-tl-none'}`}>
                                            {msg.message && <p className="text-white text-sm">{msg.message}</p>}
                                            {renderAttachment(msg)}
                                            <span className="text-[10px] text-gray-400 block text-right mt-1 opacity-70">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            }
                             <div ref={chatEndRef} />
                        </main>
                        <footer className="p-4 bg-gray-900 border-t border-gray-700 flex-shrink-0">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                                    placeholder="Répondre..."
                                    className="flex-grow bg-gray-800 border-gray-700 rounded-full px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                />
                                <button onClick={handleSendReply} className="p-3 bg-green-600 rounded-full text-white hover:bg-green-500 transition shadow-lg">
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};
