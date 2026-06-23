import { useState, useEffect, useCallback } from 'react';
import { db, type MeetingGroup } from '../db/database';

export function useMeetingGroups() {
  const [groups, setGroups] = useState<MeetingGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGroups = useCallback(async () => {
    try {
      const allGroups = await db.meetingGroups.orderBy('createdAt').reverse().toArray();
      setGroups(allGroups);
    } catch (error) {
      console.error('Failed to load meeting groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const addGroup = async (group: Omit<MeetingGroup, 'id' | 'createdAt'>): Promise<number> => {
    const newGroup: MeetingGroup = {
      ...group,
      createdAt: new Date(),
    };
    const id = await db.meetingGroups.add(newGroup);
    await loadGroups();
    return id as number;
  };

  const updateGroup = async (id: number, updates: Partial<MeetingGroup>) => {
    await db.meetingGroups.update(id, updates);
    await loadGroups();
  };

  const deleteGroup = async (id: number) => {
    await db.transaction('rw', [db.meetingGroups, db.meetings], async () => {
      await db.meetings.where('groupId').equals(id).delete();
      await db.meetingGroups.delete(id);
    });
    await loadGroups();
  };

  return { groups, loading, addGroup, updateGroup, deleteGroup, reload: loadGroups };
}
