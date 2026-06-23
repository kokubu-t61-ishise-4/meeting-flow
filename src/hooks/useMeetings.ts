import { useState, useEffect, useCallback } from 'react';
import { db, type Meeting } from '../db/database';

export function useMeetings(groupId: number | null) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeetings = useCallback(async () => {
    if (groupId === null) {
      setMeetings([]);
      setLoading(false);
      return;
    }
    try {
      const allMeetings = await db.meetings
        .where('groupId')
        .equals(groupId)
        .reverse()
        .sortBy('date');
      setMeetings(allMeetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.error('Failed to load meetings:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadMeetings();
  }, [loadMeetings]);

  const addMeeting = async (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> => {
    const now = new Date();
    const newMeeting: Meeting = {
      ...meeting,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.meetings.add(newMeeting);
    await loadMeetings();
    return id as number;
  };

  const updateMeeting = async (id: number, updates: Partial<Meeting>) => {
    await db.meetings.update(id, { ...updates, updatedAt: new Date() });
    await loadMeetings();
  };

  const deleteMeeting = async (id: number) => {
    await db.meetings.delete(id);
    await loadMeetings();
  };

  const getMeetingCount = async (groupId: number) => {
    return await db.meetings.where('groupId').equals(groupId).count();
  };

  const getLastMeetingDate = async (groupId: number) => {
    const meetings = await db.meetings
      .where('groupId')
      .equals(groupId)
      .reverse()
      .sortBy('date');
    return meetings.length > 0 ? meetings[0].date : null;
  };

  return {
    meetings,
    loading,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    reload: loadMeetings,
    getMeetingCount,
    getLastMeetingDate,
  };
}
