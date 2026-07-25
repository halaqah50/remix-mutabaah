import React from 'react';
import { User, UserRole } from '../types';
import { BookOpen, LogOut } from 'lucide-react';

interface NavbarProps {
  members?: User[];
  currentUser?: User;
  activeRole?: UserRole;
  selectedDate?: string;
  sheetSynced?: boolean;
  onSelectUser?: (userId: string) => void;
  onToggleRole?: (role: UserRole) => void;
  onDateChange?: (date: string) => void;
  onOpenNotifModal?: () => void;
  onOpenSheetModal?: () => void;
  onOpenAddMemberModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand & Group Identifier */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-sm font-black">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-lg sm:text-xl text-white tracking-tight">
                Mutabaah Ibadah CM3105
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Logout Button if authenticated */}
            {onLogout && (
              <button
                onClick={onLogout}
                title="Keluar"
                className="flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};




