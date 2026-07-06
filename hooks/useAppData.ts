
import { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  getDocs,
  writeBatch,
  query,
  orderBy,
  increment,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import type { User, Match, Prediction, LeaderboardEntry, Rule, Info, ForumMessage, ContactMessage, Ad, AppSettings, PredictionValue } from '../types';

const ADMIN_EMAILS = [
  'admin@predictionfootafrica.com',
  'test@admin.com',
  'anguiley99@gmail.com'
];

const DEFAULT_SETTINGS: AppSettings = {
    adSenseClientId: 'ca-pub-1974570269609479',
    adSenseSlots: {
        home: '9695227462', predictions: '1816737445', leaderboard: '8290630549', rules: '6016547348', info: '8190574104', forum: '7329629018', contact: '7819857257', interstitial: '4934673611', about: '', privacy: ''
    },
    emergencyMessage: ''
};

const calculatePoints = (prediction: PredictionValue, result: { homeScore: number, awayScore: number }): number => {
    let actualResult: '1' | 'X' | '2';
    if (result.homeScore > result.awayScore) actualResult = '1';
    else if (result.homeScore < result.awayScore) actualResult = '2';
    else actualResult = 'X';

    if (prediction === actualResult) return actualResult === 'X' ? 2 : 3;
    else if (prediction === '1X' && (actualResult === '1' || actualResult === 'X')) return 1;
    else if (prediction === 'X2' && (actualResult === 'X' || actualResult === '2')) return 1;
    return 0;
};

export const useAppData = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [info, setInfo] = useState<Info[]>([]);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!db) { setLoading(false); return; }

    const unsubscribers: (() => void)[] = [];

    const setupListeners = async () => {
        try {
            unsubscribers.push(onSnapshot(doc(db!, 'settings', 'config'), (s) => s.exists() && setSettings(s.data() as AppSettings), e => {
                if (e.code === 'permission-denied') console.warn("Settings permissions denied.");
            }));
            unsubscribers.push(onSnapshot(collection(db!, 'matches'), (snap) => {
                const fetched = snap.docs.map(d => ({...d.data(), id: d.id} as Match));
                setMatches(fetched);
            }, e => {
                if (e.code === 'permission-denied') console.warn("Matches permissions denied.");
            }));
            unsubscribers.push(onSnapshot(collection(db!, 'rules'), (snap) => setRules(snap.docs.map(d => ({...d.data(), id: d.id} as Rule))), e => {
                if (e.code === 'permission-denied') console.warn("Rules permissions denied.");
            }));
            unsubscribers.push(onSnapshot(collection(db!, 'info'), (snap) => setInfo(snap.docs.map(d => ({...d.data(), id: d.id} as Info))), e => {
                if (e.code === 'permission-denied') console.warn("Info permissions denied.");
            }));
            unsubscribers.push(onSnapshot(collection(db!, 'ads'), (snap) => setAds(snap.docs.map(d => ({...d.data(), id: d.id} as Ad))), e => {
                if (e.code === 'permission-denied') console.warn("Ads permissions denied.");
            }));
        } catch (e) {
            console.error("Firestore initialization error:", e);
        }
    };

    setupListeners();

    const authUnsub = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(!!user);
      setLoading(false);
    });

    return () => {
      unsubscribers.forEach(u => u());
      authUnsub();
    };
  }, []);

  useEffect(() => {
    if (!db || !isAuthReady) return;

    // Écouteurs pour les données privées nécessitant authentification
    const privateUnsubs = [
        onSnapshot(collection(db, 'users'), (snap) => {
            const fetched = snap.docs.map(d => {
                const data = d.data();
                return {
                    ...data,
                    id: d.id,
                    isAdmin: data.isAdmin || ADMIN_EMAILS.includes(data.email?.toLowerCase())
                } as User;
            });
            setUsers(fetched);
        }, e => {
            if (e.code === 'permission-denied') {
                console.warn("Users access denied: Check Firestore Rules for /users/{userId}");
            }
        }),
        onSnapshot(collection(db, 'predictions'), (snap) => setPredictions(snap.docs.map(d => d.data() as Prediction)), e => {
             if (e.code === 'permission-denied') console.warn("Predictions access denied: Check Firestore Rules.");
        }),
        onSnapshot(query(collection(db, 'forum'), orderBy('timestamp', 'asc')), (snap) => setForumMessages(snap.docs.map(d => ({...d.data(), id: d.id} as ForumMessage))), e => {
             if (e.code === 'permission-denied') console.warn("Forum access denied: Check Firestore Rules.");
        }),
        onSnapshot(query(collection(db, 'contact'), orderBy('timestamp', 'asc')), (snap) => setContactMessages(snap.docs.map(d => ({...d.data(), id: d.id} as ContactMessage))), e => {
             if (e.code === 'permission-denied') console.warn("Contact access denied: Check Firestore Rules.");
        })
    ];

    return () => privateUnsubs.forEach(u => u());
  }, [isAuthReady]);

  useEffect(() => {
    if (users.length === 0) return;
    const calculated = users.map(user => {
        let points = 0;
        const userPreds = predictions.filter(p => p.userId === user.id);
        const predictionsCount = userPreds.length;

        userPreds.forEach(p => {
            if (typeof p.points === 'number') points += p.points;
            else {
                const match = matches.find(m => m.id === p.matchId);
                if (match && match.result) points += calculatePoints(p.prediction, match.result);
            }
        });
        return { user, points, rank: 0, rankChange: 'same' as const, predictionsCount };
    });
    calculated.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return a.user.name.localeCompare(b.user.name);
    });
    const finalLeaderboard = calculated.map((entry, index) => {
        const rank = index + 1;
        const badges = [];

        // Points & Rank Badges
        if (rank <= 3 && entry.points > 0) {
            badges.push({
                name: 'Podium Élite',
                icon: '🏆',
                color: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
                description: 'Dans le top 3 mondial'
            });
        }
        if (entry.points >= 25) {
            badges.push({
                name: 'Expert Pronostiqueur',
                icon: '🧠',
                color: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
                description: 'A obtenu 25 points ou plus'
            });
        } else if (entry.points >= 15) {
            badges.push({
                name: 'As du Prono',
                icon: '🎯',
                color: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
                description: 'A obtenu 15 points ou plus'
            });
        } else if (entry.points >= 5) {
            badges.push({
                name: 'Amateur Éclairé',
                icon: '🌱',
                color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                description: 'A obtenu 5 points ou plus'
            });
        }

        // Fidelity / Participation Badges
        if (entry.predictionsCount >= 12) {
            badges.push({
                name: 'Fidèle Supporter',
                icon: '🙌',
                color: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
                description: 'A pronostiqué au moins 12 matchs'
            });
        } else if (entry.predictionsCount >= 6) {
            badges.push({
                name: 'Pilier de la Ligue',
                icon: '🛡️',
                color: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
                description: 'A pronostiqué au moins 6 matchs'
            });
        } else if (entry.predictionsCount >= 1) {
            badges.push({
                name: 'Recrue Passionnée',
                icon: '⚽',
                color: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
                description: 'A pronostiqué son premier match'
            });
        }

        return { 
            user: entry.user, 
            points: entry.points, 
            rank, 
            rankChange: entry.rankChange, 
            badges 
        };
    });
    setLeaderboard(finalLeaderboard);
  }, [users, matches, predictions]);

  const handleFirestoreError = (error: unknown, operationType: string, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  const actions = {
    submitPredictions: async (newPredictions: Prediction[], matchIdsToDelete: string[] = []) => {
        if (!db || !auth.currentUser) return;
        try {
            const batch = writeBatch(db);
            const userId = auth.currentUser.uid;

            // Delete old/conflicting predictions if requested
            matchIdsToDelete.forEach(matchId => {
                batch.delete(doc(db!, 'predictions', `${userId}_${matchId}`));
            });

            // Set new predictions
            newPredictions.forEach(p => batch.set(doc(db!, 'predictions', `${p.userId}_${p.matchId}`), p));
            
            await batch.commit();
        } catch (e: any) { 
            handleFirestoreError(e, 'WRITE', 'predictions');
        }
    },
    sendForumMessage: async (msg: Omit<ForumMessage, 'id'>) => {
        if (!db) return;
        try {
            return await addDoc(collection(db, 'forum'), msg);
        } catch (e) {
            handleFirestoreError(e, 'CREATE', 'forum');
        }
    },
    sendContactMessage: async (msg: Omit<ContactMessage, 'id'>) => {
        if (!db) return;
        try {
            return await addDoc(collection(db, 'contact'), msg);
        } catch (e) {
            handleFirestoreError(e, 'CREATE', 'contact');
        }
    },
    updateUserProfile: async (userId: string, photoUrl: string) => {
        if (!db) return;
        try {
            return await updateDoc(doc(db, 'users', userId), { profilePictureUrl: photoUrl });
        } catch (e) {
            handleFirestoreError(e, 'UPDATE', `users/${userId}`);
        }
    },
    setUserAdminStatus: async (userId: string, isAdmin: boolean) => db && updateDoc(doc(db, 'users', userId), { isAdmin }),
    addMatch: async (match: any) => { if(db) { const r = doc(collection(db, 'matches')); await setDoc(r, {...match, id: r.id}); }},
    updateMatch: async (match: Match) => { if(db) { const {id,...d}=match; await updateDoc(doc(db,'matches',id), d); }},
    deleteMatch: async (id: string) => db && deleteDoc(doc(db, 'matches', id)),
    updateRules: async (r: Rule[]) => db && updateDoc(doc(db, 'rules', r[0].id), { content: r[0].content }),
    saveInfoSlot: async (i: Info) => db && setDoc(doc(db, 'info', i.id), i),
    deleteInfo: async (id: string) => db && deleteDoc(doc(db, 'info', id)),
    saveAdSlot: async (a: Ad) => db && setDoc(doc(db, 'ads', a.id), a),
    deleteAd: async (id: string) => db && deleteDoc(doc(db, 'ads', id)),
    deleteForumMessage: async (id: string) => db && deleteDoc(doc(db, 'forum', id)),
    resetCompetition: async () => { 
        if (!db) return;
        try {
            const preds = await getDocs(collection(db, 'predictions'));
            const batch = writeBatch(db);
            preds.forEach(p => batch.delete(p.ref));
            await batch.commit();
        } catch (e) { console.error(e); }
    }
  };

  return { users, matches, predictions, leaderboard, rules, info, forumMessages, contactMessages, ads, settings, loading, actions };
};
