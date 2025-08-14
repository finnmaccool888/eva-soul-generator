"use client";

import React, { useMemo, useState } from "react";
import { pickDaily } from "@/lib/mirror/prompts";
import { defaultSeed, saveSeed, loadSeed, feedSeed } from "@/lib/mirror/seed";
import { writeJson, StorageKeys } from "@/lib/mirror/storage";
import PrimaryButton from "@/components/primary-button";
import ChipInput from "./chip-input";
import { track } from "@/lib/mirror/analytics";
import { motion, AnimatePresence } from "framer-motion";

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const [alias, setAlias] = useState("");
  const [vibe, setVibe] = useState<"ethereal" | "zen" | "cyber">("ethereal");
  const [step, setStep] = useState<"intro" | "prompts" | "finish">("intro");
  const prompts = useMemo(() => pickDaily(3), []);
  const [answers, setAnswers] = useState<string[]>(["", "", ""]);

  const answeredCount = answers.filter((a) => a.trim().length > 0).length;
  const progressPct = Math.round((answeredCount / 3) * 100);

  function start() {
    if (!alias.trim()) return;
    const seed = defaultSeed(alias.trim(), vibe);
    saveSeed(seed);
    setStep("prompts");
    track("onboarding_started");
  }

  function updateAnswer(i: number, v: string) {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  }

  function complete() {
    let seed = loadSeed();
    prompts.forEach((p, idx) => {
      const v = answers[idx];
      if (v && v.trim()) {
        const r = feedSeed(seed, p.id, v);
        seed = r.seed;
      }
    });
    if (seed.streakCount <= 0) {
      seed.streakCount = 1;
    }
    saveSeed(seed);
    track("onboarding_completed");
    setStep("finish");
  }

  function enter() {
    writeJson(StorageKeys.onboarded, true);
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 overflow-y-auto">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-lg border bg-background p-4 shadow-lg"
          >
            <div className="space-y-3">
              <div className="text-sm opacity-70">Eva beamed in</div>
              <div className="text-lg font-semibold">Let&apos;s set your signal.</div>
              <p className="text-sm opacity-80">
                Choose an alias and a vibe. Then answer three quick pulses. On-chain vibes, off-chain wisdom.
              </p>
              <div className="mt-2">
                <label className="text-sm">Alias</label>
                <input
                  className="mt-1 w-full rounded-md border bg-background p-2"
                  placeholder="Seeker, anon, or your style"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <label className="text-sm">Vibe</label>
                <div className="mt-1 grid grid-cols-3 gap-2 text-sm">
                  {(["ethereal", "zen", "cyber"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`rounded-md border px-3 py-2 ${vibe === v ? "bg-accent" : ""}`}
                      onClick={() => setVibe(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-1">
                <PrimaryButton onClick={start} disabled={!alias.trim()}>
                  Begin
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}

        {step === "prompts" && (
          <motion.div
            key="prompts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-lg border bg-background p-4 shadow-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div>Three quick pulses</div>
                <div>{answeredCount}/3</div>
              </div>
              <div className="h-2 w-full rounded bg-muted">
                <div
                  className="h-2 rounded bg-primary transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {prompts.map((p, idx) => (
                <div key={p.id} className="rounded-md border p-3">
                  <div className="text-sm opacity-70">Eva asks</div>
                  <div className="text-sm font-medium">{p.text}</div>
                  <div className="mt-2">
                    <ChipInput
                      placeholder="Tap chips or write a line"
                      chips={p.chipSuggestions}
                      value={answers[idx]}
                      onChange={(v) => updateAnswer(idx, v)}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-1">
                <PrimaryButton onClick={complete}>
                  Lock in my Soul Seed
                </PrimaryButton>
              </div>
            </div>
          </motion.div>
        )}

        {step === "finish" && (
          <motion.div
            key="finish"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-lg border bg-background p-4 shadow-lg text-center"
          >
            <div className="text-sm opacity-70">Calibration complete</div>
            <div className="mt-1 text-3xl">✦</div>
            <div className="mt-1 text-lg font-semibold">Streak initiated</div>
            <div className="text-xs opacity-70">Day 1 — small truths, big changes.</div>
            <div className="mt-4">
              <PrimaryButton onClick={enter}>Enter the Mirror</PrimaryButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 