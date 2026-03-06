import { getUserStats } from '../services/db';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function Stats({ user }) {
  const stats = getUserStats(user.username);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="text-slate-500 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p>No games played yet. Go play some rounds!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">
        Your Statistics
      </h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Games Played', value: stats.totalGames, color: 'text-cyan-400' },
          { label: 'Average Score', value: stats.averageScore, color: 'text-teal-400' },
          { label: 'Best Score', value: stats.bestScore, color: 'text-emerald-400' },
          { label: 'Worst Score', value: stats.worstScore, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Score over time */}
      {stats.overTime.length > 1 && (
        <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-4">Score Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.overTime}>
              <XAxis dataKey="game" stroke="#475569" fontSize={12} />
              <YAxis stroke="#475569" fontSize={12} domain={[0, 5000]} />
              <Tooltip contentStyle={{ background: '#0d1b2a', border: '1px solid #1e3a5f', borderRadius: 8 }} />
              <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Round performance */}
      <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Average Score by Round</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.roundStats}>
            <XAxis dataKey="round" stroke="#475569" fontSize={12} tickFormatter={v => `R${v}`} />
            <YAxis stroke="#475569" fontSize={12} domain={[0, 1000]} />
            <Tooltip contentStyle={{ background: '#0d1b2a', border: '1px solid #1e3a5f', borderRadius: 8 }} />
            <Bar dataKey="avgScore" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Continent accuracy */}
      <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-6 mb-6">
        <h3 className="text-sm font-semibold text-slate-400 mb-4">Average Distance by Continent</h3>
        <div className="space-y-3">
          {stats.continentStats.sort((a, b) => a.avgDistance - b.avgDistance).map(c => (
            <div key={c.continent} className="flex items-center gap-3">
              <div className="w-28 text-sm text-slate-300">{c.continent}</div>
              <div className="flex-1 bg-slate-800 rounded-full h-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full transition-all"
                  style={{ width: `${Math.max(5, 100 - (c.avgDistance / 200))}%` }}
                />
              </div>
              <div className="w-24 text-right text-xs text-slate-500">{c.avgDistance.toLocaleString()} km avg</div>
            </div>
          ))}
        </div>
      </div>

      {/* Best & Worst */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-emerald-400 mb-4">🎯 Best Guesses</h3>
          {stats.bestGuesses.map((g, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-slate-800/50 last:border-0">
              <span className="text-sm text-white">{g.location}</span>
              <span className="text-xs text-slate-400">{g.distance} km</span>
            </div>
          ))}
        </div>
        <div className="bg-[#0d1b2a] border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-red-400 mb-4">😬 Worst Guesses</h3>
          {stats.worstGuesses.map((g, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-slate-800/50 last:border-0">
              <span className="text-sm text-white">{g.location}</span>
              <span className="text-xs text-slate-400">{g.distance.toLocaleString()} km</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
