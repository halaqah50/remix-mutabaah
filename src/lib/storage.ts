import { User, MutabaahEntry, GoogleSheetConfig, NotificationConfig, GroupStats } from '../types';
import { DEFAULT_MEMBERS, DEFAULT_MUTABAAH_ENTRIES, DEFAULT_SHEET_CONFIG, DEFAULT_NOTIFICATION_CONFIG } from '../data/mockData';

const STORAGE_KEYS = {
  MEMBERS: 'cm3105_members',
  CURRENT_USER_ID: 'cm3105_current_user_id',
  MUTABAAH_ENTRIES: 'cm3105_mutabaah_entries',
  SHEET_CONFIG: 'cm3105_sheet_config',
  NOTIF_CONFIG: 'cm3105_notif_config',
  ACTIVE_ROLE: 'cm3105_active_role',
};

// Initialize LocalStorage with default mock data if empty
export function initStorage() {
  // Always keep members synced to DEFAULT_MEMBERS (Widy Harsanto & Muhamad Rovianto)
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(DEFAULT_MEMBERS));

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
  if (!currentUserId || !DEFAULT_MEMBERS.some((m) => m.id === currentUserId)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_MEMBERS[0].id);
  }

  if (!localStorage.getItem(STORAGE_KEYS.MUTABAAH_ENTRIES)) {
    localStorage.setItem(STORAGE_KEYS.MUTABAAH_ENTRIES, JSON.stringify(DEFAULT_MUTABAAH_ENTRIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(DEFAULT_SHEET_CONFIG));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIF_CONFIG)) {
    localStorage.setItem(STORAGE_KEYS.NOTIF_CONFIG, JSON.stringify(DEFAULT_NOTIFICATION_CONFIG));
  }
}

// Members Management
export function getMembers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return raw ? JSON.parse(raw) : DEFAULT_MEMBERS;
  } catch {
    return DEFAULT_MEMBERS;
  }
}

export function saveMembers(members: User[]) {
  localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
}

export function addMember(newMember: Omit<User, 'id' | 'joinedDate' | 'active'>): User {
  const members = getMembers();
  const created: User = {
    ...newMember,
    id: `usr-${Date.now()}`,
    joinedDate: new Date().toISOString().split('T')[0],
    active: true,
  };
  members.push(created);
  saveMembers(members);
  return created;
}

// Active User
export function getCurrentUserId(): string {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID) || DEFAULT_MEMBERS[0].id;
}

export function setCurrentUserId(userId: string) {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
}

export function getCurrentUser(): User {
  const members = getMembers();
  const id = getCurrentUserId();
  return members.find(m => m.id === id) || members[0] || DEFAULT_MEMBERS[0];
}

// Mutabaah Entries Management
export function getMutabaahEntries(): MutabaahEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MUTABAAH_ENTRIES);
    return raw ? JSON.parse(raw) : DEFAULT_MUTABAAH_ENTRIES;
  } catch {
    return DEFAULT_MUTABAAH_ENTRIES;
  }
}

export function saveMutabaahEntries(entries: MutabaahEntry[]) {
  localStorage.setItem(STORAGE_KEYS.MUTABAAH_ENTRIES, JSON.stringify(entries));
}

export function getMutabaahByDate(userId: string, dateStr: string): MutabaahEntry | undefined {
  const entries = getMutabaahEntries();
  return entries.find(e => e.userId === userId && e.date === dateStr);
}

export function upsertMutabaahEntry(entry: Omit<MutabaahEntry, 'id' | 'updatedAt'> & { id?: string }): MutabaahEntry {
  const entries = getMutabaahEntries();
  const now = new Date().toISOString();
  
  const existingIndex = entries.findIndex(e => e.userId === entry.userId && e.date === entry.date);
  
  let savedEntry: MutabaahEntry;
  
  if (existingIndex >= 0) {
    savedEntry = {
      ...entries[existingIndex],
      ...entry,
      id: entries[existingIndex].id,
      updatedAt: now,
      syncedToSheet: false,
    };
    entries[existingIndex] = savedEntry;
  } else {
    savedEntry = {
      ...entry,
      id: entry.id || `entry-${Date.now()}`,
      updatedAt: now,
      syncedToSheet: false,
    };
    entries.unshift(savedEntry);
  }
  
  saveMutabaahEntries(entries);

  // Always trigger automatic Google Sheet sync
  syncEntryToGoogleSheet(savedEntry);

  return savedEntry;
}

