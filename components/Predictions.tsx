
import React, { useState, useEffect, useMemo } from 'react';
import type { User, Match, Prediction, PredictionValue, Ad, AppSettings } from '../types';
import { Page } from '../App';
import { Header } from './common/Header';
import { AdCarousel } from './common/AdCarousel';
import { AdBanner } from './common/AdBanner';
import { CheckIcon, ClockIcon, LockClosedIcon, XMarkIcon, ExclamationTriangleIcon, ShareIcon } from '@heroicons/react/24/solid';
import { formatDate, formatTime, isValidDate, getDateKey } from '@/utils/dateUtils';
import { getSafeImageUrl } from '@/utils/imageUtils';

interface PredictionsProps {
  navigate: (page: Page) => void;
  currentUser: User;
  matches: Match[];
  predictions: Prediction[];
  onSubmit: (predictions: Prediction[], deleteIds?: string[]) => Promise<void>;
  ads: Ad[];
  settings?: AppSettings;
}

const getPointsForPrediction = (prediction: PredictionValue, match: Match): number | null => {
    if (!match.result) return null;
    const { homeScore, awayScore } = match.result;
    
    let actualResult: '1' | 'X' | '2';
    if (homeScore > awayScore) actualResult = '1';
    else if (homeScore < awayScore) actualResult = '2';
    else actualResult = 'X';

    switch (prediction) {
        case '1': return actualResult === '1' ? 3 : 0;
        case '2': return actualResult === '2' ? 3 : 0;
        case 'X': return actualResult === 'X' ? 2 : 0;
        case '1X': return actualResult === '1' || actualResult === 'X' ? 1 : 0;
        case 'X2': return actualResult === 'X' || actualResult === '2' ? 1 : 0;
        default: return 0;
    }
}

