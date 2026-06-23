const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `あなたは会議内容を構造的に要約する優秀なアシスタントです。必ず日本語で回答してください。

以下のMarkdown形式で要約を出力してください：

## 主な議題
- 議題1：〇〇
- 議題2：〇〇

## 各議題のサマリー
### 議題1：〇〇
内容の要点...

### 議題2：〇〇
内容の要点...

## 決定事項
- 〇〇

## アクションアイテム
- 【担当者名】タスク内容（期限：〇〇）

※議題が1つしかない場合は、「各議題のサマリー」セクションを省略してください。
※決定事項やアクションアイテムがない場合は、「特になし」と記載してください。`;

export async function generateSummary(
  meetingBody: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Groq APIキーが設定されていません。設定画面からAPIキーを入力してください。');
  }

  if (!meetingBody.trim()) {
    throw new Error('会議内容が空です。');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `以下の会議内容を要約してください：\n\n${meetingBody}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 401) {
      throw new Error('APIキーが無効です。正しいGroq APIキーを設定してください。');
    }
    throw new Error(
      errorData.error?.message || `API呼び出しに失敗しました (${response.status})`
    );
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export function getApiKey(): string {
  return localStorage.getItem('meetingflow-groq-api-key') || '';
}

export function setApiKey(key: string): void {
  localStorage.setItem('meetingflow-groq-api-key', key);
}
