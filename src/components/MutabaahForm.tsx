import React, { useState, useEffect } from 'react';
import { MutabaahEntry, User } from '../types';
import { TilawahTracker } from './TilawahTracker';
import { QiyamulailTracker } from './QiyamulailTracker';
import { 
  getMutabaahByDate, 
  upsertMutabaahEntry, 
  getWeeklyQiyamulailCount 
} from '../lib/storage';
import { 
  Calendar, 
  Save, 
  FileSpreadsheet, 
  CheckCircle2, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface MutabaahFormProps {
  currentUser: User;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onSaved: (savedEntry: MutabaahEntry) => void;
}

export const MutabaahForm: React.FC<MutabaahFormProps> = ({
  currentUser,
  selectedDate,
  onDateChange,
  onSaved,
}) => {
  const [entry, setEntry] = useState<MutabaahEntry>(() => {
    const existing = getMutabaahByDate(currentUser.id, selectedDate);
    if (existing) return existing;

    return {
      id: `entry-${Date.now()}`,
      userId: currentUser.id,
      date: selectedDate,
      tilawah: {
        sheetsCompleted: 0,
        juzCompleted: 0,
        pagesRead: 0,
      },
      qiyamulail: {
        performed: false,
      },
      notes: '',
      updatedAt: new Date().toISOString(),
    };
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Reload when date or user changes
  useEffect(() => {
    const existing = getMutabaahByDate(currentUser.id, selectedDate);
    if (existing) {
      setEntry(existing);
    } else {
      setEntry({
        id: `entry-${Date.now()}`,
        userId: currentUser.id,
        date: selectedDate,
        tilawah: {
          sheetsCompleted: 0,
          juzCompleted: 0,
          pagesRead: 0,
        },
        qiyamulail: {
          performed: false,
        },
        notes: '',
        updatedAt: new Date().toISOString(),
      });
    }
  }, [currentUser.id, selectedDate]);

  const weeklyQiyamCount = getWeeklyQiyamulailCount(currentUser.id, selectedDate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const saved = upsertMutabaahEntry(entry);
      onSaved(saved);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save mutabaah:', err);
      alert('Gagal menyimpan data.');
    } finally {
      setSaving(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSave} className="space-y-6">
      
      {/* Bento Card: Form Header with Date selector & User Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Mutabaah Yaumiyah
            </h2>
            {selectedDate === todayStr ? (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Hari Ini
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full font-semibold">
                {selectedDate}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Anggota: <span className="font-bold text-emerald-700">{currentUser.name}</span> • Target: Tilawah {currentUser.targetTilawahSheets || 10} Lembar/Juz & Qiyamulail {currentUser.targetQiyamulailWeekly || 2}x/Pekan
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
          <Calendar className="w-4 h-4 text-emerald-600 ml-1" />
          <span className="text-xs font-bold text-slate-700">Tanggal Log:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="bg-white text-xs font-bold text-slate-900 px-3 py-1.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-xs"
          />
        </div>
      </div>

      {/* Target 1: Tilawah Al-Qur'an (Target 10 Lembar / 1 Juz) */}
      <TilawahTracker
        tilawah={entry.tilawah}
        targetSheets={currentUser.targetTilawahSheets || 10}
        onChange={(updatedTilawah) => setEntry((prev) => ({ ...prev, tilawah: updatedTilawah }))}
      />

      {/* Target 2: Qiyamulail (Target 2x per Pekan) */}
      <QiyamulailTracker
        qiyamulail={entry.qiyamulail}
        weeklyCount={weeklyQiyamCount}
        targetWeekly={currentUser.targetQiyamulailWeekly || 2}
        onChange={(updatedQiyam) => setEntry((prev) => ({ ...prev, qiyamulail: updatedQiyam }))}
      />

      {/* Sticky Bento Save Action Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-slate-200 flex items-center justify-between gap-4 z-30">
        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <span className="font-medium text-slate-700">
            Otomatis sinkron ke database Google Sheet
          </span>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1.5 animate-in fade-in bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Tersimpan & Disinkronkan!
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center space-x-2 active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Mutabaah'}</span>
          </button>
        </div>
      </div>

    </form>
  );
};

