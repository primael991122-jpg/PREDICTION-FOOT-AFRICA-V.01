
import React, { useState, useEffect } from 'react';
import { ArrowLeftOnRectangleIcon, BellIcon, ChartPieIcon, PuzzlePieceIcon, DocumentTextIcon, UsersIcon, PhotoIcon, Cog6ToothIcon, PresentationChartLineIcon, BanknotesIcon, PlusIcon, CheckCircleIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { MatchManagement } from './MatchManagement';
import { ContentManagement } from './ContentManagement';
import { UserManagement } from './UserManagement';
import { AdsManagement } from './AdsManagement';
import { AdminDashboard } from './AdminDashboard';
import { SettingsManagement } from './SettingsManagement';
import { Statistics } from './Statistics';
import type { User, Match, Ad, ForumMessage, Rule, Info, ContactMessage, Prediction, AppSettings } from '../../types';
import { AdCarousel } from '../common/AdCarousel';

interface AdminPanelProps {
    onLogout: () => void;
    matches: Match[];
    actions: any;
    rules: Rule[];
    info: Info[];
    forumMessages: ForumMessage[];
    contactMessages: ContactMessage[];
    ads: Ad[];
    users: User[];
    predictions: Prediction[];
    settings?: AppSettings;
}

type AdminTab = 'dashboard' | 'matches' | 'content' | 'users' | 'ads' | 'settings' | 'statistics';

export const AdminPanel: React.FC<AdminPanelProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard 
                    users={props.users}
                    predictions={props.predictions}
                    matches={props.matches}
                    contactMessages={props.contactMessages}
                    forumMessages={props.forumMessages}
                    onResetPredictions={props.actions.resetCompetition}
                />;
            case 'statistics':
                return <Statistics users={props.users} />;
            case 'matches':
                return <MatchManagement matches={props.matches} actions={props.actions} />;
            case 'content':
                return <ContentManagement rules={props.rules} info={props.info} actions={props.actions} />;
            case 'users':
                return <UserManagement forumMessages={props.forumMessages} contactMessages={props.contactMessages} users={props.users} actions={props.actions} />;
            case 'ads':
                return <AdsManagement ads={props.ads} actions={props.actions} />;
            case 'settings':
                return <SettingsManagement onResetCompetition={props.actions.resetCompetition} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">
            <nav className="w-16 md:w-64 bg-gray-800 p-2 md:p-4 flex flex-col justify-between shadow-xl z-20">
                <div>
                    <div className="flex items-center justify-center md:justify-start mb-10">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-10 h-10 text-yellow-400">
                            <path fill="currentColor" d="M493.1 319.4c-4.2-1.4-8.6.2-11.4 3.7L405 419.4V84.3c0-3.3-1.8-6.3-4.6-7.9c-2.8-1.6-6.2-1.5-8.9.2L249.3 154.4l-31-38.9c-3.4-4.3-9.5-5.2-13.9-1.8L120.5 174c-4.3 3.4-5.2 9.5-1.8 13.9l43.2 54.2L41.3 222c-4.3-3-10.1-2.2-13.4 2.1l-25.2 32.5c-3.3 4.3-2.5 10.2 1.8 13.6L129.2 355c4.3 3.3 10.1 2.5 13.4-1.8l16.1-20.2l82.6 62.8c4.3 3.3 10.1 2.5 13.4-1.8l1.8-2.2l132.8-173.8c3.4-4.3 2.5-10.2-1.8-13.6zm-193.4 53.2L182.8 285.2l-32.1 40.2l128.2-97.1l-22.9 28.7c-3.4 4.3-2.5 10.2 1.8 13.6l42.6 33.1z"/>
                        </svg>
                        <h1 className="text-xl font-bold ml-2 hidden md:block">Admin</h1>
                    </div>
                    <ul className="space-y-2">
                        <TabButton label="Tableau de Bord" icon={ChartPieIcon} isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                        <TabButton label="Statistiques" icon={PresentationChartLineIcon} isActive={activeTab === 'statistics'} onClick={() => setActiveTab('statistics')} />
                        <TabButton label="Matchs" icon={PuzzlePieceIcon} isActive={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />
                        <TabButton label="Contenu" icon={DocumentTextIcon} isActive={activeTab === 'content'} onClick={() => setActiveTab('content')} />
                        <TabButton label="Utilisateurs" icon={UsersIcon} isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                        <TabButton label="Publicités" icon={PhotoIcon} isActive={activeTab === 'ads'} onClick={() => setActiveTab('ads')} />
                        <TabButton label="Paramètres" icon={Cog6ToothIcon} isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                    </ul>
                </div>
                <button onClick={props.onLogout} className="w-full flex items-center justify-center md:justify-start p-3 text-gray-400 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors">
                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                    <span className="ml-3 hidden md:block">Déconnexion</span>
                </button>
            </nav>
            <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
                <header className="bg-gray-800/50 p-4 flex justify-between items-center flex-shrink-0 backdrop-blur-md border-b border-gray-700">
                    <h2 className="text-2xl font-bold capitalize">{activeTab}</h2>
                    <div className="flex items-center space-x-4">
                        <BellIcon className="w-6 h-6 text-gray-400" />
                        <img src="https://picsum.photos/seed/admin/40" className="w-10 h-10 rounded-full border border-gray-600" />
                    </div>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </div>
                 <div className="p-6 pt-0 flex-shrink-0">
                    <AdCarousel ads={props.ads} />
                </div>
            </main>
        </div>
    );
};

const TabButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void; }> = ({ label, icon: Icon, isActive, onClick }) => (
    <li>
        <button onClick={onClick} className={`w-full flex items-center justify-center md:justify-start p-3 rounded-lg transition-colors ${isActive ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 font-bold shadow-lg' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
            <Icon className="w-6 h-6" />
            <span className="ml-3 hidden md:block">{label}</span>
        </button>
    </li>
);
