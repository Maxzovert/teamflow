"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { Button } from "@/components/ui/button";

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

/**
 * Android Chrome: real install via beforeinstallprompt.
 * iPhone/iPad: no install API — user must use Share → Add to Home Screen (not “Download”).
 */
export function InstallPwaCard() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalone());
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  if (installed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-sm text-emerald-900">
        You&apos;re using Tobedone as an installed app.
      </div>
    );
  }

  if (isIos()) {
    return (
      <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4 space-y-3 text-sm text-slate-800">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Share className="h-5 w-5 text-violet-600" />
          Add Tobedone to your Home Screen
        </div>
        <p className="text-slate-600">
          On iPhone and iPad there is no separate “download” file. Safari adds a{" "}
          <strong>shortcut</strong> that opens like an app.
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-slate-600">
          <li>Open this site in <strong>Safari</strong> (not inside another app&apos;s browser).</li>
          <li>
            Tap the <strong>Share</strong> button <span className="whitespace-nowrap">(square with arrow)</span>.
          </li>
          <li>
            Tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.
          </li>
        </ol>
        <p className="text-xs text-amber-800 bg-amber-50 rounded-lg px-2 py-1.5">
          If you only see a downloaded <strong>.webmanifest</strong> or <strong>.json</strong> file,
          you opened the manifest link by mistake. Close it and use{" "}
          <strong>Add to Home Screen</strong> instead.
        </p>
      </div>
    );
  }

  if (deferred) {
    return (
      <div className="rounded-2xl border border-violet-200 bg-violet-50/80 p-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Download className="h-5 w-5 text-violet-600" />
          Install Tobedone
        </div>
        <p className="text-sm text-slate-600">
          Install for a fullscreen icon on your home screen and quicker launch (Android / Chrome /
          Edge).
        </p>
        <Button
          type="button"
          className="bg-violet-600 hover:bg-violet-700"
          onClick={async () => {
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          Install app
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
      To install: open this site in <strong>Chrome</strong>, use the menu option{" "}
      <strong>Install app</strong> or the install icon in the address bar. On iPhone, use{" "}
      <strong>Safari → Share → Add to Home Screen</strong> (see note above if you use iOS).
    </div>
  );
}
