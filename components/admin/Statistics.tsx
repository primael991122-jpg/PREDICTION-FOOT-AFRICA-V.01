
import React, { useMemo } from 'react';
import type { User } from '../../types';
import { UserGroupIcon, GlobeEuropeAfricaIcon, ClockIcon } from '@heroicons/react/24/outline';
import { getFlagUrl } from '@/utils/imageUtils';

interface StatisticsProps {
    users: User[];
}

export const Statistics: React.FC<StatisticsProps> = ({ users }) => {
    // Calcul des statistiques de connexion basées sur lastLogin
    const stats = useMemo(() => {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        let activeHour = 0;
        let activeDay = 0;
        let activeWeek = 0;
        let activeMonth = 0;

        users.forEach(user => {
            if (user.lastLogin) {
                const lastLoginDate = new Date(user.lastLogin);
                if (lastLoginDate > oneHourAgo) activeHour++;
                if (lastLoginDate > oneDayAgo) activeDay++;
                if (lastLoginDate > oneWeekAgo) activeWeek++;
                if (lastLoginDate > oneMonthAgo) activeMonth++;
            }
        });

        return { activeHour, activeDay, activeWeek, activeMonth };
    }, [users]);

    // Calcul de la répartition par pays
    const countryStats = useMemo(() => {
        const counts: Record<string, { count: number; code: string }> = {};
        
        users.forEach(user => {
            if (!user.isAdmin) {
                const countryName = user.country?.name || 'Inconnu';
                const countryCode = user.country?.code || 'un';
                
                if (!counts[countryName]) {
                    counts[countryName] = { count: 0, code: countryCode };
                }
                counts[countryName].count++;
            }
        });

        // Convertir en tableau et trier par nombre décroissant
        return Object.entries(counts)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.count - a.count);
    }, [users]);

    const totalUsers = users.filter(u => !u.isAdmin).length;

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* EN-TÊTE STATS TEMPORELLES */}
            <div>
                <h3 className="text-xl font-bold mb-4 flex items-center text-white">
                    <ClockIcon className="w-6 h-6 mr-2 text-yellow-400" />
                    Utilisateurs Actifs (Connexions Récentes)
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Dernière Heure</p>
                        <p className="text-4xl font-black text-green-400">{stats.activeHour}</p>
                        <p className="text-[10px] text-gray-500 mt-1">En ligne</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Aujourd'hui</p>
                        <p className="text-4xl font-black text-blue-400">{stats.activeDay}</p>
                        <p className="text-[10px] text-gray-500 mt-1">Visiteurs uniques 24h</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Cette Semaine</p>
                        <p className="text-4xl font-black text-purple-400">{stats.activeWeek}</p>
                        <p className="text-[10px] text-gray-500 mt-1">7 derniers jours</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Ce Mois</p>
                        <p className="text-4xl font-black text-pink-400">{stats.activeMonth}</p>
                        <p className="text-[10px] text-gray-500 mt-1">30 derniers jours</p>
                    </div>
                </div>
            </div>

            <hr className="border-gray-700" />

            {/* STATS PAYS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center text-white">
                        <GlobeEuropeAfricaIcon className="w-6 h-6 mr-2 text-blue-400" />
                        Répartition Géographique
                    </h3>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg overflow-hidden h-[500px] flex flex-col">
                        <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-500 uppercase">
                            <span>Pays</span>
                            <span>Utilisateurs</span>
                        </div>
                        <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-thin scrollbar-thumb-gray-600">
                            {countryStats.map((stat, index) => {
                                const percentage = totalUsers > 0 ? Math.round((stat.count / totalUsers) * 100) : 0;
                                return (
                                    <div key={stat.name} className="relative group">
                                        <div className="flex items-center justify-between mb-1 relative z-10">
                                            <div className="flex items-center space-x-3">
                                                <span className="font-mono text-gray-500 w-4">{index + 1}</span>
                                                <img 
                                                    src={getFlagUrl(stat.code)} 
                                                    alt={stat.name} 
                                                    className="w-5 h-auto rounded-sm shadow-sm"
                                                />
                                                <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors">{stat.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-bold text-white">{stat.count}</span>
                                                <span className="text-xs text-gray-500 w-8 text-right">{percentage}%</span>
                                            </div>
                                        </div>
                                        {/* Bar Chart Background */}
                                        <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000 group-hover:from-yellow-500 group-hover:to-yellow-400" 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                            {countryStats.length === 0 && (
                                <p className="text-center text-gray-500 py-4">Aucune donnée géographique disponible.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold mb-4 flex items-center text-white">
                        <UserGroupIcon className="w-6 h-6 mr-2 text-green-400" />
                        Détails & Analyse
                    </h3>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
                        <div className="mb-6">
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-2">Total Inscrits</h4>
                            <p className="text-5xl font-black text-white tracking-tight">{totalUsers}</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-green-500">
                                <p className="text-xs text-green-400 font-bold uppercase mb-1">Pays dominant</p>
                                <p className="text-lg font-bold text-white">
                                    {countryStats.length > 0 ? (
                                        <span className="flex items-center">
                                            <img src={getFlagUrl(countryStats[0].code)} className="mr-2" alt="Flag"/>
                                            {countryStats[0].name} ({countryStats[0].count} joueurs)
                                        </span>
                                    ) : 'N/A'}
                                </p>
                            </div>

                             <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-yellow-500">
                                <p className="text-xs text-yellow-400 font-bold uppercase mb-1">Taux d'activité (24h)</p>
                                <p className="text-lg font-bold text-white">
                                    {totalUsers > 0 ? Math.round((stats.activeDay / totalUsers) * 100) : 0}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">des utilisateurs se sont connectés aujourd'hui.</p>
                            </div>

                            <div className="p-4 bg-gray-900 rounded-lg border-l-4 border-purple-500">
                                <p className="text-xs text-purple-400 font-bold uppercase mb-1">Rétention (30 jours)</p>
                                <p className="text-lg font-bold text-white">
                                    {totalUsers > 0 ? Math.round((stats.activeMonth / totalUsers) * 100) : 0}%
                                </p>
                                <p className="text-xs text-gray-500 mt-1">sont actifs sur le dernier mois.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
