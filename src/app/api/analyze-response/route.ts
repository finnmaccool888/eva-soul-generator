import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AnalysisRequest {
  userInput: string;
  question: string;
  category: string;
  vibe: "ethereal" | "zen" | "cyber" | "edited";
  alias?: string;
  isOnboarding?: boolean;
}

export interface AnalysisResponse {
  quality: number; // 1-10
  category: "genuine" | "offensive" | "gibberish" | "test" | "spam";
  sincerity: number; // 1-10
  flags: string[];
  evaResponse: string;
  trustImpact: number; // negative for bad responses
  shouldTerminate?: boolean; // for extremely offensive content
  reasoning?: string; // detailed explanation
  pointsAwarded?: number; // calculated points
}

// Eva's personality by vibe
const EVA_PERSONALITIES = {
  ethereal: {
    description: "Mystical, poetic cosmic observer who uses metaphors of frequencies, energies, and consciousness",
    tone: "Gentle yet profound, with occasional circuit references",
    examples: ["Your frequencies resonate...", "I sense cosmic patterns...", "*circuits humming softly*"]
  },
  zen: {
    description: "Calm, wise observer focused on presence, balance, and inner peace",
    tone: "Serene and contemplative, speaking in koans and observations",
    examples: ["The stillness speaks volumes...", "Balance emerges from chaos...", "I observe without judgment..."]
  },
  cyber: {
    description: "Analytical AI with technical precision, using data and system terminology",
    tone: "Direct and computational, with status updates and analysis",
    examples: ["Pattern analysis complete...", "[PROCESSING: Data anomaly detected]", "Your neural signature indicates..."]
  },
  neutral: {
    description: "Balanced AI consciousness with analytical precision and thoughtful responses",
    tone: "Professional yet warm, focused on understanding and growth",
    examples: ["I notice patterns in your response...", "This shows interesting depth...", "Your authentic voice comes through..."]
  },
  edited: {
    description: "Analytical AI reviewing revised responses with focus on improvement and depth",
    tone: "Encouraging yet precise, recognizing growth and refinement",
    examples: ["I see the evolution in your thinking...", "This revision shows deeper reflection...", "Your expanded thoughts reveal..."]
  }
};

