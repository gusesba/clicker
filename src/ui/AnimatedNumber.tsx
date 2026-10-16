import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Decimal } from 'decimal.js';
import { formatNumber } from '../game/config/balance';
import { presentation } from '../game/config/presentation';

export function AnimatedNumber({ value, reduced = false }: { value: string; reduced?: boolean }) {
  const element = useRef<HTMLSpanElement>(null);
  const previous = useRef(value);
  useEffect(() => {
    const from = new Decimal(previous.current), delta = new Decimal(value).sub(from);
    previous.current = value;
    if (reduced || delta.isZero()) return;
    const progress = { t: 0 };
    const tween = gsap.to(progress, { t: 1, duration: presentation.animation.counter, ease: 'power2.out', onUpdate: () => {
      if (element.current) element.current.textContent = formatNumber(from.add(delta.mul(progress.t)));
    }, onComplete: () => { if (element.current) element.current.textContent = formatNumber(value); } });
    return () => { tween.kill(); };
  }, [value, reduced]);
  return <span ref={element}>{formatNumber(value)}</span>;
}