export const Predictions: React.FC<PredictionsProps> = ({ navigate, currentUser, matches, predictions, onSubmit, ads, settings }) => {
  const [localPredictions, setLocalPredictions] = useState<Record<string, PredictionValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [canCloseAd, setCanCloseAd] = useState(false);
  const [shareText, setShareText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const existingPredictionMatchIds = useMemo(() => {
    return predictions.filter(p => p.userId === currentUser.id).map(p => p.matchId);
  }, [predictions, currentUser.id]);

  const isMatchLocked = (match: Match): boolean => {
    if (match.result) return true;
    if (!isValidDate(match.date)) return true; // Lock invalid dates
    const matchDate = new Date(match.date);
    const now = new Date();
    const lockTime = new Date(matchDate.getTime() - (60 * 60 * 1000)); 
    return now >= lockTime;
  };

  const gridMatches = useMemo(() => {
    return [...matches]
        .sort((a, b) => {
            return (a.betNumber || 999) - (b.betNumber || 999);
        });
  }, [matches]);

  useEffect(() => {
      const userPreds = predictions.filter(p => p.userId === currentUser.id);
      const predMap = userPreds.reduce((acc, p) => ({ ...acc, [p.matchId]: p.prediction }), {});
      setLocalPredictions(predMap);
  }, [predictions, currentUser.id]);
  
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      if (showAdModal) {
          setCanCloseAd(false);
          timer = setTimeout(() => {
              setCanCloseAd(true);
          }, 3000);
      }
      return () => clearTimeout(timer);
  }, [showAdModal]);

  const handlePredictionChange = (matchId: string, value: PredictionValue) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    setLocalPredictions(prev => {
      const next = { ...prev };
      if (next[matchId] === value) {
        delete next[matchId];
      } else {
        next[matchId] = value;
      }
      return next;
    });
  };

  const handleRandomFill = () => {
    setLocalPredictions(prev => {
      const next = { ...prev };
      gridMatches.forEach(match => {
        if (!isMatchLocked(match)) {
          const rand = Math.random();
          let choice: PredictionValue;
          if (rand < 0.40) choice = '1';
          else if (rand < 0.60) choice = 'X';
          else if (rand < 0.80) choice = '2';
          else if (rand < 0.90) choice = '1X';
          else choice = 'X2';
          
          next[match.id] = choice;
        }
      });
      return next;
    });
  };

  const handleClearPredictions = () => {
    setLocalPredictions(prev => {
      const next = { ...prev };
      gridMatches.forEach(match => {
        if (!isMatchLocked(match)) {
          delete next[match.id];
        }
      });
      return next;
    });
  };

  const handleShareClick = () => {
    const activePredictions = gridMatches
      .map(match => {
        const pred = localPredictions[match.id];
        if (!pred) return null;
        return `🏟️ N°${match.betNumber} | ${match.homeTeam.name} vs ${match.awayTeam.name} : [ ${pred} ]`;
      })
      .filter(Boolean);

    if (activePredictions.length === 0) {
      alert("Veuillez faire au moins un pronostic sur un match ouvert de la grille pour pouvoir le partager !");
      return;
    }

    const appUrl = window.location.origin;
    const textToShare = `⚽ Mes pronostics du jour sur Prediction Foot Africa 🌍 :\n\n${activePredictions.join('\n')}\n\nFaites vos pronostics ici : ${appUrl}`;

    setShareText(textToShare);
    setCopied(false);

    if (navigator.share) {
      navigator.share({
        title: 'Mes pronostics de foot',
        text: textToShare,
        url: appUrl
      }).catch(err => {
        console.warn('Web Share API error or dismissed:', err);
      });
    }
  };

  const handleCopyToClipboard = async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      const textArea = document.createElement("textarea");
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        alert("Impossible de copier automatiquement. Veuillez sélectionner et copier le texte manuellement.");
      }
      document.body.removeChild(textArea);
    }
  };

  const handleInitialSubmit = () => {
      // Pas de pub interstitielle pour les utilisateurs Premium dans la section Premium (optionnel, ici on garde la pub si configurée)
      if (!settings?.adSenseSlots?.interstitial) {
          handleFinalSubmit();
          return;
      }
      setShowAdModal(true);
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setShowAdModal(false);
    setIsSubmitting(true);

    const validPredictions: Prediction[] = [];
    const currentMatchIds = Object.keys(localPredictions);
    const matchIdsToDelete = existingPredictionMatchIds.filter(id => !currentMatchIds.includes(id));
    
    Object.entries(localPredictions).forEach(([matchId, prediction]) => {
        const match = matches.find(m => m.id === matchId);
        if (match && !isMatchLocked(match)) {
            validPredictions.push({
                userId: currentUser.id,
                userName: currentUser.name,
                matchId,
                matchBetNumber: match.betNumber,
                matchLabel: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
                prediction: prediction as PredictionValue,
                timestamp: new Date().toISOString()
            });
        }
    });
    
    try {
        await onSubmit(validPredictions, matchIdsToDelete);
        alert(`Vos pronostics ont été envoyés avec succès !`);
        navigate(Page.DASHBOARD);
    } catch (e) {
        console.error(e);
        alert('Erreur lors de la sauvegarde.');
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const PredictionSelector: React.FC<{ match: Match }> = ({ match }) => {
    const options: PredictionValue[] = ['1', 'X', '2', '1X', 'X2'];
    const locked = isMatchLocked(match);
    const currentPrediction = localPredictions[match.id];

    return (
      <div className="flex justify-between items-center p-2 rounded-lg mt-4 bg-gray-900">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => !locked && handlePredictionChange(match.id, opt)}
            disabled={locked}
            className={`w-10 h-10 sm:w-12 sm:h-12 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center ${
              currentPrediction === opt 
                ? 'bg-yellow-500 text-gray-900 shadow-lg transform scale-110'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white'
            } ${locked ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            {opt}
          </button>
        ))}
      </div>
    );
  };
  
  const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
      const locked = isMatchLocked(match);
      const userPrediction = localPredictions[match.id];
      const resultPoints = userPrediction && match.result ? getPointsForPrediction(userPrediction, match) : null;
      const isWin = resultPoints !== null && resultPoints > 0;

      return (
          <div className="rounded-xl shadow-lg border overflow-hidden relative group transition-all bg-gray-800 border-gray-700 hover:border-gray-600">
              <div className={`h-1.5 w-full ${match.result ? 'bg-gray-600' : (locked ? 'bg-red-500' : 'bg-green-500')}`}></div>
              
              <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                          <span className="font-black text-lg text-yellow-500">#{match.betNumber}</span>
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{formatDate(match.date)} • {formatTime(match.date)}</span>
                      </div>
                      {match.result ? (
                          <div className={`px-2 py-1 rounded text-xs font-black uppercase flex items-center ${isWin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {isWin ? (
                                <>
                                    <CheckIcon className="w-4 h-4 mr-1" />
                                    +{resultPoints} pts
                                </>
                              ) : 'Perdu'}
                          </div>
                      ) : (
                           locked ? 
                           <div className="flex items-center text-red-500 text-xs font-bold uppercase"><LockClosedIcon className="w-4 h-4 mr-1" /> Fermé</div> 
                           : <div className="flex items-center text-xs font-bold uppercase text-green-500"><div className="w-2 h-2 rounded-full animate-pulse mr-2 bg-green-500"></div> Ouvert</div>
                      )}
                  </div>

                  <div className="flex items-center justify-between mb-2">
                      <div className="flex flex-col items-center w-1/3 text-center group-hover:scale-105 transition-transform duration-300">
                          <img src={getSafeImageUrl(match.homeTeam.flagUrl, 'https://picsum.photos/seed/home/100')} alt={match.homeTeam.name} className="w-14 h-14 object-contain mb-2 drop-shadow-lg" />
                          <span className="font-bold text-white text-xs leading-tight">{match.homeTeam.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center">
                          <span className="text-xl font-black text-gray-600">VS</span>
                          {match.result && (
                              <div className="mt-1 bg-gray-900 px-2 py-0.5 rounded border border-gray-700 text-white font-mono font-bold tracking-widest text-sm">
                                  {match.result.homeScore} - {match.result.awayScore}
                              </div>
                          )}
                      </div>

                      <div className="flex flex-col items-center w-1/3 text-center group-hover:scale-105 transition-transform duration-300">
                          <img src={getSafeImageUrl(match.awayTeam.flagUrl, 'https://picsum.photos/seed/away/100')} alt={match.awayTeam.name} className="w-14 h-14 object-contain mb-2 drop-shadow-lg" />
                          <span className="font-bold text-white text-xs leading-tight">{match.awayTeam.name}</span>
                      </div>
                  </div>

                   {match.competition && (
                        <div className="text-center mb-2">
                             <span className="text-[10px] uppercase text-gray-500 font-bold bg-gray-900/50 px-2 py-0.5 rounded-full">{match.competition}</span>
                        </div>
                   )}

                  <PredictionSelector match={match} />
              </div>
          </div>
      );
  };


  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header 
        title="Grille du Jour" 
        currentUser={currentUser} 
        navigate={navigate} 
        backPage={Page.DASHBOARD} 
      />
      
      <main className="flex-grow container mx-auto p-2 md:p-4 pb-48">
        <AdBanner pageName="predictions" settings={settings} className="mb-4" />
        
        <div className="border-l-4 p-3 mb-6 rounded-r-lg shadow-sm bg-yellow-500/10 border-yellow-500">
            <div className="flex items-start">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                <div>
                    <h3 className="font-bold uppercase text-xs mb-1 text-yellow-500">
                        Pronostics Multiples Simultanés
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed">
                        Vous pouvez désormais pronostiquer sur <strong className="text-yellow-400">tous les matchs de la grille simultanément</strong>. Remplissez simplement vos choix pour l'ensemble des rencontres avant de valider votre grille.
                    </p>
                </div>
            </div>
        </div>

        <div className="border-l-4 p-3 mb-6 rounded-r-lg shadow-sm bg-green-500/10 border-green-500">
            <div className="flex items-start">
                <ClockIcon className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                <div>
                    <h3 className="font-bold uppercase text-xs mb-1 text-green-500">
                        Règles de la Grille
                    </h3>
                    <p className="text-gray-300 text-xs leading-relaxed">
                        Pronostiquez les matchs. Fermeture 1h avant. Doubles chances (1X, X2) autorisées.
                    </p>
                </div>
            </div>
        </div>

        {gridMatches.length > 0 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                <span className="text-yellow-500">⚙️</span> Actions de Grille Simultanées
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                Gagnez du temps en gérant votre grille, ou partagez vos pronostics avec vos proches !
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                type="button"
                onClick={handleRandomFill}
                className="px-3.5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 font-black text-[11px] rounded-lg shadow-md transition-all uppercase tracking-wider flex items-center gap-1"
              >
                🎲 Remplir la Grille
              </button>
              <button
                type="button"
                onClick={handleShareClick}
                className="px-3.5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-black text-[11px] rounded-lg shadow-md transition-all uppercase tracking-wider flex items-center gap-1.5"
                id="share-predictions-button"
              >
                <ShareIcon className="w-3.5 h-3.5" /> Partager mon pronostic
              </button>
              <button
                type="button"
                onClick={handleClearPredictions}
                className="px-3.5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-black text-[11px] rounded-lg transition-all uppercase tracking-wider flex items-center gap-1"
              >
                🗑️ Tout effacer
              </button>
            </div>
          </div>
        )}

        {gridMatches.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 px-4 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-700 text-center">
                <div className="bg-gray-700/50 p-4 rounded-full mb-4">
                    <CheckIcon className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Aucune grille disponible</h3>
                <p className="text-gray-400 max-w-xs mx-auto">Revenez plus tard pour les prochains matchs.</p>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gridMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))}
            </div>
        )}
        
        <div className="mt-16 pt-4 border-t border-white/5">
            <AdCarousel ads={ads} />
        </div>
      </main>
      
      <footer className="fixed bottom-20 left-0 right-0 bg-gray-900/95 backdrop-blur-md p-4 border-t border-gray-800 z-40 shadow-2xl">
        <div className="container mx-auto max-w-4xl">
            <button
              onClick={handleInitialSubmit}
              disabled={isSubmitting || gridMatches.length === 0}
              className={`w-full py-3 bg-gradient-to-r font-black uppercase tracking-wider rounded-xl shadow-lg transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center ${isSubmitting ? 'opacity-75 cursor-wait' : ''} from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white`}
            >
              {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Validation...
                  </>
              ) : 'VALIDER MA GRILLE'}
            </button>
        </div>
      </footer>

      {showAdModal && (
          <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center p-4">
              <div className="absolute top-4 right-4">
                  {canCloseAd && (
                      <button onClick={handleFinalSubmit} className="p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700">
                          <XMarkIcon className="w-6 h-6" />
                      </button>
                  )}
              </div>
              
              <div className="text-center mb-6 animate-pulse">
                  <h2 className="text-2xl font-black text-yellow-400 uppercase">Validation en cours...</h2>
                  <p className="text-gray-400 text-sm">Merci de soutenir notre application</p>
              </div>

              <div className="w-full max-w-lg bg-white rounded-lg overflow-hidden shadow-2xl min-h-[300px] flex items-center justify-center relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs z-0">
                      Chargement Publicité...
                  </div>
                  <div className="relative z-10 w-full">
                       <AdBanner pageName="interstitial" settings={settings} />
                  </div>
              </div>

              <div className="mt-8">
                  <button 
                    onClick={handleFinalSubmit}
                    disabled={!canCloseAd}
                    className={`px-8 py-4 rounded-full font-black uppercase tracking-wider text-lg shadow-xl transition-all ${
                        canCloseAd 
                        ? 'bg-green-500 hover:bg-green-600 text-white transform hover:scale-105' 
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                      {canCloseAd ? "Poursuivre la Validation" : "Patientez..."}
                  </button>
              </div>
          </div>
      )}

      {shareText && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-950 w-full max-w-md rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.8)] border border-white/10 flex flex-col p-6 relative">
            
            <button 
              onClick={() => setShareText(null)} 
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all transform active:scale-95"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-3xl">🏆</span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight mt-2">Partager mes Pronostics</h3>
              <p className="text-[11px] text-gray-400 mt-1 uppercase tracking-wider">Montrez vos pronostics à vos amis !</p>
            </div>

            <div className="bg-gray-900/60 rounded-2xl p-4 border border-white/5 mb-6 font-sans">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest text-left">Aperçu du message :</p>
              <div className="max-h-40 overflow-y-auto bg-gray-950/80 p-3 rounded-xl border border-white/5 text-gray-300 font-mono text-[11px] whitespace-pre-line text-left leading-relaxed">
                {shareText}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                💬 Partager sur WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                🐦 Partager sur X (Twitter)
              </a>
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-black uppercase tracking-wider text-[11px] rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                📋 {copied ? 'Copié ! ✅' : 'Copier le message'}
              </button>
            </div>

            <button
              onClick={() => setShareText(null)}
              className="mt-4 w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold uppercase tracking-wider text-[10px] rounded-xl transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
