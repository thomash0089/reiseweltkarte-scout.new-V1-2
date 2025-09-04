import type { ActivityType } from '../components/ActivitySelector';

export interface Admin1Monthly {
  // keyed by admin1 adm1_code or ne_id
  id: string;
  lat: number;
  admin?: string;
  name?: string;
  // monthly means (12)
  tmean: number[]; // 2m air temp °C
  prcp: number[];  // total precip mm
  sst?: number[];  // sea surface temp °C (optional)
  rh?: number[];   // relative humidity % (optional)
  pprob?: number[]; // precip probability 0..1 or wet-day fraction (optional)
}

export interface ProfilesDB {
  meta: { source: string; note?: string };
  features: Admin1Monthly[];
}

export type Months = number[];

export const defaultThresholds = {
  beach: { sstMin: 23, airMin: 22, airMax: 34, prcpMax: 80, rhMax: 85, pprobMax: 0.35 },
  hike:  { airMin: 10, airMax: 22, prcpMax: 90, rhMax: 80, pprobMax: 0.4 },
  city:  { airMin: 12, airMax: 27, prcpMax: 100, rhMax: 85, pprobMax: 0.5 }
};

export function rateMonth(
  act: ActivityType,
  m: number,
  rec: Admin1Monthly,
  th = defaultThresholds
): 'best'|'good'|'other'|'bad' {
  const t = rec.tmean[m];
  const p = rec.prcp[m];
  const rh = rec.rh?.[m];
  const pr = rec.pprob?.[m];
  if (act === 'beach') {
    const s = rec.sst?.[m] ?? t; // fallback if no SST
    const bad = (rh !== undefined && rh > th.beach.rhMax) || (pr !== undefined && pr > th.beach.pprobMax);
    if (bad) return 'bad';
    const best = s >= th.beach.sstMin && t >= th.beach.airMin && t <= th.beach.airMax && p <= th.beach.prcpMax;
    const good = s >= th.beach.sstMin-1 && t >= th.beach.airMin-2 && t <= th.beach.airMax+1 && p <= th.beach.prcpMax+20;
    return best ? 'best' : (good ? 'good' : 'other');
  }
  if (act === 'hike') {
    const bad = (rh !== undefined && rh > th.hike.rhMax) || (pr !== undefined && pr > th.hike.pprobMax);
    if (bad) return 'bad';
    const best = t >= th.hike.airMin && t <= th.hike.airMax && p <= th.hike.prcpMax;
    const good = t >= th.hike.airMin-2 && t <= th.hike.airMax+2 && p <= th.hike.prcpMax+30;
    return best ? 'best' : (good ? 'good' : 'other');
  }
  // city
  const bad = (rh !== undefined && rh > th.city.rhMax) || (pr !== undefined && pr > th.city.pprobMax);
  if (bad) return 'bad';
  const best = t >= th.city.airMin && t <= th.city.airMax && p <= th.city.prcpMax;
  const good = t >= th.city.airMin-2 && t <= th.city.airMax+2 && p <= th.city.prcpMax+40;
  return best ? 'best' : (good ? 'good' : 'other');
}

export function rateRegion(
  act: ActivityType,
  months: Months,
  rec: Admin1Monthly,
  th = defaultThresholds
): 'best'|'good'|'other'|'bad' {
  if (!months.length) return 'other';
  const set = new Set(months);
  let best = 0, good = 0, bad = 0;
  for (const m of set) {
    const r = rateMonth(act, m, rec, th);
    if (r === 'best') best++; else if (r === 'good') good++; else if (r === 'bad') bad++;
  }
  if (bad > 0) return 'bad';
  if (best === set.size) return 'best';
  if (best > 0 || good === set.size) return 'good';
  return 'other';
}
