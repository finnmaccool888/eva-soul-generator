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

export type SoulSeed = {
	alias: string;
	vibe: "ethereal" | "zen" | "cyber";
	level: number;
	streakCount: number;
	lastFedAt: number | null;
	traits: TraitVector16;
	artifacts: Artifact[];
	memories: MemoryShard[]; // local only
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