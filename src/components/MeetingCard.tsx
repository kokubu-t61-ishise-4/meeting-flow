import { Calendar, Users, FileText } from 'lucide-react';
import { type Meeting } from '../db/database';

interface MeetingCardProps {
  meeting: Meeting;
  onClick: () => void;
}

export function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const extractTopics = (summary: string): string[] => {
    const topicMatch = summary.match(/##\s*主な議題\s*([\s\S]*?)(?=##|$)/);
    if (!topicMatch) return [];

    const topicsSection = topicMatch[1];
    const topics = topicsSection
      .split('\n')
      .filter((line) => line.trim().startsWith('-'))
      .map((line) => line.replace(/^-\s*/, '').trim())
      .filter(Boolean)
      .slice(0, 3);

    return topics;
  };

  const topics = meeting.summary ? extractTopics(meeting.summary) : [];

  return (
    <div
      onClick={onClick}
      className="card p-4 cursor-pointer hover:shadow-lg transition-shadow border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{meeting.title}</h3>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(meeting.date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                weekday: 'short',
              })}
            </span>
            {meeting.participants.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {meeting.participants.slice(0, 3).join(', ')}
                {meeting.participants.length > 3 && ` 他${meeting.participants.length - 3}名`}
              </span>
            )}
          </div>

          {topics.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                <FileText className="w-3 h-3" />
                主な議題
              </div>
              <ul className="text-sm space-y-1">
                {topics.map((topic, i) => (
                  <li key={i} className="truncate text-gray-700 dark:text-gray-300">
                    • {topic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!meeting.summary && (
            <p className="mt-3 text-sm text-gray-400 dark:text-gray-500 line-clamp-2">
              {meeting.body.substring(0, 150)}...
            </p>
          )}
        </div>

        <button className="btn btn-secondary text-sm py-1 px-3 flex-shrink-0">
          詳細を見る
        </button>
      </div>
    </div>
  );
}
