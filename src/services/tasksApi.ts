import type { TaskItem } from '../types';

const TASKS_API_BASE = 'https://www.googleapis.com/tasks/v1';
const TASK_LIST_TITLE = 'My University Tasks';

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

export async function getOrCreateTaskList(token: string): Promise<string> {
  const listData = await fetchWithAuth(`${TASKS_API_BASE}/users/@me/lists`, {}, token);
  const taskList = listData.items?.find((item: any) => item.title === TASK_LIST_TITLE);
  
  if (taskList) {
    return taskList.id;
  }

  const createData = await fetchWithAuth(`${TASKS_API_BASE}/users/@me/lists`, {
    method: 'POST',
    body: JSON.stringify({ title: TASK_LIST_TITLE }),
  }, token);

  return createData.id;
}

export async function createTask(token: string, taskListId: string, task: TaskItem, dueTimeStr?: string) {
  // Tasks API doesn't support time. Format the notes with the time.
  const notesPrefix = dueTimeStr ? `[${dueTimeStr}締切]\n` : '';
  const finalNotes = `${notesPrefix}${task.notes || ''}`;

  // due must be RFC 3339 timestamp with mandatory time offset, typically 00:00:00.000Z
  const dueObj = new Date(task.dueDate);
  
  const payload = {
    title: task.title,
    notes: finalNotes,
    due: dueObj.toISOString(),
  };

  return fetchWithAuth(`${TASKS_API_BASE}/lists/${taskListId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
}
