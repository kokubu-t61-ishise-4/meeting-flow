import { useState, useCallback } from 'react';
import { db, type Meeting } from '../db/database';

export interface SearchResult extends Meeting {
  groupName: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const normalizedQuery = query.toLowerCase();
      const allMeetings = await db.meetings.toArray();
      const allGroups = await db.meetingGroups.toArray();

      const groupMap = new Map(allGroups.map((g) => [g.id, g.name]));

      const filtered = allMeetings
        .filter((meeting) => {
          const titleMatch = meeting.title.toLowerCase().includes(normalizedQuery);
          const bodyMatch = meeting.body.toLowerCase().includes(normalizedQuery);
          const summaryMatch = meeting.summary.toLowerCase().includes(normalizedQuery);
          const participantsMatch = meeting.participants.some((p) =>
            p.toLowerCase().includes(normalizedQuery)
          );
          return titleMatch || bodyMatch || summaryMatch || participantsMatch;
        })
        .map((meeting) => ({
          ...meeting,
          groupName: groupMap.get(meeting.groupId) || '不明なグループ',
        }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setResults(filtered);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return { results, searching, search, clearResults };
}
