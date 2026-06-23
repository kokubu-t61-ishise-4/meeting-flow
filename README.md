# MeetingFlow - 会議内容まとめアプリ

会議の記録・管理・AI要約を一元管理するWebアプリです。

## 機能

- **会議グループ管理**: 会議の種類ごとにグループを作成・整理
- **音声入力**: Web Speech APIによるリアルタイム文字起こし（日本語対応）
- **AI要約**: Groq API（Llama 3.3 70B）による自動要約
  - 主な議題
  - 各議題のサマリー
  - 決定事項
  - アクションアイテム
- **時系列ビュー**: 会議記録を時系列で閲覧
- **全文検索**: タイトル・本文・要約からキーワード検索
- **データ管理**: JSONエクスポート/インポートによるバックアップ
- **ダークモード**: システム設定に追従 + 手動切替
- **レスポンシブデザイン**: PC・スマホ対応

## 技術スタック

- React + TypeScript + Vite
- Tailwind CSS v3
- IndexedDB（Dexie.js）
- Groq API（llama-3.3-70b-versatile）
- Web Speech API

## ローカル開発

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# プレビュー
npm run preview
```

## Groq APIキーの設定

1. [Groq Console](https://console.groq.com/keys) でAPIキーを取得
2. アプリの設定画面（歯車アイコン）からAPIキーを入力
3. APIキーはブラウザのlocalStorageに保存されます

## デプロイ手順（Cloudflare Pages）

1. GitHubにリポジトリを作成してpush
2. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
3. Workers & Pages → Create → Pages → Connect to Git
4. リポジトリを選択し、以下を設定：
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`
5. Save and Deploy

## 注意事項

- データはブラウザのIndexedDBに保存されます
- プライベートブラウジングモードではデータは永続化されません
- 定期的なバックアップ（JSONエクスポート）をお勧めします
- 音声入力はChrome/Edgeで動作します（他ブラウザでは自動的にテキスト入力にフォールバック）

## ライセンス

MIT
