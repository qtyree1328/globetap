import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Globe from 'react-globe.gl';
import { getDailyLocations, getRandomLocations, calculateDistance, calculateScore, getTodayString } from '../services/game';
import { saveGame, getUserGames } from '../services/db';

const GLOBE_IMG = '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
const NIGHT_IMG = '//unpkg.com/three-globe/example/img/earth-night.jpg';
const ROUNDS = 5;

export default function Game({ mode, user }) {
  const nav = useNavigate();
  const globeRef = useRef();
  const [locations] = useState(() => mode === 'daily' ? getDailyLocations() : getRandomLocations());
  const [round, setRound] = useState(0);
  const [guess, setGuess] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [results, setResults] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);

  // Check if daily already played
  useEffect(() => {
    if (mode === 'daily') {
      const played = getUserGames(user.username).some(g => g.date === getTodayString() && g.mode === 'daily');
      if (played) nav('/');
    }
  }, [mode, user.username, nav]);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
      // Set initial view
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    }
  }, [globeReady]);

  const currentLocation = locations[round];

  const handleGlobeClick = useCallback(({ lat, lng }) => {
    if (confirmed || gameOver) return;
    setGuess({ lat, lng });
  }, [confirmed, gameOver]);

  const handleConfirm = useCallback(() => {
    if (!guess || confirmed) return;
    const dist = calculateDistance(guess.lat, guess.lng, currentLocation.lat, currentLocation.lng);
    const score = calculateScore(dist);
    const result = {
      location: currentLocation.name,
      country: currentLocation.country,
      continent: currentLocation.continent,
      actual: { lat: currentLocation.lat, lng: currentLocation.lng },
      guess: { lat: guess.lat, lng: guess.lng },
      distance: Math.round(dist),
      score,
    };
    setResults(prev => [...prev, result]);
    setConfirmed(true);

    // Fly to show both points
    const midLat = (guess.lat + currentLocation.lat) / 2;
    const midLng = (guess.lng + currentLocation.lng) / 2;
    globeRef.current?.pointOfView({ lat: midLat, lng: midLng, altitude: Math.max(1.5, dist / 5000) }, 1000);
  }, [guess, confirmed, currentLocation]);

  const handleNext = useCallback(() => {
    if (round + 1 >= ROUNDS) {
      const totalScore = results.reduce((a, r) => a + r.score, 0);
      const gameData = {
        mode,
        date: getTodayString(),
        rounds: results,
        totalScore,
      };
      saveGame(user.username, gameData);
      setGameOver(true);
    } else {
      setRound(r => r + 1);
      setGuess(null);
      setConfirmed(false);
      globeRef.current?.pointOfView({ altitude: 2.5 }, 800);
    }
  }, [round, results, mode, user.username]);

  // Globe data
  const guessPoints = useMemo(() => {
    if (!guess) return [];
    return [{ lat: guess.lat, lng: guess.lng, color: '#f59e0b', size: 0.8, label: 'Your guess' }];
  }, [guess]);

  const actualPoints = useMemo(() => {
    if (!confirmed) return [];
    return [{ lat: currentLocation.lat, lng: currentLocation.lng, color: '#22d3ee', size: 1, label: currentLocation.name }];
  }, [confirmed, currentLocation]);

  const allPoints = useMemo(() => [...guessPoints, ...actualPoints], [guessPoints, actualPoints]);

  const arcsData = useMemo(() => {
    if (!confirmed || !guess) return [];
    return [{
      startLat: guess.lat, startLng: guess.lng,
      endLat: currentLocation.lat, endLng: currentLocation.lng,
      color: ['#f59e0b', '#22d3ee'],
    }];
  }, [confirmed, guess, currentLocation]);

  const latestResult = confirmed ? results[results.length - 1] : null;
  const totalScore = results.reduce((a, r) => a + r.score, 0);

  if (gameOver) {
    return (
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4 py-8">
        <div className="animate-slide-up bg-[#0d1b2a] border border-slate-800 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-center mb-2 bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
            Game Over
          </h2>
          <div className="text-center mb-6">
            <div className="text-5xl font-extrabold text-white mt-2">{totalScore}</div>
            <div className="text-slate-500 text-sm">/ 5000 points</div>
          </div>

          <div className="space-y-3 mb-8">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-4 py-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{r.location}</div>
                  <div className="text-xs text-slate-500">{r.country}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-cyan-400">{r.score} pts</div>
                  <div className="text-xs text-slate-500">{r.distance.toLocaleString()} km</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => nav('/')} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition">
              Home
            </button>
            {mode === 'practice' && (
              <button onClick={() => window.location.reload()} className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold py-3 rounded-lg transition">
                Play Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-60px)] overflow-hidden">
      {/* Globe */}
      <Globe
        ref={globeRef}
        globeImageUrl={GLOBE_IMG}
        bumpImageUrl={NIGHT_IMG}
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        onGlobeClick={handleGlobeClick}
        onGlobeReady={() => setGlobeReady(true)}
        pointsData={allPoints}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="size"
        pointAltitude={0.01}
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.5}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        arcStroke={1.5}
        width={typeof window !== 'undefined' ? window.innerWidth : 800}
        height={typeof window !== 'undefined' ? window.innerHeight - 60 : 600}
        atmosphereColor="#22d3ee"
        atmosphereAltitude={0.15}
      />

      {/* HUD - Top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-center">
        <div className="bg-[#0a1628]/90 backdrop-blur-md border border-cyan-900/40 rounded-2xl px-8 py-4 animate-fade-in">
          <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">
            Round {round + 1} / {ROUNDS} • {mode === 'daily' ? 'Daily' : 'Practice'}
          </div>
          <div className="text-2xl md:text-3xl font-bold text-white">
            {currentLocation.name}
          </div>
          <div className="text-sm text-slate-400">{currentLocation.country}</div>
        </div>
      </div>

      {/* Score ticker */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-[#0a1628]/90 backdrop-blur-md border border-cyan-900/40 rounded-xl px-4 py-2">
          <div className="text-xs text-slate-500">Score</div>
          <div className="text-xl font-bold text-cyan-400">{totalScore}</div>
        </div>
      </div>

      {/* Round dots */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {Array.from({ length: ROUNDS }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i < results.length ? 'bg-cyan-400' : i === round ? 'bg-cyan-600 animate-pulse' : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
        {!confirmed && guess && (
          <button
            onClick={handleConfirm}
            className="animate-slide-up bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-cyan-900/50 transition-all"
          >
            Confirm Guess
          </button>
        )}
        {!confirmed && !guess && (
          <div className="animate-fade-in bg-[#0a1628]/80 backdrop-blur-md border border-slate-700 rounded-xl px-6 py-3 text-slate-400 text-sm">
            Tap the globe to place your guess
          </div>
        )}
        {confirmed && latestResult && (
          <div className="animate-slide-up bg-[#0a1628]/90 backdrop-blur-md border border-cyan-900/40 rounded-2xl px-8 py-4 text-center">
            <div className="flex items-center gap-6 mb-3">
              <div>
                <div className="text-3xl font-extrabold text-cyan-400">+{latestResult.score}</div>
                <div className="text-xs text-slate-500">points</div>
              </div>
              <div className="w-px h-10 bg-slate-700" />
              <div>
                <div className="text-xl font-bold text-white">{latestResult.distance.toLocaleString()} km</div>
                <div className="text-xs text-slate-500">distance</div>
              </div>
            </div>
            <button
              onClick={handleNext}
              className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              {round + 1 >= ROUNDS ? 'See Results' : 'Next Round →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
