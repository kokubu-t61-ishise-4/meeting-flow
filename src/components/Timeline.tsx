import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, FileText } from 'lucide-react';
import { type Meeting, type MeetingGroup } from '../db/database';
import { MeetingCard } from './MeetingCard';
import { MeetingDetail } from './MeetingDetail';
import { MeetingForm } from './MeetingForm';

interface TimelineProps {
  group: MeetingGroup;
  meetings: Meeting[];
  onAddMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<number>;
  onUpdateMeeting: (id: number, updates: Partial<Meeting>) => Promise<void>;
  onDeleteMeeting: (id: number) => Promise<void>;
  onOpenSettings: () => void;
}

const ITEMS_PER_PAGE = 5;

export function Timeline({
  group,
  meetings,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onOpenSettings,
}: TimelineProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedMeetingIndex, setSelectedMeetingIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const totalPages = Math.ceil(meetings.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const visibleMeetings = meetings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleMeetingClick = (index: number) => {
    setSelectedMeetingIndex(startIndex + index);
  };

  const handlePreviousMeeting = () => {
    if (selectedMeetingIndex !== null && selectedMeetingIndex < meetings.length - 1) {
      setSelectedMeetingIndex(selectedMeetingIndex + 1);
    }
  };

  const handleNextMeeting = () => {
    if (selectedMeetingIndex !== null && selectedMeetingIndex > 0) {
      setSelectedMeetingIndex(selectedMeetingIndex - 1);
    }
  };

  const handleEditMeeting = () => {
    if (selectedMeetingIndex !== null) {
      setEditingMeeting(meetings[selectedMeetingIndex]);
      setSelectedMeetingIndex(null);
      setShowForm(true);
    }
  };

  const handleDeleteMeeting = async () => {
    if (selectedMeetingIndex !== null) {
      const meetingId = meetings[selectedMeetingIndex].id;
      if (meetingId) {
        await onDeleteMeeting(meetingId);
        setSelectedMeetingIndex(null);
      }
    }
  };

  const handleUpdateSummary = async (id: number, summary: string) => {
    await onUpdateMeeting(id, { summary });
  };

  const handleSaveMeeting = async (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingMeeting?.id) {
      await onUpdateMeeting(editingMeeting.id, meeting);
      setEditingMeeting(null);
      setShowForm(false);
    } else {
      await onAddMeeting(meeting);
      setShowForm(false);
    }
    return 0;
  };

  const handleCancelEdit = () => {
    setEditingMeeting(null);
    setShowForm(false);
  };

  const selectedMeeting = selectedMeetingIndex !== null ? meetings[selectedMeetingIndex] : null;

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: group.color }}
          />
          <h2 className="text-2xl font-bold">{group.name}</h2>
        </div>
        <button
          onClick={() => {
            setEditingMeeting(null);
            setShowForm(!showForm);
          }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新しい会議</span>
        </button>
      </div>

      {group.description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6">{group.description}</p>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <MeetingForm
            groupId={group.id!}
            onSave={handleSaveMeeting}
            onOpenSettings={onOpenSettings}
            editingMeeting={editingMeeting}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      )}

      {/* Pagination */}
      {meetings.length > 0 && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            前のページ
          </button>
          <span className="text-sm text-gray-500">
            {currentPage + 1} / {totalPages || 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30"
          >
            次のページ
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Meeting List */}
      {meetings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">まだ会議記録がありません</p>
          <p className="text-sm mt-2">「新しい会議」ボタンで記録を追加してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleMeetings.map((meeting, index) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onClick={() => handleMeetingClick(index)}
            />
          ))}
        </div>
      )}

      {/* Meeting Detail Modal */}
      {selectedMeeting && selectedMeetingIndex !== null && (
        <MeetingDetail
          meeting={selectedMeeting}
          onClose={() => setSelectedMeetingIndex(null)}
          onPrevious={handlePreviousMeeting}
          onNext={handleNextMeeting}
          hasPrevious={selectedMeetingIndex < meetings.length - 1}
          hasNext={selectedMeetingIndex > 0}
          onEdit={handleEditMeeting}
          onDelete={handleDeleteMeeting}
          onUpdateSummary={handleUpdateSummary}
        />
      )}
    </div>
  );
}
