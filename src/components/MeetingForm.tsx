import { useState, useEffect } from 'react';
import { Mic, MicOff, Save, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { generateSummary, getApiKey } from '../services/groq';
import { type Meeting } from '../db/database';

interface MeetingFormProps {
  groupId: number;
  onSave: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  onOpenSettings: () => void;
  editingMeeting?: Meeting | null;
  onCancelEdit?: () => void;
}

export function MeetingForm({
  groupId,
  onSave,
  onOpenSettings,
  editingMeeting,
  onCancelEdit,
}: MeetingFormProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [participants, setParticipants] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const {
    isSupported: speechSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    setTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    if (editingMeeting) {
      setTitle(editingMeeting.title);
      setDate(new Date(editingMeeting.date).toISOString().slice(0, 16));
      setParticipants(editingMeeting.participants.join(', '));
      setBody(editingMeeting.body);
      setNotes(editingMeeting.notes);
      setSummary(editingMeeting.summary);
    } else {
      resetForm();
    }
  }, [editingMeeting]);

  useEffect(() => {
    if (transcript) {
      setBody((prev) => prev + transcript);
      setTranscript('');
    }
  }, [transcript, setTranscript]);

  const resetForm = () => {
    setTitle('');
    setDate(new Date().toISOString().slice(0, 16));
    setParticipants('');
    setBody('');
    setNotes('');
    setSummary('');
    setError('');
  };

  const handleGenerateSummary = async () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      setError('Groq APIキーが設定されていません。設定画面から入力してください。');
      return;
    }

    if (!body.trim()) {
      setError('会議内容を入力してください。');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const result = await generateSummary(body, apiKey);
      setSummary(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI要約の生成に失敗しました');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('タイトルを入力してください。');
      return;
    }
    if (!body.trim()) {
      setError('会議内容を入力してください。');
      return;
    }

    setSaving(true);
    setError('');
    try {
      let finalSummary = summary;
      if (!finalSummary && getApiKey()) {
        try {
          finalSummary = await generateSummary(body, getApiKey());
        } catch {
          // Ignore summary generation error on save
        }
      }

      await onSave({
        groupId,
        title: title.trim(),
        date: new Date(date),
        participants: participants
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
        body: body.trim(),
        notes: notes.trim(),
        summary: finalSummary,
      });

      if (!editingMeeting) {
        resetForm();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">
        {editingMeeting ? '会議を編集' : '新しい会議を記録'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-red-700 dark:text-red-300 text-sm">
            {error}
            {error.includes('APIキー') && (
              <button
                onClick={onOpenSettings}
                className="ml-2 underline hover:no-underline"
              >
                設定を開く
              </button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">タイトル *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 第10回定例ミーティング"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">日時 *</label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">参加者（カンマ区切り）</label>
          <input
            type="text"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            placeholder="例: 山田, 田中, 佐藤"
            className="input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">会議内容 *</label>
            {speechSupported && (
              <button
                onClick={toggleRecording}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    録音停止
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    音声入力
                  </>
                )}
              </button>
            )}
          </div>
          <textarea
            value={body + interimTranscript}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              speechSupported
                ? 'テキストを入力するか、音声入力ボタンで録音してください...'
                : '会議内容を入力してください...'
            }
            className="input min-h-[200px] resize-y"
            rows={8}
          />
          {isListening && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              録音中...
            </p>
          )}
          {!speechSupported && (
            <p className="text-sm text-gray-500 mt-1">
              ※このブラウザは音声入力に対応していません
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">メモ・補足（任意）</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="追加のメモや補足情報..."
            className="input"
            rows={3}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">AI要約</label>
            <button
              onClick={handleGenerateSummary}
              disabled={generating || !body.trim()}
              className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  {summary ? '再生成' : '要約を生成'}
                </>
              )}
            </button>
          </div>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="保存時に自動生成されます（APIキー設定時）"
            className="input min-h-[120px] resize-y bg-gray-50 dark:bg-gray-900"
            rows={5}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          {editingMeeting && onCancelEdit && (
            <button onClick={onCancelEdit} className="btn btn-secondary">
              キャンセル
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
