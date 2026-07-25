export type UserRole = 'member' | 'admin';

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  targetTilawahSheets: number; // default 10 lembar (approx 1 juz / 20 pages)
  targetQiyamulailWeekly: number; // default 2x per week
  joinedDate: string;
  active: boolean;
}

export interface TilawahRecord {
  sheetsCompleted: number; // 1 lembar = 2 halaman
  juzCompleted: number; // 1 juz = 10 lembar
  pagesRead: number; // e.g. 20 pages = 10 lembar
  startSurah?: string;
  endSurah?: string;
  notes?: string;
}

export interface QiyamulailRecord {
  performed: boolean;
  rakaatCount?: number;
  timeLogged?: string; // e.g. "03:15"
  notes?: string;
}

export interface MutabaahEntry {
  id: string;
  userId: string;
  date: string; // Format: YYYY-MM-DD
  tilawah: TilawahRecord;
  qiyamulail: QiyamulailRecord;
  notes?: string;
  updatedAt: string;
  syncedToSheet?: boolean;
}

export interface NotificationConfig {
  enabled: boolean;
  soundEnabled: boolean;
  times: {
    qiyamulail: string; // e.g., "03:15"
    tilawahTarget: string; // e.g., "12:30"
    evaluasiMalam: string; // e.g., "20:30"
  };
}

export interface GoogleSheetConfig {
  spreadsheetIdOrUrl: string;
  webhookUrl: string; // Apps Script Webhook deployment URL
  githubRepoUrl?: string; // Optional GitHub Repository URL / Sync
  sheetName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  errorMessage?: string;
}

export interface GroupStats {
  totalMembers: number;
  activeToday: number;
  avgTilawahSheetsToday: number;
  avgTilawahJuzToday: number;
  membersReachedQiyamulailTargetThisWeek: number;
  overallTargetPercentToday: number;
}

