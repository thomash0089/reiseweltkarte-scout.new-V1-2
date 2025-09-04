export interface HazardRule { bbox: [number, number, number, number]; months: number[]; label: string; }

const M = (...ms: number[]) => ms.map(m => (m+12)%12);

export const hazardRules: HazardRule[] = [
  { bbox: [-100, 5, -10, 35], months: M(5,6,7,8,9,10,11), label: 'Atlantik-Hurrikansaison' },
  { bbox: [-140, 5, -90, 30], months: M(4,5,6,7,8,9,10,11), label: 'Ostpazifik-Hurrikansaison' },
  { bbox: [100, 0, 180, 35], months: M(6,7,8,9,10,11,0), label: 'Westpazifik-Taifunsaison' },
  { bbox: [55, 0, 100, 30], months: M(3,4,5,9,10,11), label: 'Nordindischer Ozean Zyklonsaison' },
  { bbox: [55, -30, 120, 0], months: M(10,11,0,1,2,3,4), label: 'Südindischer Ozean Zyklonsaison' },
  { bbox: [150, -30, -120, 0], months: M(10,11,0,1,2,3,4), label: 'Südpazifik Zyklonsaison' },
  { bbox: [-105, 25, -85, 50], months: M(3,4,5,6), label: 'US Tornado-Saison' },
  { bbox: [-90, 25, -75, 35], months: M(2,3,4,10,11), label: 'Südost-US Tornado-Peaks' },
];

export function inBbox(lon: number, lat: number, bbox: [number, number, number, number]) {
  const [minx, miny, maxx, maxy] = bbox;
  if (minx <= maxx) return lon >= minx && lon <= maxx && lat >= miny && lat <= maxy;
  // dateline wrap
  return (lon >= minx || lon <= maxx) && lat >= miny && lat <= maxy;
}

export function hazardsFor(lat: number, lon: number, months: number[]) {
  const hits = hazardRules.filter(r => inBbox(lon, lat, r.bbox) && months.some(m => r.months.includes(m)));
  return hits.map(h => h.label);
}
