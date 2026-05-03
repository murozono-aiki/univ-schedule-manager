export interface ClassEvent {
  id?: string;
  subject: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
  teacher?: string;
  notes?: string;
  recurrenceRule?: string; // RRULE string
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status?: 'cancelled' | 'confirmed';
}

export interface TaskItem {
  id?: string;
  title: string;
  notes?: string;
  dueDate: string; // YYYY-MM-DD
  status: 'needsAction' | 'completed';
}
