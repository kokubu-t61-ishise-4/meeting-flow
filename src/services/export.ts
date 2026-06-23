import { db, type MeetingGroup, type Meeting } from '../db/database';

export interface ExportData {
  version: string;
  exportedAt: string;
  meetingGroups: MeetingGroup[];
  meetings: Meeting[];
}

export async function exportData(): Promise<void> {
  const meetingGroups = await db.meetingGroups.toArray();
  const meetings = await db.meetings.toArray();

  const data: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    meetingGroups,
    meetings,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().split('T')[0];
  a.download = `meetingflow-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(
  file: File,
  mode: 'merge' | 'overwrite'
): Promise<{ groups: number; meetings: number }> {
  const text = await file.text();
  const data: ExportData = JSON.parse(text);

  if (!data.version || !data.meetingGroups || !data.meetings) {
    throw new Error('無効なバックアップファイルです。');
  }

  if (mode === 'overwrite') {
    await db.transaction('rw', [db.meetingGroups, db.meetings], async () => {
      await db.meetingGroups.clear();
      await db.meetings.clear();

      for (const group of data.meetingGroups) {
        await db.meetingGroups.add({
          ...group,
          createdAt: new Date(group.createdAt),
        });
      }

      for (const meeting of data.meetings) {
        await db.meetings.add({
          ...meeting,
          date: new Date(meeting.date),
          createdAt: new Date(meeting.createdAt),
          updatedAt: new Date(meeting.updatedAt),
        });
      }
    });
  } else {
    const existingGroups = await db.meetingGroups.toArray();
    const existingGroupNames = new Set(existingGroups.map((g) => g.name));

    const groupIdMap = new Map<number, number>();

    await db.transaction('rw', [db.meetingGroups, db.meetings], async () => {
      for (const group of data.meetingGroups) {
        if (!existingGroupNames.has(group.name)) {
          const oldId = group.id;
          const newId = await db.meetingGroups.add({
            name: group.name,
            description: group.description,
            color: group.color,
            createdAt: new Date(group.createdAt),
          });
          if (oldId !== undefined) {
            groupIdMap.set(oldId, newId as number);
          }
        } else {
          const existing = existingGroups.find((g) => g.name === group.name);
          if (existing?.id !== undefined && group.id !== undefined) {
            groupIdMap.set(group.id, existing.id);
          }
        }
      }

      for (const meeting of data.meetings) {
        const newGroupId = groupIdMap.get(meeting.groupId);
        if (newGroupId !== undefined) {
          await db.meetings.add({
            groupId: newGroupId,
            title: meeting.title,
            date: new Date(meeting.date),
            participants: meeting.participants,
            body: meeting.body,
            notes: meeting.notes,
            summary: meeting.summary,
            createdAt: new Date(meeting.createdAt),
            updatedAt: new Date(meeting.updatedAt),
          });
        }
      }
    });
  }

  return {
    groups: data.meetingGroups.length,
    meetings: data.meetings.length,
  };
}
