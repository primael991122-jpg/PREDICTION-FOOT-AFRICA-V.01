
import React, { useState, useMemo } from 'react';
import type { Match } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, ClockIcon, ArchiveBoxXMarkIcon, TrophyIcon, CalendarIcon, ExclamationTriangleIcon, ListBulletIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { teams } from '../../data/teams';
import { competitions } from '../../data/competitions';
import { countries } from '../../data/countries';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface MatchManagementProps {
    matches: Match[];
    actions: any;
}

const emptyMatch: Omit<Match, 'id'> = {
    betNumber: 1,
    homeTeam: { name: '', flagUrl: '' },
    awayTeam: { name: '', flagUrl: '' },
    date: '',
    competition: '',
    competitionLogoUrl: '',
    country: '',
};

export const MatchManagement: React.FC<MatchManagementProps> = ({ matches, actions }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMatch, setEditingMatch] = useState<Match | Omit<Match, 'id'> | null>(null);
    const [matchStatus, setMatchStatus] = useState<'scheduled' | 'finished'>('scheduled');
    const [activeTab, setActiveTab] = useState<'upcoming' | 'finished'>('upcoming');
    const [loading, setLoading] = useState(false);
    
    // État pour la modale de suppression
    const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Tri et Filtrage
    const sortedMatches = useMemo(() => {
        return [...matches].sort((a, b) => (a.betNumber || 999) - (b.betNumber || 999));
    }, [matches]);

    const upcomingMatches = sortedMatches.filter(m => !m.result);
    const finishedMatches = sortedMatches.filter(m => m.result);

    const displayedMatches = activeTab === 'upcoming' ? upcomingMatches : finishedMatches;

    const handleOpenModal = (match: Match | null = null) => {
        if (match) {
            setEditingMatch({ ...match });
            setMatchStatus(match.result ? 'finished' : 'scheduled');
        } else {
            // Auto-increment intelligent
            const maxBetNum = matches.length > 0 ? Math.max(...matches.map(m => m.betNumber || 0)) : 0;
            const nextBetNumber = maxBetNum + 1;
            setEditingMatch({ ...emptyMatch, betNumber: nextBetNumber });
            setMatchStatus('scheduled');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMatch(null);
    };

    const handleSaveMatch = async () => {
        if (!editingMatch) return;
        
        const matchToSave = { ...editingMatch };

        if (matchStatus === 'scheduled') {
            delete matchToSave.result;
        } else {
            if (!matchToSave.result) {
                matchToSave.result = { homeScore: 0, awayScore: 0 };
            }
        }
        
        try {
            if ('id' in matchToSave) {
                await actions.updateMatch(matchToSave as Match);
            } else {
                await actions.addMatch(matchToSave);
            }
            handleCloseModal();
        } catch (e) {
            console.error("Erreur sauvegarde:", e);
            alert("Erreur lors de la sauvegarde du match.");
        }
    };
    
    const onRequestDelete = (match: Match) => {
        setMatchToDelete(match);
    };

    const handleConfirmDelete = async () => {
        if (!matchToDelete) return;
        setIsDeleting(true);
        try {
            await actions.deleteMatch(matchToDelete.id);
            if (editingMatch && 'id' in editingMatch && (editingMatch as Match).id === matchToDelete.id) {
                handleCloseModal();
            }
            setMatchToDelete(null);
        } catch (error) {
            console.error("Erreur suppression:", error);
            alert("Impossible de supprimer ce match. Vérifiez votre connexion.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteFinishedMatches = async () => {
        if (finishedMatches.length === 0) {
            alert("Aucun match terminé à supprimer.");
            return;
        }
        if (window.confirm(`ATTENTION : Vous allez supprimer ${finishedMatches.length} matchs terminés.\n\nVoulez-vous continuer ?`)) {
            setLoading(true);
            try {
                await actions.deleteAllFinishedMatches();
                alert("Nettoyage effectué !");
            } catch (error) {
                console.error("Erreur suppression groupée", error);
                alert("Erreur technique lors du nettoyage.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleTeamNameChange = (team: 'homeTeam' | 'awayTeam', name: string) => {
        const selectedTeam = teams.find(t => t.name.toLowerCase() === name.toLowerCase());
        if (!editingMatch) return;
        const currentTeam = editingMatch[team];
        setEditingMatch({
            ...editingMatch,
            [team]: {
                name: name,
                flagUrl: selectedTeam ? selectedTeam.logoUrl : currentTeam.flagUrl,
            },
        });
    };

    const handleCompetitionChange = (name: string) => {
        if (!editingMatch) return;
        const selectedComp = competitions.find(c => c.name.toLowerCase() === name.toLowerCase());
        setEditingMatch({
            ...editingMatch,
            competition: name,
            competitionLogoUrl: selectedComp ? selectedComp.logoUrl : (editingMatch.competitionLogoUrl || ''),
        });
    };

    const updateScore = (type: 'home' | 'away', value: string) => {
        if (!editingMatch) return;
        const numValue = parseInt(value) || 0;
        const currentResult = editingMatch.result || { homeScore: 0, awayScore: 0 };
        setEditingMatch({
            ...editingMatch,
            result: {
                ...currentResult,
                [type === 'home' ? 'homeScore' : 'awayScore']: numValue
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                <div className="flex items-center space-x-2">
                    <div className="bg-yellow-500/10 p-2 rounded-lg">
                        <ListBulletIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Gestion des Matchs</h3>
                        <p className="text-xs text-gray-400">{matches.length} matchs au total</p>
                    </div>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={() => handleOpenModal()} 
                        className="flex items-center px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 shadow-lg transition-all transform hover:scale-105 font-bold text-sm"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nouveau Match
                    </button>
                    {finishedMatches.length > 0 && (
                        <button 
                            onClick={handleDeleteFinishedMatches} 
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-red-900/50 text-red-200 border border-red-500/50 rounded-lg hover:bg-red-900 transition-colors text-sm font-bold"
                        >
                            <ArchiveBoxXMarkIcon className="w-5 h-5 mr-2" />
                            {loading ? '...' : 'Purger Terminés'}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs Filter */}
            <div className="flex space-x-2 border-b border-gray-700 pb-1">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'upcoming' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    En Cours / À Venir
                    <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">{upcomingMatches.length}</span>
                    {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('finished')}
                    className={`pb-3 px-4 text-sm font-bold transition-all relative ${activeTab === 'finished' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    Terminés
                    <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">{finishedMatches.length}</span>
                    {activeTab === 'finished' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full"></div>}
                </button>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedMatches.map(match => (
                    <div key={match.id} className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden relative group hover:border-gray-500 transition-all flex flex-col">
                        <div className={`h-2 w-full ${match.result ? 'bg-gray-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'}`}></div>
                        
                        <div className="p-4 flex-grow relative">
                            <div className="absolute top-4 left-4">
                                <div className="flex flex-col items-center justify-center bg-gray-900 border border-gray-600 rounded-lg w-10 h-10 shadow-md">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">N°</span>
                                    <span className="text-lg font-black text-white leading-none">{match.betNumber}</span>
                                </div>
                            </div>

                            <div className="flex justify-end mb-4">
                                {match.result ? (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-gray-700 text-gray-400 border border-gray-600">
                                        Terminé
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-green-900/40 text-green-400 border border-green-500/30">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse mr-1.5"></div>
                                        Ouvert
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-6 mb-4">
                                <div className="flex flex-col items-center w-2/5 text-center">
                                    <div className="relative w-14 h-14 mb-2">
                                        <img src={getSafeImageUrl(match.homeTeam.flagUrl, 'https://picsum.photos/seed/home/100')} alt={match.homeTeam.name} className="w-full h-full object-contain drop-shadow-md" />
                                    </div>
                                    <span className="font-bold text-white text-xs leading-tight line-clamp-2">{match.homeTeam.name}</span>
                                </div>
                                
                                <div className="flex flex-col items-center justify-center w-1/5">
                                    {match.result ? (
                                        <div className="bg-gray-900 px-2 py-1 rounded border border-gray-700 text-white font-mono font-bold tracking-widest text-base whitespace-nowrap">
                                            {match.result.homeScore}-{match.result.awayScore}
                                        </div>
                                    ) : (
                                        <span className="text-sm font-black text-gray-600 italic">VS</span>
                                    )}
                                </div>

                                <div className="flex flex-col items-center w-2/5 text-center">
                                    <div className="relative w-14 h-14 mb-2">
                                        <img src={getSafeImageUrl(match.awayTeam.flagUrl, 'https://picsum.photos/seed/away/100')} alt={match.awayTeam.name} className="w-full h-full object-contain drop-shadow-md" />
                                    </div>
                                    <span className="font-bold text-white text-xs leading-tight line-clamp-2">{match.awayTeam.name}</span>
                                </div>
                            </div>

                            <div className="bg-gray-900/50 rounded-lg p-2 flex items-center justify-between border border-gray-700/50 mt-2">
                                <div className="flex items-center space-x-2 overflow-hidden flex-1">
                                     {match.competitionLogoUrl ? (
                                         <img src={getSafeImageUrl(match.competitionLogoUrl)} alt="Comp" className="w-5 h-5 object-contain flex-shrink-0" />
                                     ) : (
                                         <TrophyIcon className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                     )}
                                    <span className="text-[10px] text-gray-400 font-bold truncate uppercase">{match.competition || 'Coupe Amicale'}</span>
                                </div>
                                <div className="flex items-center text-[10px] text-gray-500 font-mono whitespace-nowrap ml-2">
                                    <CalendarIcon className="w-3 h-3 mr-1" />
                                    {formatDate(match.date)}
                                    <span className="mx-1">•</span>
                                    {formatTime(match.date)}
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-900 border-t border-gray-700 p-2 flex gap-2">
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleOpenModal(match);
                                }}
                                className="flex-1 flex items-center justify-center py-2 bg-gray-800 hover:bg-gray-700 text-blue-400 text-xs font-bold rounded transition-colors border border-gray-700 hover:border-blue-500/50"
                            >
                                <PencilIcon className="w-3 h-3 mr-1.5" />
                                Modifier
                            </button>
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onRequestDelete(match);
                                }}
                                className="w-10 flex items-center justify-center bg-gray-800 hover:bg-red-900/30 text-gray-500 hover:text-red-400 rounded transition-colors border border-gray-700 hover:border-red-500/50"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal d'édition */}
            {isModalOpen && editingMatch && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl overflow-y-auto max-h-[90vh] border border-gray-700">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <PencilIcon className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-xl font-bold text-white">{'id' in editingMatch ? 'Modifier le match' : 'Nouveau Match'}</h4>
                            </div>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700 transition">✕</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="col-span-full bg-gray-900 p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="flex space-x-4 items-center">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">État</label>
                                        <div className="flex space-x-2">
                                            <button type="button" onClick={() => setMatchStatus('scheduled')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${matchStatus === 'scheduled' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'}`}>À venir</button>
                                            <button type="button" onClick={() => setMatchStatus('finished')} className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${matchStatus === 'finished' ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-400'}`}>Terminé</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-yellow-500 uppercase block mb-1 text-right">N° Grille</label>
                                        <input type="number" value={editingMatch.betNumber} onChange={(e) => setEditingMatch({...editingMatch, betNumber: parseInt(e.target.value)})} className="w-20 p-2 bg-gray-800 border border-gray-600 rounded text-center font-bold text-white outline-none"/>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-blue-400 uppercase">Domicile</label>
                                    <input type="text" list="teams-list" placeholder="Nom Équipe A" value={editingMatch.homeTeam.name} onChange={(e) => handleTeamNameChange('homeTeam', e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-blue-500"/>
                                    <input type="text" placeholder="URL Logo Équipe A" value={editingMatch.homeTeam.flagUrl} onChange={(e) => setEditingMatch({...editingMatch, homeTeam: {...editingMatch.homeTeam, flagUrl: e.target.value}})} className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-xs text-gray-300"/>
                                </div>
                            </div>

                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-red-400 uppercase">Extérieur</label>
                                    <input type="text" list="teams-list" placeholder="Nom Équipe B" value={editingMatch.awayTeam.name} onChange={(e) => handleTeamNameChange('awayTeam', e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg text-white outline-none focus:ring-2 focus:ring-red-500"/>
                                    <input type="text" placeholder="URL Logo Équipe B" value={editingMatch.awayTeam.flagUrl} onChange={(e) => setEditingMatch({...editingMatch, awayTeam: {...editingMatch.awayTeam, flagUrl: e.target.value}})} className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-xs text-gray-300"/>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Nom Compétition</label>
                                <input type="text" list="competitions-list" placeholder="Ex: CAN 2024" value={editingMatch.competition} onChange={(e) => handleCompetitionChange(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-yellow-500"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">URL Logo Compétition</label>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="https://..." value={editingMatch.competitionLogoUrl || ''} onChange={(e) => setEditingMatch({...editingMatch, competitionLogoUrl: e.target.value})} className="flex-1 p-3 bg-gray-700 rounded-lg text-white text-xs outline-none focus:ring-2 focus:ring-yellow-500"/>
                                    <div className="w-10 h-10 bg-gray-800 rounded flex items-center justify-center border border-gray-600">
                                        {editingMatch.competitionLogoUrl ? <img src={getSafeImageUrl(editingMatch.competitionLogoUrl)} className="w-8 h-8 object-contain" /> : <PhotoIcon className="w-6 h-6 text-gray-600" />}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Date & Heure</label>
                                <input 
                                    type="datetime-local" 
                                    value={editingMatch.date && editingMatch.date.length >= 16 ? editingMatch.date.substring(0, 16) : ''} 
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val) {
                                            try {
                                                const d = new Date(val);
                                                if (!isNaN(d.getTime())) {
                                                    setEditingMatch({...editingMatch, date: d.toISOString()});
                                                }
                                            } catch (err) {}
                                        }
                                    }} 
                                    className="w-full p-3 bg-gray-700 rounded-lg text-white font-mono text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Pays Organisateur</label>
                                <input type="text" list="countries-list" placeholder="Ex: Côte d'Ivoire" value={editingMatch.country} onChange={(e) => setEditingMatch({...editingMatch, country: e.target.value})} className="w-full p-3 bg-gray-700 rounded-lg text-white text-sm outline-none focus:ring-2 focus:ring-yellow-500"/>
                            </div>
                        </div>
                        
                        {matchStatus === 'finished' && (
                            <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 mb-6">
                                <label className="text-xs font-bold text-yellow-400 block mb-4 text-center uppercase tracking-widest">Score Final</label>
                                <div className="flex items-center justify-center space-x-6">
                                    <input type="number" placeholder="0" value={editingMatch.result?.homeScore ?? 0} onChange={(e) => updateScore('home', e.target.value)} className="w-20 h-20 bg-gray-800 rounded-xl border-2 border-gray-600 text-center text-4xl font-black text-white focus:border-yellow-400 outline-none"/>
                                    <span className="font-black text-4xl text-gray-600">-</span>
                                    <input type="number" placeholder="0" value={editingMatch.result?.awayScore ?? 0} onChange={(e) => updateScore('away', e.target.value)} className="w-20 h-20 bg-gray-800 rounded-xl border-2 border-gray-600 text-center text-4xl font-black text-white focus:border-yellow-400 outline-none"/>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-4 pt-4 border-t border-gray-700">
                            <button type="button" onClick={handleCloseModal} className="flex-1 py-3 bg-gray-700 text-white font-bold rounded-lg">Annuler</button>
                            <button type="button" onClick={handleSaveMatch} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-lg">Enregistrer</button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de Confirmation de Suppression */}
            {matchToDelete && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-gray-800 rounded-xl border border-red-500/30 p-6 w-full max-w-sm shadow-2xl">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-900/20 p-4 rounded-full mb-4 ring-1 ring-red-500/50">
                                <ExclamationTriangleIcon className="w-10 h-10 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">Supprimer le match ?</h3>
                            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700 w-full mb-6">
                                <div className="text-yellow-500 font-mono font-bold text-xs mb-1">PARI N°{matchToDelete.betNumber}</div>
                                <div className="text-white font-bold text-sm">{matchToDelete.homeTeam.name} VS {matchToDelete.awayTeam.name}</div>
                            </div>
                            
                            <div className="flex space-x-3 w-full">
                                <button onClick={() => setMatchToDelete(null)} disabled={isDeleting} className="flex-1 py-3 bg-gray-700 text-white font-bold rounded-lg">Annuler</button>
                                <button onClick={handleConfirmDelete} disabled={isDeleting} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg">
                                    {isDeleting ? '...' : 'Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <datalist id="teams-list">
                {teams.map(team => <option key={team.name} value={team.name} />)}
            </datalist>
            <datalist id="countries-list">
                {countries.map(c => <option key={c.code} value={c.name} />)}
            </datalist>
            <datalist id="competitions-list">
                {competitions.map(c => <option key={c.name} value={c.name} />)}
            </datalist>
        </div>
    );
};
