import React from 'react';
import { Briefcase, Settings, BarChart3, LogOut, BookOpen, Layers, Library, ClipboardList, LayoutDashboard, StickyNote } from 'lucide-react';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentUser: User | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, activeTab, onTabChange, onLogout }) => {
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  // Modification: Seul l'admin voit le dashboard de management global
  const showManagement = isAdmin; 

  const navItemClass = (tab: string) => `
    flex items-center w-full px-4 py-3 mb-1 transition-all rounded-lg text-sm font-medium
    ${activeTab === tab 
      ? 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border-r-2 border-indigo-600 dark:border-indigo-400' 
      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}
  `;

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-50 transition-colors duration-200">
      <div className="p-6 flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 transform rotate-3">
            <span className="text-white font-black text-lg italic">D</span>
        </div>
        <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">
            DOINg
            </h1>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <button onClick={() => onTabChange('dashboard')} className={navItemClass('dashboard')}>
          <BarChart3 className="w-5 h-5 mr-3" />
          Dashboard
        </button>

        {showManagement && (
            <button onClick={() => onTabChange('management')} className={navItemClass('management')}>
                <LayoutDashboard className="w-5 h-5 mr-3" />
                Management
            </button>
        )}

        <button onClick={() => onTabChange('projects')} className={navItemClass('projects')}>
          <Briefcase className="w-5 h-5 mr-3" />
          Projects & Tasks
        </button>
        
        <button onClick={() => onTabChange('book-of-work')} className={navItemClass('book-of-work')}>
          <Library className="w-5 h-5 mr-3" />
          Book of Work
        </button>
        
        <button onClick={() => onTabChange('weekly-report')} className={navItemClass('weekly-report')}>
          <ClipboardList className="w-5 h-5 mr-3" />
          Weekly Report
        </button>

        <button onClick={() => onTabChange('meetings')} className={navItemClass('meetings')}>
          <BookOpen className="w-5 h-5 mr-3" />
          Minutes & Actions
        </button>

        <button onClick={() => onTabChange('notes')} className={navItemClass('notes')}>
          <StickyNote className="w-5 h-5 mr-3" />
          Notes & Canvas
        </button>

        {isAdmin && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-4">System</h3>
            <button onClick={() => onTabChange('admin-users')} className={navItemClass('admin-users')}>
              <Settings className="w-5 h-5 mr-3" />
              Users & Teams
            </button>
            <button onClick={() => onTabChange('settings')} className={navItemClass('settings')}>
              <Layers className="w-5 h-5 mr-3" />
              Configuration
            </button>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center mb-4 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white shadow-sm mr-3">
                {currentUser?.firstName.charAt(0)}{currentUser?.lastName.charAt(0)}
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{currentUser?.firstName} {currentUser?.lastName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser?.functionTitle}</p>
            </div>
        </div>
        <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;