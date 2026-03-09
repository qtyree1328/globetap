// Game logic - daily seed, scoring, location selection
import locations from '../data/locations.json';

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateSeed(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Pick locations ensuring continent diversity (no two from the same continent per round)
function pickDiverse(shuffled, count) {
  const picked = [];
  const usedContinents = new Set();
  for (const loc of shuffled) {
    if (picked.length >= count) break;
    if (!usedContinents.has(loc.continent)) {
      picked.push(loc);
      usedContinents.add(loc.continent);
    }
  }
  // If we still need more (only 7 continents, count=5 should be fine), allow repeats
  if (picked.length < count) {
    for (const loc of shuffled) {
      if (picked.length >= count) break;
      if (!picked.includes(loc)) {
        picked.push(loc);
      }
    }
  }
  return picked;
}

export function getDailyLocations() {
  const today = new Date().toISOString().slice(0, 10);
  const rand = seededRandom(dateSeed(today));
  const shuffled = [...locations].sort(() => rand() - 0.5);
  return pickDiverse(shuffled, 5);
}

// Track recently seen locations to avoid repeats in practice mode
const RECENT_KEY = 'globetap_recent_locations';
const RECENT_MAX = 50; // remember last 50 locations

function getRecentLocations() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch { return []; }
}

function saveRecentLocations(names) {
  const recent = getRecentLocations();
  const updated = [...names, ...recent].slice(0, RECENT_MAX);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
}

export function getRandomLocations(count = 5) {
  const recent = new Set(getRecentLocations());
  // Prefer locations not recently seen
  const fresh = locations.filter(l => !recent.has(l.name));
  const pool = fresh.length >= count * 3 ? fresh : locations;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picked = pickDiverse(shuffled, count);
  saveRecentLocations(picked.map(l => l.name));
  return picked;
}

export function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

// Haversine distance in km
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Score: 1000 max, decreasing with distance
export function calculateScore(distance) {
  const maxDist = 20000;
  const score = Math.max(0, Math.round(1000 * (1 - distance / maxDist)));
  return score;
}
