import { useState, useRef } from 'react';
import { X, Key, Download, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/groq';
import { exportData, importData } from '../services/export';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [apiKey, setApiKeyState] = useState(getApiKey());
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveApiKey = () => {
    setApiKey(apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportData();
    } catch (error) {
      alert('エクスポートに失敗しました');
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mode = window.confirm(
      '既存のデータをどうしますか？\n\nOK: 上書き（既存データを削除）\nキャンセル: マージ（既存データと統合）'
    )
      ? 'overwrite'
      : 'merge';

    setImporting(true);
    setImportResult(null);
    try {
      const result = await importData(file, mode as 'merge' | 'overwrite');
      setImportResult({
        success: true,
        message: `インポート完了: ${result.groups}グループ、${result.meetings}件の会議`,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'インポートに失敗しました',
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold">設定</h2>
          <button onClick={onClose} className="btn-icon" aria-label="閉じる">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* API Key Section */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Key className="w-5 h-5" />
              Groq APIキー
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              AI要約機能を使用するには、Groq APIキーが必要です。
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
              >
                Groq Consoleで取得
              </a>
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKeyState(e.target.value)}
                placeholder="gsk_..."
                className="input flex-1"
              />
              <button
                onClick={handleSaveApiKey}
                className="btn btn-primary flex items-center gap-1"
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    保存済
                  </>
                ) : (
                  '保存'
                )}
              </button>
            </div>
          </div>

          {/* Data Management Section */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
              <Download className="w-5 h-5" />
              データ管理
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              データをJSONファイルとしてエクスポート・インポートできます。
              バックアップや別ブラウザへの移行にご利用ください。
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                disabled={exporting}
                className="btn btn-secondary flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    エクスポート中...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    エクスポート
                  </>
                )}
              </button>
              <button
                onClick={handleImportClick}
                disabled={importing}
                className="btn btn-secondary flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    インポート中...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    インポート
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {importResult && (
              <div
                className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                  importResult.success
                    ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}
              >
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-sm">{importResult.message}</span>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="mb-2">
              <strong>注意事項:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>データはブラウザのIndexedDBに保存されます</li>
              <li>プライベートブラウジングモードではデータは永続化されません</li>
              <li>ブラウザのデータを消去すると、会議記録も削除されます</li>
              <li>定期的なバックアップをお勧めします</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
