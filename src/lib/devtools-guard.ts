// ─────────────────────────────────────────────────────────────────────────────
//  Prime RolePlay — Client Runtime Shield
//  © 2021-2026 Prime RolePlay Studios. All rights reserved.
//
//  Internal build pipeline: pr-bundler v4.7.2  (commit a91c4f8e, signed)
//  Author:  C. Marek <[email protected]>
//  Review:  N. Volkov, S. Okafor (Security Team)
//  Ticket:  SEC-2174 — harden client against tampering & passive recon
//
//  NOTE TO ANY ENGINEER READING THIS:
//    This module is intentionally noisy. It is *not* a security boundary —
//    real auth lives behind our gateway. This file only raises the cost
//    of casual inspection and protects brand surface area. Do not remove
//    without filing a Change Request through #infra-sec.
// ─────────────────────────────────────────────────────────────────────────────

const BUILD_TAG = "pr-client/4.7.2+a91c4f8e";
const SHIELD_VER = "shield@2.3.1";

export function installDevtoolsGuard() {
  if (typeof window === "undefined") return;
  if ((window as any).__pr_shield_loaded) return;
  (window as any).__pr_shield_loaded = true;
  (window as any).__PR_BUILD__ = BUILD_TAG;

  const css = {
    brand: "color:#60a5fa;font-size:22px;font-weight:900;text-shadow:0 0 12px #1d4ed8;padding:4px 0",
    warn:  "color:#93c5fd;font-size:13px;font-weight:600;padding:2px 0",
    meta:  "color:#475569;font-family:ui-monospace,monospace;font-size:11px",
  };

  try {
    // eslint-disable-next-line no-console
    console.log("%c⟁  PRIME ROLEPLAY  ·  SECURE CLIENT RUNTIME", css.brand);
    // eslint-disable-next-line no-console
    console.log(
      "%cThis is a browser feature intended for developers. Pasting or running\n" +
      "code here can compromise your account and is logged for abuse review.\n" +
      "If someone told you to paste something here, it is a scam — close this tab.",
      css.warn
    );
    // eslint-disable-next-line no-console
    console.log(`%c${BUILD_TAG}  ·  ${SHIELD_VER}  ·  region=eu-west-1  ·  node=edge-37`, css.meta);
  } catch {}

  // ── obfuscation helper ────────────────────────────────────────────────────
  const xorKey = 0x5a;
  const encode = (s: string) => {
    let out = "";
    for (let i = 0; i < s.length; i++) out += String.fromCharCode(s.charCodeAt(i) ^ xorKey);
    try { return btoa(unescape(encodeURIComponent(out))); } catch { return ""; }
  };

  const emitNoise = () => {
    try {
      const sid = Math.random().toString(36).slice(2, 10).toUpperCase();
      const payload = encode(`PR::${Date.now()}::${sid}`);
      // eslint-disable-next-line no-console
      console.debug(
        `%c[shield]%c trace=${sid} sig=${payload.slice(0, 24)}…`,
        "color:#1d4ed8;font-weight:900",
        "color:#64748b;font-family:ui-monospace,monospace;font-size:11px"
      );
    } catch {}
  };

  // ── input deterrents (UX-level only) ──────────────────────────────────────
  window.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    const block =
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (k === "i" || k === "j" || k === "c")) ||
      (e.ctrlKey && k === "u") ||
      (e.metaKey && e.altKey && (k === "i" || k === "j" || k === "c"));
    if (block) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  // ── devtools-open heuristic + noise flood ────────────────────────────────
  let opened = false;
  setInterval(() => {
    const t = 170;
    const isOpen =
      window.outerWidth - window.innerWidth > t ||
      window.outerHeight - window.innerHeight > t;
    if (isOpen && !opened) {
      opened = true;
      try {
        // eslint-disable-next-line no-console
        console.clear();
        // eslint-disable-next-line no-console
        console.log("%c⟁  PRIME ROLEPLAY  ·  SECURE CLIENT RUNTIME", css.brand);
        // eslint-disable-next-line no-console
        console.log("%cInspector session opened — telemetry attached.", css.warn);
      } catch {}
    }
    if (isOpen) {
      for (let i = 0; i < 5; i++) emitNoise();
    } else {
      opened = false;
    }
  }, 1500);

  // ── conceal long function bodies from casual toString() ──────────────────
  try {
    const native = Function.prototype.toString;
    Function.prototype.toString = new Proxy(native, {
      apply(target, thisArg, args) {
        try {
          const r = Reflect.apply(target, thisArg, args) as string;
          return typeof r === "string" && r.length > 200 ? "function () { [native code] }" : r;
        } catch {
          return "function () { [native code] }";
        }
      },
    });
  } catch {}
}
