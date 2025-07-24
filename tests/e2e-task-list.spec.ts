import { test, expect } from '@playwright/test';

// E2E: List Management

test.describe('List Management', () => {
  test('Create List', async ({ page }) => {
    await page.goto('/lists');
    await page.getByRole('button', { name: /add list/i }).click();
    await page.getByLabel('List Name').fill('My New List');
    await page.getByRole('button', { name: /submit|save/i }).click();
    await expect(page.getByText('My New List')).toBeVisible();
  });

  test('Edit List', async ({ page }) => {
    await page.goto('/lists');
    await page.getByText('My New List').click();
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel('List Name').fill('Updated List');
    await page.getByRole('button', { name: /submit|save/i }).click();
    await expect(page.getByText('Updated List')).toBeVisible();
  });

  test('Delete List', async ({ page }) => {
    await page.goto('/lists');
    await page.getByText('Updated List').click();
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText('Updated List')).not.toBeVisible();
  });
});

// E2E: Task Management

test.describe('Task Management', () => {
  test('Create Task', async ({ page }) => {
    await page.goto('/lists');
    await page.getByText('My New List').click();
    await page.getByRole('button', { name: /add task/i }).click();
    await page.getByLabel('Task Name').fill('My New Task');
    await page.getByLabel('Deadline').fill('2025-07-30');
    await page.getByRole('button', { name: /submit|save/i }).click();
    await expect(page.getByText('My New Task')).toBeVisible();
  });

  test('Edit Task', async ({ page }) => {
    await page.goto('/lists');
    await page.getByText('My New List').click();
    await page.getByText('My New Task').click();
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel('Task Name').fill('Updated Task');
    await page.getByRole('button', { name: /submit|save/i }).click();
    await expect(page.getByText('Updated Task')).toBeVisible();
  });

  test('Delete Task', async ({ page }) => {
    await page.goto('/lists');
    await page.getByText('My New List').click();
    await page.getByText('Updated Task').click();
    await page.getByRole('button', { name: /delete/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();
    await expect(page.getByText('Updated Task')).not.toBeVisible();
  });

  test('Toggle Task Complete', async ({ page }) => {
    await page.goto('/lists');
    await page.getByText('My New List').click();
    await page.getByText('My New Task').click();
    await page.getByRole('checkbox', { name: /complete/i }).check();
    await expect(page.getByText('My New Task')).toHaveClass(/completed/);
    await page.getByRole('checkbox', { name: /complete/i }).uncheck();
    await expect(page.getByText('My New Task')).not.toHaveClass(/completed/);
  });

  test('Sort Tasks by Deadline', async ({ page }) => {
    await page.goto('/lists');
    await page.getByText('My New List').click();
    await page.getByRole('button', { name: /sort by deadline/i }).click();
    // Add assertion for sorted order if possible
  });

  test('View Tasks Due This Week', async ({ page }) => {
    await page.goto('/lists');
    await page.getByText('My New List').click();
    await page.getByRole('button', { name: /due this week/i }).click();
    // Add assertion for filtered tasks if possible
  });
});
