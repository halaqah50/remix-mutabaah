import React, { useState } from 'react';
import { NotificationConfig } from '../types';
import { getNotificationConfig, saveNotificationConfig } from '../lib/storage';
import { requestNotificationPermission, sendLocalNotification } from '../lib/notifications';
import { playReminderSound } from '../lib/audio';
import { Bell, Volume2, X, Clock, CheckCircle2 } from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<NotificationConfig>(() => getNotificationConfig());
  const [permissionGranted, setPermissionGranted] = useState<boolean>(() =>
    'Notification' in window && Notification.permission === 'granted'
  );

  if (!isOpen) return null;

  const handleEnablePermission = async () => {
    const granted = await requestNotificationPermission();
    setPermissionGranted(granted);
    if (granted) {
      sendLocalNotification('Pengingat CM3105 Aktif! 🎉', 'Notifikasi harian mutabaah telah diaktifkan.', config.soundEnabled);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotificationConfig(config);
    alert('Jadwal Pengingat Harian Tersimpan!');
    onClose();
  };

  const handleTestNotification = () => {
    if (config.soundEnabled) playReminderSound();
    sendLocalNotification(
      '📖 Tes Notifikasi Tilawah CM3105',
      'Target hari ini: 10 Lembar / 1 Juz Al-Qur\'an. Yuk tilawah sekarang!',
      config.soundEnabled
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in duration-200 relative">
        
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-emerald-950">Notifikasi Pengingat Harian</h3>
            <p className="text-xs text-gray-500">Atur waktu pengingat Tilawah (10 Lembar) & Qiyamulail</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Permission Status */}
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-950 block">Izin Notifikasi Browser</span>
              <span className="text-[11px] text-emerald-700">
                {permissionGranted ? 'Izin telah diberikan ✅' : 'Izin belum diaktifkan di browser'}
              </span>
            </div>

            {!permissionGranted ? (
              <button
                type="button"
                onClick={handleEnablePermission}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow"
              >
                Aktifkan Izin
              </button>
            ) : (
              <span className="text-xs bg-emerald-200 text-emerald-900 font-bold px-2.5 py-1 rounded-full">
                Aktif
              </span>
            )}
          </div>

          {/* Master Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <label className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-gray-800">Aktifkan Pengingat</span>
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>

            <label className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between cursor-pointer">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                Suara Bell
              </span>
              <input
                type="checkbox"
                checked={config.soundEnabled}
                onChange={(e) => setConfig({ ...config, soundEnabled: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
            </label>
          </div>

          {/* Schedule Inputs */}
          <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
            <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              Jadwal Waktu Pengingat Harian
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-gray-600 font-semibold mb-1">🌙 Qiyamulail</label>
                <input
                  type="time"
                  value={config.times.qiyamulail}
                  onChange={(e) => setConfig({ ...config, times: { ...config.times, qiyamulail: e.target.value } })}
                  className="w-full bg-white p-2 rounded-xl border border-gray-300 font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">🌅 Dzikir Pagi</label>
                <input
                  type="time"
                  value={config.times.dzikirPagi}
                  onChange={(e) => setConfig({ ...config, times: { ...config.times, dzikirPagi: e.target.value } })}
                  className="w-full bg-white p-2 rounded-xl border border-gray-300 font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">📖 Checkpoint Tilawah 10 Lm</label>
                <input
                  type="time"
                  value={config.times.tilawahTarget}
                  onChange={(e) => setConfig({ ...config, times: { ...config.times, tilawahTarget: e.target.value } })}
                  className="w-full bg-white p-2 rounded-xl border border-gray-300 font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-semibold mb-1">🌇 Dzikir Petang</label>
                <input
                  type="time"
                  value={config.times.dzikirPetang}
                  onChange={(e) => setConfig({ ...config, times: { ...config.times, dzikirPetang: e.target.value } })}
                  className="w-full bg-white p-2 rounded-xl border border-gray-300 font-bold text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={handleTestNotification}
              className="flex-1 py-3 px-4 rounded-2xl border border-amber-300 bg-amber-50 text-amber-900 text-xs font-bold hover:bg-amber-100 flex items-center justify-center space-x-1.5"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              <span>Tes Notifikasi</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-lg transition-all"
            >
              Simpan Jadwal
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
