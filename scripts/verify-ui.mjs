import { chromium, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { Decimal } from 'decimal.js';

const baseURL = process.env.CLICKER_URL ?? 'http://127.0.0.1:5173';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
const errors = [];
const monitor = page => {
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
};
const waitForScene = async page => {
  await expect(page.locator('.canvas-host canvas')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.loading-scene')).toHaveCount(0);
};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const page = await context.newPage(); monitor(page);
  await page.goto(baseURL); await waitForScene(page);
  await page.screenshot({ path: 'artifacts/desktop.png', fullPage: true });
  const scene = await page.locator('canvas').boundingBox();
  await page.locator('canvas').click({ position: { x: scene.width * .66, y: scene.height * .59 } });
  await expect(page.getByRole('progressbar', { name: 'Vida do inimigo' })).toHaveAttribute('aria-valuenow', '83');
  await page.reload(); await waitForScene(page);
  await expect(page.getByRole('progressbar', { name: 'Vida do inimigo' })).toHaveAttribute('aria-valuenow', '83');
  const attack = page.getByRole('button', { name: 'Atacar inimigo' });
  for (let i = 0; i < 17; i++) await attack.click();
  await expect(page.locator('.gold-panel strong')).toHaveText('24');
  await page.getByRole('button', { name: /Aprimorar/ }).click();
  await expect(page.locator('.level-badge')).toHaveText('NV. 1');
  await expect(page.locator('.gold-panel strong')).toHaveText('4');
  await expect(page.locator('.damage-preview strong')).toHaveText('6');
  await page.getByRole('button', { name: 'Configurações', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Reduzir movimento').check();
  await page.getByRole('slider', { name: 'Volume' }).fill('0.2');
  await page.getByLabel('Efeitos sonoros').uncheck();
  await page.screenshot({ path: 'artifacts/settings.png', fullPage: true });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.reload(); await waitForScene(page);
  await expect(page.locator('.app-shell')).toHaveClass(/reduced-motion/);
  await expect(page.getByRole('button', { name: 'Ativar som' })).toBeVisible();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('wildbound.save')));
  expect(saved.progress.gold).toBe('4'); expect(saved.preferences.volume).toBe(.2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage(); monitor(mobilePage);
  await mobilePage.goto(baseURL); await waitForScene(mobilePage);
  await mobilePage.screenshot({ path: 'artifacts/mobile.png', fullPage: true });
  await mobilePage.getByRole('button', { name: 'Atacar inimigo' }).tap();
  await expect(mobilePage.getByRole('progressbar', { name: 'Vida do inimigo' })).toHaveAttribute('aria-valuenow', '83');
  await mobilePage.setViewportSize({ width: 320, height: 740 });
  expect(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await mobilePage.screenshot({ path: 'artifacts/mobile-320.png', fullPage: true });

  const bossContext = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
  const bossPage = await bossContext.newPage(); monitor(bossPage);
  const bossHealth = new Decimal(1.18).pow(9).mul(30).mul(6).ceil().toString();
  await bossPage.addInitScript(data => localStorage.setItem('wildbound.save', JSON.stringify(data)), {
    version: 1, progress: { stage: 10, defeated: 0, gold: '200', level: 5, hp: bossHealth }, preferences: { muted: false, volume: .2, reducedMotion: false },
  });
  await bossPage.goto(baseURL); await waitForScene(bossPage);
  await expect(bossPage.getByRole('heading', { name: 'Ancião das raízes' })).toBeVisible();
  await bossPage.screenshot({ path: 'artifacts/boss.png', fullPage: true });
  const mobileBoss = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobileBoss.addInitScript(data => localStorage.setItem('wildbound.save', JSON.stringify(data)), {
    version: 1, progress: { stage: 10, defeated: 0, gold: '200', level: 5, hp: bossHealth }, preferences: { muted: true, volume: .2, reducedMotion: false },
  });
  const mobileBossPage = await mobileBoss.newPage(); monitor(mobileBossPage);
  await mobileBossPage.goto(baseURL); await waitForScene(mobileBossPage);
  await mobileBossPage.screenshot({ path: 'artifacts/boss-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
  console.log('UI verificada: clique no canvas, combate, compra, restauração, configurações, mobile 390/320px e boss. Sem erros de console.');
} finally {
  await browser.close();
}
