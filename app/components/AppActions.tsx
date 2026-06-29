"use client";

import { useEffect, useState } from "react";

// Floating PWA actions: registers the service worker, offers an "install app"
// button when the browser allows it, and a "enable notifications" button that
// subscribes the device to web push (only when a VAPID public key is set).

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type InstallEvent = Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> };

export default function AppActions() {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [pushState, setPushState] = useState<"idle" | "on" | "busy">("idle");
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});

    setPushSupported(
      "PushManager" in window &&
      "Notification" in window &&
      "serviceWorker" in navigator
    );

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
    };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // Reflect existing push subscription.
    if (VAPID && "serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => { if (sub) setPushState("on"); })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setInstalled(true);
    setDeferred(null);
  }

  async function enablePush() {
    if (!VAPID || pushState === "busy") return;
    setPushState("busy");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { setPushState("idle"); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID) as BufferSource,
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      setPushState(res.ok ? "on" : "idle");
    } catch {
      setPushState("idle");
    }
  }

  const showInstall = !!deferred && !installed;
  const showPush = !!VAPID && pushSupported && pushState !== "on";
  if (!showInstall && !showPush) return null;

  return (
    <div className="app-actions">
      {showInstall && (
        <button className="aa-btn aa-install" onClick={install}>
          <span className="aa-ic">⬇️</span> Pasang App
        </button>
      )}
      {showPush && (
        <button className="aa-btn aa-push" onClick={enablePush} disabled={pushState === "busy"}>
          <span className="aa-ic">🔔</span> {pushState === "busy" ? "Memproses..." : "Aktifkan Notifikasi"}
        </button>
      )}
    </div>
  );
}
