import { User, MutabaahEntry, GoogleSheetConfig, NotificationConfig } from '../types';

export const DEFAULT_MEMBERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Administrator CM3105',
    email: 'admin@cm3105.org',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '081298765432',
    targetTilawahSheets: 10,
    targetQiyamulailWeekly: 2,
    joinedDate: '2025-01-01',
    active: true,
  },
  {
    id: 'usr-widy',
    name: 'Widy Harsanto',
    email: 'widy@cm3105.org',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '081234567891',
    targetTilawahSheets: 10,
    targetQiyamulailWeekly: 2,
    joinedDate: '2025-01-01',
    active: true,
  },
  {
    id: 'usr-rovi',
    name: 'Muhamad Rovianto',
    email: 'rovi@cm3105.org',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '081234567890',
    targetTilawahSheets: 10,
    targetQiyamulailWeekly: 2,
    joinedDate: '2025-01-01',
    active: true,
  },
];

// Helper to generate past dates
const getDateString = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_MUTABAAH_ENTRIES: MutabaahEntry[] = [
  {
    id: 'entry-widy-1',
    userId: 'usr-widy',
    date: getDateString(0),
    tilawah: {
      sheetsCompleted: 10,
      juzCompleted: 1,
      pagesRead: 20,
      startSurah: 'Al-Baqarah (1)',
      endSurah: 'Al-Baqarah (141)',
      notes: 'Alhamdulillah target 10 lembar selesai',
    },
    qiyamulail: {
      performed: true,
      rakaatCount: 11,
      timeLogged: '03:15',
      notes: 'Tahajjud 8 rakaat + Witir 3 rakaat',
    },
    notes: 'Istiqamah CM3105 hari ini.',
    updatedAt: new Date().toISOString(),
    syncedToSheet: true,
  },
  {
    id: 'entry-rovi-1',
    userId: 'usr-rovi',
    date: getDateString(0),
    tilawah: {
      sheetsCompleted: 10,
      juzCompleted: 1,
      pagesRead: 20,
      startSurah: 'Al-Baqarah (142)',
      endSurah: 'Al-Baqarah (252)',
      notes: 'Target 10 lembar selesai',
    },
    qiyamulail: {
      performed: true,
      rakaatCount: 11,
      timeLogged: '03:20',
      notes: 'Alhamdulillah qiyamulail',
    },
    updatedAt: new Date().toISOString(),
    syncedToSheet: true,
  },
];

export const DEFAULT_SHEET_CONFIG: GoogleSheetConfig = {
  spreadsheetIdOrUrl: 'https://docs.google.com/spreadsheets/d/1UWijDg96sW0gnjpo9UkmJ3QoM7lKuPW4F5kmREDZGEA/edit?usp=sharing',
  webhookUrl: '',
  githubRepoUrl: 'https://github.com/',
  sheetName: 'Mutabaah CM3105',
  autoSync: true,
  lastSyncedAt: new Date().toISOString(),
  syncStatus: 'idle',
};

export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: true,
  soundEnabled: true,
  times: {
    qiyamulail: '03:15',
    tilawahTarget: '12:30',
    evaluasiMalam: '20:30',
  },
};

