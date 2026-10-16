import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import { Decimal } from 'decimal.js';
import { gsap } from 'gsap';
import { ArrowRight, Check, Coins, Crown, MousePointer2, Settings2, Shield, Sprout, Swords } from 'lucide-react';
import { createRuntime } from './runtime';
import { GameRenderer, type SceneLayout } from '../game/rendering/GameRenderer';
import { costFor, damageFor, enemyName, formatNumber, healthFor, isBoss, stageGoal } from '../game/config/balance';
import { presentation } from '../game/config/presentation';
import { Settings } from '../ui/Settings';
import { AnimatedNumber } from '../ui/AnimatedNumber';

export function App() {
  const [runtime] = useState(createRuntime);
  const stage = useStore(runtime.store, s => s.stage);
  const defeated = useStore(runtime.store, s => s.defeated);
  const gold = useStore(runtime.store, s => s.gold);
  const hp = useStore(runtime.store, s => s.hp);
  const level = useStore(runtime.store, s => s.level);
  const status = useStore(runtime.store, s => s.status);
  const prefs = useStore(runtime.store, s => s.preferences);
  const saveStatus = useStore(runtime.store, s => s.saveStatus);
  const [settings, setSettings] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [showHint, setShowHint] = useState(() => {
    const state = runtime.store.getState();
    return state.stage === 1 && state.defeated === 0 && state.level === 0 && state.gold === '0' && new Decimal(state.hp).eq(healthFor(1));
  });
  const host = useRef<HTMLDivElement>(null);
  const target = useRef<HTMLButtonElement>(null);
  const enemyPanel = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const stagePanel = useRef<HTMLDivElement>(null);
  const upgrade = useRef<HTMLDivElement>(null);
  const goldPanel = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  const boss = isBoss(stage);
  const cost = costFor(level), damage = damageFor(level), nextDamage = damageFor(level + 1);
  const affordable = new Decimal(gold).gte(cost);
  const ratio = new Decimal(hp).div(healthFor(stage)).toNumber();

  useEffect(() => {
    const positionHud = ({ enemyX, ground, unit, boss: layoutBoss }: SceneLayout) => {
      const scale = unit * (layoutBoss ? presentation.bossScale : 1);
      if (enemyPanel.current) {
        enemyPanel.current.style.left = `${enemyX}px`;
        enemyPanel.current.style.top = `${Math.max(80, ground + 12 - (layoutBoss ? 360 : 280) * scale - 66)}px`;
      }
      if (target.current) {
        target.current.style.left = `${enemyX}px`;
        target.current.style.top = `${ground + 12 - (layoutBoss ? 360 : 270) * scale}px`;
        target.current.style.width = `${(layoutBoss ? 350 : 260) * scale}px`;
        target.current.style.height = `${(layoutBoss ? 360 : 270) * scale}px`;
      }
      if (hint.current) hint.current.style.top = `${ground + 5}px`;
    };
    const goldTarget = () => {
      const coin = goldPanel.current?.querySelector('svg')?.getBoundingClientRect();
      const canvas = host.current?.getBoundingClientRect();
      return coin && canvas ? { x: coin.x + coin.width / 2 - canvas.x, y: coin.y + coin.height / 2 - canvas.y } : undefined;
    };
    const renderer = new GameRenderer(runtime.engine, runtime.attack, positionHud, goldTarget);
    let disposed = false;
    void renderer.init(host.current!).then(() => {
      if (disposed) renderer.destroy(); else setReady(true);
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; renderer.destroy(); runtime.destroy(); };
  }, [runtime]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const stop = runtime.engine.subscribe(event => {
      const reduced = runtime.store.getState().preferences.reducedMotion;
      if (event.type === 'enemy:damaged') setShowHint(false);
      if (event.type === 'gold:earned' && goldPanel.current) gsap.fromTo(goldPanel.current, { scale: reduced ? 1 : 1.07 }, { scale: 1, duration: presentation.animation.goldPulse, ease: 'back.out(2)', overwrite: true });
      if (event.type === 'upgrade:purchased' && upgrade.current) {
        gsap.fromTo(upgrade.current, { boxShadow: '0 0 0 2px #d7b66a, 0 0 25px #d7b66a55' }, { boxShadow: '0 0 0 0px #d7b66a00, 0 0 0px #d7b66a00', duration: presentation.animation.upgradePulse, clearProps: 'boxShadow', overwrite: true });
        setAnnouncement(`Dano por clique: ${formatNumber(event.damage)}`);
      } else if (event.type === 'stage:started') {
        setAnnouncement(`Fase ${event.stage}`);
        if (stagePanel.current) gsap.fromTo(stagePanel.current, { scale: reduced ? 1 : 1.12 }, { scale: 1, duration: presentation.animation.goldPulse, ease: 'back.out(2)', overwrite: true });
        return;
      } else if (event.type === 'boss:spawned') {
        setNotice(enemyName(event.stage, 0));
      } else if (event.type === 'boss:defeated') {
        setNotice('Boss derrotado');
      }
      else return;
      clearTimeout(timeout);
      timeout = setTimeout(() => setNotice(''), presentation.noticeMs);
    });
    return () => { stop(); clearTimeout(timeout); gsap.killTweensOf([goldPanel.current, upgrade.current, stagePanel.current]); };
  }, [runtime]);

  useEffect(() => {
    if (!notice || !banner.current || prefs.reducedMotion) return;
    const tween = gsap.fromTo(banner.current, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: presentation.animation.banner, ease: 'power2.out' });
    return () => { tween.kill(); };
  }, [notice, prefs.reducedMotion]);

  return <main className={`app-shell ${prefs.reducedMotion ? 'reduced-motion' : ''}`} aria-label="Wildbound">
      <section className={`game-scene ${boss ? 'boss-scene' : ''}`} aria-label="Campo de combate">
        <div ref={host} className="canvas-host" aria-hidden="true" />
        <div className="scene-vignette" />
        {!ready && <div className="loading-scene" role="status"><Sprout size={36} /><strong>{error ? 'Não foi possível abrir o jogo.' : 'Carregando…'}</strong>{error && <><p>É necessário um navegador com WebGL.</p><button className="primary-button" onClick={() => location.reload()}>Tentar novamente</button></>}</div>}

        <div className="scene-hud">
          <div ref={stagePanel} className="stage-panel"><span className="stage-emblem" aria-hidden="true">{boss ? <Crown size={25} /> : <Shield size={25} />}</span><div><strong>Fase {stage}</strong><div className="stage-progress" aria-label={`${defeated} de ${stageGoal(stage)} inimigos derrotados`}>{Array.from({ length: stageGoal(stage) }, (_, i) => <span key={i} className={i < defeated ? 'done' : ''}>{i < defeated && <Check size={8} strokeWidth={3} />}</span>)}</div></div></div>
          <div className="hud-actions"><div ref={goldPanel} className={`gold-panel ${formatNumber(gold).length > 7 ? 'compact-value' : ''}`} role="group" aria-label={`${formatNumber(gold)} gold`}><Coins size={24} aria-hidden="true" /><strong><AnimatedNumber value={gold} reduced={prefs.reducedMotion} /></strong></div><button className="icon-button settings-button" aria-label="Configurações" title="Configurações" onClick={() => setSettings(true)}><Settings2 size={21} />{saveStatus !== 'saved' && <span className="save-alert" aria-label="Aviso de salvamento" />}</button></div>
        </div>

        <div ref={enemyPanel} className={`enemy-panel ${boss ? 'boss-health' : ''}`}>
          <h2>{boss && <Crown size={15} aria-hidden="true" />}{enemyName(stage, defeated)}</h2>
          <div className="health-track" role="progressbar" aria-label="Vida do inimigo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} aria-valuetext={`${formatNumber(hp)} de ${formatNumber(healthFor(stage))}`}><div style={{ width: `${ratio * 100}%` }} /></div>
          <span className="health-numbers">{formatNumber(hp)} <span>/ {formatNumber(healthFor(stage))}</span></span>
        </div>

        <button ref={target} className="keyboard-attack" aria-label="Atacar inimigo" aria-disabled={!ready || status !== 'ready'} onClick={() => { if (ready) runtime.attack(); }} />
        <div ref={hint} className="attack-hint">{ready && showHint && <><MousePointer2 size={15} /><span>Clique para atacar</span></>}</div>
        {notice && <div className="event-banner" ref={banner} role="status"><Crown size={21} />{notice}</div>}

        <div ref={upgrade} className={`upgrade-panel ${affordable ? 'can-upgrade' : ''} ${Math.max(formatNumber(damage).length, formatNumber(nextDamage).length) > 5 || formatNumber(cost).length > 6 ? 'compact-values' : ''}`} role="group" aria-label="Melhoria de dano">
          <Swords className="sword-emblem" size={30} strokeWidth={1.6} aria-hidden="true" />
          <div className="damage-preview" role="group" aria-label={`Dano por clique: ${formatNumber(damage)}; próximo: ${formatNumber(nextDamage)}`}><strong><AnimatedNumber value={damage.toString()} reduced={prefs.reducedMotion} /></strong><ArrowRight size={17} aria-hidden="true" /><b>{formatNumber(nextDamage)}</b></div>
          <button className="primary-button purchase-button" disabled={!affordable || !ready} onClick={runtime.purchase} aria-label={`Aprimorar por ${formatNumber(cost)} gold`}><span>Aprimorar</span><span className="price"><Coins size={17} aria-hidden="true" />{formatNumber(cost)}</span></button>
        </div>
      </section>
    <span className="sr-only" role="status">{announcement}</span>
    {settings && <Settings runtime={runtime} onClose={() => setSettings(false)} />}
  </main>;
}
