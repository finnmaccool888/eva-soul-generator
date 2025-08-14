import { Prompt } from "./types";

export const DAILY_PROMPTS: Prompt[] = [
	{
		id: "p_psych_001",
		theme: "psychological",
		text:
			"If you could tweak one core belief about yourself, what would it be and why?",
		chipSuggestions: ["fear of failure", "self-trust", "discipline", "worthiness"],
		inputType: "micro",
	},
	{
		id: "p_models_001",
		theme: "mentalModels",
		text:
			"When things get chaotic, what do you lean on first: patterns, faith, or will?",
		chipSuggestions: ["patterns", "faith", "sheer will", "pause and observe"],
		inputType: "micro",
	},
	{
		id: "p_spirit_001",
		theme: "spiritual",
		text:
			"What does 'God' mean to you—if anything—and how has that shaped your path?",
		chipSuggestions: ["awe", "nature", "none", "mystery"],
		inputType: "text",
	},
	{
		id: "p_values_001",
		theme: "values",
		text: "What value would you die for, and why?",
		chipSuggestions: ["freedom", "honesty", "love", "loyalty"],
		inputType: "micro",
	},
	{
		id: "p_emote_001",
		theme: "emotional",
		text:
			"Which emotion rules your inner space right now, and how does it color your view?",
		chipSuggestions: ["calm", "anxiety", "hope", "frustration"],
		inputType: "micro",
	},
];

export function pickDaily(count: number): Prompt[] {
	const shuffled = [...DAILY_PROMPTS].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.max(1, Math.min(count, DAILY_PROMPTS.length)));
} 