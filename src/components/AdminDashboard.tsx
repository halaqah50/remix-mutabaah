import React, { useState } from 'react';
import { User, MutabaahEntry, GoogleSheetConfig } from '../types';
import { 
  getMembers, 
  getMutabaahEntries, 
  getGroupStats, 
  getWeeklyQiyamulailCount, 
  generateMutabaahCSV, 
  syncEntryToGoogleSheet, 
  getSheetConfig 
} from '../lib/storage';
import { 
  Users, 
  BookOpen, 
  Moon, 
  Award, 
  FileSpreadsheet, 
  Download, 
  Search, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Calendar 
} from 'lucide-react';

interface AdminDashboardProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenAddMemberModal: () => void;
  onOpenSheetModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  selectedDate,
  onDateChange,
  onOpenAddMemberModal,
  onOpenSheetModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [syncingAll, setSyncingAll] = useState(false);

  const members = getMembers();
  const entries = getMutabaahEntries();
  const groupStats = getGroupStats(selectedDate);
  const sheetConfig = getSheetConfig();

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadCSV = () => {
    const csvContent = generateMutabaahCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Mutabaah_CM3105_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncAll = async () => {
    if (entries.length === 0) {
      alert('Belum ada data mutabaah untuk disinkronkan.');
      return;
    }
    setSyncingAll(true);
    let successCount = 0;
    try {
      for (const entry of entries) {
        await syncEntryToGoogleSheet(entry);
        successCount++;
      }
      alert(`Berhasil menyinkronkan ${successCount} data mutabaah ke Google Sheet via Google Apps Script!`);
    } catch (err) {
      alert('Gagal menyinkronkan data.');
    } finally {
      setSyncingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Bento Card: Admin Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>Dashboard Administrator CM3105</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Rekapitulasi Mutabaah Kelompok
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Pantau ketercapaian Tilawah Al-Qur'an (10 Lembar/1 Juz) dan Qiyamulail (2x/Pekan) seluruh anggota halaqah CM3105.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs px-4 py-3 rounded-2xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Unduh CSV</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-2xl transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Proses Sync...' : 'Sync All ke Google Sheet'}</span>
          </button>

          <button
            onClick={onOpenAddMemberModal}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-4 py-3 rounded-2xl border border-slate-700 transition-all"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            <span>+ Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Auto-Sync Status Banner */}
      <div className="bg-emerald-950/90 text-emerald-100 rounded-2xl p-4 border border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-800/80 flex items-center justify-center text-emerald-300 shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-emerald-200">
              Sinkronisasi Otomatis Google Sheet Active (Metode Apps Script)
            </p>
            <p className="text-[11px] text-emerald-400">
              Setiap perubahan data mutabaah akan otomatis dikirim ke Google Sheet secara real-time.
            </p>
          </div>
        </div>
        <button
          onClick={onOpenSheetModal}
          className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold text-[11px] px-3.5 py-2 rounded-xl transition-all border border-emerald-700 self-start sm:self-auto cursor-pointer shrink-0"
        >
          Konfigurasi Webhook
        </button>
      </div>

      {/* Bento Grid: Group Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Bento Metric 1 */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Log Hari Ini</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-slate-900">{groupStats.activeToday}</span>
            <span className="text-xs text-slate-500 font-bold">/ {groupStats.totalMembers} Anggota</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-2 font-medium">
            {Math.round((groupStats.activeToday / (groupStats.totalMembers || 1)) * 100)}% Anggota telah mengisi mutabaah
          </p>
        </div>

        {/* Bento Metric 2: Rata-Rata Tilawah */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-rata Tilawah</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-slate-900">{groupStats.avgTilawahSheetsToday}</span>
            <span className="text-xs text-slate-500 font-bold">Lembar / Hari</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-2 font-medium">
            Target kelompok: 10 Lembar (1 Juz) per anggota
          </p>
        </div>

        {/* Bento Metric 3: Qiyamulail Target Reached */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Ketercapaian Qiyam</span>
            <Moon className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-black text-indigo-950">
              {groupStats.membersReachedQiyamulailTargetThisWeek}
            </span>
            <span className="text-xs text-slate-500 font-bold">/ {groupStats.totalMembers} Anggota</span>
          </div>
          <p className="text-[11px] text-indigo-700 mt-2 font-medium">
            Telah mencapai target 2x per pekan
          </p>
        </div>

        {/* Bento Metric 4: Connected Google Sheet */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Google Sheet</span>
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {sheetConfig.sheetName || 'Mutabaah CM3105'}
            </span>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {sheetConfig.webhookUrl ? 'Webhook Terhubung ✅' : 'Siap Disambungkan'}
            </p>
          </div>
          <button
            onClick={onOpenSheetModal}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-800 mt-3 text-left"
          >
            Kelola Koneksi Database →
          </button>
        </div>

      </div>

      {/* Bento Main Table: Rekapitulasi Anggota CM3105 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
        
        {/* Table Filters & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <h3 className="font-black text-slate-900 text-lg">
              Matrix Mutabaah Anggota CM3105
            </h3>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
              Tanggal: {selectedDate}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama anggota..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 w-48 sm:w-64"
              />
            </div>

            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5 rounded-l-2xl">Nama Anggota</th>
                <th className="p-3.5">Tilawah (Target 10 Lembar / 1 Juz)</th>
                <th className="p-3.5">Qiyamulail Pekan Ini (Target 2x)</th>
                <th className="p-3.5">Status Pengisian Tanggal Ini</th>
                <th className="p-3.5">Catatan Evaluasi</th>
                <th className="p-3.5 rounded-r-2xl text-center">Sync Sheet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member) => {
                const userEntry = entries.find((e) => e.userId === member.id && e.date === selectedDate);
                const sheets = userEntry?.tilawah?.sheetsCompleted || 0;
                const juz = userEntry?.tilawah?.juzCompleted || Math.round((sheets / 10) * 10) / 10;
                const isTilawahTargetMet = sheets >= (member.targetTilawahSheets || 10);

                const weeklyQiyam = getWeeklyQiyamulailCount(member.id, selectedDate);
                const isQiyamTargetMet = weeklyQiyam >= (member.targetQiyamulailWeekly || 2);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Member Info */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={member.name}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-300 shadow-xs"
                        />
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{member.name}</p>
                          <p className="text-[10px] text-slate-500">{member.phone || member.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Tilawah Column */}
                    <td className="p-3.5">
                      {userEntry ? (
                        <div className="flex items-center space-x-2">
                          <span className={`font-black text-sm ${isTilawahTargetMet ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {sheets} Lembar
                          </span>
                          <span className="text-slate-400 text-[11px]">({juz} Juz)</span>
                          {isTilawahTargetMet ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ✓ 100% Target
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              {Math.round((sheets / 10) * 100)}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">Belum Tilawah</span>
                      )}
                    </td>

                    {/* Qiyamulail Column */}
                    <td className="p-3.5">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${isQiyamTargetMet ? 'text-indigo-700' : 'text-slate-700'}`}>
                          {weeklyQiyam} / {member.targetQiyamulailWeekly || 2}x Pekan Ini
                        </span>
                        {isQiyamTargetMet ? (
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Target Reached ✅
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-medium">
                            Progres
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Log Column */}
                    <td className="p-3.5">
                      {userEntry ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Sudah Mengisi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Belum Isi
                        </span>
                      )}
                    </td>

                    {/* Notes Column */}
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">
                      {userEntry?.notes || userEntry?.tilawah?.notes || '-'}
                    </td>

                    {/* Sync Action */}
                    <td className="p-3.5 text-center">
                      {userEntry ? (
                        <button
                          onClick={() => syncEntryToGoogleSheet(userEntry)}
                          title="Sinkronkan data anggota ini ke Google Sheet"
                          className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

