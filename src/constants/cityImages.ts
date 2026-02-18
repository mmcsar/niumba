// Niumba - City Images and Icons
// Images and visual assets for cities

export interface CityVisual {
  name: string;
  imageUrl: string;
  gradient: string[];
  icon: string;
}

// Carte de la RDC pour toutes les villes (évite les conflits)
const RDC_MAP_IMAGE = 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop';

// City gradients - Couleurs sobres basées sur la palette de la marque (pas de rainbow)
// Utilisation de tons bleus, gris-bleu et variations subtiles
export const CITY_VISUALS: Record<string, CityVisual> = {
  'Lubumbashi': {
    name: 'Lubumbashi',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#006AFF', '#0051CC'],
    icon: 'map',
  },
  'Kolwezi': {
    name: 'Kolwezi',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#006AFF', '#0048A3'],
    icon: 'map',
  },
  'Likasi': {
    name: 'Likasi',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0051CC', '#003D99'],
    icon: 'map',
  },
  'Kipushi': {
    name: 'Kipushi',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0048A3', '#003D99'],
    icon: 'map',
  },
  'Kasenga': {
    name: 'Kasenga',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#006AFF', '#0051CC'],
    icon: 'map',
  },
  'Kakanda': {
    name: 'Kakanda',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0051CC', '#0048A3'],
    icon: 'map',
  },
  'Kambove': {
    name: 'Kambove',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#003D99', '#002E73'],
    icon: 'map',
  },
  'Kampemba': {
    name: 'Kampemba',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#006AFF', '#0051CC'],
    icon: 'map',
  },
  'Kisanga': {
    name: 'Kisanga',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0051CC', '#0048A3'],
    icon: 'map',
  },
  'Kakontwe': {
    name: 'Kakontwe',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0048A3', '#003D99'],
    icon: 'map',
  },
  'Pweto': {
    name: 'Pweto',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#003D99', '#002E73'],
    icon: 'map',
  },
  'Mitwaba': {
    name: 'Mitwaba',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#006AFF', '#0051CC'],
    icon: 'map',
  },
  'Manono': {
    name: 'Manono',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0051CC', '#0048A3'],
    icon: 'map',
  },
  'Kongolo': {
    name: 'Kongolo',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0048A3', '#003D99'],
    icon: 'map',
  },
  'Kabongo': {
    name: 'Kabongo',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#003D99', '#002E73'],
    icon: 'map',
  },
  'Kamina': {
    name: 'Kamina',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#006AFF', '#0051CC'],
    icon: 'map',
  },
  'Fungurume': {
    name: 'Fungurume',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0051CC', '#0048A3'],
    icon: 'map',
  },
  'Kasumbalesa': {
    name: 'Kasumbalesa',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#0048A3', '#003D99'],
    icon: 'map',
  },
  'Mutshatsha': {
    name: 'Mutshatsha',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#003D99', '#002E73'],
    icon: 'map',
  },
  'Lubudi': {
    name: 'Lubudi',
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#006AFF', '#0051CC'],
    icon: 'map',
  },
};

// Get visual for a city (with fallback)
export const getCityVisual = (cityName: string): CityVisual => {
  return CITY_VISUALS[cityName] || {
    name: cityName,
    imageUrl: RDC_MAP_IMAGE,
    gradient: ['#006AFF', '#0051CC'],
    icon: 'map',
  };
};

