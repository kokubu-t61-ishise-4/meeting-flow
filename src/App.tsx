import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Timeline } from './components/Timeline';
import { Settings } from './components/Settings';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useMeetingGroups } from './hooks/useMeetingGroups';
import { useMeetings } from './hooks/useMeetings';
import { useTheme } from './hooks/useTheme';
import { type SearchResult } from './hooks/useSearch';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);

  const { themeMode, setTheme } = useTheme();
  const { groups, loading: groupsLoading, addGroup, updateGroup, deleteGroup } = useMeetingGroups();
  const { meetings, addMeeting, updateMeeting, deleteMeeting } = useMeetings(selectedGroupId);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  useEffect(() => {
    if (!groupsLoading && groups.length > 0 && selectedGroupId === null) {
      setSelectedGroupId(groups[0].id!);
    }
  }, [groups, groupsLoading, selectedGroupId]);

  const handleSelectGroup = (id: number | null) => {
    setSelectedGroupId(id);
    setSidebarOpen(false);
  };

  const handleMeetingSelect = (meeting: SearchResult) => {
    setSelectedGroupId(meeting.groupId);
  };

  const handleDeleteGroup = async (id: number) => {
    await deleteGroup(id);
    if (selectedGroupId === id) {
      setSelectedGroupId(groups.length > 1 ? groups.find(g => g.id !== id)?.id ?? null : null);
    }
  };

  if (groupsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header
        onMenuClick={() => setSidebarOpen(true)}
        onSettingsClick={() => setSettingsOpen(true)}
        themeMode={themeMode}
        onThemeChange={setTheme}
        onMeetingSelect={handleMeetingSelect}
      />

      <div className="flex-1 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={handleSelectGroup}
          onAddGroup={addGroup}
          onUpdateGroup={updateGroup}
          onDeleteGroup={handleDeleteGroup}
        />

        <main className="flex-1 flex flex-col min-w-0">
          {selectedGroup ? (
            <Timeline
              group={selectedGroup}
              meetings={meetings}
              onAddMeeting={addMeeting}
              onUpdateMeeting={updateMeeting}
              onDeleteMeeting={deleteMeeting}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          ) : (
            <WelcomeScreen
              hasGroups={groups.length > 0}
              onOpenSidebar={() => setSidebarOpen(true)}
            />
          )}
        </main>
      </div>

      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
    </div>
  );
}

export default App;
