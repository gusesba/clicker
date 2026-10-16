import { Application, Container, Graphics, ImageSource, Rectangle, Sprite, Text, Texture } from 'pixi.js';
import type { GameEngine } from '../engine/GameEngine';
import { enemyVariant, formatNumber, isBoss } from '../config/balance';
import { presentation } from '../config/presentation';
import * as art from './art';

type Particle = { view: Graphics; age: number; duration: number; vx: number; vy: number };
type Damage = { view: Text; age: number; x: number; y: number; drift: number };
type Coin = { view: Graphics; age: number; x: number; y: number; delay: number };
export type SceneLayout = { enemyX: number; ground: number; unit: number; boss: boolean };

async function textureFromSvg(source: string) {
  const image = new Image();
  const resolution = presentation.maxResolution;
  const raster = source.replace(/width="(\d+)"/, (_, width) => `width="${Number(width) * resolution}"`).replace(/height="(\d+)"/, (_, height) => `height="${Number(height) * resolution}"`);
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(raster)}`;
  await image.decode();
  return new Texture({ source: new ImageSource({ resource: image, resolution }) });
}

export class GameRenderer {
  private app = new Application();
  private initialized = false;
  private world = new Container();
  private back = new Sprite();
  private front = new Sprite();
  private hero = new Container();
  private heroHead = new Sprite();
  private heroCape = new Sprite();
  private heroArm = new Sprite();
  private enemy = new Container();
  private enemyBody = new Sprite();
  private enemyCrown = new Sprite();
  private heroShadow = new Graphics().ellipse(0, 0, 65, 12).fill({ color: 0x0d2f27, alpha: .3 });
  private enemyShadow = new Graphics().ellipse(0, 0, 80, 15).fill({ color: 0x0d2f27, alpha: .3 });
  private slash = new Graphics();
  private atmosphere = new Graphics();
  private particles: Particle[] = [];
  private numbers: Damage[] = [];
  private coins: Coin[] = [];
  private fireflies: { view: Graphics; x: number; y: number; phase: number }[] = [];
  private textures: Record<string, Texture> = {};
  private observer?: ResizeObserver;
  private unsubscribe?: () => void;
  private unsubscribeStore?: () => void;
  private width = 1;
  private height = 1;
  private ground = 1;
  private unit = 1;
  private time = 0;
  private hitAge = 10;
  private entranceAge = 10;
  private deathAge = 0;
  private shake = 0;
  private pointer = { x: 0, y: 0 };
  private impact = { x: 0, y: 0 };
  private customImpact = false;
  private reduced = false;
  private destroyed = false;
  private heroX = 0;
  private enemyX = 0;
  private coinTarget?: { x: number; y: number };

  constructor(private engine: GameEngine, private attack: () => void, private onLayout?: (layout: SceneLayout) => void, private goldTarget?: () => { x: number; y: number } | undefined) {}

  async init(host: HTMLElement) {
    try {
      await this.app.init({
        width: host.clientWidth, height: host.clientHeight,
        backgroundColor: 0x315c4e, antialias: true, autoDensity: true,
        resolution: Math.min(devicePixelRatio || 1, presentation.maxResolution),
        preference: 'webgl',
      });
      this.initialized = true;
      if (this.destroyed) { this.destroy(); return; }
      await document.fonts.ready;
      const entries = await Promise.all(Object.entries(art).map(async ([key, value]) => [key, await textureFromSvg(value)] as const));
      this.textures = Object.fromEntries(entries);
      if (this.destroyed) { this.destroy(); return; }
      host.appendChild(this.app.canvas);
      this.app.stage.addChild(this.world);
      this.back.texture = this.textures.forestBack;
      this.front.texture = this.textures.forestFront;
      this.world.addChild(this.back, this.atmosphere);
      this.createActors();
      this.createEffects();
      this.world.addChild(this.front);
      this.app.stage.eventMode = 'static';
      this.app.stage.on('pointermove', e => {
        this.pointer.x = e.global.x / this.width - .5;
        this.pointer.y = e.global.y / this.height - .5;
        const inTarget = this.insideTarget(e.global.x, e.global.y);
        this.app.canvas.style.cursor = inTarget ? 'pointer' : 'default';
      });
      this.app.stage.on('pointerdown', e => {
        if (!this.insideTarget(e.global.x, e.global.y)) return;
        this.impact = { x: e.global.x, y: e.global.y };
        this.customImpact = true;
        this.attack();
        this.customImpact = false;
      });
      this.unsubscribe = this.engine.subscribe(event => {
        if (event.type === 'enemy:damaged') this.hit(event.damage, event.final, event.boss);
        if (event.type === 'gold:earned') this.reward(event.boss);
        if (event.type === 'upgrade:purchased') this.burst(this.hero.x, this.ground - 140 * this.unit, 0xf1d38a, 22);
      });
      let encounter = '';
      const sync = () => {
        const state = this.engine.store.getState();
        this.reduced = state.preferences.reducedMotion;
        const key = `${state.stage}:${state.defeated}`;
        if (key !== encounter) { encounter = key; this.spawn(); }
      };
      sync();
      this.unsubscribeStore = this.engine.store.subscribe(sync);
      const resize = () => {
        if (this.destroyed) return;
        this.width = host.clientWidth; this.height = host.clientHeight;
        this.app.renderer.resize(this.width, this.height);
        this.app.stage.hitArea = new Rectangle(0, 0, this.width, this.height);
        this.updateLayout();
        const scale = Math.max(this.width / 1400, this.height / 760, (this.height - this.ground) / 140);
        for (const layer of [this.back, this.front]) {
          layer.scale.set(scale * 1.025);
          layer.x = (this.width - layer.width) / 2;
          layer.y = this.ground - 620 * scale * 1.025;
        }
        this.atmosphere.clear().rect(0, 0, this.width, this.height).fill({ color: 0x251f40, alpha: isBoss(this.engine.store.getState().stage) ? .18 : 0 });
      };
      this.observer = new ResizeObserver(resize);
      this.observer.observe(host);
      resize();
      this.app.ticker.add(ticker => this.tick(Math.min(ticker.deltaMS / 1000, .05)));
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  private updateLayout() {
    const boss = isBoss(this.engine.store.getState().stage);
    this.ground = Math.min(this.height * .815, this.height - 112);
    const actorHeight = boss ? 360 * presentation.bossScale : 280;
    this.unit = Math.max(.25, Math.min(1.65, this.width / 760 + .3, (this.ground - 140) / actorHeight));
    this.heroX = this.width * (this.width < 600 ? .26 : .34);
    this.enemyX = this.width * (this.width < 600 ? (boss ? .65 : .72) : .66);
    this.hero.position.set(this.heroX, this.ground + 12);
    this.enemy.position.set(this.enemyX, this.ground + 12);
    this.hero.scale.set(this.unit);
    this.enemy.scale.set(this.unit * (boss ? presentation.bossScale : 1));
    this.heroShadow.position.set(this.heroX, this.ground - 3);
    this.enemyShadow.position.set(this.enemyX, this.ground - 3);
    this.heroShadow.scale.set(this.unit);
    this.enemyShadow.scale.set(this.enemy.scale.x);
    this.onLayout?.({ enemyX: this.enemyX, ground: this.ground, unit: this.unit, boss });
  }

  private createActors() {
    const sprite = (key: string) => { const s = new Sprite(this.textures[key]); s.anchor.set(.5, 1); return s; };
    this.heroCape = sprite('heroCape');
    this.heroHead = sprite('heroHead');
    this.heroArm = sprite('heroArm');
    this.heroArm.anchor.set(.2, .64);
    this.heroArm.position.set(28, -146);
    this.hero.addChild(this.heroCape, sprite('heroBody'), this.heroHead, this.heroArm);
    this.enemyBody.anchor.set(.5, 1);
    this.enemyCrown.anchor.set(.5, 1);
    this.enemy.addChild(this.enemyBody, this.enemyCrown);
    this.world.addChild(this.heroShadow, this.enemyShadow, this.hero, this.enemy, this.slash);
  }

  private createEffects() {
    for (let i = 0; i < presentation.limits.particles; i++) {
      const view = new Graphics().poly([0, -4, 3, 0, 0, 4, -3, 0]).fill(0xffffff);
      view.visible = false; this.world.addChild(view);
      this.particles.push({ view, age: 2, duration: 1, vx: 0, vy: 0 });
    }
    for (let i = 0; i < presentation.limits.numbers; i++) {
      const view = new Text({ text: '', style: { fontFamily: 'Nunito Sans', fontSize: 35, fontWeight: '800', fill: 0xfff5d4, stroke: { color: 0x294d3b, width: 5 }, dropShadow: { color: 0x163c30, blur: 3, distance: 3, alpha: .5 } } });
      view.anchor.set(.5); view.visible = false; this.world.addChild(view);
      this.numbers.push({ view, age: 2, x: 0, y: 0, drift: 0 });
    }
    for (let i = 0; i < presentation.limits.coins; i++) {
      const view = new Graphics().circle(0, 0, 9).fill(0xf0c66f).stroke({ color: 0x9d7338, width: 2 }).circle(0, 0, 5).stroke({ color: 0xffe6a4, width: 1.5 });
      view.visible = false; this.world.addChild(view);
      this.coins.push({ view, age: 2, x: 0, y: 0, delay: 0 });
    }
    for (let i = 0; i < 22; i++) {
      const view = new Graphics().circle(0, 0, i % 3 === 0 ? 2.3 : 1.3).fill(i % 2 ? 0xf6e2a0 : 0xc5e6b4);
      this.world.addChild(view);
      this.fireflies.push({ view, x: ((i * 137) % 997) / 997, y: ((i * 53) % 100) / 100, phase: i * 2.1 });
    }
  }

  private spawn() {
    const state = this.engine.store.getState();
    const boss = isBoss(state.stage);
    this.enemyBody.texture = this.textures[boss ? 'bossBody' : ['sproutBody', 'mushroomBody', 'stoneBody'][enemyVariant(state.stage, state.defeated)]];
    this.enemyCrown.texture = this.textures.sproutCrown;
    this.enemyCrown.visible = !boss && enemyVariant(state.stage, state.defeated) === 0;
    this.entranceAge = 0; this.deathAge = 0; this.hitAge = 10;
    this.enemy.alpha = 1; this.enemy.rotation = 0;
    this.updateLayout();
    this.atmosphere.clear().rect(0, 0, this.width, this.height).fill({ color: 0x30233f, alpha: boss ? .18 : 0 });
  }

  private hit(damage: string, final: boolean, boss: boolean) {
    this.hitAge = 0;
    this.shake = this.reduced ? 0 : final ? (boss ? presentation.shake.boss : presentation.shake.final) : presentation.shake.hit;
    if (!this.customImpact) this.impact = { x: this.enemy.x, y: this.ground - 140 * this.enemy.scale.y };
    const slot = this.numbers.find(n => !n.view.visible) ?? this.numbers.reduce((a, b) => a.age > b.age ? a : b);
    slot.view.text = `${final ? '✦ ' : ''}${formatNumber(damage)}`;
    slot.view.style.fill = final ? 0xffdd8b : 0xfff8dc;
    slot.x = this.impact.x + (Math.random() - .5) * 25;
    slot.y = this.impact.y - 30;
    slot.age = 0; slot.drift = (Math.random() - .5) * 55;
    slot.view.visible = true;
    this.burst(this.impact.x, this.impact.y, final ? 0xffd27b : 0xe8efbd, final ? (boss ? 34 : 20) : 9);
    this.slash.clear().moveTo(-65, 50).quadraticCurveTo(-10, -40, 82, -65).stroke({ color: final ? 0xffdc82 : 0xfff5c4, width: final ? 8 : 5, cap: 'round' }).moveTo(-44, 57).quadraticCurveTo(10, -20, 66, -35).stroke({ color: 0xffffff, width: 2, cap: 'round' });
    this.slash.position.set(this.impact.x, this.impact.y);
  }

  private insideTarget(x: number, y: number) {
    const boss = isBoss(this.engine.store.getState().stage);
    return Math.abs(x - this.enemy.x) < (boss ? 180 : 145) * this.enemy.scale.x && y > this.ground - (boss ? 360 : 275) * this.enemy.scale.y && y < this.ground + 20;
  }

  private burst(x: number, y: number, color: number, amount: number) {
    let used = 0;
    for (const p of this.particles) {
      if (p.view.visible) continue;
      if (used++ >= (this.reduced ? 3 : amount)) break;
      p.view.visible = true; p.view.position.set(x, y); p.view.tint = color;
      p.view.scale.set(.5 + Math.random()); p.age = 0; p.duration = .3 + Math.random() * .35;
      const angle = Math.random() * Math.PI * 2, speed = 80 + Math.random() * 180;
      p.vx = Math.cos(angle) * speed; p.vy = Math.sin(angle) * speed - 70;
    }
  }

  private reward(boss: boolean) {
    this.coinTarget = this.goldTarget?.();
    let used = 0;
    for (const c of this.coins) {
      if (c.view.visible) continue;
      if (used >= (this.reduced ? 3 : boss ? 15 : 7)) break;
      c.age = 0; c.delay = used++ * .035;
      c.x = this.enemy.x + (Math.random() - .5) * 100;
      c.y = this.ground - 80 * this.unit + (Math.random() - .5) * 50;
      c.view.visible = true;
    }
  }

  private tick(dt: number) {
    this.time += dt; this.hitAge += dt; this.entranceAge += dt;
    const state = this.engine.store.getState();
    const motion = this.reduced ? 0 : 1;
    const breath = Math.sin(this.time * 2.5) * motion;
    this.heroHead.y = breath * 2.2;
    this.heroCape.skew.x = Math.sin(this.time * 2) * .018 * motion;
    const hit = Math.max(0, 1 - this.hitAge / presentation.animation.hit);
    this.heroArm.rotation = -.95 * Math.sin(hit * Math.PI);
    this.hero.x = this.heroX + hit * 13 * motion;
    this.hero.skew.x = -.025 * hit * motion;
    const boss = isBoss(state.stage);
    const bossScale = boss ? presentation.bossScale : 1;
    let scale = this.unit * bossScale;
    const entranceDuration = boss ? presentation.animation.bossEntrance : presentation.animation.entrance;
    if (this.entranceAge < entranceDuration && !this.reduced) {
      const t = this.entranceAge / entranceDuration;
      scale *= .75 + .25 * (1 - Math.pow(1 - t, 3));
    }
    this.enemy.scale.set(scale * (1 + hit * .1 * motion), scale * (1 - hit * .09 * motion + breath * .008));
    this.enemy.x = this.enemyX + hit * 8 * motion;
    this.enemy.y = this.ground + 12 + breath * 3;
    if (boss && this.entranceAge < entranceDuration && !this.reduced) this.enemy.y += Math.pow(1 - this.entranceAge / entranceDuration, 2) * 35;
    this.enemyCrown.rotation = Math.sin(this.time * 2.3) * .025 * motion;
    this.enemyBody.tint = hit > .5 ? 0xffeec6 : 0xffffff;
    if (state.status === 'transition') {
      this.deathAge += dt;
      this.enemy.alpha = Math.max(0, 1 - this.deathAge / presentation.animation.death);
      this.enemy.y -= this.deathAge * 100 * motion;
      this.enemy.rotation = this.deathAge * .7 * motion;
    }
    this.slash.alpha = hit;
    this.slash.scale.set((1 + (1 - hit) * .2) * this.unit);
    this.world.position.set((Math.random() - .5) * this.shake, (Math.random() - .5) * this.shake);
    this.shake *= Math.pow(.002, dt);
    const artScale = this.back.scale.x;
    const center = (this.width - 1400 * artScale) / 2;
    this.back.x = center - this.pointer.x * 5 * motion;
    this.front.x = center - this.pointer.x * 12 * motion;
    for (const f of this.fireflies) {
      f.view.position.set(f.x * this.width + Math.sin(this.time * .35 + f.phase) * 15 * motion, this.height * (.2 + f.y * .65) + Math.cos(this.time * .45 + f.phase) * 12 * motion);
      f.view.alpha = this.reduced ? .25 : .2 + (Math.sin(this.time + f.phase) + 1) * .25;
    }
    for (const p of this.particles) {
      if (!p.view.visible) continue;
      p.age += dt;
      if (p.age > p.duration) { p.view.visible = false; continue; }
      p.view.x += p.vx * dt; p.view.y += p.vy * dt; p.vy += 300 * dt;
      p.view.rotation += dt * 3; p.view.alpha = 1 - p.age / p.duration;
    }
    for (const n of this.numbers) {
      if (!n.view.visible) continue;
      n.age += dt;
      const t = n.age / presentation.animation.damageNumber;
      if (t > 1) { n.view.visible = false; continue; }
      const padding = Math.min(this.width / 2, n.view.width / 2 + 8);
      const x = Math.max(padding, Math.min(this.width - padding, n.x + n.drift * t * motion));
      n.view.position.set(x, n.y - (this.reduced ? 12 : 65) * t);
      n.view.alpha = Math.min(1, (1 - t) * 3);
      n.view.scale.set((.85 + .3 * Math.sin(Math.min(1, t * 5) * Math.PI)) * Math.max(.7, this.unit));
    }
    for (const c of this.coins) {
      if (!c.view.visible) continue;
      c.age += dt;
      const t = Math.max(0, (c.age - c.delay) / presentation.animation.coin);
      if (t > 1) { c.view.visible = false; continue; }
      const ease = t * t;
      c.view.position.set(c.x + ((this.coinTarget?.x ?? this.width - 100) - c.x) * ease, c.y + ((this.coinTarget?.y ?? 60) - c.y) * ease - Math.sin(t * Math.PI) * (this.reduced ? 0 : 95));
      c.view.scale.set(1 - t * .4); c.view.alpha = Math.min(1, (1 - t) * 4);
    }
  }

  destroy() {
    this.destroyed = true;
    this.observer?.disconnect(); this.unsubscribe?.(); this.unsubscribeStore?.();
    if (this.initialized) { this.app.destroy(true, { children: true }); this.initialized = false; }
    Object.values(this.textures).forEach(texture => texture.destroy(true));
    this.textures = {};
  }
}