// Weekly Qiyamulail Count Calculator (Counts Qiyamulail in current week Mon-Sun)
export function getWeeklyQiyamulailCount(userId: string, targetDateStr: string = new Date().toISOString().split('T')[0]): number {
  const entries = getMutabaahEntries();
  const refDate = new Date(targetDateStr);
  
  // Calculate start of week (Monday)
  const day = refDate.getDay();
  const diffToMon = refDate.getDate() - day + (day === 0 ? -6 : 1);
  const monDate = new Date(refDate.setDate(diffToMon));
  monDate.setHours(0, 0, 0, 0);

  const sunDate = new Date(monDate);
  sunDate.setDate(sunDate.getDate() + 6);
  sunDate.setHours(23, 59, 59, 999);

  return entries.filter(e => {
    if (e.userId !== userId) return false;
    const eDate = new Date(e.date);
    return eDate >= monDate && eDate <= sunDate && e.qiyamulail?.performed;
  }).length;
}

// User Streak Calculator
export function getUserStreak(userId: string): number {
  const entries = getMutabaahEntries().filter(e => e.userId === userId);
  if (entries.length === 0) return 0;

  const dates = entries.map(e => e.date).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  let curr = new Date();
  
  // Check if filled today or yesterday
  const todayStr = curr.toISOString().split('T')[0];
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toISOString().split('T')[0];

  let checkDate = dates.includes(todayStr) ? new Date() : dates.includes(yestStr) ? yest : null;
  if (!checkDate) return 0;

  while (true) {
    const cStr = checkDate.toISOString().split('T')[0];
    if (dates.includes(cStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// Group Aggregate Stats for Admin
export function getGroupStats(dateStr: string = new Date().toISOString().split('T')[0]): GroupStats {
  const members = getMembers().filter(m => m.active);
  const entries = getMutabaahEntries();
  
  const todayEntries = entries.filter(e => e.date === dateStr);
  const activeToday = todayEntries.length;

  let totalSheets = 0;
  let totalJuz = 0;
  let membersQiyamulailMet = 0;
  let totalCompletionSum = 0;

  members.forEach(member => {
    const userTodayEntry = todayEntries.find(e => e.userId === member.id);
    if (userTodayEntry) {
      const sheets = userTodayEntry.tilawah?.sheetsCompleted || 0;
      totalSheets += sheets;
      totalJuz += userTodayEntry.tilawah?.juzCompleted || (sheets / 10);

      // Percentage calculation
      const tilawahScore = Math.min(100, (sheets / member.targetTilawahSheets) * 100);
      const qiyamCount = getWeeklyQiyamulailCount(member.id, dateStr);
      const qiyamScore = qiyamCount >= member.targetQiyamulailWeekly ? 100 : (qiyamCount / member.targetQiyamulailWeekly) * 50;
      
      const overall = Math.round((tilawahScore * 0.5) + (qiyamScore * 0.5));
      totalCompletionSum += overall;
    }

    const wQiyam = getWeeklyQiyamulailCount(member.id, dateStr);
    if (wQiyam >= member.targetQiyamulailWeekly) {
      membersQiyamulailMet++;
    }
  });

  return {
    totalMembers: members.length,
    activeToday,
    avgTilawahSheetsToday: members.length ? Math.round((totalSheets / members.length) * 10) / 10 : 0,
    avgTilawahJuzToday: members.length ? Math.round((totalJuz / members.length) * 100) / 100 : 0,
    membersReachedQiyamulailTargetThisWeek: membersQiyamulailMet,
    overallTargetPercentToday: members.length ? Math.round(totalCompletionSum / members.length) : 0,
  };
}

// Configs
export function getSheetConfig(): GoogleSheetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEET_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_SHEET_CONFIG;
  } catch {
    return DEFAULT_SHEET_CONFIG;
  }
}

export function saveSheetConfig(config: GoogleSheetConfig) {
  localStorage.setItem(STORAGE_KEYS.SHEET_CONFIG, JSON.stringify(config));
}

export function getNotificationConfig(): NotificationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIF_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_NOTIFICATION_CONFIG;
  } catch {
    return DEFAULT_NOTIFICATION_CONFIG;
  }
}

