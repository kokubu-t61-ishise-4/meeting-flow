import { useState, useEffect } from 'react';
import { Plus, Folder, Edit2, Trash2, X } from 'lucide-react';
import { type MeetingGroup } from '../db/database';
import { db } from '../db/database';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  groups: MeetingGroup[];
  selectedGroupId: number | null;
  onSelectGroup: (id: number | null) => void;
  onAddGroup: (group: Omit<MeetingGroup, 'id' | 'createdAt'>) => Promise<number>;
  onUpdateGroup: (id: number, updates: Partial<MeetingGroup>) => Promise<void>;
  onDeleteGroup: (id: number) => Promise<void>;
}

interface GroupStats {
  count: number;
  lastDate: Date | null;
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export function Sidebar({
  isOpen,
  onClose,
  groups,
  selectedGroupId,
  onSelectGroup,
  onAddGroup,
  onUpdateGroup,
  onDeleteGroup,
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [newGroupColor, setNewGroupColor] = useState(COLORS[0]);
  const [groupStats, setGroupStats] = useState<Map<number, GroupStats>>(new Map());

  useEffect(() => {
    const loadStats = async () => {
      const stats = new Map<number, GroupStats>();
      for (const group of groups) {
        if (group.id === undefined) continue;
        const meetings = await db.meetings
          .where('groupId')
          .equals(group.id)
          .toArray();
        const sortedMeetings = meetings.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        stats.set(group.id, {
          count: meetings.length,
          lastDate: sortedMeetings.length > 0 ? new Date(sortedMeetings[0].date) : null,
        });
      }
      setGroupStats(stats);
    };
    loadStats();
  }, [groups]);

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    await onAddGroup({
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      color: newGroupColor,
    });
    setNewGroupName('');
    setNewGroupDescription('');
    setNewGroupColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setIsAdding(false);
  };

  const handleUpdateGroup = async (id: number) => {
    if (!newGroupName.trim()) return;
    await onUpdateGroup(id, {
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      color: newGroupColor,
    });
    setEditingId(null);
    setNewGroupName('');
    setNewGroupDescription('');
  };

  const startEditing = (group: MeetingGroup) => {
    setEditingId(group.id!);
    setNewGroupName(group.name);
    setNewGroupDescription(group.description);
    setNewGroupColor(group.color);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewGroupName('');
    setNewGroupDescription('');
    setIsAdding(false);
  };

  const handleDeleteGroup = async (id: number) => {
    if (window.confirm('このグループと含まれるすべての会議記録を削除しますか？')) {
      await onDeleteGroup(id);
      if (selectedGroupId === id) {
        onSelectGroup(null);
      }
    }
  };

  const sidebarContent = (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">会議グループ</h2>
          <button
            onClick={() => {
              setIsAdding(true);
              setNewGroupColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
            }}
            className="btn-icon text-blue-600 dark:text-blue-400"
            aria-label="グループを追加"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isAdding && (
          <div className="card p-3 mb-2">
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="グループ名"
              className="input mb-2"
              autoFocus
            />
            <input
              type="text"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              placeholder="説明（任意）"
              className="input mb-2"
            />
            <div className="flex gap-1 mb-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewGroupColor(color)}
                  className={`w-6 h-6 rounded-full ${
                    newGroupColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`色を選択: ${color}`}
                />
              ))}
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelEditing} className="btn btn-secondary text-sm py-1">
                キャンセル
              </button>
              <button onClick={handleAddGroup} className="btn btn-primary text-sm py-1">
                追加
              </button>
            </div>
          </div>
        )}

        {groups.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>グループがありません</p>
            <p className="text-sm">「+」ボタンで追加してください</p>
          </div>
        )}

        {groups.map((group) => {
          const stats = groupStats.get(group.id!);
          const isEditing = editingId === group.id;

          if (isEditing) {
            return (
              <div key={group.id} className="card p-3 mb-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="グループ名"
                  className="input mb-2"
                  autoFocus
                />
                <input
                  type="text"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="説明（任意）"
                  className="input mb-2"
                />
                <div className="flex gap-1 mb-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewGroupColor(color)}
                      className={`w-6 h-6 rounded-full ${
                        newGroupColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`色を選択: ${color}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={cancelEditing} className="btn btn-secondary text-sm py-1">
                    キャンセル
                  </button>
                  <button
                    onClick={() => handleUpdateGroup(group.id!)}
                    className="btn btn-primary text-sm py-1"
                  >
                    保存
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={group.id}
              className={`group flex items-start gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedGroupId === group.id
                  ? 'bg-blue-50 dark:bg-blue-900/30'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => onSelectGroup(group.id!)}
            >
              <div
                className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: group.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{group.name}</div>
                {group.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {group.description}
                  </div>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {stats ? `${stats.count}回の会議` : '0回の会議'}
                  {stats?.lastDate && (
                    <span className="ml-2">
                      最終: {stats.lastDate.toLocaleDateString('ja-JP')}
                    </span>
                  )}
                </div>
              </div>
              <div className="hidden group-hover:flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditing(group);
                  }}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  aria-label="編集"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteGroup(group.id!);
                  }}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded"
                  aria-label="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
        <p>データはブラウザに保存されます</p>
        <p className="mt-1 text-amber-600 dark:text-amber-400">
          ※プライベートモードでは永続化されません
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">会議グループ</h2>
              <button onClick={onClose} className="btn-icon" aria-label="閉じる">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
