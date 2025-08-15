"use client";

import React, { useState, useEffect } from "react";
import { loadProfile, saveProfile } from "@/lib/mirror/profile";

export default function DebugProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Debug mode - set to true to enable debug panel
  const debugMode = false;

  useEffect(() => {
    const profile = loadProfile();
    setProfile(profile);
  }, []);

  const forceOGPoints = () => {
    if (profile) {
      // Recalculate total points properly
      let basePoints = 1000; // Base verification points
      
      // Add session points
      if (profile.sessionHistory) {
        basePoints += profile.sessionHistory.reduce((sum: number, session: any) => 
          sum + (session.pointsEarned || 0), 0);
      }
      
      // Add OG bonus
      const totalPoints = basePoints + 10000;
      
      profile.points = totalPoints;
      profile.isOG = true;
      profile.ogPointsAwarded = true;
      profile.updatedAt = Date.now();
      saveProfile(profile);
      setProfile({ ...profile });
      console.log('[Debug] Recalculated points:', {
        basePoints,
        sessionPoints: profile.sessionHistory?.reduce((sum: number, s: any) => sum + (s.pointsEarned || 0), 0),
        ogBonus: 10000,
        totalPoints
      });
    }
  };

  const clearProfile = () => {
    localStorage.removeItem('eva_mirror_v1:userProfile');
    setProfile(null);
    console.log('[Debug] Cleared profile');
  };

  // Don't render anything if debug mode is disabled
  if (!debugMode) {
    return null;
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-slate-800 text-white px-3 py-1 rounded text-xs z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 text-white p-4 rounded-lg text-xs max-w-md z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Profile Debug</h3>
        <button onClick={() => setIsVisible(false)} className="text-slate-400">×</button>
      </div>
      
      {profile ? (
        <div className="space-y-2">
          <div>Points: {profile.points?.toLocaleString()}</div>
          <div>Is OG: {profile.isOG ? "Yes" : "No"}</div>
          <div>OG Points Awarded: {profile.ogPointsAwarded ? "Yes" : "No"}</div>
          <div>Twitter ID: {profile.twitterId}</div>
          <div>Handle: @{profile.twitterHandle}</div>
          <div>Sessions: {profile.sessionHistory?.length || 0}</div>
          <div>Session Points: {profile.sessionHistory?.reduce((sum: number, s: any) => sum + (s.pointsEarned || 0), 0) || 0}</div>
          <div>Human Score: {profile.humanScore || 0}</div>
          
          <div className="flex gap-2 mt-3 flex-wrap">
            <button
              onClick={forceOGPoints}
              className="bg-blue-600 px-2 py-1 rounded text-xs"
            >
              Fix OG Points
            </button>
            <button
              onClick={clearProfile}
              className="bg-red-600 px-2 py-1 rounded text-xs"
            >
              Clear Profile
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 px-2 py-1 rounded text-xs"
            >
              Refresh Page
            </button>
          </div>
        </div>
      ) : (
        <div>No profile found in localStorage</div>
      )}
    </div>
  );
} 