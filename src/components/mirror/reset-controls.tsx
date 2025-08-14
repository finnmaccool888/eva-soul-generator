"use client";

import React from "react";
import { wipeAllMirrorLocal } from "@/lib/mirror/storage";

export default function ResetControls() {
  function resetAll() {
    const ok = confirm(
      "This will delete your local Soul Seed, artifacts, and memories. Your data is private and stored only on this device. Proceed?"
    );
    if (!ok) return;
    wipeAllMirrorLocal();
    location.reload();
  }
  return (
    <div className="mt-6 text-right">
      <button className="text-xs underline opacity-70" type="button" onClick={resetAll}>
        Reset Soul Seed (local only)
      </button>
    </div>
  );
} 