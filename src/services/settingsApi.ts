import type { AppSettings } from '../contexts/SettingsContext.tsx';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';
const SETTINGS_FILENAME = 'univ-schedule-settings.json';

async function findSettingsFile(token: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${SETTINGS_FILENAME}' and trashed=false`);
  const res = await fetch(
    `${DRIVE_API_BASE}/files?spaces=appDataFolder&q=${query}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error('Failed to search settings file');
  const data = await res.json();
  return data.files?.length > 0 ? data.files[0].id : null;
}

export async function syncSettingsFromDrive(token: string): Promise<AppSettings | null> {
  const fileId = await findSettingsFile(token);
  if (!fileId) return null;

  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to download settings file');
  return (await res.json()) as AppSettings;
}

export async function saveSettingsToDrive(token: string, settings: AppSettings): Promise<void> {
  const body = JSON.stringify(settings);
  const fileId = await findSettingsFile(token);

  if (fileId) {
    // Update existing file
    await fetch(`${UPLOAD_API_BASE}/files/${fileId}?uploadType=media`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    });
  } else {
    // Create new file in appDataFolder
    const metadata = {
      name: SETTINGS_FILENAME,
      parents: ['appDataFolder'],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([body], { type: 'application/json' }));

    await fetch(`${UPLOAD_API_BASE}/files?uploadType=multipart`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  }
}
