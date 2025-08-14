"use client";

import React, { useEffect } from "react";
import DailyTransmission from "@/components/mirror/daily-transmission";
import { track } from "@/lib/mirror/analytics";

export default function MirrorPage() {
  useEffect(() => {
    track("daily_opened");
  }, []);
  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="mb-3 text-2xl font-semibold">Eva&apos;s Mirror</h1>
      <p className="mb-4 text-sm opacity-80">Feed your Soul Seed a little every day. Small truths, big changes.</p>
      <DailyTransmission />
    </main>
  );
} 