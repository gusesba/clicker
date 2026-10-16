import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import { Decimal } from 'decimal.js';
import { gsap } from 'gsap';
import { ArrowRight, Check, ChevronRight, Coins, Crown, Leaf, MousePointer2, Settings2, Shield, Sparkles, Sprout, Swords, Volume2, VolumeX } from 'lucide-react';
import { createRuntime } from './runtime';
import { GameRenderer } from '../game/rendering/GameRenderer';
import { balance, costFor, damageFor, enemyName, formatNumber, healthFor, isBoss, rewardFor, stageGoal } from '../game/config/balance';
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
  const host = useRef<HTMLDivElement>(null);
  const upgrade = useRef<HTMLDivElement>(null);
  const goldPanel = useRef<HTMLDivElement>(null);
  const banner = useRef<HTMLDivElement>(null);
  const boss = isBoss(stage);
  const cost = costFor(level), damage = damageFor(level), nextDamage = damageFor(level + 1);
  const affordable = new Decimal(gold).gte(cost);
  const remaining = Decimal.max(0, cost.sub(gold));
  const ratio = new Decimal(hp).div(healthFor(stage)).toNumber();
  const savedLabel = saveStatus === 'saved' ? 'Progresso salvo' : saveStatus === 'recovered' ? 'Save recuperado' : saveStatus === 'protected' ? 'Save preservado' : 'Save indisponível';

  useEffect(() => {
    const renderer = new GameRenderer(runtime.engine, runtime.attack);
    let disposed = false;
    void renderer.init(host.current!).then(() => {
      if (disposed) renderer.destroy(); else setReady(true);
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; renderer.destroy(); runtime.destroy(); };
  }, [runtime]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let bossCelebrationUntil = 0;
    const stop = runtime.engine.subscribe(event => {
      const reduced = runtime.store.getState().preferences.reducedMotion;
      if (event.type === 'gold:earned' && goldPanel.current) gsap.fromTo(goldPanel.current, { scale: reduced ? 1 : 1.07 }, { scale: 1, duration: presentation.animation.goldPulse, ease: 'back.out(2)', overwrite: true });
      if (event.type === 'upgrade:purchased' && upgrade.current) {
        gsap.fromTo(upgrade.current, { boxShadow: '0 0 0 2px #d7b66a, 0 0 25px #d7b66a55' }, { boxShadow: '0 0 0 0px #d7b66a00, 0 0 0px #d7b66a00', duration: presentation.animation.upgradePulse, overwrite: true });
        setNotice('Lâmina fortalecida!');
      } else if (event.type === 'stage:started') {
        if (Date.now() < bossCelebrationUntil) return;
        setNotice(isBoss(event.stage) ? 'Um guardião ancestral desperta…' : `Fase ${event.stage} · A jornada continua`);
      } else if (event.type === 'boss:defeated') {
        bossCelebrationUntil = Date.now() + presentation.bossCelebrationMs;
        setNotice('O bosque celebra sua vitória!');
      }
      else return;
      clearTimeout(timeout);
      timeout = setTimeout(() => setNotice(''), presentation.noticeMs);
    });
    return () => { stop(); clearTimeout(timeout); gsap.killTweensOf([goldPanel.current, upgrade.current]); };
  }, [runtime]);

  useEffect(() => {
    if (!notice || !banner.current || prefs.reducedMotion) return;
    const tween = gsap.fromTo(banner.current, { y: -8, opacity: 0 }, { y: 0, opacity: 1, duration: presentation.animation.banner, ease: 'power2.out' });
    return () => { tween.kill(); };
  }, [notice, prefs.reducedMotion]);

  return <div className={`app-shell ${prefs.reducedMotion ? 'reduced-motion' : ''}`}>
    <header className="site-header">
      <a className="wordmark" href="#" aria-label="Wildbound, início"><span className="brand-symbol"><Sprout size={25} strokeWidth={1.6} /></span><span>WILDBOUND<small>GUARDIÕES DO BOSQUE</small></span></a>
      <div className="header-actions flex items-center gap-3">
        <span className={`save-indicator ${saveStatus === 'unavailable' || saveStatus === 'protected' ? 'save-warning' : ''}`}><span className="save-dot" />{savedLabel}</span>
        <span className="header-divider" />
        <button className="icon-button" aria-label={prefs.muted ? 'Ativar som' : 'Desativar som'} onClick={() => runtime.engine.setPreferences({ muted: !prefs.muted })}>{prefs.muted ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
        <button className="icon-button" aria-label="Configurações" onClick={() => setSettings(true)}><Settings2 size={19} /></button>
      </div>
    </header>

    <main>
      <div className="journey-heading flex items-end justify-between gap-4">
        <div><p className="eyebrow">CADA CLIQUE, UMA NOVA CONQUISTA</p><h1>O bosque está chamando<span>.</span></h1></div>
        <div className="region-label"><span className="region-icon"><Leaf size={18} /></span><span>REGIÃO 01<strong>Floresta Sussurrante</strong></span></div>
      </div>

      <section className={`game-scene ${boss ? 'boss-scene' : ''}`} aria-label="Campo de combate">
        <div ref={host} className="canvas-host" aria-hidden="true" />
        <div className="scene-vignette" />
        {!ready && <div className="loading-scene" role="status"><Sprout size={36} /><strong>{error ? 'O bosque não pôde ser aberto.' : 'Despertando o bosque…'}</strong><p>{error ? 'É necessário um navegador com WebGL. Recarregue para tentar novamente.' : 'Preparando uma pequena grande aventura.'}</p>{error && <button className="primary-button" onClick={() => location.reload()}>Tentar novamente</button>}</div>}

        <div className="scene-hud">
          <div className="stage-card"><div className="stage-emblem">{boss ? <Crown size={24} /> : <Shield size={24} />}</div><div><span className="hud-label">{boss ? 'ENCONTRO ESPECIAL' : 'SUA JORNADA'}</span><strong>Fase {String(stage).padStart(2, '0')}</strong><div className="stage-progress" aria-label={`${defeated} de ${stageGoal(stage)} inimigos derrotados`}>{Array.from({ length: stageGoal(stage) }, (_, i) => <span key={i} className={i < defeated ? 'done' : ''}>{i < defeated && <Check size={8} strokeWidth={3} />}</span>)}<small>{defeated}/{stageGoal(stage)}</small></div></div></div>
          <div className="realm-caption"><span /> UM BOSQUE. INFINITAS HISTÓRIAS. <span /></div>
          <div ref={goldPanel} className="gold-panel"><span className="gold-icon"><Coins size={23} /></span><div><span className="hud-label">SEU TESOURO</span><strong><AnimatedNumber value={gold} reduced={prefs.reducedMotion} /></strong></div></div>
        </div>

        <div className={`enemy-panel ${boss ? 'boss-health' : ''}`}>
          <p>{boss ? <><Crown size={12} /> GUARDIÃO ANCESTRAL</> : 'CRIATURA DO BOSQUE'}</p>
          <h2>{enemyName(stage, defeated)}</h2>
          <div className="health-track" role="progressbar" aria-label="Vida do inimigo" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(ratio * 100)} aria-valuetext={`${formatNumber(hp)} de ${formatNumber(healthFor(stage))}`}><div style={{ width: `${ratio * 100}%` }} /></div>
          <span className="health-numbers">{formatNumber(hp)} <span>/ {formatNumber(healthFor(stage))} PV</span></span>
        </div>

        {notice && <div className="event-banner" ref={banner} role="status"><Sparkles size={16} />{notice}</div>}
        <div className="scene-bottom">
          <div className="hero-caption"><span className="tiny-line" /><div><strong>KAEL</strong><span>Guardião errante</span></div></div>
          <button className="attack-hint" onClick={runtime.attack} disabled={!ready || status !== 'ready'} aria-label="Atacar inimigo"><MousePointer2 size={17} /><span>Clique no inimigo para atacar</span><span className="hint-dot" /></button>
          <div className="reward-caption"><span>RECOMPENSA</span><strong><Coins size={14} />{formatNumber(rewardFor(stage))}</strong></div>
        </div>
      </section>

      <section ref={upgrade} className={`upgrade-panel ${affordable ? 'can-upgrade' : ''}`} aria-label="Melhoria de dano">
        <div className="upgrade-identity"><div className="sword-emblem"><Swords size={32} strokeWidth={1.4} /><span className="emblem-spark">✦</span></div><div><div className="flex items-center gap-2"><p className="eyebrow">FORJA DO GUARDIÃO</p><span className="level-badge">NV. {level}</span></div><h2>Fortaleça sua lâmina</h2><p>Um pouco mais de poder. Um passo mais longe.</p></div></div>
        <div className="damage-preview"><span>DANO POR CLIQUE</span><div><strong><AnimatedNumber value={damage.toString()} reduced={prefs.reducedMotion} /></strong><ArrowRight size={18} /><b>{formatNumber(nextDamage)}</b></div></div>
        <div className="upgrade-action"><button className="primary-button purchase-button" disabled={!affordable || !ready} onClick={runtime.purchase}><span><Sparkles size={17} /> Aprimorar</span><span className="price"><Coins size={17} />{formatNumber(cost)}</span></button><p>{affordable ? <><span className="available-dot" /> Sua próxima conquista está pronta</> : <>Faltam <b>{formatNumber(remaining)}</b> moedas para aprimorar</>}</p><div className="purchase-track"><span style={{ width: `${Decimal.min(1, new Decimal(gold).div(cost)).mul(100).toNumber()}%` }} /></div></div>
      </section>

      <div className="journey-footer"><p><Crown size={15} /><span>Próximo boss na <strong>fase {(Math.floor(stage / balance.bossInterval) + 1) * balance.bossInterval}</strong></span><ChevronRight size={13} /></p><div className="milestone-path" aria-hidden="true">{Array.from({ length: balance.bossInterval }, (_, i) => <span key={i} className={i < (stage - 1) % balance.bossInterval ? 'complete' : i === (stage - 1) % balance.bossInterval ? 'current' : ''}>{i === balance.bossInterval - 1 ? <Crown size={12} /> : ''}</span>)}</div><span className="quiet-note"><Leaf size={12} /> Sem pressa. Só mais um clique.</span></div>
    </main>
    <footer className="site-footer"><span>FEITO DE MAGIA, MUSGO E PERSISTÊNCIA.</span><span>WILDBOUND <b>✦</b> PROTÓTIPO 0.1</span></footer>
    {settings && <Settings runtime={runtime} onClose={() => setSettings(false)} />}
  </div>;
}
