import { Folder, FileText, Mic, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  hasGroups: boolean;
  onOpenSidebar: () => void;
  onCreateGroup: () => void;
}

export function WelcomeScreen({ hasGroups, onOpenSidebar, onCreateGroup }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
          MeetingFlow
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          会議の記録・管理・AI要約を一元管理
        </p>

        {!hasGroups ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">はじめましょう</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              まずは会議グループを作成してください。
            </p>
            <button onClick={onCreateGroup} className="btn btn-primary w-full">
              グループを作成
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">グループを選択</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              サイドバーからグループを選んで、会議記録を確認・追加してください。
            </p>
            <button onClick={onOpenSidebar} className="btn btn-primary w-full lg:hidden">
              グループ一覧を開く
            </button>
          </div>
        )}

        <div className="mt-12 grid grid-cols-2 gap-4 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">グループ管理</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                会議を種類ごとに整理
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Mic className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">音声入力</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                話すだけで文字起こし
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">AI要約</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                議題・決定事項を自動抽出
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="font-medium text-sm">時系列ビュー</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                過去の会議を振り返り
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
