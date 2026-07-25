import React from 'react';
import { QiyamulailRecord } from '../types';
import { Moon, CheckCircle2, Clock, Calendar, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '../lib/audio';

interface QiyamulailTrackerProps {
  qiyamulail: QiyamulailRecord;
  weeklyCount: number; // How many times performed this week
  targetWeekly?: number; // default 2x per week
  onChange: (updated: QiyamulailRecord) => void;
}

export const QiyamulailTracker: React.FC<QiyamulailTrackerProps> = ({
  qiyamulail,
  weeklyCount,
  targetWeekly = 2,
  onChange,
}) => {
  const isWeeklyTargetMet = weeklyCount >= targetWeekly;

  const handleToggle = (performed: boolean) => {
    if (performed && !qiyamulail.performed) {
      if (weeklyCount + 1 >= targetWeekly) {
        playSuccessSound();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#0284c7', '#38bdf8', '#f59e0b', '#10b981'],
        });
      }
    }

    onChange({
      ...qiyamulail,
      performed,
      rakaatCount: performed ? (qiyamulail.rakaatCount || 11) : 0,
      timeLogged: performed ? (qiyamulail.timeLogged || '03:15') : '',
    });
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/80 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-900/80 rounded-2xl text-amber-300 border border-indigo-800">
            <Moon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-100 flex items-center gap-2">
              Qiyamulail (Shalat Malam)
              {isWeeklyTargetMet && (
                <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-400/40 font-semibold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" />
                  Target Pekanan Reached!
                </span>
              )}
            </h3>
            <p className="text-xs text-indigo-300">
              Target Pekanan: <span className="font-bold text-amber-300">2x per Pekan</span>
            </p>
          </div>
        </div>

        {/* Weekly Badge Counter */}
        <div className="flex items-center space-x-3 bg-indigo-950/80 px-4 py-2.5 rounded-2xl border border-indigo-800/80">
          <Calendar className="w-4 h-4 text-amber-300" />
          <div>
            <span className="text-xs text-indigo-300 block">Pekan Ini</span>
            <span className="text-sm font-bold text-white">
              {weeklyCount} / {targetWeekly} Kali {isWeeklyTargetMet ? '✅' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Main Toggle Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleToggle(true)}
          className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl border font-bold text-xs transition-all ${
            qiyamulail.performed
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-900/40'
              : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border-indigo-800'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${qiyamulail.performed ? 'text-amber-300' : 'text-indigo-400'}`} />
          <span>Ya, Qiyamulail</span>
        </button>

        <button
          type="button"
          onClick={() => handleToggle(false)}
          className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-2xl border font-bold text-xs transition-all ${
            !qiyamulail.performed
              ? 'bg-slate-800 text-slate-300 border-slate-600'
              : 'bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border-indigo-800'
          }`}
        >
          <span>Tidak / Halangan</span>
        </button>
      </div>

      {/* Details when performed */}
      {qiyamulail.performed && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-indigo-950/70 p-4 rounded-2xl border border-indigo-800/80">
          <div>
            <label className="block text-indigo-300 font-medium mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Jumlah Rakaat
            </label>
            <select
              value={qiyamulail.rakaatCount || 11}
              onChange={(e) => onChange({ ...qiyamulail, rakaatCount: parseInt(e.target.value) })}
              className="w-full bg-indigo-900/80 border border-indigo-700 rounded-xl px-3 py-2 text-indigo-100 focus:outline-none focus:border-amber-400"
            >
              <option value={2}>2 Rakaat (Minimal)</option>
              <option value={4}>4 Rakaat</option>
              <option value={8}>8 Rakaat</option>
              <option value={11}>11 Rakaat (8 Tahajjud + 3 Witir)</option>
              <option value={13}>13 Rakaat</option>
              <option value={23}>23 Rakaat</option>
            </select>
          </div>

          <div>
            <label className="block text-indigo-300 font-medium mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              Jam Pelaksanaan
            </label>
            <input
              type="time"
              value={qiyamulail.timeLogged || '03:15'}
              onChange={(e) => onChange({ ...qiyamulail, timeLogged: e.target.value })}
              className="w-full bg-indigo-900/80 border border-indigo-700 rounded-xl px-3 py-2 text-indigo-100 focus:outline-none focus:border-amber-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
