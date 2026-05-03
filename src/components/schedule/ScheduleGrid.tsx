import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrCreateCalendar, getEvents, createClassEvent } from '../../services/calendarApi';
import type { ClassEvent } from '../../types';
import ClassForm from '../forms/ClassForm';
import { format, startOfWeek, addDays, isSameDay, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

const ScheduleGrid: React.FC = () => {
  const { accessToken } = useAuth();
  const { settings } = useSettings();
  const weekStartPreference: 0 | 1 = settings.weekStart === 'monday' ? 1 : 0;
  const today = startOfDay(new Date());
  const [viewStartDate, setViewStartDate] = useState(today);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [calendarId, setCalendarId] = useState<string | null>(null);

  const fetchSchedule = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const calId = calendarId || await getOrCreateCalendar(accessToken);
      if (!calendarId) setCalendarId(calId);

      const start = viewStartDate;
      const end = addDays(viewStartDate, 7);
      
      const fetchedEvents = await getEvents(accessToken, calId, start, end);
      setEvents(fetchedEvents || []);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [viewStartDate, accessToken, weekStartPreference]);

  const handleAddClass = async (eventData: ClassEvent) => {
    if (!accessToken || !calendarId) return;
    try {
      await createClassEvent(accessToken, calendarId, eventData);
      setIsFormOpen(false);
      fetchSchedule(); // Refresh
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(viewStartDate, i));

  const handlePrev = () => {
    const w0 = startOfWeek(today, { weekStartsOn: weekStartPreference });
    const w1 = addDays(w0, 7);

    if (isSameDay(viewStartDate, w1) && !isSameDay(w0, today)) {
      setViewStartDate(today);
    } else if (isSameDay(viewStartDate, today) && !isSameDay(w0, today)) {
      setViewStartDate(w0);
    } else {
      setViewStartDate(addDays(viewStartDate, -7));
    }
  };

  const handleNext = () => {
    const w0 = startOfWeek(today, { weekStartsOn: weekStartPreference });
    const w1 = addDays(w0, 7);

    if (isSameDay(viewStartDate, w0) && !isSameDay(w0, today)) {
      setViewStartDate(today);
    } else if (isSameDay(viewStartDate, today) && !isSameDay(w0, today)) {
      setViewStartDate(w1);
    } else {
      setViewStartDate(addDays(viewStartDate, 7));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={handlePrev} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring" aria-label="先週">
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="font-medium text-base sm:text-lg whitespace-nowrap">
              {format(viewStartDate, 'yyyy年M月d日', { locale: ja })} - {format(addDays(viewStartDate, 6), 'M月d日', { locale: ja })}
            </span>
            <button 
              onClick={() => setViewStartDate(today)}
              className="ml-2 flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors focus-ring"
              title="今日から1週間"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>今日</span>
            </button>
          </div>

          <button onClick={handleNext} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring" aria-label="来週">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 focus-ring"
        >
          <Plus className="w-4 h-4" />
          <span>授業を追加</span>
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px] border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          <div className="grid grid-cols-8 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="p-3 text-center border-r border-gray-200 dark:border-gray-800 font-medium text-sm text-gray-500">
              時間
            </div>
            {weekDays.map(day => (
              <div key={day.toString()} className="p-3 text-center border-r last:border-r-0 border-gray-200 dark:border-gray-800">
                <div className="text-xs text-gray-500 uppercase">{format(day, 'E', { locale: ja })}</div>
                <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-[var(--accent-color)] font-bold' : 'font-medium'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          <div className="relative bg-white dark:bg-gray-950 min-h-[500px]">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10">
                <span>読み込み中...</span>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-8 gap-2">
                <div className="col-span-1 border-r pr-2 border-gray-100 dark:border-gray-800 space-y-8 text-xs text-gray-400 text-right">
                  {/* Simplistic time slots */}
                  <div>09:00</div>
                  <div>10:00</div>
                  <div>11:00</div>
                  <div>12:00</div>
                  <div>13:00</div>
                  <div>14:00</div>
                  <div>15:00</div>
                  <div>16:00</div>
                </div>
                {weekDays.map((day, i) => (
                  <div key={i} className="col-span-1 relative min-h-[400px]">
                    {events.filter(e => isSameDay(new Date(e.start.dateTime || e.start.date), day)).map((event, j) => (
                      <div key={j} className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md text-sm">
                        <div className="font-semibold truncate">{event.summary}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(event.start.dateTime), 'HH:mm')} - {format(new Date(event.end.dateTime), 'HH:mm')}
                        </div>
                        {event.location && <div className="text-xs mt-1 truncate">📍 {event.location}</div>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isFormOpen && (
        <ClassForm 
          onClose={() => setIsFormOpen(false)} 
          onSubmit={handleAddClass}
        />
      )}
    </div>
  );
};

export default ScheduleGrid;
