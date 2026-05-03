import React, { useState, useEffect } from 'react';

const Settings: React.FC = () => {
  const [weekStart, setWeekStart] = useState<'sunday' | 'monday'>('sunday');

  useEffect(() => {
    const saved = localStorage.getItem('weekStart');
    if (saved === 'monday' || saved === 'sunday') {
      setWeekStart(saved);
    }
  }, []);

  const handleWeekStartChange = (val: 'sunday' | 'monday') => {
    setWeekStart(val);
    localStorage.setItem('weekStart', val);
    // In a real app we'd dispatch an event or use context
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">設定</h1>
      
      <div className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 mb-4">カレンダー設定</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">週の開始曜日</p>
              <p className="text-sm text-gray-500">カレンダーの週の開始曜日を選択します。</p>
            </div>
            <select
              value={weekStart}
              onChange={(e) => handleWeekStartChange(e.target.value as 'sunday' | 'monday')}
              className="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm rounded-md focus-ring"
            >
              <option value="sunday">日曜日</option>
              <option value="monday">月曜日</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
