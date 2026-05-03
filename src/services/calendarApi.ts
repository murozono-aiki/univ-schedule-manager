import type { ClassEvent } from '../types';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';
const CALENDAR_SUMMARY = 'My University Schedule';

async function fetchWithAuth(url: string, options: RequestInit, token: string) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'API request failed');
  }
  return response.json();
}

export async function getOrCreateCalendar(token: string): Promise<string> {
  // 1. Check if calendar exists
  const listData = await fetchWithAuth(`${CALENDAR_API_BASE}/users/me/calendarList`, {}, token);
  const calendar = listData.items.find((item: any) => item.summary === CALENDAR_SUMMARY);
  
  if (calendar) {
    return calendar.id;
  }

  // 2. Create if not exists
  const createData = await fetchWithAuth(`${CALENDAR_API_BASE}/calendars`, {
    method: 'POST',
    body: JSON.stringify({ summary: CALENDAR_SUMMARY, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
  }, token);

  return createData.id;
}

export async function getEvents(token: string, calendarId: string, timeMin: Date, timeMax: Date) {
  const params = new URLSearchParams({
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: 'true', // Expand recurring events
    orderBy: 'startTime',
  });
  
  const data = await fetchWithAuth(`${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`, {}, token);
  return data.items;
}

export async function createClassEvent(token: string, calendarId: string, event: ClassEvent) {
  // Combine date and time
  const startDateTime = `${event.startDate}T${event.startTime}:00`;
  const endDateTime = `${event.startDate}T${event.endTime}:00`;

  const descriptionParts = [];
  if (event.teacher) descriptionParts.push(`Teacher: ${event.teacher}`);
  if (event.notes) descriptionParts.push(`Notes: ${event.notes}`);

  const payload: any = {
    summary: event.subject,
    location: event.location,
    description: descriptionParts.join('\n'),
    start: {
      dateTime: startDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endDateTime,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  if (event.recurrenceRule) {
    payload.recurrence = [`RRULE:${event.recurrenceRule}`];
  }

  return fetchWithAuth(`${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}

export async function updateSingleEventInstance(token: string, calendarId: string, eventId: string, payload: any) {
  return fetchWithAuth(`${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  }, token);
}
