import React, { useState, useEffect } from 'react';
import { GoogleSheetConfig } from '../types';
import { getGoogleAppsScriptCode } from '../lib/googleSheets';
import { getSheetConfig, saveSheetConfig } from '../lib/storage';
import { 
  FileSpreadsheet, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  RefreshCw, 
  ShieldCheck, 
  Zap, 
  CheckCircle2,
  GitBranch
} from 'lucide-react';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<GoogleSheetConfig>(() => getSheetConfig());
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getSheetConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      saveSheetConfig(config);
      alert('Pengaturan Sinkronisasi Google Sheet & GitHub Berhasil Disimpan!');
      onClose();
    } catch (err: any) {
      alert('Gagal menyimpan pengaturan: ' + (err?.message || 'Error'));
    }
  };

  const handleCopyCode = () => {
    const scriptCode = getGoogleAppsScriptCode();
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!config.webhookUrl) {
      setTestResult({
        success: false,
        message: 'Silakan isi Webhook URL Google Apps Script terlebih dahulu.',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(config.webhookUrl, { method: 'GET' });
      if (res.ok) {
        setTestResult({
          success: true,
          message: 'Koneksi ke Google Apps Script Webhook Berhasil! Database Google Sheet siap digunakan.',
        });
        setConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
        saveSheetConfig({ ...config, lastSyncedAt: new Date().toISOString() });
      } else {
        setTestResult({
          success: false,
          message: 'Webhook tidak merespons. Pastikan Webhook URL benar dan dipublikasikan sebagai "Anyone".',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Gagal tes koneksi: ${err.message || 'Error koneksi'}. Periksa URL Webhook Anda.`,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 my-8 animate-in fade-in zoom-in duration-200 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-emerald-950">Integrasi Database Google Sheet</h3>
            <p className="text-xs text-gray-500">Mutabaah CM3105 otomatis tersimpan ke Google Sheet secara real-time</p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSaveConfig} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1">
              Link URL Google Sheet (Dokumen Spreadsheet)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="https://docs.google.com/spreadsheets/d/1CM3105_..."
                value={config.spreadsheetIdOrUrl}
                onChange={(e) => setConfig({ ...config, spreadsheetIdOrUrl: e.target.value })}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              {config.spreadsheetIdOrUrl && (
                <a
                  href={config.spreadsheetIdOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl transition-colors"
                  title="Buka Google Sheet"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
              <span>Google Apps Script Webhook URL (PENTING untuk Real-Time Sync)</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Deployment Web App</span>
            </label>
            <input
              type="text"
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-slate-700" />
                <span>Link GitHub Repository / Sync Backup (Opsional)</span>
              </span>
              <span className="text-[10px] text-gray-500 font-normal">GitHub Sync</span>
            </label>
            <input
              type="text"
              placeholder="https://github.com/username/repository"
              value={config.githubRepoUrl || ''}
              onChange={(e) => setConfig({ ...config, githubRepoUrl: e.target.value })}
              className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-between bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
            <div>
              <span className="text-xs font-bold text-emerald-950 block">Otomatis Simpan Perubahan (Auto-Sync)</span>
              <span className="text-[11px] text-emerald-800">Kirim data ke Google Sheet setiap kali anggota klik Simpan Mutabaah</span>
            </div>
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
              className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          {/* Test connection alert */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center space-x-2 ${
              testResult.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <X className="w-4 h-4 text-rose-700 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Step-by-Step Setup Helper */}
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Cara Menghubungkan Google Sheet (1 Menit):
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center space-x-1 bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kode Tersalin!' : 'Salin Kode Script'}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li>Buka Google Sheet Anda {'>'} klik menu <strong className="text-white">Ekstensi (Extensions)</strong> {'>'} <strong className="text-white">Apps Script</strong>.</li>
              <li>Hapus kode lama, klik tombol <strong>Salin Kode Script</strong> di atas, lalu paste ke Apps Script.</li>
              <li>Klik menu <strong className="text-white">Deploy</strong> {'>'} <strong className="text-white">New deployment</strong> {'>'} pilih jenis <strong className="text-white">Web App</strong>.</li>
              <li>Setel <i>Execute as</i>: <strong>Me</strong> dan <i>Who has access</i>: <strong className="text-amber-300 font-bold">Anyone (Siapa saja)</strong>.</li>
              <li>Klik Deploy & izinkan akses, lalu salin Web App URL ke kolom Webhook di atas.</li>
            </ol>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="flex-1 py-3 px-4 rounded-2xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Menguji...' : 'Tes Koneksi Webhook'}</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-lg transition-all"
            >
              Simpan Pengaturan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
