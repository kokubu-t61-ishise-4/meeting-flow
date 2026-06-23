import Dexie, { type EntityTable } from 'dexie';

export interface MeetingGroup {
  id?: number;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
}

export interface Meeting {
  id?: number;
  groupId: number;
  title: string;
  date: Date;
  participants: string[];
  body: string;
  notes: string;
  summary: string;
  createdAt: Date;
  updatedAt: Date;
}

const db = new Dexie('MeetingFlowDB') as Dexie & {
  meetingGroups: EntityTable<MeetingGroup, 'id'>;
  meetings: EntityTable<Meeting, 'id'>;
};

db.version(1).stores({
  meetingGroups: '++id, name, createdAt',
  meetings: '++id, groupId, title, date, createdAt, updatedAt',
});

export { db };
