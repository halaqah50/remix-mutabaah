import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { 
  initStorage, 
  getMembers, 
  getCurrentUser, 
  setCurrentUserId, 
  getSheetConfig 
} from './lib/storage';
import { startNotificationScheduler, stopNotificationScheduler } from './lib/notifications';
import { Navbar } from './components/Navbar';
import { MemberDashboard } from './components/MemberDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { NotificationSettingsModal } from './components/NotificationSettingsModal';
import { AddMemberModal } from './components/AddMemberModal';
import { LoginForm } from './components/LoginForm';
import { BookOpen, Heart, FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => localStorage.getItem('cm3105_is_authenticated') === 'true'
  );
  const [members, setMembers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole>('member');
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Modals state
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  // Initialize
  useEffect(() => {
    initStorage();
    const loadedMembers = getMembers();
    const loadedUser = getCurrentUser();
    setMembers(loadedMembers);
    setCurrentUser(loadedUser);
    if (loadedUser?.role === 'admin') {
      setActiveRole('admin');
    } else {
      setActiveRole('member');
    }

    // Start daily background notification scheduler
    startNotificationScheduler();

    return () => {
      stopNotificationScheduler();
    };
  }, []);

  const handleSelectUser = (userId: string) => {
    setCurrentUserId(userId);
    const updated = getMembers().find((m) => m.id === userId);
    if (updated) {
      setCurrentUser(updated);
      if (updated.role === 'admin') {
        setActiveRole('admin');
      } else {
        setActiveRole('member');
      }
    }
  };

  const handleMemberAdded = (newMember: User) => {
    const updatedMembers = getMembers();
    setMembers(updatedMembers);
    setCurrentUser(newMember);
    setCurrentUserId(newMember.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('cm3105_is_authenticated');
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = (userId: string) => {
    setIsAuthenticated(true);
    handleSelectUser(userId);
  };

  // If user is not authenticated, show LoginForm gate
  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center text-white p-4">
        <div className="text-center space-y-3 animate-pulse">
          <BookOpen className="w-12 h-12 text-amber-300 mx-auto" />
          <p className="text-lg font-bold">Memuat Aplikasi Mutabaah CM3105...</p>
        </div>
      </div>
    );
  }

  const sheetConfig = getSheetConfig();
  const isSheetConnected = Boolean(sheetConfig.webhookUrl || sheetConfig.spreadsheetIdOrUrl);

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 font-sans flex flex-col selection:bg-emerald-200">
      
      {/* Header Navbar */}
      <Navbar
        members={members}
        currentUser={currentUser}
        activeRole={activeRole}
        selectedDate={selectedDate}
        sheetSynced={isSheetConnected}
        onSelectUser={handleSelectUser}
        onToggleRole={(role) => setActiveRole(role)}
        onDateChange={setSelectedDate}
        onOpenNotifModal={() => setIsNotifModalOpen(true)}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Role View Switcher Content */}
        {activeRole === 'admin' ? (
          <AdminDashboard
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onOpenAddMemberModal={() => setIsAddMemberModalOpen(true)}
            onOpenSheetModal={() => setIsSheetModalOpen(true)}
          />
        ) : (
          <MemberDashboard
            currentUser={currentUser}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 py-6 border-t border-emerald-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span className="font-bold text-amber-300">Mutabaah Ibadah CM3105</span>
          </div>

          {activeRole === 'admin' && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSheetModalOpen(true)}
                title="Integrasi Google Sheet & Apps Script"
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-all cursor-pointer font-semibold text-xs shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Google Sheet</span>
              </button>
            </div>
          )}
        </div>
      </footer>

      {/* Modals */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
      />

      <NotificationSettingsModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onMemberAdded={handleMemberAdded}
      />

    </div>
  );
}

