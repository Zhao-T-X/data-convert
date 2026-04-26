import { test, expect } from '@playwright/test';

test('loads main page and shows Transform header', async ({ page }) => {
  await page.goto('/');
  // Basic smoke check: heading text should appear
  const heading = await page.locator('h3').first().textContent();
  expect(heading).toContain('数据转换');
});

test('Step 2: paste JSON results in JSON output', async ({ page }) => {
  await page.goto('/');
  const json = JSON.stringify([{id:1, name:'Alice'},{id:2, name:'Bob'}]);
  // simulate paste by dispatching a paste event on the dropzone
  await page.evaluate((payload) => {
    const dz = document.querySelector('[data-testid="dropzone"]');
    const e = new Event('paste', { bubbles: true, cancelable: true });
    (e as any).clipboardData = {
      getData: () => payload
    };
    dz.dispatchEvent(e);
  }, json);
  // small wait for conversion
  await page.waitForTimeout(200);
  const out = await page.locator('[data-testid="output-text"]').textContent();
  expect(out).toContain('id');
  expect(out).toContain('Alice');
});

test('Step 3: switch to SQL and validate output', async ({ page }) => {
  await page.goto('/');
  // Paste JSON data first to have a valid input
  const json = '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]';
  await page.evaluate((payload) => {
    const dz = document.querySelector('[data-testid="dropzone"]');
    const e = new Event('paste', { bubbles: true, cancelable: true });
    (e as any).clipboardData = { getData: () => payload };
    dz.dispatchEvent(e);
  }, json);
  await page.waitForTimeout(200);
  // Now switch to SQL
  await page.locator('[data-testid="format-select"]').selectOption('sql');
  // small wait for conversion
  await page.waitForTimeout(200);
  const out = await page.locator('[data-testid="output-text"]').textContent();
  expect(out).toContain('INSERT INTO');
});

test('Step 4: CSV drop test', async ({ page }) => {
  await page.goto('/');
  const csv = 'name,age\nAlice,30\nBob,25\n';
  await page.evaluate(async (csv) => {
    const dz = document.querySelector('[data-testid="dropzone"]');
    const file = new File([csv], 'data.csv', { type: 'text/csv' });
    const dt = new DataTransfer();
    dt.items.add(file);
    const e = new DragEvent('drop', { dataTransfer: dt });
    dz.dispatchEvent(e);
  }, csv);
  await page.waitForTimeout(300);
  const out = await page.locator('[data-testid="output-text"]').textContent();
  expect(out).toContain('name');
});
