// Niumba - Cities of Haut-Katanga and Lualaba Provinces
// République Démocratique du Congo

export interface City {
  name: string;
  nameEn: string;
  province: 'Haut-Katanga' | 'Lualaba';
  lat?: number;
  lng?: number;
}

// Haut-Katanga Province Cities (Complete List - No Duplicates)
export const HAUT_KATANGA_CITIES: City[] = [
  { name: 'Lubumbashi', nameEn: 'Lubumbashi', province: 'Haut-Katanga', lat: -11.6876, lng: 27.4847 },
  { name: 'Likasi', nameEn: 'Likasi', province: 'Haut-Katanga', lat: -10.9833, lng: 26.7333 },
  { name: 'Kipushi', nameEn: 'Kipushi', province: 'Haut-Katanga', lat: -11.7667, lng: 27.2500 },
  { name: 'Kasenga', nameEn: 'Kasenga', province: 'Haut-Katanga', lat: -10.3833, lng: 28.6167 },
  { name: 'Kakanda', nameEn: 'Kakanda', province: 'Haut-Katanga', lat: -10.7167, lng: 26.8000 },
  { name: 'Kambove', nameEn: 'Kambove', province: 'Haut-Katanga', lat: -10.8667, lng: 26.6000 },
  { name: 'Kampemba', nameEn: 'Kampemba', province: 'Haut-Katanga' },
  { name: 'Kisanga', nameEn: 'Kisanga', province: 'Haut-Katanga' },
  { name: 'Kakontwe', nameEn: 'Kakontwe', province: 'Haut-Katanga' },
  { name: 'Pweto', nameEn: 'Pweto', province: 'Haut-Katanga', lat: -8.4667, lng: 28.9000 },
  { name: 'Mitwaba', nameEn: 'Mitwaba', province: 'Haut-Katanga' },
  { name: 'Manono', nameEn: 'Manono', province: 'Haut-Katanga' },
  { name: 'Kongolo', nameEn: 'Kongolo', province: 'Haut-Katanga' },
  { name: 'Kabongo', nameEn: 'Kabongo', province: 'Haut-Katanga' },
  { name: 'Kamina', nameEn: 'Kamina', province: 'Haut-Katanga' },
];

// Lualaba Province Cities (Complete List - No Duplicates)
export const LUALABA_CITIES: City[] = [
  { name: 'Kolwezi', nameEn: 'Kolwezi', province: 'Lualaba', lat: -10.7167, lng: 25.4667 },
  { name: 'Fungurume', nameEn: 'Fungurume', province: 'Lualaba', lat: -10.3667, lng: 25.3167 },
  { name: 'Kasumbalesa', nameEn: 'Kasumbalesa', province: 'Lualaba', lat: -12.1833, lng: 27.8000 },
  { name: 'Mutshatsha', nameEn: 'Mutshatsha', province: 'Lualaba' },
  { name: 'Lubudi', nameEn: 'Lubudi', province: 'Lualaba' },
];

// All cities combined
export const ALL_CITIES: City[] = [
  ...HAUT_KATANGA_CITIES,
  ...LUALABA_CITIES,
];

// Remove duplicates and sort alphabetically
const uniqueCitiesMap = new Map<string, City>();
ALL_CITIES.forEach(city => {
  if (!uniqueCitiesMap.has(city.name)) {
    uniqueCitiesMap.set(city.name, city);
  }
});

export const CITIES: City[] = Array.from(uniqueCitiesMap.values()).sort((a, b) => 
  a.name.localeCompare(b.name)
);

// Simple city names array (for backward compatibility)
export const CITY_NAMES: string[] = CITIES.map(city => city.name);

// Get cities by province
export const getCitiesByProvince = (province: 'Haut-Katanga' | 'Lualaba'): City[] => {
  return CITIES.filter(city => city.province === province);
};

// Get city by name
export const getCityByName = (name: string): City | undefined => {
  return CITIES.find(city => city.name === name || city.nameEn === name);
};

// Get province by city name
export const getProvinceByCity = (cityName: string): 'Haut-Katanga' | 'Lualaba' | null => {
  const city = getCityByName(cityName);
  return city ? city.province : null;
};

export default CITIES;
