import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ScheduleGrid from '../components/schedule/ScheduleGrid';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">マイスケジュール</h1>
      </div>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center p-12 bg-[var(--surface-color)] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-center">
          <h2 className="text-xl font-semibold mb-2">時間割マネージャーへようこそ</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Googleアカウントでログインして、時間割を管理し、Google Tasksと課題を同期しましょう。
          </p>
        </div>
      ) : (
        <div className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 md:p-6">
          <ScheduleGrid />
        </div>
      )}
    </div>
  );
};

export default Home;
