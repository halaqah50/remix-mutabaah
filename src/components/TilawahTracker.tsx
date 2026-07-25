import React from 'react';
import { TilawahRecord } from '../types';
import { BookOpen, CheckCircle, Plus, Minus, Sparkles, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '../lib/audio';

interface TilawahTrackerProps {
  tilawah: TilawahRecord;
  targetSheets?: number; // default 10 lembar
  onChange: (updated: TilawahRecord) => void;
}

export const TilawahTracker: React.FC<TilawahTrackerProps> = ({
  tilawah,
  targetSheets = 10,
  onChange,
}) => {
  const currentSheets = tilawah.sheetsCompleted || 0;
  const currentJuz = tilawah.juzCompleted || Math.round((currentSheets / 10) * 100) / 100;
  const currentPages = tilawah.pagesRead || currentSheets * 2;
  const isTargetMet = currentSheets >= targetSheets;
  const percent = Math.min(100, Math.round((currentSheets / targetSheets) * 100));

  const handleUpdateSheets = (newVal: number) => {
    const sheets = Math.max(0, newVal);
    const pages = sheets * 2;
    const juz = Math.round((sheets / 10) * 10) / 10;

    if (sheets >= targetSheets && currentSheets < targetSheets) {
      // Trigger celebrate sound & confetti
      playSuccessSound();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#f59e0b', '#3b82f6'],
      });
    }

    onChange({
      ...tilawah,
      sheetsCompleted: sheets,
      pagesRead: pages,
      juzCompleted: juz,
    });
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/80 relative overflow-hidden">
      {/* Decorative background Islamic pattern shape */}
      <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-800/80 rounded-xl text-amber-300 border border-emerald-700">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-emerald-100 flex items-center gap-2">
                Tilawah Al-Qur'an
                {isTargetMet && (
                  <span className="bg-amber-400/20 text-amber-300 text-xs px-2.5 py-0.5 rounded-full border border-amber-400/40 font-semibold flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    Target 10 Lembar Reached
                  </span>
                )}
              </h3>
              <p className="text-xs text-emerald-300">
                Target Harian: <span className="font-bold text-amber-300">10 Lembar</span> (1 Juz / 20 Halaman)
              </p>
            </div>
          </div>
        </div>

        {/* Big Counter Display */}
        <div className="flex items-center space-x-4 bg-emerald-950/70 p-3 rounded-2xl border border-emerald-800/80">
          <div className="text-center">
            <span className="text-3xl font-extrabold text-amber-300 leading-none">{currentSheets}</span>
            <span className="text-[10px] text-emerald-300 block uppercase font-medium">Lembar</span>
          </div>
          <div className="text-emerald-700 font-light text-2xl">/</div>
          <div className="text-center">
            <span className="text-xl font-bold text-emerald-200 leading-none">{currentJuz}</span>
            <span className="text-[10px] text-emerald-300 block uppercase font-medium">Juz</span>
          </div>
          <div className="text-emerald-700 font-light text-2xl">/</div>
          <div className="text-center">
            <span className="text-xl font-bold text-emerald-200 leading-none">{currentPages}</span>
            <span className="text-[10px] text-emerald-300 block uppercase font-medium">Halaman</span>
          </div>
        </div>
      </div>

      {/* Progress Bar & Target Meter */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-xs text-emerald-200 font-medium">
          <span>Progres Target Harian</span>
          <span className="font-bold text-amber-300">{percent}% ({currentSheets}/{targetSheets} Lembar)</span>
        </div>
        <div className="w-full bg-emerald-950 rounded-full h-3.5 p-0.5 border border-emerald-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isTargetMet
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 shadow-sm shadow-amber-400'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
        <button
          type="button"
          onClick={() => handleUpdateSheets(currentSheets - 1)}
          className="flex items-center justify-center space-x-1 bg-emerald-800/60 hover:bg-emerald-800 text-emerald-200 py-2 rounded-xl text-xs font-semibold border border-emerald-700 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>1 Lembar</span>
        </button>

        <button
          type="button"
          onClick={() => handleUpdateSheets(currentSheets + 1)}
          className="flex items-center justify-center space-x-1 bg-emerald-800/80 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold border border-emerald-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+1 Lembar</span>
        </button>

        <button
          type="button"
          onClick={() => handleUpdateSheets(currentSheets + 2)}
          className="flex items-center justify-center space-x-1 bg-emerald-800/80 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold border border-emerald-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+2 Lembar</span>
        </button>

        <button
          type="button"
          onClick={() => handleUpdateSheets(currentSheets + 5)}
          className="flex items-center justify-center space-x-1 bg-emerald-800/80 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold border border-emerald-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+5 Lembar</span>
        </button>

        <button
          type="button"
          onClick={() => handleUpdateSheets(10)}
          className="col-span-2 sm:col-span-1 flex items-center justify-center space-x-1 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 font-bold py-2 rounded-xl text-xs shadow-md hover:brightness-110 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>1 Juz Full (10 Lm)</span>
        </button>
      </div>

      {/* Surah Details Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-emerald-300 font-medium mb-1">Awal Surah / Juz</label>
          <input
            type="text"
            placeholder="misal: Al-Baqarah ayat 1 atau Juz 1"
            value={tilawah.startSurah || ''}
            onChange={(e) => onChange({ ...tilawah, startSurah: e.target.value })}
            className="w-full bg-emerald-950/80 border border-emerald-800 rounded-xl px-3 py-2 text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-amber-400"
          />
        </div>
        <div>
          <label className="block text-emerald-300 font-medium mb-1">Akhir Surah / Catatan Tilawah</label>
          <input
            type="text"
            placeholder="misal: Al-Baqarah ayat 141"
            value={tilawah.endSurah || ''}
            onChange={(e) => onChange({ ...tilawah, endSurah: e.target.value })}
            className="w-full bg-emerald-950/80 border border-emerald-800 rounded-xl px-3 py-2 text-emerald-100 placeholder-emerald-600 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>
    </div>
  );
};
