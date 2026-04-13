import React, { useState } from 'react';
import { useAuthStore } from '../../features/auth/useAuthStore';

interface TopBarProps {
  onKpiClick?: () => void;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(): string {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date());
}

export const TopBar: React.FC<TopBarProps> = ({ onKpiClick }) => {
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const canViewKpi = user?.role === 'leader' || user?.role === 'admin' || user?.role === 'owner';

  return (
    <header className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shrink-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>N</span>
        </div>
        <span className="text-white font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>Nedu</span>
        <span className="text-slate-500 text-sm ml-1">ops</span>
      </div>

      {/* Center: greeting + date */}
      <div className="hidden md:flex items-center gap-4 text-sm">
        <span className="text-slate-400">
          Xin chào, <span className="text-white font-medium">{user?.full_name || 'Bạn'}</span>
        </span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-500">{formatDate()}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {canViewKpi && (
          <button
            onClick={onKpiClick}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <span>📊</span>
            <span className="hidden sm:inline">KPI</span>
          </button>
        )}

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors"
          >
            {user ? getInitials(user.full_name) : 'U'}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-white text-sm font-medium">{user?.full_name}</p>
                <p className="text-slate-400 text-xs">{user?.email}</p>
                <span className="inline-block mt-1 bg-indigo-900 text-indigo-300 text-xs px-2 py-0.5 rounded">
                  {user?.role}
                </span>
              </div>
              <div className="py-1">
                <button className="w-full text-left px-4 py-2 text-slate-300 hover:bg-slate-700 text-sm transition-colors">
                  ⚙️ Cài đặt
                </button>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700 text-sm transition-colors"
                >
                  🚪 Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close menu on outside click */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
};
