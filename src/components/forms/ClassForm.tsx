import React, { useState } from 'react';
import type { ClassEvent } from '../../types';
import { X } from 'lucide-react';

interface ClassFormProps {
  onClose: () => void;
  onSubmit: (event: ClassEvent) => void;
  initialData?: Partial<ClassEvent>;
}

const ClassForm: React.FC<ClassFormProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<Partial<ClassEvent>>(initialData || {
    subject: '',
    startTime: '09:00',
    endTime: '10:30',
    location: '',
    teacher: '',
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.startTime || !formData.endTime || !formData.startDate) return;
    onSubmit(formData as ClassEvent);
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
            <div>
              <label className="block text-sm font-medium mb-1">繰り返し設定 (RRULE)</label>
              <input type="text" name="recurrenceRule" placeholder="FREQ=WEEKLY" value={formData.recurrenceRule || ''} onChange={handleChange} className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">開始時間 *</label>
              <input required type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">終了時間 *</label>
              <input required type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full border rounded-md p-2 dark:bg-gray-800 dark:border-gray-700 focus-ring" />
            </div>
          </div>
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
