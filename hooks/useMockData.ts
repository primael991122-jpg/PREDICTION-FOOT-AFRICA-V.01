
import { useState } from 'react';
import type { User, Match, Prediction, LeaderboardEntry, Rule, Info, ForumMessage, ContactMessage, Ad } from '../types';

const MOCK_INITIAL_USERS: User[] = [
  { id: 'user1', name: 'Jean Dupont', email: 'jean.dupont@example.com', profilePictureUrl: 'https://picsum.photos/seed/user1/200', country: { name: 'France', code: 'fr' }, gender: 'Male', phone: '+33612345678', isAdmin: false },
  { id: 'user2', name: 'Marie Curie', email: 'marie.curie@example.com', profilePictureUrl: 'https://picsum.photos/seed/user2/200', country: { name: 'Pologne', code: 'pl' }, gender: 'Female', phone: '+48123456789', isAdmin: false },
  { id: 'user3', name: 'Admin', email: 'admin@example.com', profilePictureUrl: 'https://picsum.photos/seed/admin/200', country: { name: 'Adminland', code: 'aq' }, gender: 'Other', phone: '+11234567890', isAdmin: true },
  { id: 'user4', name: 'Léo Martin', email: 'leo.martin@example.com', profilePictureUrl: 'https://picsum.photos/seed/user4/200', country: { name: 'Belgique', code: 'be' }, gender: 'Male', phone: '+32412345678', isAdmin: false },
  { id: 'user5', name: 'Sofia Costa', email: 'sofia.costa@example.com', profilePictureUrl: 'https://picsum.photos/seed/user5/200', country: { name: 'Portugal', code: 'pt' }, gender: 'Female', phone: '+351912345678', isAdmin: false },
];


// Generate a large list of additional users to reach 1000 total users
const generateExtraUsers = (count: number): User[] => {
    const extraUsers: User[] = [];
    const countries = [
        { name: 'France', code: 'fr' }, { name: 'Brésil', code: 'br' },
        { name: 'Allemagne', code: 'de' }, { name: 'Espagne', code: 'es' },
        { name: 'Italie', code: 'it' }, { name: 'Angleterre', code: 'gb-eng' },
        { name: 'Argentine', code: 'ar' }, { name: 'Pays-Bas', code: 'nl' },
    ];
    const firstNames = ['Lucas', 'Hugo', 'Léa', 'Emma', 'Gabriel', 'Louis', 'Chloé', 'Alice', 'Adam', 'Jules'];
    const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau'];

    for (let i = 0; i < count; i++) {
        const userId = `gen_user_${i}`;
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
        extraUsers.push({
            id: userId,
            name: `${firstName} ${lastName}`,
            email: `joueur${i + MOCK_INITIAL_USERS.length}@example.com`,
            profilePictureUrl: `https://picsum.photos/seed/${userId}/200`,
            country: countries[i % countries.length],
            gender: i % 2 === 0 ? 'Male' : 'Female',
            phone: `+336${String(i).padStart(8, '0')}`,
            isAdmin: false,
        });
    }
    return extraUsers;
};

// Combine initial users with generated ones
const MOCK_USERS: User[] = [...MOCK_INITIAL_USERS, ...generateExtraUsers(995)];


const MOCK_MATCHES: Match[] = [
  { id: 'match1', betNumber: 1, homeTeam: { name: 'France', flagUrl: 'https://flagcdn.com/w320/fr.png' }, awayTeam: { name: 'Allemagne', flagUrl: 'https://flagcdn.com/w320/de.png' }, date: '2024-07-20T21:00:00Z', competition: 'Euro 2024', country: 'Allemagne', result: { homeScore: 2, awayScore: 1 } },
  { id: 'match2', betNumber: 2, homeTeam: { name: 'Brésil', flagUrl: 'https://flagcdn.com/w320/br.png' }, awayTeam: { name: 'Argentine', flagUrl: 'https://flagcdn.com/w320/ar.png' }, date: '2024-07-21T00:00:00Z', competition: 'Copa America', country: 'USA', result: { homeScore: 0, awayScore: 0 } },
  { id: 'match3', betNumber: 3, homeTeam: { name: 'Espagne', flagUrl: 'https://flagcdn.com/w320/es.png' }, awayTeam: { name: 'Italie', flagUrl: 'https://flagcdn.com/w320/it.png' }, date: '2024-07-22T19:00:00Z', competition: 'Euro 2024', country: 'Allemagne' },
  { id: 'match4', betNumber: 4, homeTeam: { name: 'Angleterre', flagUrl: 'https://flagcdn.com/w320/gb-eng.png' }, awayTeam: { name: 'Pays-Bas', flagUrl: 'https://flagcdn.com/w320/nl.png' }, date: '2024-07-23T21:00:00Z', competition: 'Euro 2024', country: 'Allemagne' },
];

