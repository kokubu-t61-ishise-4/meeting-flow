import { useState } from 'react';
import { Menu, Search, Settings, Moon, Sun, Monitor, X } from 'lucide-react';
import { useSearch, type SearchResult } from '../hooks/useSearch';

interface HeaderProps {
  onMenuClick: () => void;
  onSettingsClick: () => void;
  onLogoClick: () => void;
  themeMode: 'system' | 'light' | 'dark';
  onThemeChange: (mode: 'system' | 'light' | 'dark') => void;
  onMeetingSelect: (meeting: SearchResult) => void;
}

export function Header({
  onMenuClick,
  onSettingsClick,
  onLogoClick,
  themeMode,
  onThemeChange,
  onMeetingSelect,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { results, searching, search, clearResults } = useSearch();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search(query);
  };

  const handleResultClick = (result: SearchResult) => {
    onMeetingSelect(result);
    setSearchOpen(false);
    setSearchQuery('');
    clearResults();
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
    clearResults();
  };

  const themeIcons = {
    system: Monitor,
    light: Sun,
    dark: Moon,
  };
  const ThemeIcon = themeIcons[themeMode];
  const nextTheme: Record<'system' | 'light' | 'dark', 'system' | 'light' | 'dark'> = {
    system: 'light',
    light: 'dark',
    dark: 'system',
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onMenuClick}
            className="btn-icon lg:hidden"
            aria-label="メニュー"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={onLogoClick}
            className="text-xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            MeetingFlow
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="btn-icon"
            aria-label="検索"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={onSettingsClick}
            className="btn-icon"
            aria-label="設定"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => onThemeChange(nextTheme[themeMode])}
            className="btn-icon"
            aria-label="テーマ切替"
          >
            <ThemeIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="会議を検索..."
                className="flex-1 bg-transparent outline-none text-lg"
                autoFocus
              />
              <button onClick={closeSearch} className="btn-icon" aria-label="閉じる">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {searching && (
                <div className="p-4 text-center text-gray-500">検索中...</div>
              )}
              {!searching && searchQuery && results.length === 0 && (
                <div className="p-4 text-center text-gray-500">
                  該当する会議が見つかりません
                </div>
              )}
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="font-medium">{result.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span className="text-blue-600 dark:text-blue-400">
                      {result.groupName}
                    </span>
                    {' · '}
                    {new Date(result.date).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="text-sm text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                    {result.body.substring(0, 100)}...
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
