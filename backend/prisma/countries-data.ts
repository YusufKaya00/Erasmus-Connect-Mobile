// Extended list of Erasmus+ countries with coordinates
export const erasmusCountries = [
  // Western Europe
  { name: 'Germany', code: 'DE', flag: '🇩🇪', continent: 'Europe', currency: 'EUR', languages: ['de', 'en'], latitude: 51.1657, longitude: 10.4515, timezone: 'Europe/Berlin', description: 'Educational excellence in the heart of Europe' },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', continent: 'Europe', currency: 'EUR', languages: ['es', 'en'], latitude: 40.4637, longitude: -3.7492, timezone: 'Europe/Madrid', description: 'Rich culture and vibrant student life' },
  { name: 'France', code: 'FR', flag: '🇫🇷', continent: 'Europe', currency: 'EUR', languages: ['fr', 'en'], latitude: 46.2276, longitude: 2.2137, timezone: 'Europe/Paris', description: 'Art, culture, and world-class education' },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', continent: 'Europe', currency: 'EUR', languages: ['it', 'en'], latitude: 41.8719, longitude: 12.5674, timezone: 'Europe/Rome', description: 'History, art, and Mediterranean lifestyle' },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', continent: 'Europe', currency: 'EUR', languages: ['nl', 'en'], latitude: 52.1326, longitude: 5.2913, timezone: 'Europe/Amsterdam', description: 'Progressive education and English-friendly' },
  { name: 'Belgium', code: 'BE', flag: '🇧🇪', continent: 'Europe', currency: 'EUR', languages: ['nl', 'fr', 'de', 'en'], latitude: 50.5039, longitude: 4.4699, timezone: 'Europe/Brussels', description: 'Multicultural heart of Europe' },
  { name: 'Portugal', code: 'PT', flag: '🇵🇹', continent: 'Europe', currency: 'EUR', languages: ['pt', 'en'], latitude: 39.3999, longitude: -8.2245, timezone: 'Europe/Lisbon', description: 'Affordable living and coastal beauty' },
  { name: 'Austria', code: 'AT', flag: '🇦🇹', continent: 'Europe', currency: 'EUR', languages: ['de', 'en'], latitude: 47.5162, longitude: 14.5501, timezone: 'Europe/Vienna', description: 'Alpine beauty and classical culture' },
  { name: 'Switzerland', code: 'CH', flag: '🇨🇭', continent: 'Europe', currency: 'CHF', languages: ['de', 'fr', 'it', 'en'], latitude: 46.8182, longitude: 8.2275, timezone: 'Europe/Zurich', description: 'Excellence and multilingual environment' },
  { name: 'Luxembourg', code: 'LU', flag: '🇱🇺', continent: 'Europe', currency: 'EUR', languages: ['lb', 'fr', 'de', 'en'], latitude: 49.8153, longitude: 6.1296, timezone: 'Europe/Luxembourg', description: 'International finance hub' },
  { name: 'Ireland', code: 'IE', flag: '🇮🇪', continent: 'Europe', currency: 'EUR', languages: ['en', 'ga'], latitude: 53.4129, longitude: -8.2439, timezone: 'Europe/Dublin', description: 'English-speaking with vibrant tech scene' },
  
  // Nordic Countries
  { name: 'Sweden', code: 'SE', flag: '🇸🇪', continent: 'Europe', currency: 'SEK', languages: ['sv', 'en'], latitude: 60.1282, longitude: 18.6435, timezone: 'Europe/Stockholm', description: 'Innovation and high quality of life' },
  { name: 'Denmark', code: 'DK', flag: '🇩🇰', continent: 'Europe', currency: 'DKK', languages: ['da', 'en'], latitude: 56.2639, longitude: 9.5018, timezone: 'Europe/Copenhagen', description: 'Design and student-friendly cities' },
  { name: 'Finland', code: 'FI', flag: '🇫🇮', continent: 'Europe', currency: 'EUR', languages: ['fi', 'sv', 'en'], latitude: 61.9241, longitude: 25.7482, timezone: 'Europe/Helsinki', description: 'Top-ranked education' },
  { name: 'Norway', code: 'NO', flag: '🇳🇴', continent: 'Europe', currency: 'NOK', languages: ['no', 'en'], latitude: 60.4720, longitude: 8.4689, timezone: 'Europe/Oslo', description: 'Fjords and high living standards' },
  { name: 'Iceland', code: 'IS', flag: '🇮🇸', continent: 'Europe', currency: 'ISK', languages: ['is', 'en'], latitude: 64.9631, longitude: -19.0208, timezone: 'Atlantic/Reykjavik', description: 'Unique landscapes and adventure' },
  
  // Central Europe
  { name: 'Poland', code: 'PL', flag: '🇵🇱', continent: 'Europe', currency: 'PLN', languages: ['pl', 'en'], latitude: 51.9194, longitude: 19.1451, timezone: 'Europe/Warsaw', description: 'Rich history and affordable student life' },
  { name: 'Czech Republic', code: 'CZ', flag: '🇨🇿', continent: 'Europe', currency: 'CZK', languages: ['cs', 'en'], latitude: 49.8175, longitude: 15.4730, timezone: 'Europe/Prague', description: 'Beautiful architecture and culture' },
  { name: 'Hungary', code: 'HU', flag: '🇭🇺', continent: 'Europe', currency: 'HUF', languages: ['hu', 'en'], latitude: 47.1625, longitude: 19.5033, timezone: 'Europe/Budapest', description: 'Thermal baths and vibrant nightlife' },
  { name: 'Slovakia', code: 'SK', flag: '🇸🇰', continent: 'Europe', currency: 'EUR', languages: ['sk', 'en'], latitude: 48.6690, longitude: 19.6990, timezone: 'Europe/Bratislava', description: 'Mountain hiking and affordable living' },
  { name: 'Slovenia', code: 'SI', flag: '🇸🇮', continent: 'Europe', currency: 'EUR', languages: ['sl', 'en'], latitude: 46.1512, longitude: 14.9955, timezone: 'Europe/Ljubljana', description: 'Alpine and Mediterranean beauty' },
  
  // Eastern Europe
  { name: 'Romania', code: 'RO', flag: '🇷🇴', continent: 'Europe', currency: 'RON', languages: ['ro', 'en'], latitude: 45.9432, longitude: 24.9668, timezone: 'Europe/Bucharest', description: 'Carpathian mountains and castles' },
  { name: 'Bulgaria', code: 'BG', flag: '🇧🇬', continent: 'Europe', currency: 'BGN', languages: ['bg', 'en'], latitude: 42.7339, longitude: 25.4858, timezone: 'Europe/Sofia', description: 'Black Sea coast and low costs' },
  { name: 'Croatia', code: 'HR', flag: '🇭🇷', continent: 'Europe', currency: 'EUR', languages: ['hr', 'en'], latitude: 45.1000, longitude: 15.2000, timezone: 'Europe/Zagreb', description: 'Adriatic coast and island hopping' },
  { name: 'Serbia', code: 'RS', flag: '🇷🇸', continent: 'Europe', currency: 'RSD', languages: ['sr', 'en'], latitude: 44.0165, longitude: 21.0059, timezone: 'Europe/Belgrade', description: 'Vibrant nightlife and culture' },
  { name: 'Lithuania', code: 'LT', flag: '🇱🇹', continent: 'Europe', currency: 'EUR', languages: ['lt', 'en'], latitude: 55.1694, longitude: 23.8813, timezone: 'Europe/Vilnius', description: 'Baltic charm and tech startups' },
  { name: 'Latvia', code: 'LV', flag: '🇱🇻', continent: 'Europe', currency: 'EUR', languages: ['lv', 'en'], latitude: 56.8796, longitude: 24.6032, timezone: 'Europe/Riga', description: 'Art Nouveau and sandy beaches' },
  { name: 'Estonia', code: 'EE', flag: '🇪🇪', continent: 'Europe', currency: 'EUR', languages: ['et', 'en'], latitude: 58.5953, longitude: 25.0136, timezone: 'Europe/Tallinn', description: 'Digital innovation and medieval towns' },
  
  // Southern Europe
  { name: 'Greece', code: 'GR', flag: '🇬🇷', continent: 'Europe', currency: 'EUR', languages: ['el', 'en'], latitude: 39.0742, longitude: 21.8243, timezone: 'Europe/Athens', description: 'Ancient history and island paradise' },
  { name: 'Cyprus', code: 'CY', flag: '🇨🇾', continent: 'Europe', currency: 'EUR', languages: ['el', 'tr', 'en'], latitude: 35.1264, longitude: 33.4299, timezone: 'Asia/Nicosia', description: 'Year-round sunshine' },
  { name: 'Malta', code: 'MT', flag: '🇲🇹', continent: 'Europe', currency: 'EUR', languages: ['mt', 'en'], latitude: 35.9375, longitude: 14.3754, timezone: 'Europe/Malta', description: 'English-speaking island nation' },
  
  // Balkans
  { name: 'Albania', code: 'AL', flag: '🇦🇱', continent: 'Europe', currency: 'ALL', languages: ['sq', 'en'], latitude: 41.1533, longitude: 20.1683, timezone: 'Europe/Tirane', description: 'Pristine beaches and mountains' },
  { name: 'North Macedonia', code: 'MK', flag: '🇲🇰', continent: 'Europe', currency: 'MKD', languages: ['mk', 'en'], latitude: 41.6086, longitude: 21.7453, timezone: 'Europe/Skopje', description: 'Rich cultural heritage' },
  { name: 'Bosnia and Herzegovina', code: 'BA', flag: '🇧🇦', continent: 'Europe', currency: 'BAM', languages: ['bs', 'hr', 'sr', 'en'], latitude: 43.9159, longitude: 17.6791, timezone: 'Europe/Sarajevo', description: 'Ottoman heritage and nature' },
  { name: 'Montenegro', code: 'ME', flag: '🇲🇪', continent: 'Europe', currency: 'EUR', languages: ['sr', 'en'], latitude: 42.7087, longitude: 19.3744, timezone: 'Europe/Podgorica', description: 'Mountains and Adriatic coast' },
  
  // Partner Countries
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', continent: 'Europe', currency: 'GBP', languages: ['en'], latitude: 55.3781, longitude: -3.4360, timezone: 'Europe/London', description: 'World-renowned universities' },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷', continent: 'Asia', currency: 'TRY', languages: ['tr', 'en'], latitude: 38.9637, longitude: 35.2433, timezone: 'Europe/Istanbul', description: 'Bridge between East and West' },
];

