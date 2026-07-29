"use client";

import { useEffect, useState } from "react";
import {
  checkCodeAvailability,
  createClipboardAction,
  getClientIpAction,
} from "@/app/clipboard.action";

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateModal({ isOpen, onClose }: CreateModalProps) {
  const [step, setStep] = useState<"initial" | "custom" | "collision">(
    "initial",
  );
  const [code, setCode] = useState("a");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [networkIp, setNetworkIp] = useState<string>("Detecting...");

  useEffect(() => {
    if (isOpen) {
      getClientIpAction().then(setNetworkIp);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCustomCodeSubmit = async () => {
    setLoading(true);
    const result = await checkCodeAvailability(code);
    if (result.available) {
      await createClipboardAction(code);
    } else {
      setSuggestions(result.suggestions);
      setStep("collision");
    }
    setLoading(false);
  };

  const handleRandomCode = async () => {
    setLoading(true);
    await createClipboardAction("");
    setLoading(false);
  };

  const handleSelectSuggestion = async (selectedCode: string) => {
    setLoading(true);
    await createClipboardAction(selectedCode);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="hide-scrollbar relative z-10 max-h-[90dvh] w-full max-w-120 overflow-y-auto rounded-2xl border border-outline-variant/30 bg-surface p-5 shadow-2xl md:p-8">
        {/* Step 1: Initial Selection */}
        {step === "initial" && (
          <div>
            <div className="mb-6 flex items-center">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>
            <h2 className="mb-6 font-bold text-2xl text-on-surface md:text-3xl">
              Create a Clipboard Room
            </h2>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                disabled={loading}
                onClick={() => setStep("custom")}
                className="hover:-translate-y-0.5 flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary font-semibold text-lg text-on-primary transition-all hover:shadow-lg disabled:opacity-70"
              >
                <span className="material-symbols-outlined">edit</span>
                Custom Code
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleRandomCode}
                className="flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-outline-variant bg-surface-container font-semibold text-lg text-on-surface transition-all hover:bg-surface-container-high disabled:opacity-70"
              >
                <span className="material-symbols-outlined">
                  {loading ? "progress_activity" : "shuffle"}
                </span>
                {loading ? "Creating..." : "Random Code"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Custom Code Entry */}
        {step === "custom" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("initial")}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <div className="flex items-center gap-1 rounded-full bg-surface-container-low px-3 py-1">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  wifi
                </span>
                <span className="text-on-surface-variant text-xs">
                  {networkIp}
                </span>
              </div>
            </div>

            <h2 className="mb-4 font-bold text-2xl text-on-surface">
              Choose Your Code
            </h2>

            <div className="mb-6">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-16 w-full rounded-2xl border-2 border-primary bg-surface-container-lowest px-6 font-semibold text-on-surface text-xl transition-all focus:outline-none focus:ring-4 focus:ring-primary/20"
                placeholder="Example: a2"
              />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={handleCustomCodeSubmit}
              className="hover:-translate-y-0.5 flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary font-semibold text-lg text-on-primary transition-all hover:shadow-lg disabled:opacity-70"
            >
              {loading && (
                <span className="material-symbols-outlined animate-spin">
                  progress_activity
                </span>
              )}
              {loading ? "Creating Room..." : "Create Room"}
            </button>
          </div>
        )}

        {/* Step 3: Collision UI */}
        {step === "collision" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("custom")}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
            </div>

            <h2 className="mb-4 font-bold text-2xl text-on-surface">
              Code Taken
            </h2>

            <div className="relative mb-3">
              <input
                type="text"
                disabled
                value={code}
                className="h-16 w-full rounded-2xl border-2 border-error bg-error-container/20 px-6 font-semibold text-error text-xl"
              />
              <span className="-translate-y-1/2 material-symbols-outlined absolute top-1/2 right-4 text-error">
                error
              </span>
            </div>

            <div className="mb-6 rounded-xl bg-surface-container p-4">
              <p className="mb-3 text-on-surface-variant text-sm">
                That code is already in use. Pick an available one:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug) => (
                  <button
                    type="button"
                    key={sug}
                    onClick={() => handleSelectSuggestion(sug)}
                    className="cursor-pointer rounded-full bg-primary-container px-4 py-2 font-semibold text-on-primary-container text-sm transition-colors hover:bg-primary-fixed"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("initial")}
                className="flex h-14 flex-1 cursor-pointer items-center justify-center rounded-full border border-outline-variant bg-surface-container font-semibold text-base text-on-surface transition-all hover:bg-surface-container-high"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRandomCode}
                className="hover:-translate-y-0.5 flex h-14 flex-1 cursor-pointer items-center justify-center rounded-full bg-primary font-semibold text-base text-on-primary transition-all"
              >
                Try Random
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