const MOCK_PREDICTIONS: Prediction[] = [
  { userId: 'user1', matchId: 'match1', prediction: '1' },
  { userId: 'user1', matchId: 'match2', prediction: '1X' },
  { userId: 'user2', matchId: 'match1', prediction: '2' },
  { userId: 'user2', matchId: 'match2', prediction: 'X' },
];

const generateLeaderboard = (users: User[]): LeaderboardEntry[] => {
    const rankChanges: ('up' | 'down' | 'same')[] = ['up', 'down', 'same'];
    
    const entries: LeaderboardEntry[] = users
        .filter(u => !u.isAdmin)
        .map((user, index) => ({
            user,
            points: Math.floor(Math.random() * 250),
            rank: 0, 
            rankChange: rankChanges[index % rankChanges.length],
        }));
    
    entries.sort((a, b) => b.points - a.points);
    
    return entries.map((entry, index) => ({
        ...entry,
        rank: index + 1,
    }));
};

const MOCK_LEADERBOARD: LeaderboardEntry[] = generateLeaderboard(MOCK_USERS);

const MOCK_RULES: Rule[] = [{ id: 'rule1', content: 'Le règlement officiel du jeu. Les points sont attribués comme suit : 3 points pour un résultat correct (1 ou 2), 2 points pour un match nul (X), et 1 point pour un double chance (1X ou X2). Les prédictions doivent être soumises avant le début de chaque match. Les résultats sont mis à jour par l\'administrateur. En cas d\'égalité, le classement est déterminé par la date d\'inscription. Fair-play et respect sont attendus de tous les participants.' }];

const MOCK_INFO: Info[] = [{ id: 'info1', text: 'Bienvenue sur PREDICTION FOOT AFRICA ! Le meilleur jeu de pronostics pour les fans de football. Participez, montrez vos talents de pronostiqueur et gagnez des prix incroyables. Bonne chance à tous !', imageUrl: 'https://picsum.photos/seed/info/800/400' }];

const MOCK_FORUM: ForumMessage[] = [
  { id: 'fm1', user: MOCK_USERS[0], message: 'Super match de la France hier !', timestamp: '2024-07-21T10:00:00Z' },
  { id: 'fm2', user: MOCK_USERS[1], message: 'Le match nul était prévisible entre le Brésil et l\'Argentine.', timestamp: '2024-07-21T10:05:00Z' },
];

const MOCK_CONTACT: ContactMessage[] = [
  { id: 'cm1', user: MOCK_USERS[0], message: 'Bonjour, j\'ai un problème avec mes points.', timestamp: '2024-07-21T11:00:00Z', isFromAdmin: false },
  { id: 'cm2', user: MOCK_USERS[2], message: 'Bonjour Jean, je regarde ça tout de suite.', timestamp: '2024-07-21T11:02:00Z', isFromAdmin: true },
];

const MOCK_ADS: Ad[] = [
  { id: 'ad1', imageUrl: 'https://picsum.photos/seed/ad1/400/200', name: 'Maillot de Foot Pro', price: '79.99€', url: '#' },
  { id: 'ad2', imageUrl: 'https://picsum.photos/seed/ad2/400/200', name: 'Ballon Officiel', price: '129.99€', url: '#' },
  { id: 'ad3', imageUrl: 'https://picsum.photos/seed/ad3/400/200', name: 'Crampons Nouveauté', price: '249.99€', url: '#' },
  { id: 'ad4', imageUrl: 'https://picsum.photos/seed/ad4/400/200', name: 'Écharpe de Supporter', price: '19.99€', url: '#' },
];

export const useMockData = () => {
  const [users] = useState<User[]>(MOCK_USERS);
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [predictions, setPredictions] = useState<Prediction[]>(MOCK_PREDICTIONS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);
  const [rules, setRules] = useState<Rule[]>(MOCK_RULES);
  const [info, setInfo] = useState<Info[]>(MOCK_INFO);
  const [forumMessages, setForumMessages] = useState<ForumMessage[]>(MOCK_FORUM);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(MOCK_CONTACT);
  const [ads, setAds] = useState<Ad[]>(MOCK_ADS);

  return {
    users,
    matches, setMatches,
    predictions, setPredictions,
    leaderboard, setLeaderboard,
    rules, setRules,
    info, setInfo,
    forumMessages, setForumMessages,
    contactMessages, setContactMessages,
    ads, setAds
  };
};