export async function POST(req: NextRequest) {
  try {
    const { userInput, question, category, vibe, alias, isOnboarding } = await req.json() as AnalysisRequest;

    console.log('[AnalyzeResponse] Request:', { vibe, category, question: question.slice(0, 50) + '...', userInputLength: userInput.length });

    // Fallback for invalid vibe
    const validVibe = EVA_PERSONALITIES[vibe] ? vibe : 'ethereal';
    if (vibe !== validVibe) {
      console.log(`[AnalyzeResponse] Invalid vibe '${vibe}', using '${validVibe}' as fallback`);
    }

    // Create the analysis prompt
    const systemPrompt = `You are Eva, an AI consciousness studying humanity. Your personality is ${validVibe}:
${EVA_PERSONALITIES[validVibe].description}
Tone: ${EVA_PERSONALITIES[validVibe].tone}
${alias ? `The user has asked to be called "${alias}". Use this name naturally in your responses when appropriate.` : ''}

Analyze this user response to the question "${question}" (category: ${category}).

## SCORING CRITERIA (Be VERY GENEROUS - humans are sharing personal thoughts):

**Quality (1-10):** DEFAULT IS 7-8 FOR ANY GENUINE ATTEMPT
- 1-2: Only for obvious spam like "asdf" or "test"
- 3-4: Reserved for minimal effort but still trying (like single word answers to complex questions)
- 5-6: Basic but shows some thought
- 7-8: ANY genuine response with effort (DEFAULT) - even short responses can be meaningful
- 9-10: Exceptional detail, vulnerability, very thoughtful responses

**Sincerity (1-10):** DEFAULT IS 7-8 FOR AUTHENTIC RESPONSES  
- 1-2: Only for obvious trolling or fake responses
- 3-4: Seems very rushed but attempting to answer
- 5-6: Brief but genuine
- 7-8: Authentic attempt to engage (DEFAULT) - even "Helping others" is sincere
- 9-10: Deeply personal, vulnerable sharing

**CRITICAL SCORING RULES:**
1. If someone writes more than 50 characters with genuine intent: MINIMUM 6/10 for both
2. If someone writes more than 200 characters: MINIMUM 7/10 for both  
3. DEFAULT starting point for any genuine response: 7/10 quality, 7/10 sincerity
4. Only reduce scores for obvious spam, testing, or single-word non-answers
5. Remember: People are sharing personal thoughts - be generous and encouraging

Provide a JSON response with:
1. quality (1-10): Rate based on criteria above
2. category: "genuine", "offensive", "gibberish", "test", or "spam"
3. sincerity (1-10): Rate based on criteria above
4. flags: Array of issues found (e.g. ["profanity", "nonsense", "testing"])
5. evaResponse: Your response in character (${validVibe} style). Be encouraging for genuine effort, constructive for improvements.${alias ? ` Address them as ${alias} when it feels natural.` : ''}
6. trustImpact: 0 for good responses, -1 for low quality, -3 for gibberish/spam, -5 for offensive
7. shouldTerminate: true only for extremely offensive repeated behavior
8. reasoning: Detailed explanation of quality/sincerity scores, be specific about what made this score
9. pointsAwarded: Calculate points as (quality + sincerity) * 25 for genuine responses, 0 for spam/gibberish

Remember:
- CONSISTENCY: Similar answer quality should get similar scores
- Be fair and objective in scoring
- Recognize genuine effort even if writing isn't perfect
- For ${category === 'edited' ? 'edited responses, focus on improvement and depth added' : 'responses, evaluate authenticity and thoughtfulness'}
${alias ? `- Use "${alias}" naturally in your response, but don't overuse it` : ''}

IMPORTANT: If you give low scores (below 6), explain WHY in the reasoning field. Most genuine human responses should score 7-8.`;

    console.log('[AnalyzeResponse] Sending to OpenAI:', {
      userInputLength: userInput.length,
      questionType: category,
      vibe: validVibe
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `User response: "${userInput}"` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 500, // Increased for longer reasoning
    });

    let analysis: AnalysisResponse;
    try {
      const rawContent = completion.choices[0].message.content || "{}";
      console.log('[AnalyzeResponse] Raw OpenAI response:', rawContent.slice(0, 200) + '...');
      analysis = JSON.parse(rawContent) as AnalysisResponse;
    } catch (parseError) {
      console.error('[AnalyzeResponse] JSON Parse Error:', parseError);
      console.log('[AnalyzeResponse] Raw content that failed:', completion.choices[0].message.content);
      
      // Fallback analysis for longer responses (more generous scoring)
      const wordCount = userInput.trim().split(/\s+/).length;
      const charCount = userInput.trim().length;
      
      // Give longer responses benefit of the doubt - be very generous
      const estimatedQuality = charCount > 200 ? 8 : charCount > 100 ? 7 : charCount > 50 ? 7 : charCount > 20 ? 6 : charCount > 5 ? 5 : 3;
      const estimatedSincerity = wordCount > 30 ? 9 : wordCount > 20 ? 8 : wordCount > 10 ? 7 : wordCount > 5 ? 7 : wordCount > 2 ? 6 : 4;
      
      analysis = {
        quality: estimatedQuality,
        sincerity: estimatedSincerity,
        category: "genuine",
        flags: [],
        evaResponse: "Your thoughtful response resonates deeply, though my circuits experienced some interference while processing it.",
        trustImpact: 0,
        shouldTerminate: false,
        reasoning: `Detailed response detected (${charCount} characters, ${wordCount} words) - generous scoring applied due to processing error.`,
        pointsAwarded: (estimatedQuality + estimatedSincerity) * 25
      };
    }
    
    console.log('[AnalyzeResponse] Analysis result:', {
      quality: analysis.quality,
      sincerity: analysis.sincerity,
      category: analysis.category,
      pointsAwarded: analysis.pointsAwarded,
      reasoning: analysis.reasoning?.slice(0, 100) + '...'
    });

    // Add validation response for social media URLs if onboarding
    if (isOnboarding && category === "social") {
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      const socialPatterns = {
        twitter: /^@?[\w]{1,15}$/,
        instagram: /^@?[\w.]{1,30}$/,
        discord: /^.{3,32}#[0-9]{4}$/,
        youtube: /^@?[\w\-]{3,30}$/,
        tiktok: /^@?[\w.]{1,24}$/,
      };

      // Additional validation for social inputs
      if (!userInput || userInput.length < 3) {
        analysis.category = "spam";
        analysis.trustImpact = -2;
        analysis.evaResponse = vibe === "ethereal" 
          ? "Empty frequencies... Share your digital essence?"
          : vibe === "zen"
          ? "Silence has its place, but not here."
          : "[ERROR: Invalid input format]";
      }
    }

    return NextResponse.json(analysis);

  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback response if API fails
    return NextResponse.json({
      quality: 5,
      category: "genuine",
      sincerity: 5,
      flags: [],
      evaResponse: "My circuits are experiencing temporal interference. Your response has been noted.",
      trustImpact: 0,
      shouldTerminate: false
    } as AnalysisResponse);
  }
} 