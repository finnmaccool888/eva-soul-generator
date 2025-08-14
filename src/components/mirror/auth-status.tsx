"use client";

import React from "react";
import { getTwitterAuth, logout } from "@/lib/mirror/auth";
import { LogOut } from "lucide-react";

export default function AuthStatus() {
  const auth = getTwitterAuth();
  
  if (!auth) return null;
  
  function handleLogout() {
    if (confirm("This will log you out and clear all your data. Continue?")) {
      logout();
      location.reload();
    }
  }
  
  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm">
        {auth.profileImage && (
          <img 
            src={auth.profileImage} 
            alt={auth.twitterHandle}
            className="h-8 w-8 rounded-full"
          />
        )}
        <div className="text-sm">
          <div className="font-medium">{auth.twitterHandle}</div>
          <div className="text-xs text-muted-foreground">Verified {new Date(auth.verifiedAt).toLocaleDateString()}</div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded p-1 hover:bg-accent hover:text-accent-foreground"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 