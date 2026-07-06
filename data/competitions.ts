
export interface Competition {
  name: string;
  logoUrl: string;
}

export const competitions: Competition[] = [
  // --- COMPÉTITIONS AFRICAINES ---
  { name: "CAN (Coupe d'Afrique des Nations)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/0/0e/Logo_de_la_Coupe_d%27Afrique_des_nations_de_football_2023.svg" },
  { name: "CHAN (Champ. d'Afrique des Nations)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/6/68/Logo_CHAN_2022.svg/1200px-Logo_CHAN_2022.svg.png" },
  { name: "Ligue des Champions de la CAF", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/8/88/CAF_Champions_League.svg/1200px-CAF_Champions_League.svg.png" },
  { name: "Coupe de la Confédération CAF", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/2/2e/CAF_Confederation_Cup_Logo.svg/1200px-CAF_Confederation_Cup_Logo.svg.png" },
  { name: "Botola Pro (Maroc)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/d/d6/Botola_Pro_Inwi_logo.svg/1200px-Botola_Pro_Inwi_logo.svg.png" },
  { name: "Ligue 1 Pro (Tunisie)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/e/e3/Ligue_1_Tunisie_logo.png" },
  { name: "Ligue 1 Mobilis (Algérie)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/a/a8/Ligue_1_Mobilis_logo.svg/1200px-Ligue_1_Mobilis_logo.svg.png" },
  { name: "Ligue 1 (Sénégal)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/1/1e/Ligue_S%C3%A9n%C3%A9galaise_de_Football_Professionnel_logo.png" },
  { name: "Ligue 1 (Côte d'Ivoire)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/8/8d/F%C3%A9d%C3%A9ration_ivoirienne_de_football.svg" },

  // --- EUROPE (TOP 5 + LIGUES 2) ---
  // France
  { name: "Ligue 1 (France)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ligue_1_%282024%29.svg/1200px-Ligue_1_%282024%29.svg.png" },
  { name: "Ligue 2 (France)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Ligue_2_%282024%29.png/800px-Ligue_2_%282024%29.png" },
  // Angleterre
  { name: "Premier League (Angleterre)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png" },
  { name: "Championship (Angleterre D2)", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/EFL_Championship.svg/1200px-EFL_Championship.svg.png" },
  // Espagne
  { name: "La Liga (Espagne)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/LaLiga_logo_2023.svg/1200px-LaLiga_logo_2023.svg.png" },
  { name: "La Liga 2 (Espagne)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/LaLiga_Hypermotion_logo_2023.svg/1200px-LaLiga_Hypermotion_logo_2023.svg.png" },
  // Italie
  { name: "Serie A (Italie)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Serie_A_logo_2019.svg/1200px-Serie_A_logo_2019.svg.png" },
  { name: "Serie B (Italie)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Serie_B_BKT_logo.svg/1200px-Serie_B_BKT_logo.svg.png" },
  // Allemagne
  { name: "Bundesliga (Allemagne)", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png" },
  { name: "2. Bundesliga (Allemagne)", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8d/2._Bundesliga_logo.svg/1200px-2._Bundesliga_logo.svg.png" },

  // --- INTERNATIONAL ---
  { name: "Coupe du Monde", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/e/e3/Coupe_du_monde_de_football_2026_logo.svg/1200px-Coupe_du_monde_de_football_2026_logo.svg.png" },
  { name: "Euro 2024", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/9/95/UEFA_Euro_2024_Logo.svg/1200px-UEFA_Euro_2024_Logo.svg.png" },
  { name: "Ligue des Champions UEFA", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/b/bf/UEFA_Champions_League_logo_2.svg/1200px-UEFA_Champions_League_logo_2.svg.png" },
  { name: "Europa League", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/8/8f/UEFA_Europa_League_logo.svg/1200px-UEFA_Europa_League_logo.svg.png" },
  
  // --- AUTRES LIGUES 1 & 2 IMPORTANTES ---
  { name: "Liga Portugal (Portugal)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Liga_Portugal_logo.svg/1200px-Liga_Portugal_logo.svg.png" },
  { name: "Eredivisie (Pays-Bas)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Eredivisie_new_logo_2017-.svg/1200px-Eredivisie_new_logo_2017-.svg.png" },
  { name: "Jupiler Pro League (Belgique)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/f/f8/Jupiler_Pro_League.svg/1200px-Jupiler_Pro_League.svg.png" },
  { name: "Süper Lig (Turquie)", logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/S%C3%BCper_Lig_logo.svg/1200px-S%C3%BCper_Lig_logo.svg.png" },
  { name: "Saudi Pro League (Arabie Saoudite)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/6/6d/Saudi_Pro_League_2023.svg/1200px-Saudi_Pro_League_2023.svg.png" },
  { name: "MLS (USA)", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/MLS_crest_logo_RGB_gradient.svg/1200px-MLS_crest_logo_RGB_gradient.svg.png" },
  { name: "Brasileirão (Brésil)", logoUrl: "https://upload.wikimedia.org/wikipedia/fr/thumb/3/38/Brasileir%C3%A3o_Assa%C3%AD_2020.svg/1200px-Brasileir%C3%A3o_Assa%C3%AD_2020.svg.png" },
];
