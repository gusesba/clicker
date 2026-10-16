import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { Volume2, X, Sparkles, ShieldCheck } from 'lucide-react';
import type { Runtime } from '../app/runtime';

export function Settings({ runtime, onClose }: { runtime: Runtime; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const prefs = useStore(runtime.store, s => s.preferences);
  const saveStatus = useStore(runtime.store, s => s.saveStatus);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} className="settings-dialog" onClose={onClose} onClick={e => { if (e.target === e.currentTarget) dialog.current?.close(); }} aria-labelledby="settings-title">
    <div className="settings-content">
      <div className="flex items-center justify-between gap-4"><h2 id="settings-title">Configurações</h2><button className="icon-button" aria-label="Fechar configurações" onClick={() => dialog.current?.close()}><X size={20} /></button></div>
      <label className="setting-row"><strong><Volume2 size={18} /> Efeitos sonoros</strong><input type="checkbox" checked={!prefs.muted} onChange={e => runtime.engine.setPreferences({ muted: !e.target.checked })} /></label>
      <label className="volume-row"><span>Volume <b>{Math.round(prefs.volume * 100)}%</b></span><input aria-label="Volume" type="range" min="0" max="1" step="0.05" value={prefs.volume} onChange={e => runtime.engine.setPreferences({ volume: Number(e.target.value) })} /></label>
      <label className="setting-row"><strong><Sparkles size={18} /> Reduzir movimento</strong><input type="checkbox" checked={prefs.reducedMotion} onChange={e => runtime.engine.setPreferences({ reducedMotion: e.target.checked })} /></label>
      <div className={`save-note ${saveStatus !== 'saved' ? 'save-warning' : ''}`}><ShieldCheck size={19} /><p>{saveStatus === 'saved' ? 'Salvo neste navegador.' : saveStatus === 'recovered' ? 'Save inválido preservado. Uma nova partida foi iniciada.' : saveStatus === 'protected' ? 'Este save pertence a uma versão mais recente e não será sobrescrito.' : 'Não foi possível salvar. O progresso ficará apenas nesta sessão.'}</p></div>
      <button className="primary-button w-full" onClick={() => dialog.current?.close()}>Voltar</button>
    </div>
  </dialog>;
}
