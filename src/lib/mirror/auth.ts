import { readJson, writeJson, StorageKeys } from "./storage";

export interface TwitterAuth {
  twitterId: string;
  twitterHandle: string;
  twitterName?: string;
  profileImage?: string;
  verifiedAt: string;
  lastChecked: number;
}

export function getTwitterAuth(): TwitterAuth | null {
  return readJson<TwitterAuth | null>(StorageKeys.twitterAuth, null);
}

export function setTwitterAuth(auth: TwitterAuth): void {
  writeJson(StorageKeys.twitterAuth, auth);
}

export function clearTwitterAuth(): void {
  writeJson(StorageKeys.twitterAuth, null);
}

export function isAuthenticated(): boolean {
  const auth = getTwitterAuth();
  return auth !== null;
}

// Mock Twitter OAuth for now - replace with real OAuth later
export async function mockTwitterLogin(handle: string): Promise<TwitterAuth> {
  const auth: TwitterAuth = {
    twitterId: `mock_${Date.now()}`,
    twitterHandle: handle.startsWith('@') ? handle : `@${handle}`,
    twitterName: handle.replace('@', ''),
    profileImage: `https://unavatar.io/twitter/${handle.replace('@', '')}`,
    verifiedAt: new Date().toISOString(),
    lastChecked: Date.now(),
  };
  
  setTwitterAuth(auth);
  return auth;
}

export function logout(): void {
  // Clear all auth and profile data
  clearTwitterAuth();
  localStorage.removeItem(StorageKeys.userProfile);
  localStorage.removeItem(StorageKeys.soulSeed);
  localStorage.removeItem(StorageKeys.onboarded);
} 