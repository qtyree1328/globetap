// Database service - localStorage implementation (Firebase-ready abstraction)

const GAMES_KEY = 'globetap_games';

function getAllGames() {
  return JSON.parse(localStorage.getItem(GAMES_KEY) || '[]');
}

function saveAllGames(games) {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

export function saveGame(username, gameData) {
  const games = getAllGames();
  games.push({ ...gameData, username, completedAt: Date.now() });
  saveAllGames(games);
}

export function getUserGames(username) {
  return getAllGames().filter(g => g.username === username).sort((a, b) => b.completedAt - a.completedAt);
}

export function getAllUserStats() {
  const games = getAllGames();
  const byUser = {};
  games.forEach(g => {
    if (!byUser[g.username]) byUser[g.username] = [];
    byUser[g.username].push(g);
  });

  return Object.entries(byUser).map(([username, userGames]) => {
    const scores = userGames.map(g => g.totalScore);
    const today = new Date().toISOString().slice(0, 10);
    const todayGame = userGames.find(g => g.date === today);
    return {
      username,
      gamesPlayed: userGames.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      bestScore: Math.max(...scores),
      todayScore: todayGame ? todayGame.totalScore : null,
      lastPlayed: Math.max(...userGames.map(g => g.completedAt)),
    };
  }).sort((a, b) => b.averageScore - a.averageScore);
}

export function getUserStats(username) {
  const games = getUserGames(username);
  if (!games.length) return null;

  const scores = games.map(g => g.totalScore);
  const allRounds = games.flatMap(g => g.rounds || []);

  // By continent
  const byCont = {};
  allRounds.forEach(r => {
    if (!byCont[r.continent]) byCont[r.continent] = [];
    byCont[r.continent].push(r.distance);
  });
  const continentStats = Object.entries(byCont).map(([continent, dists]) => ({
    continent,
    avgDistance: Math.round(dists.reduce((a, b) => a + b, 0) / dists.length),
    count: dists.length,
  }));

  // By round number
  const byRound = [[], [], [], [], []];
  games.forEach(g => (g.rounds || []).forEach((r, i) => { if (i < 5) byRound[i].push(r); }));
  const roundStats = byRound.map((rounds, i) => ({
    round: i + 1,
    avgScore: rounds.length ? Math.round(rounds.reduce((a, r) => a + r.score, 0) / rounds.length) : 0,
    avgDistance: rounds.length ? Math.round(rounds.reduce((a, r) => a + r.distance, 0) / rounds.length) : 0,
  }));

  // Best/worst guesses
  const sorted = [...allRounds].sort((a, b) => a.distance - b.distance);
  const bestGuesses = sorted.slice(0, 5);
  const worstGuesses = sorted.slice(-5).reverse();

  // Over time
  const overTime = games.slice().reverse().map((g, i) => ({
    game: i + 1,
    score: g.totalScore,
    date: new Date(g.completedAt).toLocaleDateString(),
  }));

  return {
    totalGames: games.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    bestScore: Math.max(...scores),
    worstScore: Math.min(...scores),
    continentStats,
    roundStats,
    bestGuesses,
    worstGuesses,
    overTime,
  };
}
