import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, LogIn, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--surface-color)] border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-[var(--accent-color)] hover:opacity-80 transition-opacity focus-ring rounded-md outline-none">
          <Calendar className="w-6 h-6" />
          <span className="font-bold text-lg md:text-xl tracking-tight hidden sm:block">時間割マネージャー</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/settings" aria-label="設定" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-ring outline-none">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Link>
          
          {isAuthenticated ? (
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:bg-blue-700 transition-colors focus-ring outline-none"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          ) : (
            <button 
              onClick={() => login()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--accent-color)] rounded-lg hover:bg-blue-700 transition-colors focus-ring outline-none"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Googleでログイン</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
