import React, { useState } from 'react';
import { User, MutabaahEntry } from '../types';
import { MutabaahForm } from './MutabaahForm';
import { AnalyticsCharts } from './AnalyticsCharts';
import { 
  getMutabaahEntries, 
  getWeeklyQiyamulailCount, 
  getUserStreak, 
  getMutabaahByDate 
} from '../lib/storage';
import { 
  BookOpen, 
  Moon, 
  Flame, 
  Award, 
  Calendar, 
  TrendingUp, 
  ListFilter, 
  CheckCircle2, 
  XCircle, 
  PenSquare,
  Sparkles
} from 'lucide-react';

interface MemberDashboardProps {
  currentUser: User;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const MemberDashboard: React.FC<MemberDashboardProps> = ({
  currentUser,
  selectedDate,
  onDateChange,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'charts' | 'history'>('form');

  const allEntries = getMutabaahEntries();
  const userEntries = allEntries.filter((e) => e.userId === currentUser.id);
  const todayEntry = getMutabaahByDate(currentUser.id, selectedDate);

  const streakDays = getUserStreak(currentUser.id);
  const weeklyQiyam = getWeeklyQiyamulailCount(currentUser.id, selectedDate);

  const todayTilawahSheets = todayEntry?.tilawah?.sheetsCompleted || 0;
  const tilawahTarget = currentUser.targetTilawahSheets || 10;
  const isTilawahTargetMet = todayTilawahSheets >= tilawahTarget;

  const qiyamTarget = currentUser.targetQiyamulailWeekly || 2;
  const isQiyamTargetMet = weeklyQiyam >= qiyamTarget;

  return (
    <div className="space-y-6">
      
      {/* Bento Grid: Top Highlights Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Bento Box: Tilawah Target (10 Lembar / 1 Juz) */}
        <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider font-extrabold opacity-90">Tilawah Hari Ini</span>
            <div className="p-2 bg-white/20 backdrop-blur rounded-2xl">
              <BookOpen className="w-5 h-5 text-emerald-100" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-black">{todayTilawahSheets}</span>
              <span className="text-sm font-bold opacity-80">/ {tilawahTarget} Lembar</span>
            </div>
            <p className="text-[11px] text-emerald-100 mt-1 font-semibold">
              {isTilawahTargetMet ? '🎉 Target 10 Lembar / 1 Juz Tercapai!' : `Kurang ${tilawahTarget - todayTilawahSheets} lembar lagi (10 Lm)`}
            </p>
          </div>
        </div>

        {/* Bento Box: Qiyamulail Weekly Target (2x/week) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-300">Qiyamulail Pekan Ini</span>
            <div className="p-2 bg-white/10 backdrop-blur rounded-2xl">
              <Moon className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1">
              <span className="text-4xl font-black text-amber-300">{weeklyQiyam}</span>
              <span className="text-sm font-bold text-slate-300">/ {qiyamTarget} Kali</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1 font-medium">
              {isQiyamTargetMet ? '✅ Target 2x Pekanan Tercapai' : `Butuh ${qiyamTarget - weeklyQiyam}x lagi pekan ini`}
            </p>
          </div>
        </div>

      </div>

      {/* Bento Navigation Tabs */}
      <div className="bg-white p-2 rounded-3xl border border-slate-100 shadow-sm flex space-x-2">
        <button
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'form'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PenSquare className="w-4 h-4" />
          <span>Form Mutabaah</span>
        </button>

        <button
          onClick={() => setActiveTab('charts')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'charts'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Statistik Progres</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span>Histori Log ({userEntries.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'form' && (
        <MutabaahForm
          currentUser={currentUser}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          onSaved={() => {
            // Refreshes view
          }}
        />
      )}

      {activeTab === 'charts' && (
        <AnalyticsCharts
          entries={userEntries}
          targetSheets={currentUser.targetTilawahSheets || 10}
        />
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <ListFilter className="w-5 h-5 text-emerald-600" />
              Riwayat Mutabaah Saya ({currentUser.name})
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Target: Tilawah 10 Lm & Qiyam 2x/Wk
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-3.5 rounded-l-2xl">Tanggal</th>
                  <th className="p-3.5">Tilawah (Target 10 Lembar / 1 Juz)</th>
                  <th className="p-3.5">Qiyamulail (Target 2x Pekan)</th>
                  <th className="p-3.5">Catatan Evaluasi</th>
                  <th className="p-3.5 rounded-r-2xl text-center">Status Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userEntries.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-slate-400 font-medium">
                      Belum ada riwayat mutabaah. Mulai isi mutabaah hari ini!
                    </td>
                  </tr>
                ) : (
                  userEntries.map((e) => {
                    const sheets = e.tilawah?.sheetsCompleted || 0;
                    const juz = e.tilawah?.juzCompleted || Math.round((sheets / 10) * 10) / 10;
                    const isTilawahDone = sheets >= 10;
                    const isQiyamDone = e.qiyamulail?.performed;

                    return (
                      <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-800">
                          {e.date}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center space-x-2">
                            <span className={`font-black text-sm ${isTilawahDone ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {sheets} Lembar
                            </span>
                            <span className="text-slate-400 font-normal text-[11px]">({juz} Juz)</span>
                            {isTilawahDone && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                100% Target
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {isQiyamDone ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-xl w-fit">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              Ya ({e.qiyamulail.rakaatCount || 11} Rk - {e.qiyamulail.timeLogged || 'Malam'})
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-slate-300" />
                              Tidak
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600 max-w-xs truncate">
                          {e.notes || e.tilawah?.notes || '-'}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${
                            e.syncedToSheet !== false
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {e.syncedToSheet !== false ? '✓ Synced' : 'Lokal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

