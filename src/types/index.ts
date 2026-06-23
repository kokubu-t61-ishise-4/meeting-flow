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

export interface AppSettings {
  groqApiKey: string;
  darkMode: 'system' | 'light' | 'dark';
}

export interface ExportData {
  version: string;
  exportedAt: string;
  meetingGroups: MeetingGroup[];
  meetings: Meeting[];
}
