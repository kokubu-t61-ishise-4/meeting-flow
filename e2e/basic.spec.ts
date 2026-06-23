import { test, expect } from '@playwright/test';

test.describe('MeetingFlow Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should load the app and show welcome screen', async ({ page }) => {
    await expect(page).toHaveTitle('MeetingFlow - 会議内容まとめ');
    await expect(page.getByRole('banner').getByRole('heading', { name: 'MeetingFlow' })).toBeVisible();
    await expect(page.getByText('会議の記録・管理・AI要約を一元管理')).toBeVisible();
  });

  test('should show "create group" prompt when no groups exist', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'グループを作成' })).toBeVisible();
  });

  test('should create a new meeting group', async ({ page }) => {
    // Use desktop sidebar
    const sidebar = page.locator('aside.hidden.lg\\:block');

    // Click add button in desktop sidebar
    await sidebar.locator('button[aria-label="グループを追加"]').click();

    // Fill in group details
    await page.locator('input[placeholder="グループ名"]').fill('テスト定例MTG');
    await page.locator('input[placeholder="説明（任意）"]').fill('テスト用のグループです');

    // Click add button (exact match)
    await page.getByRole('button', { name: '追加', exact: true }).click();

    // Verify group was created
    await expect(page.getByText('テスト定例MTG')).toBeVisible();
  });

  test('should open settings modal', async ({ page }) => {
    // Click settings button
    await page.locator('button[aria-label="設定"]').click();

    // Verify settings modal is open
    await expect(page.getByRole('heading', { name: 'Groq APIキー' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'データ管理' })).toBeVisible();
  });

  test('should toggle dark mode', async ({ page }) => {
    // Click theme toggle button multiple times to cycle through themes
    await page.locator('button[aria-label="テーマ切替"]').click();
    await page.locator('button[aria-label="テーマ切替"]').click();
    await page.locator('button[aria-label="テーマ切替"]').click();
    // Theme cycles: system -> light -> dark -> system
  });

  test('should open search modal', async ({ page }) => {
    await page.locator('button[aria-label="検索"]').click();
    await expect(page.locator('input[placeholder="会議を検索..."]')).toBeVisible();
  });

  test('should create a meeting after creating a group', async ({ page }) => {
    const sidebar = page.locator('aside.hidden.lg\\:block');

    // Create a group using the desktop sidebar
    await sidebar.locator('button[aria-label="グループを追加"]').click();
    await page.locator('input[placeholder="グループ名"]').fill('開発定例');
    await page.getByRole('button', { name: '追加', exact: true }).click();

    // Select the created group in desktop sidebar
    await sidebar.getByText('開発定例').click();

    // Wait for timeline to load
    await expect(page.locator('h2').filter({ hasText: '開発定例' })).toBeVisible();

    // Click new meeting button
    await page.getByRole('button', { name: /新しい会議/ }).click();

    // Fill meeting form
    await page.locator('input[placeholder="例: 第10回定例ミーティング"]').fill('第1回開発定例');
    await page.locator('textarea').first().fill('本日の議題：\n1. 進捗確認\n2. 課題共有\n\n決定事項：\n- 次回は来週月曜日に実施');

    // Save meeting
    await page.getByRole('button', { name: '保存' }).click();

    // Verify meeting was created (card should appear)
    await expect(page.getByText('第1回開発定例')).toBeVisible();
  });

  test('should show meeting detail when clicking on meeting card', async ({ page }) => {
    const sidebar = page.locator('aside.hidden.lg\\:block');

    // Create group using desktop sidebar
    await sidebar.locator('button[aria-label="グループを追加"]').click();
    await page.locator('input[placeholder="グループ名"]').fill('詳細テスト');
    await page.getByRole('button', { name: '追加', exact: true }).click();
    await sidebar.getByText('詳細テスト').click();

    await page.getByRole('button', { name: /新しい会議/ }).click();
    await page.locator('input[placeholder="例: 第10回定例ミーティング"]').fill('詳細確認用MTG');
    await page.locator('textarea').first().fill('テスト内容です');
    await page.getByRole('button', { name: '保存' }).click();

    // Click on the meeting card
    await page.getByRole('button', { name: '詳細を見る' }).click();

    // Verify detail modal is open
    await expect(page.locator('h2').filter({ hasText: '詳細確認用MTG' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI要約' })).toBeVisible();
    await expect(page.getByRole('button', { name: '会議内容' })).toBeVisible();
  });

  test('should export data', async ({ page }) => {
    // Open settings
    await page.locator('button[aria-label="設定"]').click();

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'エクスポート' }).click();
    const download = await downloadPromise;

    // Verify download started
    expect(download.suggestedFilename()).toContain('meetingflow-backup-');
    expect(download.suggestedFilename()).toContain('.json');
  });

  test('should delete a meeting group', async ({ page }) => {
    const sidebar = page.locator('aside.hidden.lg\\:block');

    // Create a group using desktop sidebar
    await sidebar.locator('button[aria-label="グループを追加"]').click();
    await page.locator('input[placeholder="グループ名"]').fill('削除テスト');
    await page.getByRole('button', { name: '追加', exact: true }).click();

    // Hover over the group in desktop sidebar and click delete
    const groupItem = sidebar.locator('.group').filter({ hasText: '削除テスト' });
    await groupItem.hover();

    // Accept the confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    await groupItem.locator('button[aria-label="削除"]').click();

    // Verify group was deleted
    await expect(sidebar.getByText('削除テスト')).not.toBeVisible();
  });
});
