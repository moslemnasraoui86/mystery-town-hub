import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1600, prefix = "", suffix = "", decimals = 0, className }: Props) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = () => {
      if (hasRun.current) return;
      hasRun.current = true;
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setCurrent(value * eased);
        if (p < 1) requestAnimationFrame(step);
        else setCurrent(value);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) start(); });
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  // Locale-independent formatting so SSR output matches the client exactly.
  const format = (n: number) => {
    const fixed = n.toFixed(decimals);
    const [int, frac] = fixed.split(".");
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return frac ? `${grouped}.${frac}` : grouped;
  };

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(current)}
      {suffix}
    </span>
  );
}
