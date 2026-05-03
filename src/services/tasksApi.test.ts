import { describe, it, expect, vi } from 'vitest';
import { createTask } from './tasksApi';

// Mock fetch
globalThis.fetch = vi.fn() as any;

describe('Tasks API', () => {
  it('appends the time correctly to the notes field', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ id: '123' })
    });

    await createTask('fake-token', 'list-id', {
      title: 'Math Homework',
      notes: 'Page 42',
      dueDate: '2026-05-10',
      status: 'needsAction'
    }, '23:59');

    expect(globalThis.fetch).toHaveBeenCalled();
    const mockCallArgs = (globalThis.fetch as any).mock.calls[0];
    const fetchOptions = mockCallArgs[1];
    const bodyObj = JSON.parse(fetchOptions.body);
    
    expect(bodyObj.notes).toBe('[23:59締切]\nPage 42');
  });
});
