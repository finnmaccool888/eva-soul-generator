"use client";

import React, { useEffect, useState } from "react";
import DailyTransmission from "@/components/mirror/daily-transmission";
import { track } from "@/lib/mirror/analytics";
import Onboarding from "@/components/mirror/onboarding";
import OnboardingWizard from "@/components/mirror/onboarding-wizard";
import ResetControls from "@/components/mirror/reset-controls";
import AuthStatus from "@/components/mirror/auth-status";
import { readJson, writeJson, StorageKeys } from "@/lib/mirror/storage";
import { loadProfile } from "@/lib/mirror/profile";
import { isAuthenticated } from "@/lib/mirror/auth";

export default function MirrorPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  
  useEffect(() => {
    track("daily_opened");
    
    // Check if user is authenticated and has completed profile wizard
    const isAuth = isAuthenticated();
    const profile = loadProfile();
    const hasProfile = profile.twitterHandle && profile.points > 0;
    const hasOnboarded = readJson<boolean>(StorageKeys.onboarded, false);
    
    // Show wizard if not authenticated OR if authenticated but no profile
    if (!isAuth || !hasProfile) {
      setShowWizard(true);
    } else {
      setOnboarded(hasOnboarded);
    }
  }, []);

  function handleWizardComplete() {
    setShowWizard(false);
    setOnboarded(false); // Show the personality questions
  }

  function handleOnboardingComplete() {
    writeJson(StorageKeys.onboarded, true);
    location.reload();
  }

  if (showWizard) {
    return <OnboardingWizard onComplete={handleWizardComplete} />;
  }

  return (
    <>
      <AuthStatus />
      <main className="mx-auto max-w-xl p-4 text-foreground">
        <h1 className="mb-3 text-2xl font-semibold text-foreground">Eva&apos;s Mirror</h1>
        <p className="mb-4 text-sm opacity-80 text-foreground">Feed your Soul Seed a little every day. Small truths, big changes.</p>
        {!onboarded && <Onboarding onDone={handleOnboardingComplete} />}
        {onboarded && <DailyTransmission />}
        <ResetControls />
      </main>
    </>
  );
} 