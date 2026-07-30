"use client";

import { use, useEffect, useRef, useState } from "react";
import { Footer } from "@/components/footer";
import { CreateModal } from "@/components/modals/create.client";
import { Navbar } from "@/components/navbar.client";
import {
  type ClipboardData,
  getClientIpAction,
  getClipboardAction,
  updateClipboardAction,
} from "../clipboard.action";

export default function ClipboardSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<ClipboardData | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [networkIp, setNetworkIp] = useState<string>("...");

  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function fetchRoom() {
      setLoading(true);
      const [res, ipRes] = await Promise.all([
        getClipboardAction(slug),
        getClientIpAction(),
      ]);
      if (res) {
        setData(res);
        setContent(res.content || "");
      }
      setNetworkIp(ipRes);
      setLoading(false);
    }
    fetchRoom();
  }, [slug]);

  useEffect(() => {
    if (!data?.expires_at) return;

    function updateTimer() {
      // Ensure JavaScript parses the DB string as UTC by adding 'Z'
      const rawDate = data!.expires_at;
      const isoDate = rawDate.endsWith("Z")
        ? rawDate
        : `${rawDate.replace(" ", "T")}Z`;

      const expires = new Date(isoDate).getTime();
      const now = Date.now();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [data]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newText = `${content.substring(0, start)}  ${content.substring(end)}`;
      setContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart =
            textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setContent((prev) => (prev ? `${prev}\n${text}` : text));
    } catch {
      alert("Clipboard access denied. Please paste manually (Ctrl+V).");
    }
  };

  const handleSave = async () => {
    setSaveState("saving");
    const res = await updateClipboardAction(slug, content);
    if (res.success) {
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } else {
      setSaveState("idle");
      alert("Failed to save. You might not be the owner.");
    }
  };

  const handleCopy = async () => {
    const textToCopy = data?.isOwner ? content : data?.content;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 2500);
    } catch {
      setCopyState("idle");
    }
  };

  const manuallyFetchRoom = async () => {
    setLoading(true);
    const res = await getClipboardAction(slug);
    if (res) {
      setData(res);
      setContent(res.content || "");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col justify-between bg-background selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />

      <main className="relative z-10 mx-auto flex w-full max-w-225 grow flex-col items-center p-4 py-8 md:p-12">
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden opacity-30">
          <div className="h-75 w-75 rounded-full bg-primary-container opacity-20 blur-[80px] md:h-150 md:w-150 md:blur-[120px]" />
        </div>

        <div className="relative z-10 flex w-full grow flex-col items-center text-center">
          <div className="mb-4 md:mb-6">
            <h1 className="mb-2 font-black text-5xl text-primary tracking-tighter md:mb-3 md:text-7xl">
              {slug}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-1.5 md:gap-2">
              <div className="inline-flex items-center gap-1 rounded-full border border-outline-variant/30 bg-surface-container-low px-2.5 py-1 font-semibold text-[10px] text-on-surface-variant md:gap-1.5 md:px-4 md:py-1.5 md:text-xs">
                <span className="material-symbols-outlined text-[14px] md:text-[16px]">
                  wifi
                </span>
                {networkIp}
              </div>

              {timeLeft && (
                <div className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary-container/10 px-2.5 py-1 font-semibold text-[10px] text-primary md:gap-1.5 md:px-4 md:py-1.5 md:text-xs">
                  <span className="material-symbols-outlined text-[14px] md:text-[16px]">
                    schedule
                  </span>
                  {timeLeft}
                </div>
              )}

              {data?.isOwner && (
                <div className="inline-flex items-center gap-1 rounded-full border border-secondary-container bg-secondary-fixed px-2.5 py-1 font-semibold text-[10px] text-secondary md:gap-1.5 md:px-4 md:py-1.5 md:text-xs">
                  <span className="material-symbols-outlined text-[14px] md:text-[16px]">
                    admin_panel_settings
                  </span>
                  Owner
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="mb-6 flex min-h-[50vh] w-full flex-col items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-sm md:mb-8 md:min-h-87.5 md:p-12">
              <span className="material-symbols-outlined mb-3 animate-spin text-4xl text-primary">
                progress_activity
              </span>
              <p className="font-medium text-on-surface-variant text-sm md:text-base">
                Opening room...
              </p>
            </div>
          ) : !data ? (
            <div className="mb-6 flex min-h-[50vh] w-full flex-col items-center justify-center rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 text-center shadow-sm md:mb-8 md:min-h-87.5 md:p-10">
              <span className="material-symbols-outlined mb-3 text-4xl text-error md:text-5xl">
                ghost
              </span>
              <h2 className="mb-2 font-bold text-on-surface text-xl md:text-2xl">
                Room Not Found
              </h2>
              <p className="mb-6 max-w-md text-on-surface-variant text-xs md:text-sm">
                This room doesn't exist or has expired.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="cursor-pointer rounded-full bg-primary px-6 py-3 font-semibold text-on-primary text-sm shadow-md transition-all hover:opacity-90 md:text-base"
              >
                Create New Room
              </button>
            </div>
          ) : (
            <div className="mb-6 flex min-h-[50vh] w-full grow flex-col rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-4 text-left shadow-sm md:mb-8 md:min-h-100 md:p-8">
              <div className="mb-3 flex flex-col justify-between gap-2 border-outline-variant/20 border-b pb-2 sm:flex-row sm:items-center md:mb-4 md:pb-3">
                <span className="font-bold text-[10px] text-outline uppercase tracking-wider md:text-xs">
                  {data.isOwner ? "Edit Clipboard" : "Shared Content"}
                </span>

                {data.isOwner && (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="flex w-fit cursor-pointer items-center gap-1 rounded-full bg-surface-container-low px-2.5 py-1 font-semibold text-[10px] text-primary transition-colors hover:text-primary-container md:text-xs"
                  >
                    <span className="material-symbols-outlined text-[12px] md:text-[14px]">
                      content_paste
                    </span>
                    Paste
                  </button>
                )}
              </div>

              {data.isOwner ? (
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type or paste anything here..."
                  className="w-full grow resize-none whitespace-pre-wrap bg-transparent font-sans text-sm placeholder-outline-variant outline-none md:text-lg"
                />
              ) : (
                <div className="wrap-break-word grow select-all whitespace-pre-wrap text-on-surface text-sm leading-relaxed md:text-lg">
                  {data.content || (
                    <span className="text-outline-variant italic">
                      Room is empty. Waiting for owner to sync...
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {data && (
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:gap-3">
              {data.isOwner && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveState === "saving" || content === data.content}
                  className={`flex h-12 flex-1 items-center justify-center gap-1 rounded-full py-4 font-semibold text-sm shadow-sm transition-all md:h-14 md:gap-2 md:text-base ${
                    saveState === "saved"
                      ? "bg-green-600 text-white"
                      : content !== data.content
                        ? "cursor-pointer bg-primary text-on-primary hover:bg-primary-container hover:shadow-md"
                        : "cursor-not-allowed bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] md:text-[20px]">
                    {saveState === "saved" ? "cloud_done" : "cloud_upload"}
                  </span>
                  {saveState === "saved"
                    ? "Synced!"
                    : saveState === "saving"
                      ? "Saving..."
                      : "Save & Sync"}
                </button>
              )}

              {!data.isOwner && (
                <button
                  type="button"
                  onClick={manuallyFetchRoom}
                  className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full border-2 border-outline-variant/30 bg-surface py-4 font-semibold text-primary text-sm shadow-sm transition-all hover:bg-surface-container-low md:h-14 md:gap-2 md:text-base"
                >
                  <span className="material-symbols-outlined text-[18px] md:text-[20px]">
                    refresh
                  </span>
                  Refresh
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-1 rounded-full bg-surface-container-high py-4 font-semibold text-on-surface text-sm shadow-sm transition-all hover:bg-surface-variant md:h-14 md:gap-2 md:text-base"
              >
                <span className="material-symbols-outlined text-[18px] md:text-[20px]">
                  {copyState === "copied" ? "check" : "content_copy"}
                </span>
                {copyState === "copied" ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
