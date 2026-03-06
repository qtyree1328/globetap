import { getAllUserStats } from '../services/db';

export default function Leaderboard() {
  const stats = getAllUserStats();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
        Leaderboard
      </h1>

      {!stats.length ? (
        <div className="text-center text-slate-500 py-20">
          <div className="text-4xl mb-3">🏆</div>
          <p>No games played yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stats.map((s, i) => (
            <div
              key={s.username}
              className={`flex items-center gap-4 bg-[#0d1b2a] border rounded-xl px-5 py-4 transition-all ${
                i === 0 ? 'border-amber-600/50' : i === 1 ? 'border-slate-500/50' : i === 2 ? 'border-orange-800/50' : 'border-slate-800'
              }`}
            >
              <div className={`text-2xl font-extrabold w-8 text-center ${
                i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-orange-600' : 'text-slate-600'
              }`}>
                {i + 1}
              </div>

              <div className="flex-1">
                <div className="font-semibold text-white">{s.username}</div>
                <div className="text-xs text-slate-500">{s.gamesPlayed} games played</div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-cyan-400">{s.averageScore}</div>
                <div className="text-xs text-slate-500">avg score</div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-lg font-bold text-emerald-400">{s.bestScore}</div>
                <div className="text-xs text-slate-500">best</div>
              </div>

              {s.todayScore !== null && (
                <div className="text-right hidden sm:block">
                  <div className="text-lg font-bold text-teal-400">{s.todayScore}</div>
                  <div className="text-xs text-slate-500">today</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
