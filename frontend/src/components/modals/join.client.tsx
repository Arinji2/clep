"use client";

import { useEffect, useState } from "react";
import { getClientIpAction, joinClipboardAction } from "@/app/clipboard.action";

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinModal({ isOpen, onClose }: JoinModalProps) {
  const [networkIp, setNetworkIp] = useState<string>("Detecting...");
  useEffect(() => {
    if (isOpen) {
      getClientIpAction().then(setNetworkIp);
    }
  }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="hide-scrollbar relative z-10 max-h-[90dvh] w-full max-w-120 overflow-y-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-2xl md:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-6 left-6 rounded-full bg-surface p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className="mt-8 mb-6 text-center">
          <h2 className="mb-2 font-bold text-2xl text-on-surface md:text-3xl">
            Join Clipboard
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Enter a code to connect.
          </p>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-xl border border-outline-variant/30 bg-surface-container-low p-4">
          <span className="material-symbols-outlined mt-0.5 text-primary">
            wifi
          </span>
          <div>
            <h3 className="mb-0.5 font-semibold text-on-surface text-sm">
              Network: {networkIp}
            </h3>
            <p className="text-on-surface-variant text-xs">
              You can only join clipboards shared on your current network.
            </p>
          </div>
        </div>

        <form action={joinClipboardAction} className="flex flex-col gap-4">
          <div>
            <label className="sr-only" htmlFor="join-code">
              Join Code
            </label>
            <input
              id="join-code"
              name="code"
              type="text"
              required
              autoComplete="off"
              placeholder="Enter code"
              className="w-full rounded-2xl border border-outline-variant bg-surface px-6 py-4 text-lg text-on-surface transition-all focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="mt-2 px-2 text-on-surface-variant text-xs">
              Examples: a2, abc, 1
            </p>
          </div>

          <button
            type="submit"
            className="min-h-12 w-full cursor-pointer rounded-full bg-linear-to-r from-primary to-secondary py-4 font-semibold text-lg text-on-primary shadow-md transition-all hover:opacity-90 active:scale-95"
          >
            Open Clipboard
          </button>
        </form>
      </div>
    </div>
  );
}
