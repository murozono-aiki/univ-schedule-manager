import React, { useState, useEffect } from 'react';
import type { ClassEvent } from '../../types';
import { X } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

interface ClassFormProps {
  onClose: () => void;
  onSubmit: (event: ClassEvent) => void;
  initialData?: Partial<ClassEvent>;
}

const ClassForm: React.FC<ClassFormProps> = ({ onClose, onSubmit, initialData }) => {
  const { settings } = useSettings();
  const periods = settings.periods;

  const [formData, setFormData] = useState<Partial<ClassEvent>>(initialData || {
    subject: '',
    startTime: periods[0]?.startTime || '09:00',
    endTime: periods[0]?.endTime || '10:30',
    location: '',
    teacher: '',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  // 'custom' or period id as string e.g. '1'
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    if (!initialData?.startTime) return periods[0] ? String(periods[0].id) : 'custom';
    const matched = periods.find(
      p => p.startTime === initialData.startTime && p.endTime === initialData.endTime
    );
    return matched ? String(matched.id) : 'custom';
  });

  const [isRepeating, setIsRepeating] = useState<boolean>(() => !!(initialData?.recurrenceRule));
  const [repeatInterval, setRepeatInterval] = useState<number>(() => {
    if (initialData?.recurrenceRule) {
      const match = initialData.recurrenceRule.match(/INTERVAL=(\d+)/);
      return match ? parseInt(match[1], 10) : 1;
    }
    return 1;
  });

  // When period dropdown changes, update time fields
  useEffect(() => {
    if (selectedPeriod !== 'custom') {
      const period = periods.find(p => String(p.id) === selectedPeriod);
      if (period) {
        setFormData(prev => ({ ...prev, startTime: period.startTime, endTime: period.endTime }));
      }
    }
  }, [selectedPeriod, periods]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // If user manually edits time, switch to custom
    if (name === 'startTime' || name === 'endTime') {
      setSelectedPeriod('custom');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.startTime || !formData.endTime || !formData.startDate) return;

    const finalData = { ...formData };
    if (isRepeating) {
      finalData.recurrenceRule = `FREQ=WEEKLY${repeatInterval > 1 ? `;INTERVAL=${repeatInterval}` : ''}`;
    } else {
      finalData.recurrenceRule = undefined;
    }

    onSubmit(finalData as ClassEvent);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface-color)] rounded-xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold">{initialData ? '授業を編集' : '授業を追加'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">科目名 *</label>
            <input required type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">開始日 *</label>
              <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium">繰り返し</label>
              <div className="flex items-center gap-3 mt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRepeating}
                    onChange={(e) => setIsRepeating(e.target.checked)}
                    className="rounded border-gray-300 text-[var(--accent-color)] focus:ring-[var(--accent-color)]"
                  />
                  <span>毎週繰り返す</span>
                </label>
                {isRepeating && (
                  <div className="flex items-center gap-1 text-sm">
                    <input
                      type="number"
                      min="1"
                      max="52"
                      value={repeatInterval}
                      onChange={(e) => setRepeatInterval(parseInt(e.target.value) || 1)}
                      className="w-16 border rounded-md p-1 dark:bg-gray-800 dark:border-gray-700 focus-ring text-center"
                    />
                    <span>週間ごと</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Period selector */}
          <div>
            <label className="block text-sm font-medium mb-1">時限</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring"
            >
              {periods.map(p => (
                <option key={p.id} value={String(p.id)}>
                  {p.label}（{p.startTime}〜{p.endTime}）
                </option>
              ))}
              <option value="custom">カスタム</option>
            </select>
          </div>

          {/* Time fields shown when custom or as a read-only reference */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">開始時間 *</label>
              <input
                required
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring ${selectedPeriod !== 'custom' ? 'opacity-60' : ''}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">終了時間 *</label>
              <input
                required
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring ${selectedPeriod !== 'custom' ? 'opacity-60' : ''}`}
              />
            </div>
          </div>
          {selectedPeriod !== 'custom' && (
            <p className="text-xs text-gray-400 -mt-2">
              時刻を変更すると自動的に「カスタム」に切り替わります。
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">教室 / 場所</label>
              <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">教員名</label>
              <input type="text" name="teacher" value={formData.teacher || ''} onChange={handleChange} className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">連絡事項・メモ</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={2} className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring" />
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-700 focus-ring">キャンセル</button>
            <button type="submit" className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-md hover:opacity-90 focus-ring">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
