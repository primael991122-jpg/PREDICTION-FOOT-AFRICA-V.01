
import React, { useState, useMemo } from 'react';
import type { Prediction, User, Match } from '../../types';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '@/utils/dateUtils';

interface PredictionsListProps {
    predictions: Prediction[];
    users: User[];
    matches: Match[];
}

export const PredictionsList: React.FC<PredictionsListProps> = ({ predictions, users, matches }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Enrichissement des données (Fallback pour les anciennes données qui n'ont pas le nom stocké)
    const enrichedPredictions = useMemo(() => {
        return predictions.map(pred => {
            // Si les champs sont déjà dans la DB, on les utilise. Sinon on fait le lien.
            const user = users.find(u => u.id === pred.userId);
            const match = matches.find(m => m.id === pred.matchId);

            return {
                ...pred,
                displayName: pred.userName || user?.name || 'Inconnu',
                displayMatchNum: pred.matchBetNumber || match?.betNumber || 0,
                displayMatchLabel: pred.matchLabel || (match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : 'Match inconnu'),
                displayDate: pred.timestamp || new Date().toISOString()
            };
        }).sort((a, b) => b.displayDate.localeCompare(a.displayDate)); // Tri par date décroissante
    }, [predictions, users, matches]);

    const filteredPredictions = enrichedPredictions.filter(p => 
        p.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.displayMatchLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.displayMatchNum.toString().includes(searchTerm)
    );

    return (
        <div>
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold">Historique Global des Pronostics</h3>
                <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Rechercher (Nom, Match...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-10 text-white focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900 text-gray-400 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4 border-b border-gray-700">Date</th>
                                <th className="p-4 border-b border-gray-700">Joueur</th>
                                <th className="p-4 border-b border-gray-700 text-center">Pari N°</th>
                                <th className="p-4 border-b border-gray-700">Match</th>
                                <th className="p-4 border-b border-gray-700 text-center">Prono</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {filteredPredictions.map((pred, index) => (
                                <tr key={`${pred.userId}-${pred.matchId}-${index}`} className="hover:bg-gray-700/50 transition-colors">
                                    <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                                        {formatDate(pred.displayDate)} <span className="text-xs">{formatTime(pred.displayDate)}</span>
                                    </td>
                                    <td className="p-4 font-semibold text-white">
                                        {pred.displayName}
                                    </td>
                                    <td className="p-4 text-center font-mono text-yellow-400 font-bold">
                                        #{pred.displayMatchNum}
                                    </td>
                                    <td className="p-4 text-sm text-gray-300">
                                        {pred.displayMatchLabel}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`inline-block w-8 h-8 leading-8 rounded-full font-bold text-sm
                                            ${pred.prediction === '1' || pred.prediction === '2' ? 'bg-blue-600 text-white' : ''}
                                            ${pred.prediction === 'X' ? 'bg-gray-500 text-white' : ''}
                                            ${pred.prediction.length > 1 ? 'bg-purple-600 text-white' : ''}
                                        `}>
                                            {pred.prediction}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredPredictions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        Aucun pronostic trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center">
                Affichage des 1000 derniers pronostics.
            </div>
        </div>
    );
};
