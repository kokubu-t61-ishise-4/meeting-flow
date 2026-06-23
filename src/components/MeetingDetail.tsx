import { useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Users,
  Edit2,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { type Meeting } from '../db/database';
import { generateSummary, getApiKey } from '../services/groq';

interface MeetingDetailProps {
  meeting: Meeting;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateSummary: (id: number, summary: string) => Promise<void>;
}

export function MeetingDetail({
  meeting,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  onEdit,
  onDelete,
  onUpdateSummary,
}: MeetingDetailProps) {
  const [regenerating, setRegenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'body'>('summary');

  const handleRegenerate = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      alert('Groq APIキーが設定されていません。設定画面から入力してください。');
      return;
    }

    setRegenerating(true);
    try {
      const newSummary = await generateSummary(meeting.body, apiKey);
      await onUpdateSummary(meeting.id!, newSummary);
    } catch (error) {
      alert(error instanceof Error ? error.message : '要約の再生成に失敗しました');
    } finally {
      setRegenerating(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('この会議記録を削除しますか？')) {
      onDelete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="btn-icon disabled:opacity-30"
              aria-label="前の会議"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-500">前回</span>
            <span className="text-sm text-gray-400 mx-2">|</span>
            <span className="text-sm text-gray-500">次回</span>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="btn-icon disabled:opacity-30"
              aria-label="次の会議"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onEdit} className="btn-icon" aria-label="編集">
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="btn-icon text-red-600"
              aria-label="削除"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="btn-icon" aria-label="閉じる">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-4">{meeting.title}</h2>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(meeting.date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {meeting.participants.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {meeting.participants.join(', ')}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'summary'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              AI要約
            </button>
            <button
              onClick={() => setActiveTab('body')}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === 'body'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              会議内容
            </button>
          </div>

          {activeTab === 'summary' && (
            <div>
              {meeting.summary ? (
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{meeting.summary}</ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>AI要約はまだ生成されていません</p>
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="btn btn-primary mt-4"
                  >
                    {regenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        生成中...
                      </>
                    ) : (
                      '要約を生成'
                    )}
                  </button>
                </div>
              )}
              {meeting.summary && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {regenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        再生成中...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        要約を再生成
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'body' && (
            <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {meeting.body}
            </div>
          )}

          {meeting.notes && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="text-sm font-semibold mb-2 text-gray-500 dark:text-gray-400">
                メモ・補足
              </h3>
              <p className="text-sm whitespace-pre-wrap">{meeting.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
