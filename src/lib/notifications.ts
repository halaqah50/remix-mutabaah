import { NotificationConfig } from '../types';
import { getNotificationConfig } from './storage';
import { playReminderSound } from './audio';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    alert('Browser Anda tidak mendukung Web Notification.');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendLocalNotification(title: string, body: string, playAudio: boolean = true) {
  if (playAudio) {
    playReminderSound();
  }

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'cm3105-mutabaah-reminder',
      });
    } catch (err) {
      console.warn('Could not spawn Notification:', err);
    }
  }
}

// Background checker interval for daily notifications
let notificationTimer: any = null;

export function startNotificationScheduler(onReminderTriggered?: (title: string, body: string) => void) {
  if (notificationTimer) clearInterval(notificationTimer);

  // Check every 30 seconds
  notificationTimer = setInterval(() => {
    const config: NotificationConfig = getNotificationConfig();
    if (!config.enabled) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;
    const currentSeconds = now.getSeconds();

    // Only fire at 00 seconds of that minute to avoid duplicate triggers
    if (currentSeconds > 30) return;

    const times = config.times;

    let triggerTitle = '';
    let triggerBody = '';

    if (currentTimeStr === times.qiyamulail) {
      triggerTitle = '🌙 Pengingat Qiyamulail CM3105';
      triggerBody = 'Target pekan ini: minimal 2x Qiyamulail. Saatnya bangun malam dan bermunajat!';
    } else if (currentTimeStr === times.dzikirPagi) {
      triggerTitle = '🌅 Pengingat Dzikir Pagi CM3105';
      triggerBody = 'Awali hari dengan membaca Dzikir Pagi (Al-Ma\'tsurat) dan niat tilawah 10 lembar.';
    } else if (currentTimeStr === times.tilawahTarget) {
      triggerTitle = '📖 Checkpoint Tilawah 10 Lembar / 1 Juz';
      triggerBody = 'Sudahkah Anda tilawah hari ini? Target harian 10 lembar (1 juz). Yuk sempatkan!';
    } else if (currentTimeStr === times.dzikirPetang) {
      triggerTitle = '🌇 Pengingat Dzikir Petang CM3105';
      triggerBody = 'Waktu Dzikir Petang telah tiba. Jangan lupa menyempatkan zikir sore ini.';
    } else if (currentTimeStr === times.evaluasiMalam) {
      triggerTitle = '📋 Evaluasi Mutabaah Yaumiyah CM3105';
      triggerBody = 'Mari lengkapi catatan ibadah harian Anda hari ini sebelum beristirahat.';
    }

    if (triggerTitle) {
      sendLocalNotification(triggerTitle, triggerBody, config.soundEnabled);
      if (onReminderTriggered) {
        onReminderTriggered(triggerTitle, triggerBody);
      }
    }
  }, 30000);
}

export function stopNotificationScheduler() {
  if (notificationTimer) {
    clearInterval(notificationTimer);
    notificationTimer = null;
  }
}
