import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { Leaf, Volume2, X, Sparkles, ShieldCheck } from 'lucide-react';
import type { Runtime } from '../app/runtime';

export function Settings({ runtime, onClose }: { runtime: Runtime; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const prefs = useStore(runtime.store, s => s.preferences);
  const saveStatus = useStore(runtime.store, s => s.saveStatus);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="settings-dialog" onClose={onClose} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} aria-labelledby="settings-title">
    <div className="settings-content">
      <div className="flex items-center justify-between gap-4"><span className="eyebrow flex items-center gap-2"><Leaf size={15} /> SUA EXPERIÊNCIA</span><button className="icon-button" aria-label="Fechar configurações" onClick={() => dialog.current?.close()}><X size={20} /></button></div>
      <h2 id="settings-title">Um bosque do seu jeito.</h2>
      <p className="settings-intro">Pequenos ajustes para uma boa aventura.</p>
      <label className="setting-row"><span><strong><Volume2 size={18} /> Efeitos sonoros</strong><small>Golpes, moedas e um pouco de magia.</small></span><input type="checkbox" checked={!prefs.muted} onChange={e => runtime.engine.setPreferences({ muted: !e.target.checked })} /></label>
      <label className="volume-row"><span>Volume <b>{Math.round(prefs.volume * 100)}%</b></span><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={prefs.volume} onChange={e => runtime.engine.setPreferences({ volume: Number(e.target.value) })} /></label>
      <label className="setting-row"><span><strong><Sparkles size={18} /> Reduzir movimento</strong><small>Menos partículas, flashes e tremor de tela.</small></span><input type="checkbox" checked={prefs.reducedMotion} onChange={e => runtime.engine.setPreferences({ reducedMotion: e.target.checked })} /></label>
      <div className="save-note"><ShieldCheck size={22} /><div><strong>{saveStatus === 'saved' ? 'Sua jornada fica por aqui.' : 'Atenção ao salvamento'}</strong><p>{saveStatus === 'saved' ? 'Progresso e preferências são salvos neste navegador. Você pode voltar quando quiser.' : saveStatus === 'recovered' ? 'Um save inválido foi preservado em wildbound.save.recovery. Uma nova partida está sendo salva normalmente.' : saveStatus === 'protected' ? 'Existe um save de uma versão futura. Ele foi preservado; esta sessão não será salva sobre ele.' : 'O armazenamento local está indisponível. O jogo funciona nesta sessão, mas o progresso pode não ser salvo.'}</p></div></div>
      <button className="primary-button w-full" onClick={() => dialog.current?.close()}>Voltar à aventura <span aria-hidden="true">→</span></button>
    </div>
  </dialog>;
}
