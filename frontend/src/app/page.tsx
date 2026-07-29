"use client";

import { useEffect, useState } from "react";
import { BentoWorkflow } from "@/components/bento-workflow";
import { Footer } from "@/components/footer";
import { CreateModal } from "@/components/modals/create.client";
import { JoinModal } from "@/components/modals/join.client";
import { Navbar } from "@/components/navbar.client";
import { getClientIpAction } from "./clipboard.action";

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [networkIp, setNetworkIp] = useState<string>("Detecting...");

  useEffect(() => {
    getClientIpAction().then(setNetworkIp);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />

      <main className="relative z-10 flex w-full grow flex-col items-center pt-8 pb-16 md:pt-12 md:pb-24">
        <div className="pointer-events-none absolute inset-0 z-0 mt-10 flex items-start justify-center overflow-hidden opacity-30 md:mt-20">
          <div className="h-75 w-75 rounded-full bg-primary-container opacity-20 blur-[80px] md:h-150 md:w-150 md:blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-300 flex-col items-center px-4 text-center md:px-12">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-surface-container-highest px-3 py-1 font-semibold text-[10px] text-primary shadow-sm md:px-4 md:py-1.5 md:text-xs">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary md:h-2 md:w-2" />
            Network Active: {networkIp}
          </div>

          <h1 className="mb-4 font-black text-4xl text-on-background tracking-tighter sm:text-5xl md:mb-6 md:text-7xl">
            The Local Network <br className="hidden md:block" />
            <span className="text-primary">Clipboard.</span>
          </h1>

          <p className="mb-8 max-w-2xl px-2 font-medium text-base text-on-surface-variant leading-relaxed md:mb-10 md:text-2xl">
            Share text instantly between devices on the same WiFi. No accounts,
            no apps, and links as short as a single letter.
          </p>

          <div className="mb-10 flex w-full max-w-120 flex-col gap-3 px-2 sm:flex-row md:mb-16">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="hover:-translate-y-0.5 flex h-14 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary py-4 font-semibold text-base text-on-primary shadow-lg transition-all hover:shadow-xl md:h-16 md:text-lg"
            >
              <span className="material-symbols-outlined text-[20px] md:text-[24px]">
                add_circle
              </span>
              Create Room
            </button>

            <button
              type="button"
              onClick={() => setIsJoinOpen(true)}
              className="flex h-14 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-outline-variant/30 bg-surface py-4 font-semibold text-base text-primary shadow-sm transition-all hover:border-primary/50 hover:bg-surface-container-low md:h-16 md:text-lg"
            >
              <span className="material-symbols-outlined text-[20px] md:text-[24px]">
                login
              </span>
              Join Room
            </button>
          </div>

          <BentoWorkflow />
        </div>

        <div className="relative z-10 mx-auto mt-16 flex w-full max-w-300 flex-col px-4 md:mt-24 md:px-12">
          <div className="mb-8 text-center md:mb-12">
            <h2 className="mb-3 font-black text-2xl text-on-background sm:text-3xl md:mb-4 md:text-4xl">
              Why use CLEP?
            </h2>
            <p className="mx-auto max-w-2xl px-2 text-on-surface-variant text-sm md:text-lg">
              We re-engineered clipboard sharing to be completely frictionless
              by scoping rooms to your public IP address.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
            <div className="flex flex-col rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm md:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-container/20 text-primary md:mb-6 md:h-12 md:w-12">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">
                  link
                </span>
              </div>
              <h3 className="mb-2 font-bold text-lg text-on-surface md:mb-3 md:text-xl">
                Ultra-Short URLs
              </h3>
              <p className="mb-6 text-on-surface-variant text-xs leading-relaxed md:text-sm">
                Because codes are restricted to your router's IP, you don't need
                10-character hashes. A single letter works perfectly.
              </p>

              <div className="mt-auto flex w-full max-w-50 items-center overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-low px-3 py-2">
                <span className="material-symbols-outlined mr-2 shrink-0 text-[14px] text-outline md:text-[16px]">
                  lock
                </span>
                <span className="truncate font-mono text-on-surface-variant text-xs md:text-sm">
                  clep.arinji.com/
                </span>
                <span className="font-bold font-mono text-primary text-xs md:text-sm">
                  a
                </span>
              </div>
            </div>

            <div className="flex flex-col rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm md:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-container/20 text-secondary md:mb-6 md:h-12 md:w-12">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">
                  router
                </span>
              </div>
              <h3 className="mb-2 font-bold text-lg text-on-surface md:mb-3 md:text-xl">
                Network Scoped
              </h3>
              <p className="text-on-surface-variant text-xs leading-relaxed md:text-sm">
                Someone in New York can use the code <strong>"a"</strong> at the
                exact same time as someone in London. As long as you aren't on
                the same WiFi, your clipboards will never collide.
              </p>
            </div>

            <div className="flex flex-col rounded-3xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm md:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-error-container/20 text-error md:mb-6 md:h-12 md:w-12">
                <span className="material-symbols-outlined text-[24px] md:text-[28px]">
                  timer
                </span>
              </div>
              <h3 className="mb-2 font-bold text-lg text-on-surface md:mb-3 md:text-xl">
                Secure & Ephemeral
              </h3>
              <p className="mb-4 text-on-surface-variant text-xs leading-relaxed md:text-sm">
                Only the creator of a room can edit the content. Anyone else on
                the network can only view and copy.
              </p>
              <p className="mt-auto font-semibold text-[10px] text-on-surface-variant md:text-xs">
                * Everything auto-destructs after 24 hours.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
      <JoinModal isOpen={isJoinOpen} onClose={() => setIsJoinOpen(false)} />
    </div>
  );
}