export function saveNotificationConfig(config: NotificationConfig) {
  localStorage.setItem(STORAGE_KEYS.NOTIF_CONFIG, JSON.stringify(config));
}

// Google Sheets Sync Logic
export async function syncEntryToGoogleSheet(entry: MutabaahEntry) {
  const config = getSheetConfig();
  const members = getMembers();
  const member = members.find(m => m.id === entry.userId);

  const payload = {
    action: 'SAVE_MUTABAAH',
    timestamp: new Date().toISOString(),
    id: entry.id,
    date: entry.date,
    memberId: entry.userId,
    memberName: member?.name || 'Anggota CM3105',
    tilawahSheets: entry.tilawah.sheetsCompleted,
    tilawahJuz: entry.tilawah.juzCompleted || (entry.tilawah.sheetsCompleted / 10),
    tilawahNotes: entry.tilawah.notes || '',
    qiyamulailPerformed: entry.qiyamulail.performed ? 'YA' : 'TIDAK',
    qiyamulailRakaat: entry.qiyamulail.rakaatCount || 0,
    qiyamulailTime: entry.qiyamulail.timeLogged || '',
    notes: entry.notes || '',
  };

  // Try calling backend sync endpoint
  try {
    config.syncStatus = 'syncing';
    saveSheetConfig(config);

    const res = await fetch('/api/sheets/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, entry: payload }),
    });

    if (res.ok) {
      config.syncStatus = 'success';
      config.lastSyncedAt = new Date().toISOString();
      config.errorMessage = undefined;

      // Mark entry synced
      const entries = getMutabaahEntries();
      const idx = entries.findIndex(e => e.id === entry.id);
      if (idx >= 0) {
        entries[idx].syncedToSheet = true;
        saveMutabaahEntries(entries);
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      config.syncStatus = 'error';
      config.errorMessage = errData.message || 'Gagal tersambung ke webhook Google Sheet';
    }
  } catch (err: any) {
    console.warn('Google Sheet Sync warning:', err);
    config.syncStatus = 'error';
    config.errorMessage = 'Gagal mengirim data. Data tersimpan di database lokal.';
  } finally {
    saveSheetConfig(config);
  }
}

// Generate CSV for Google Sheet Manual Export / Copy-Paste
export function generateMutabaahCSV(): string {
  const entries = getMutabaahEntries();
  const members = getMembers();

  const headers = [
    'Tanggal',
    'ID Anggota',
    'Nama Anggota',
    'Tilawah (Lembar)',
    'Tilawah (Juz)',
    'Status Target Tilawah (10 Lembar)',
    'Qiyamulail',
    'Rakaat Qiyamulail',
    'Jam Qiyamulail',
    'Catatan / Evaluasi',
    'Waktu Update',
  ];

  const rows = entries.map(e => {
    const member = members.find(m => m.id === e.userId);
    const tilawahSheets = e.tilawah.sheetsCompleted || 0;
    const tilawahJuz = e.tilawah.juzCompleted || (tilawahSheets / 10);
    const tilawahStatus = tilawahSheets >= 10 ? 'TERCAPAI (10 Lembar/1 Juz)' : `${tilawahSheets}/10 Lembar`;

    return [
      e.date,
      e.userId,
      `"${member?.name || 'Anggota'}"`,
      tilawahSheets,
      tilawahJuz,
      `"${tilawahStatus}"`,
      e.qiyamulail.performed ? 'YA' : 'TIDAK',
      e.qiyamulail.rakaatCount || 0,
      `"${e.qiyamulail.timeLogged || '-'}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      e.updatedAt,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

