import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import type { PeriodDef } from '../contexts/SettingsContext';
import { RefreshCw, CloudUpload, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const Settings: React.FC = () => {
  const { settings, updateSettings, syncFromDrive, syncToDrive, isSyncing, lastSynced } = useSettings();
  const { isAuthenticated } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleWeekStartChange = (val: 'sunday' | 'monday') => {
    updateSettings({ weekStart: val });
  };

  const handlePeriodChange = (id: number, field: keyof PeriodDef, value: string) => {
    const newPeriods = settings.periods.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    updateSettings({ periods: newPeriods });
  };

  const addPeriod = () => {
    const maxId = settings.periods.reduce((m, p) => Math.max(m, p.id), 0);
    const newId = maxId + 1;
    updateSettings({
      periods: [
        ...settings.periods,
        { id: newId, label: `${newId}限`, startTime: '09:00', endTime: '10:30' },
      ],
    });
  };

  const removePeriod = (id: number) => {
    updateSettings({ periods: settings.periods.filter(p => p.id !== id) });
  };

  const handleSaveToDrive = async () => {
    await syncToDrive();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">設定</h1>

      {/* Calendar settings */}
      <div className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium leading-6 mb-4">カレンダー設定</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">週の開始曜日</p>
              <p className="text-sm text-gray-500">カレンダーの週の開始曜日を選択します。</p>
            </div>
            <select
              value={settings.weekStart}
              onChange={(e) => handleWeekStartChange(e.target.value as 'sunday' | 'monday')}
              className="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] sm:text-sm rounded-md focus-ring"
            >
              <option value="sunday">日曜日</option>
              <option value="monday">月曜日</option>
            </select>
          </div>
        </div>
      </div>

      {/* Period settings */}
      <div className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium leading-6">時限設定</h3>
          <button
            onClick={addPeriod}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 focus-ring"
          >
            <Plus className="w-4 h-4" />
            時限を追加
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-500 px-2">
            <div className="col-span-2">時限</div>
            <div className="col-span-4">開始時刻</div>
            <div className="col-span-4">終了時刻</div>
            <div className="col-span-2"></div>
          </div>
          {settings.periods.map(period => (
            <div key={period.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={period.label}
                  onChange={e => handlePeriodChange(period.id, 'label', e.target.value)}
                  className="w-full border rounded-md p-1.5 text-sm dark:bg-gray-800 dark:border-gray-700 focus-ring"
                />
              </div>
              <div className="col-span-4">
                <input
                  type="time"
                  value={period.startTime}
                  onChange={e => handlePeriodChange(period.id, 'startTime', e.target.value)}
                  className="w-full border rounded-md p-1.5 text-sm dark:bg-gray-800 dark:border-gray-700 focus-ring"
                />
              </div>
              <div className="col-span-4">
                <input
                  type="time"
                  value={period.endTime}
                  onChange={e => handlePeriodChange(period.id, 'endTime', e.target.value)}
                  className="w-full border rounded-md p-1.5 text-sm dark:bg-gray-800 dark:border-gray-700 focus-ring"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => removePeriod(period.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-md focus-ring"
                  aria-label="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Drive Sync */}
      <div className="bg-[var(--surface-color)] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-4">
        <h3 className="text-lg font-medium leading-6">Googleドライブ同期</h3>
        {!isAuthenticated ? (
          <p className="text-sm text-gray-500">Googleアカウントでログインすると、設定をGoogleドライブに同期できます。</p>
        ) : (
          <div className="space-y-3">
            {lastSynced && (
              <p className="text-xs text-gray-400">
                最終同期: {format(lastSynced, 'yyyy年M月d日 HH:mm', { locale: ja })}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={syncFromDrive}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 focus-ring"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                ドライブから取得
              </button>
              <button
                onClick={handleSaveToDrive}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 focus-ring"
              >
                <CloudUpload className="w-4 h-4" />
                {saved ? '保存しました！' : 'ドライブに保存'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
