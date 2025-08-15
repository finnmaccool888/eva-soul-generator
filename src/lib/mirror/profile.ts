import { UserProfile, SocialPlatform } from "./types";
import { readJson, writeJson, StorageKeys } from "./storage";

const POINTS_PER_SOCIAL = 1000;

export function createEmptyProfile(): UserProfile {
  return {
    twitterVerified: false,
    personalInfo: {},
    socialProfiles: [],
    points: 0,
    trustScore: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function loadProfile(): UserProfile {
  return readJson<UserProfile>(StorageKeys.userProfile, createEmptyProfile());
}

export function saveProfile(profile: UserProfile): void {
  writeJson(StorageKeys.userProfile, profile);
}

// NEW UNIFIED POINTS CALCULATION - matches leaderboard logic
export function calculateTotalPoints(profile: UserProfile): number {
  let totalPoints = 0;
  
  // Base verification points (for being authenticated)
  totalPoints += 1000;
  
  // OG bonus points
  if (profile.isOG) {
    totalPoints += 10000;
  }
  
  // Points from session history
  if (profile.sessionHistory) {
    totalPoints += profile.sessionHistory.reduce((sum: number, session: any) => 
      sum + (session.pointsEarned || 0), 0);
  }
  
  return totalPoints;
}

// LEGACY FUNCTION - keep for backward compatibility but deprecate
export function calculatePoints(profile: UserProfile): number {
  // Use the new unified calculation instead
  return calculateTotalPoints(profile);
}

export function calculateTrustScore(profile: UserProfile, trustPenalty: number = 0): number {
  let score = 0;
  
  // Base score for Twitter verification
  if (profile.twitterVerified) score += 20;
  
  // Personal info completeness (up to 30 points)
  const personalFields = [profile.personalInfo.fullName, profile.personalInfo.location, profile.personalInfo.bio];
  const filledFields = personalFields.filter(f => f && f.trim().length > 0).length;
  score += filledFields * 10;
  
  // Social profiles (5 points each, up to 30)
  score += Math.min(profile.socialProfiles.length * 5, 30);
  
  // Verified socials bonus
  const verifiedCount = profile.socialProfiles.filter(s => s.verified).length;
  score += verifiedCount * 5;
  
  // Apply trust penalty from bad responses
  score = Math.max(0, score - trustPenalty);
  
  return Math.min(score, 100); // Cap at 100
}

// NEW: Update profile with recalculated points
export function updateProfilePoints(profile: UserProfile): UserProfile {
  const updated = { ...profile };
  updated.points = calculateTotalPoints(updated);
  updated.updatedAt = Date.now();
  return updated;
}

export function addSocialProfile(
  profile: UserProfile,
  platform: SocialPlatform,
  handle: string,
  profileUrl?: string
): UserProfile {
  const updated = { ...profile };
  
  // Remove existing profile for this platform if any
  updated.socialProfiles = updated.socialProfiles.filter(s => s.platform !== platform);
  
  // Add new profile
  updated.socialProfiles.push({
    platform,
    handle,
    profileUrl: profileUrl || generateProfileUrl(platform, handle),
    verified: false,
    addedAt: Date.now(),
  });
  
  // Recalculate points and trust score using new system
  updated.points = calculateTotalPoints(updated);
  updated.trustScore = calculateTrustScore(updated);
  
  return updated;
}

export function generateProfileUrl(platform: SocialPlatform, handle: string): string {
  const cleanHandle = handle.replace(/^@/, '');
  
  switch (platform) {
    case 'email':
      return `mailto:${cleanHandle}`;
    case 'discord':
      return `https://discord.com/users/${cleanHandle}`;
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'linkedin':
      return `https://linkedin.com/in/${cleanHandle}`;
    case 'youtube':
      return `https://youtube.com/@${cleanHandle}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanHandle}`;
    default:
      return '';
  }
} 