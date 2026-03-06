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

export function getDailyLocations() {
  const today = new Date().toISOString().slice(0, 10);
  const rand = seededRandom(dateSeed(today));
  const shuffled = [...locations].sort(() => rand() - 0.5);
  // Pick a mix of difficulties
  const easy = shuffled.filter(l => l.difficulty === 'easy');
  const medium = shuffled.filter(l => l.difficulty === 'medium');
  const hard = shuffled.filter(l => l.difficulty === 'hard');
  return [easy[0], medium[0], medium[1], hard[0], easy[1]].filter(Boolean);
}

export function getRandomLocations(count = 5) {
  const shuffled = [...locations].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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
// 0 km = 1000, ~20000 km = 0
export function calculateScore(distance) {
  const maxDist = 20000;
  const score = Math.max(0, Math.round(1000 * (1 - distance / maxDist)));
  return score;
}
