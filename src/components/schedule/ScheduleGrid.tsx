import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getOrCreateCalendar, getEvents, createClassEvent } from '../../services/calendarApi';
import type { ClassEvent } from '../../types';
import ClassForm from '../forms/ClassForm';
import { format, startOfWeek, endOfWeek, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const ScheduleGrid: React.FC = () => {
  const { accessToken } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [weekStartPreference, setWeekStartPreference] = useState<0 | 1>(0); // 0: Sunday, 1: Monday

  useEffect(() => {
    const saved = localStorage.getItem('weekStart');
    setWeekStartPreference(saved === 'monday' ? 1 : 0);
  }, []);

  const fetchSchedule = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const calId = calendarId || await getOrCreateCalendar(accessToken);
      if (!calendarId) setCalendarId(calId);

      const start = startOfWeek(currentDate, { weekStartsOn: weekStartPreference });
      const end = endOfWeek(currentDate, { weekStartsOn: weekStartPreference });
      
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
  }, [currentDate, accessToken, weekStartPreference]);

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

  const start = startOfWeek(currentDate, { weekStartsOn: weekStartPreference });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(start, i));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentDate(addDays(currentDate, -7))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring" aria-label="先週">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-lg">
            {format(start, 'MMM d')} - {format(addDays(start, 6), 'MMM d, yyyy')}
          </span>
          <button onClick={() => setCurrentDate(addDays(currentDate, 7))} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring" aria-label="来週">
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
                <div className="text-xs text-gray-500 uppercase">{format(day, 'EEE')}</div>
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
