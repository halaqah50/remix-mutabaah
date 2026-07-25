import React from 'react';
import { MutabaahEntry } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { BookOpen, Moon, TrendingUp } from 'lucide-react';

interface AnalyticsChartsProps {
  entries: MutabaahEntry[];
  targetSheets?: number; // 10 lembar
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  entries,
  targetSheets = 10,
}) => {
  // Sort last 14 entries by date ascending
  const chartData = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14)
    .map((e) => {
      const sheets = e.tilawah?.sheetsCompleted || 0;
      const juz = e.tilawah?.juzCompleted || Math.round((sheets / 10) * 10) / 10;
      const qiyam = e.qiyamulail?.performed ? 1 : 0;
      
      // Calculate daily score %
      const tilawahScore = Math.min(100, (sheets / targetSheets) * 100);
      const qiyamScore = qiyam ? 100 : 0;
      const overall = Math.round((tilawahScore * 0.6) + (qiyamScore * 0.4));

      // Format date for label e.g., "25 Jul"
      const dateObj = new Date(e.date);
      const label = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      return {
        date: label,
        fullDate: e.date,
        sheets,
        juz,
        targetSheets,
        qiyam,
        overallScore: overall,
      };
    });

  return (
    <div className="space-y-6">
      
      {/* Bento Card 1: Tilawah Progress (Target 10 Lembar / 1 Juz) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900">Grafik Progres Tilawah Al-Qur'an</h4>
              <p className="text-xs text-slate-500">Target harian 10 lembar / 1 juz (garis oranye terputus)</p>
            </div>
          </div>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            14 Hari Terakhir
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tilawahColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
                formatter={(val: any) => [
                  `${val} Lembar (${(Number(val) / 10).toFixed(1)} Juz)`,
                  'Capaian Tilawah',
                ]}
              />
              <ReferenceLine y={targetSheets} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Target 10 Lembar', fill: '#d97706', fontSize: 11, position: 'top' }} />
              <Area type="monotone" dataKey="sheets" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#tilawahColor)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bento Card 2: Qiyamulail Habit Tracker */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-sm text-slate-900">Histori Qiyamulail (Shalat Malam)</h4>
              <p className="text-xs text-slate-500">Minimal 2x per pekan</p>
            </div>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <YAxis domain={[0, 1]} ticks={[0, 1]} tickFormatter={(v) => (v === 1 ? 'Ya' : 'Tidak')} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
                formatter={(val: any) => [val === 1 ? 'Melaksanakan Qiyamulail ✅' : 'Tidak / Off', 'Status']}
              />
              <Bar dataKey="qiyam" fill="#0f172a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

