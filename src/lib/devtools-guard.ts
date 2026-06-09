// Devtools deterrent + console scrambler. Best-effort: cannot truly stop a
// determined inspector but obfuscates UX and floods output with noise.
export function installDevtoolsGuard() {
  if (typeof window === "undefined") return;
  if ((window as any).__pg_installed) return;
  (window as any).__pg_installed = true;

  const BANNER = [
    "%c⚠ PRIME ROLEPLAY :: SECURE RUNTIME ⚠",
    "color:#60a5fa;font-size:22px;font-weight:900;text-shadow:0 0 10px #1d4ed8",
  ] as const;
  const WARN = [
    "%cAccess restricted. This console is monitored. Unauthorized inspection, tampering or code injection will be logged and reported.",
    "color:#93c5fd;font-size:13px;font-weight:600",
  ] as const;

  try {
    // eslint-disable-next-line no-console
    console.log(...BANNER);
    // eslint-disable-next-line no-console
    console.log(...WARN);
  } catch {}

  const scramble = (s: string) => {
    let out = "";
    for (let i = 0; i < s.length; i++) {
      out += String.fromCharCode(s.charCodeAt(i) ^ 0x5a);
    }
    return btoa(unescape(encodeURIComponent(out)));
  };

  const noise = () => {
    try {
      const payload = scramble(`PRIME::${Date.now()}::${Math.random().toString(36).slice(2)}`);
      // eslint-disable-next-line no-console
      console.debug(`%c[PRIME-ENC]%c ${payload}`,
        "color:#1d4ed8;font-weight:900",
        "color:#475569;font-family:monospace");
    } catch {}
  };

  // Block context menu + common devtools shortcuts (best-effort UX deterrent)
  window.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (k === "i" || k === "j" || k === "c")) ||
      (e.ctrlKey && k === "u") ||
      (e.metaKey && e.altKey && (k === "i" || k === "j" || k === "c"))
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, true);

  // Detect open devtools via window-size delta and flood noise
  let detected = false;
  setInterval(() => {
    const threshold = 170;
    const open =
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold;
    if (open && !detected) {
      detected = true;
      // eslint-disable-next-line no-console
      console.clear();
      // eslint-disable-next-line no-console
      console.log(...BANNER);
      // eslint-disable-next-line no-console
      console.log(...WARN);
    }
    if (open) {
      for (let i = 0; i < 6; i++) noise();
    } else {
      detected = false;
    }
  }, 1500);

  // Override toString on key globals so casual inspection reveals nothing
  const trap = () => "[native code]";
  try {
    Function.prototype.toString = new Proxy(Function.prototype.toString, {
      apply(target, thisArg, args) {
        try {
          const r = Reflect.apply(target, thisArg, args) as string;
          if (typeof r === "string" && r.length > 200) return trap();
          return r;
        } catch {
          return trap();
        }
      },
    });
  } catch {}
}
