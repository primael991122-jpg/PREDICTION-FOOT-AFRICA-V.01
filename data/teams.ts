
import { countries } from './countries';

export interface Team {
  name: string;
  logoUrl: string;
  type: 'country' | 'club';
}

// Football-specific regions/associations that might not be in classical ISO lists of independent countries
const footballSpecificRegions: Team[] = [
  { name: 'Angleterre', logoUrl: 'https://flagcdn.com/w320/gb-eng.png', type: 'country' },
  { name: 'Écosse', logoUrl: 'https://flagcdn.com/w320/gb-sct.png', type: 'country' },
  { name: 'Pays de Galles', logoUrl: 'https://flagcdn.com/w320/gb-wls.png', type: 'country' },
  { name: 'Irlande du Nord', logoUrl: 'https://flagcdn.com/w320/gb-nir.png', type: 'country' },
];

const customClubs: Team[] = [
  // Clubs (using Wikimedia)
  { name: 'Paris Saint-Germain', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/8/86/Paris_Saint-Germain_Logo.svg', type: 'club' },
  { name: 'Olympique de Marseille', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_de_Marseille_logo.svg', type: 'club' },
  { name: 'Olympique Lyonnais', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/c/c6/Olympique_lyonnais_%28logo%29.svg', type: 'club' },
  { name: 'AS Monaco', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/5/58/AS_Monaco_FC_logo.svg', type: 'club' },
  { name: 'Real Madrid', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/c/c7/Logo_Real_Madrid.svg', type: 'club' },
  { name: 'FC Barcelone', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/a/a1/Logo_FC_Barcelona.svg', type: 'club' },
  { name: 'Atlético Madrid', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/f/f4/Atletico_Madrid_2017_logo.svg', type: 'club' },
  { name: 'Manchester United', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/b/b9/Logo_Manchester_United.svg', type: 'club' },
  { name: 'Manchester City', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/e/eb/Logo_Manchester_City_FC.svg', type: 'club' },
  { name: 'Liverpool FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/0/00/Logo_Liverpool_FC.svg', type: 'club' },
  { name: 'Chelsea FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/c/cc/Chelsea_FC.svg', type: 'club' },
  { name: 'Arsenal FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/5/53/Arsenal_FC.svg', type: 'club' },
  { name: 'Bayern Munich', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Logo_FC_Bayern_M%C3%BCnchen.svg', type: 'club' },
  { name: 'Borussia Dortmund', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg', type: 'club' },
  { name: 'Juventus FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Juventus_FC_2017_logo.svg', type: 'club' },
  { name: 'Inter Milan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Inter_Milan_logo.svg/1024px-Inter_Milan_logo.svg.png', type: 'club' },
  { name: 'AC Milan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg', type: 'club' },
  { name: 'Al Nassr FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Al-Nassr-Logo.svg/1024px-Al-Nassr-Logo.svg.png', type: 'club' },
  { name: 'Al-Hilal SFC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/archive/d/d1/20230604082218%21Al-Hilal_SFC_logo.svg', type: 'club' },
  { name: 'Wydad AC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/30/Wydad_Athletic_Club_logo.svg/1024px-Wydad_Athletic_Club_logo.svg.png', type: 'club' },
  { name: 'Raja CA', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/e/e9/Raja_Club_Athletic_Logo.svg/1200px-Raja_Club_Athletic_Logo.svg.png', type: 'club' },
  { name: 'Al Ahly SC', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/5/55/Al_Ahly_SC_logo.svg', type: 'club' },
  { name: 'Zamalek SC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Zamalek_logo_2.svg/1200px-Zamalek_logo_2.svg.png', type: 'club' },
  { name: 'Espérance de Tunis', logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/thumb/f/f4/Esperance_Sportive_de_Tunis_logo.svg/1200px-Esperance_Sportive_de_Tunis_logo.svg.png', type: 'club' },
  { name: 'Mamelodi Sundowns FC', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cf/Mamelodi_Sundowns_FC_logo.svg/1200px-Mamelodi_Sundowns_FC_logo.svg.png', type: 'club' },
];

const uniqueTeamsMap = new Map<string, Team>();

const addTeam = (team: Team) => {
  const key = team.name.toLowerCase().trim();
  if (!uniqueTeamsMap.has(key)) {
    uniqueTeamsMap.set(key, team);
  }
};

// Add standard football nations first
footballSpecificRegions.forEach(addTeam);

// Add all standard countries from countries.ts
countries.forEach(country => {
  addTeam({
    name: country.name,
    logoUrl: `https://flagcdn.com/w320/${country.code.toLowerCase()}.png`,
    type: 'country'
  });
});

// Add all custom clubs
customClubs.forEach(addTeam);

export const teams: Team[] = Array.from(uniqueTeamsMap.values());

