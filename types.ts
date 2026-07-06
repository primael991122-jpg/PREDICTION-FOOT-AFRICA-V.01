
export interface User {
  id: string;
  shortId?: string; // Code Joueur Court (ex: A7B9X2)
  name: string;
  email: string;
  profilePictureUrl: string;
  country: {
    name: string;
    code: string;
  };
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  isAdmin: boolean;
  lastLogin?: string;
}

export type PredictionValue = '1' | 'X' | '2' | '1X' | 'X2';

export interface Match {
  id: string;
  betNumber: number;
  homeTeam: {
    name: string;
    flagUrl: string;
  };
  awayTeam: {
    name: string;
    flagUrl: string;
  };
  date: string;
  competition: string;
  competitionLogoUrl?: string;
  country: string;
  result?: {
    homeScore: number;
    awayScore: number;
  };
}

export interface Prediction {
  userId: string;
  matchId: string;
  prediction: PredictionValue;
  userName?: string;
  matchBetNumber?: number;
  matchLabel?: string;
  timestamp?: string;
  points?: number;
}

export interface Badge {
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface LeaderboardEntry {
  user: User;
  points: number;
  rank: number;
  rankChange: 'up' | 'down' | 'same';
  badges?: Badge[];
}

export interface Rule {
  id: string;
  content: string;
}

export interface Info {
  id: string;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp?: string;
}

export interface ForumMessage {
  id: string;
  user: User;
  message: string;
  timestamp: string;
  // NOUVEAUX CHAMPS POUR PIÈCES JOINTES
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface ContactMessage {
  id: string;
  user: User;
  message: string;
  timestamp: string;
  isFromAdmin: boolean;
  // NOUVEAUX CHAMPS POUR PIÈCES JOINTES
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface Ad {
  id: string;
  imageUrl: string;
  name: string;
  price: string;
  url: string;
}

export interface AppSettings {
    adSenseClientId: string;
    adSenseSlots: {
        home: string;
        predictions: string;
        leaderboard: string;
        rules: string;
        info: string;
        forum: string;
        contact: string;
        interstitial: string;
        about: string;
        privacy: string;
    };
    emergencyMessage?: string; // NOUVEAU : Message d'urgence défilant
}
