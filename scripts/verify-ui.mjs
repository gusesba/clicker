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
const attackAtCanvas = async page => {
  await expect(page.getByRole('button', { name: 'Atacar inimigo' })).toHaveAttribute('aria-disabled', 'false');
  const target = await page.locator('.keyboard-attack').boundingBox();
  const scene = await page.locator('canvas').boundingBox();
  await page.locator('canvas').click({ position: { x: target.x + target.width / 2 - scene.x, y: target.y + target.height / 2 - scene.y } });
};
const checkViewport = async page => {
  const layout = await page.evaluate(() => {
    const scene = document.querySelector('.game-scene').getBoundingClientRect();
    const health = document.querySelector('.enemy-panel').getBoundingClientRect();
    const target = document.querySelector('.keyboard-attack').getBoundingClientRect();
    const dock = document.querySelector('.upgrade-panel').getBoundingClientRect();
    const controlsFit = [...document.querySelector('.upgrade-panel').children].every(child => {
      const rect = child.getBoundingClientRect();
      return rect.left >= dock.left && rect.right <= dock.right && rect.top >= dock.top && rect.bottom <= dock.bottom;
    });
    return {
      fits: document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight,
      fills: scene.x === 0 && scene.y === 0 && Math.abs(scene.width - innerWidth) < 1 && Math.abs(scene.height - innerHeight) < 1,
      healthFits: health.left >= 0 && health.right <= innerWidth && health.top >= 0 && health.bottom <= target.top + 4,
      targetAboveDock: target.bottom <= dock.top,
      dockFits: dock.left >= 0 && dock.right <= innerWidth && dock.bottom <= innerHeight && controlsFit,
    };
  });
  expect(layout).toEqual({ fits: true, fills: true, healthFits: true, targetAboveDock: true, dockFits: true });
};

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage(); monitor(page);
  await page.goto(baseURL); await waitForScene(page);
  await checkViewport(page);
  await expect(page.locator('header, footer, h1')).toHaveCount(0);
  await expect(page.getByText('Clique para atacar', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'artifacts/desktop.png', fullPage: true });
  await attackAtCanvas(page);
  await expect(page.getByRole('progressbar', { name: 'Vida do inimigo' })).toHaveAttribute('aria-valuenow', '83');
  await expect(page.getByText('Clique para atacar', { exact: true })).toHaveCount(0);
  await page.reload(); await waitForScene(page);
  await expect(page.getByRole('progressbar', { name: 'Vida do inimigo' })).toHaveAttribute('aria-valuenow', '83');
  await expect(page.getByText('Clique para atacar', { exact: true })).toHaveCount(0);
  const attack = page.getByRole('button', { name: 'Atacar inimigo' });
  await attack.focus();
  await attack.press('Space');
  await expect(page.getByRole('progressbar', { name: 'Vida do inimigo' })).toHaveAttribute('aria-valuenow', '67');
  for (let i = 0; i < 16; i++) await attackAtCanvas(page);
  await expect(page.locator('.gold-panel strong')).toHaveText('24');
  await page.getByRole('button', { name: /Aprimorar/ }).click();
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
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('wildbound.save')));
  expect(saved.progress.gold).toBe('4'); expect(saved.preferences.volume).toBe(.2);
  expect(saved.progress.level).toBe(1); expect(saved.preferences.muted).toBe(true);
  await checkViewport(page);

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mobilePage = await mobile.newPage(); monitor(mobilePage);
  await mobilePage.goto(baseURL); await waitForScene(mobilePage);
  await checkViewport(mobilePage);
  await mobilePage.screenshot({ path: 'artifacts/mobile.png', fullPage: true });
  const mobileTarget = await mobilePage.locator('.keyboard-attack').boundingBox();
  await mobilePage.touchscreen.tap(mobileTarget.x + mobileTarget.width / 2, mobileTarget.y + mobileTarget.height / 2);
  await expect(mobilePage.getByRole('progressbar', { name: 'Vida do inimigo' })).toHaveAttribute('aria-valuenow', '83');
  await mobilePage.setViewportSize({ width: 320, height: 740 });
  await expect.poll(() => mobilePage.locator('canvas').evaluate(canvas => canvas.clientWidth)).toBe(320);
  await checkViewport(mobilePage);
  await mobilePage.screenshot({ path: 'artifacts/mobile-320.png', fullPage: true });
  await mobilePage.setViewportSize({ width: 844, height: 390 });
  await expect.poll(() => mobilePage.locator('canvas').evaluate(canvas => canvas.clientWidth)).toBe(844);
  await checkViewport(mobilePage);
  await mobilePage.screenshot({ path: 'artifacts/landscape.png', fullPage: true });

  const bossContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const bossPage = await bossContext.newPage(); monitor(bossPage);
  const bossHealth = new Decimal(1.18).pow(9).mul(30).mul(6).ceil().toString();
  await bossPage.addInitScript(data => localStorage.setItem('wildbound.save', JSON.stringify(data)), {
    version: 1, progress: { stage: 10, defeated: 0, gold: '200', level: 5, hp: bossHealth }, preferences: { muted: false, volume: .2, reducedMotion: false },
  });
  await bossPage.goto(baseURL); await waitForScene(bossPage);
  await expect(bossPage.getByRole('heading', { name: 'Ancião das raízes' })).toBeVisible();
  await checkViewport(bossPage);
  await bossPage.screenshot({ path: 'artifacts/boss.png', fullPage: true });
  const mobileBoss = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobileBoss.addInitScript(data => { if (!localStorage.getItem('wildbound.save')) localStorage.setItem('wildbound.save', JSON.stringify(data)); }, {
    version: 1, progress: { stage: 10, defeated: 0, gold: '200', level: 5, hp: bossHealth }, preferences: { muted: true, volume: .2, reducedMotion: false },
  });
  const mobileBossPage = await mobileBoss.newPage(); monitor(mobileBossPage);
  await mobileBossPage.goto(baseURL); await waitForScene(mobileBossPage);
  await checkViewport(mobileBossPage);
  await mobileBossPage.screenshot({ path: 'artifacts/boss-mobile.png', fullPage: true });
  await mobileBossPage.setViewportSize({ width: 320, height: 740 });
  await expect.poll(() => mobileBossPage.locator('canvas').evaluate(canvas => canvas.clientWidth)).toBe(320);
  await checkViewport(mobileBossPage);
  await mobileBossPage.close();
  const advancedPage = await mobileBoss.newPage(); monitor(advancedPage);
  await advancedPage.setViewportSize({ width: 320, height: 740 });
  await advancedPage.addInitScript(data => localStorage.setItem('wildbound.save', JSON.stringify(data)), {
    version: 1, progress: { stage: 100, defeated: 0, gold: '40845686', level: 75, hp: new Decimal(1.18).pow(99).mul(180).ceil().toString() }, preferences: { muted: true, volume: .2, reducedMotion: true },
  });
  await advancedPage.goto(baseURL); await waitForScene(advancedPage);
  await expect(advancedPage.locator('.stage-panel strong')).toHaveText('Fase 100');
  await checkViewport(advancedPage);
  await advancedPage.screenshot({ path: 'artifacts/advanced-mobile.png', fullPage: true });
  expect(errors).toEqual([]);
  console.log('UI verificada: viewport sem rolagem, HUD e vida alinhadas, dica temporária, canvas, teclado, compra, restauração, configurações, mobile 390/320px, paisagem, boss e fase 100. Sem erros de console.');
} finally {
  await browser.close();
}
