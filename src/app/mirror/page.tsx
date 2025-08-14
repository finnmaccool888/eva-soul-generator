"use client";

import React, { useEffect } from "react";
import DailyTransmission from "@/components/mirror/daily-transmission";
import { track } from "@/lib/mirror/analytics";
import Onboarding from "@/components/mirror/onboarding";
import ResetControls from "@/components/mirror/reset-controls";
import { readJson, StorageKeys } from "@/lib/mirror/storage";

export default function MirrorPage() {
  useEffect(() => {
    track("daily_opened");
  }, []);
  const onboarded = readJson<boolean>(StorageKeys.onboarded, false);
  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="mb-3 text-2xl font-semibold">Eva&apos;s Mirror</h1>
      <p className="mb-4 text-sm opacity-80">Feed your Soul Seed a little every day. Small truths, big changes.</p>
      {!onboarded && <Onboarding onDone={() => location.reload()} />}
      {onboarded && <DailyTransmission />}
      <ResetControls />
    </main>
  );
} 