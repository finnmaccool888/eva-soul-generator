export type TraitKey =
	| "empathy"
	| "noveltySeeking"
	| "locusOfControl"
	| "conscientiousness"
	| "openness"
	| "agreeableness"
	| "extraversion"
	| "emotionalStability"
	| "riskTolerance"
	| "spiritualAttunement"
	| "systemsThinking"
	| "intuition"
	| "resilience"
	| "authenticity"
	| "altruism"
	| "curiosity";

export type TraitVector16 = Record<TraitKey, number>; // 0..100

export type MemoryShard = {
	id: string;
	createdAt: number;
	promptId: string;
	text: string; // stored locally only
	tags: string[];
};

export type ArtifactRarity = "common" | "uncommon" | "rare" | "legendary";

export type Artifact = {
	id: string;
	name: string;
	rarity: ArtifactRarity;
	acquiredAt: number;
	symbol: string; // emoji or short code
	description?: string;
};

export type SocialPlatform = "email" | "discord" | "instagram" | "linkedin" | "youtube" | "tiktok";

export type SocialProfile = {
	platform: SocialPlatform;
	handle: string;
	profileUrl: string;
	verified: boolean;
	addedAt: number;
};

export type PersonalInfo = {
	fullName?: string;
	location?: string;
	bio?: string;
};

export type UserProfile = {
	twitterId?: string;
	twitterHandle?: string;
	twitterVerified: boolean;
	personalInfo: PersonalInfo;
	socialProfiles: SocialProfile[];
	points: number;
	trustScore: number;
	createdAt: number;
	updatedAt: number;
};

export type SoulSeed = {
	alias: string;
	vibe: "ethereal" | "zen" | "cyber";
	level: number;
	streakCount: number;
	lastFedAt: number | null;
	traits: TraitVector16;
	artifacts: Artifact[];
	memories: MemoryShard[]; // local only
	profile?: UserProfile; // new: linked profile
};

export type Prompt = {
	id: string;
	theme:
		| "psychological"
		| "mentalModels"
		| "spiritual"
		| "philosophical"
		| "social"
		| "history"
		| "values"
		| "habits"
		| "passions"
		| "emotional";
	text: string;
	chipSuggestions?: string[];
	inputType?: "text" | "micro" | "choice";
	cooldownDays?: number;
};

export type EchoInvitePayload = {
	promptId: string;
	issuedAt: number;
	salt: string;
};

export type InsightCardData = {
	title: string;
	excerpt: string;
	symbol: string;
};

export type OnboardingStep = "twitter" | "personal" | "socials" | "questions" | "complete"; 