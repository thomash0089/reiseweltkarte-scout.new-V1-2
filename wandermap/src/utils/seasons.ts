export type Months = number[]; // 0-11

export function scoreRegionByMonths(lat: number, admin?: string, name?: string, months: Months = []): 'best' | 'good' | 'other' {
  if (!months.length) return 'other';

  const monthSet = new Set(months);

  // Heuristic windows by latitude band (simple, global, free-data)
  const band = Math.abs(lat);
  const north = lat > 0;

  const bestNorthHigh = [5,6,7,8]; // Jun-Sep
  const goodNorthHigh = [4,9];

  const bestNorthMid = [4,5,9,10]; // Apr-May, Sep-Oct
  const goodNorthMid = [6,7,8];

  const bestTropicsN = [10,11,0,1,2]; // Nov-Mar
  const goodTropicsN = [3,9];

  const bestTropicsS = [4,5,6,7,8]; // May-Sep
  const goodTropicsS = [3,9];

  const bestSouthMid = [11,0,1,2]; // Dec-Mar
  const goodSouthMid = [10,3];

  const bestSouthHigh = [11,0,1,2]; // Summer
  const goodSouthHigh = [10,3];

  // Basic monsoon exceptions by rough region keywords (very coarse)
  const key = `${admin||''} ${name||''}`.toLowerCase();
  const isSouthAsia = /(india|bangladesh|nepal|sri lanka|pakistan)/.test(key);
  const isSeAsia = /(thailand|vietnam|lao|cambodia|myanmar|malaysia|indonesia|philippines)/.test(key);
  const isEastAsiaHumid = /(china|taiwan|japan|korea)/.test(key);
  const isNorthAfricaSummerHot = /(egypt|morocco|algeria|libya|tunisia)/.test(key);

  let best: number[] = [];
  let good: number[] = [];

  if (band >= 45 && north) { best = bestNorthHigh; good = goodNorthHigh; }
  else if (band >= 30 && north) { best = bestNorthMid; good = goodNorthMid; }
  else if (band < 30 && north) { best = bestTropicsN; good = goodTropicsN; }
  else if (band < 30 && !north) { best = bestTropicsS; good = goodTropicsS; }
  else if (band >= 30 && !north && band < 45) { best = bestSouthMid; good = goodSouthMid; }
  else { best = bestSouthHigh; good = goodSouthHigh; }

  // Monsoon adjustments
  if (isSouthAsia || isSeAsia) {
    best = north ? [10,11,0,1,2] : [5,6,7,8,9];
    good = north ? [3,9] : [4,10];
  }
  if (isEastAsiaHumid) {
    best = [4,5,9,10];
    good = [6,7,8];
  }
  if (isNorthAfricaSummerHot) {
    best = [3,4,5,10,11];
    good = [2,6,9];
  }

  let bestCount = 0, goodCount = 0;
  for (const m of monthSet) {
    if (best.includes(m)) bestCount++;
    else if (good.includes(m)) goodCount++;
  }

  if (bestCount === monthSet.size) return 'best';
  if (bestCount > 0 || goodCount === monthSet.size) return 'good';
  return 'other';
}
