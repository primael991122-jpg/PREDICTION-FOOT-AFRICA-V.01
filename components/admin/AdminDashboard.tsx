
import React from 'react';
import type { User, Prediction, Match, ContactMessage, ForumMessage } from '../../types';
import { UsersIcon, ClipboardDocumentCheckIcon, PuzzlePieceIcon, ChatBubbleBottomCenterTextIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';
import { PredictionsList } from './PredictionsList';
import { formatDateTime, getTimestamp } from '@/utils/dateUtils';

interface AdminDashboardProps {
    users: User[];
    predictions: Prediction[];
    matches: Match[];
    contactMessages: ContactMessage[];
    forumMessages: ForumMessage[];
    onResetPredictions?: () => Promise<void>;
}

interface StatCardProps {
    icon: React.ElementType;
    title: string;
    value: string | number;
    color: string;
    onAction?: () => void;
    actionIcon?: React.ElementType;
    actionLabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, color, onAction, actionIcon: ActionIcon, actionLabel }) => (
    <div className={`bg-gray-800 p-6 rounded-2xl flex items-center justify-between border-l-4 ${color} relative group`}>
        <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-700 rounded-full">
                <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
                <p className="text-gray-400 text-sm">{title}</p>
                <p className="text-3xl font-bold text-white">{value}</p>
            </div>
        </div>
        {onAction && ActionIcon && (
            <button 
                onClick={(e) => {
                    e.preventDefault();
                    if(window.confirm(actionLabel || "Êtes-vous sûr ?")) onAction();
                }}
                className="absolute top-4 right-4 p-2 bg-gray-700 hover:bg-red-500 text-gray-400 hover:text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                title={actionLabel || "Action"}
            >
                <ActionIcon className="w-4 h-4" />
            </button>
        )}
    </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, predictions, matches, contactMessages, forumMessages, onResetPredictions }) => {
    const totalUsers = users.filter(u => !u.isAdmin).length;
    const totalPredictions = predictions.length;
    const totalMatches = matches.length;
    
    // Calculate unique user conversations
    const activeConversations = new Set(contactMessages.map(m => m.user.id)).size;
    
    // Create a mock recent activity feed
    const recentActivities = [
        ...users.filter(u => !u.isAdmin).slice(-2).map(u => ({ type: 'user', text: `${u.name} s'est inscrit.`, timestamp: new Date(Date.now() - Math.random() * 1000000).toISOString() })),
        ...forumMessages.slice(-2).map(m => ({ type: 'forum', text: `Nouveau message de ${m.user.name} dans le forum.`, timestamp: m.timestamp })),
        { type: 'match', text: 'Le résultat pour France vs Allemagne a été mis à jour.', timestamp: new Date(Date.now() - 3600000).toISOString() },
    ].sort((a, b) => getTimestamp(b.timestamp) - getTimestamp(a.timestamp));


    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold mb-6">Vue d'ensemble</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={UsersIcon} title="Total Joueurs" value={totalUsers} color="border-green-500" />
                    <StatCard 
                        icon={ClipboardDocumentCheckIcon} 
                        title="Prédictions Soumises" 
                        value={totalPredictions} 
                        color="border-yellow-500"
                        onAction={onResetPredictions}
                        actionIcon={TrashIcon}
                        actionLabel="Réinitialiser à zéro"
                    />
                    <StatCard icon={PuzzlePieceIcon} title="Matchs Gérés" value={totalMatches} color="border-blue-500" />
                    <StatCard icon={ChatBubbleBottomCenterTextIcon} title="Conversations Actives" value={activeConversations} color="border-purple-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activité Récente */}
                <div className="lg:col-span-1">
                    <h3 className="text-xl font-bold mb-4">Activité Récente</h3>
                    <div className="bg-gray-800 rounded-lg p-4 space-y-3 max-h-96 overflow-y-auto border border-gray-700">
                        {recentActivities.map((activity, index) => (
                             <div key={index} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700/50">
                                 <div className="p-2 bg-gray-700 rounded-full">
                                    <ClockIcon className="w-5 h-5 text-gray-400"/>
                                 </div>
                                 <div>
                                     <p className="text-white text-sm">{activity.text}</p>
                                     <p className="text-xs text-gray-500">{formatDateTime(activity.timestamp)}</p>
                                 </div>
                             </div>
                        ))}
                         {recentActivities.length === 0 && <p className="text-gray-400 text-center p-4">Aucune activité récente.</p>}
                    </div>
                </div>

                {/* Liste Complète des Pronostics */}
                <div className="lg:col-span-2">
                     <PredictionsList 
                        predictions={predictions} 
                        users={users} 
                        matches={matches} 
                     />
                </div>
            </div>
        </div>
    );
};
