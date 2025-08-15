"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MirrorQuestion, EvaReaction, getEvaReaction, getDailyQuestions } from "@/lib/mirror/questions";
import { feedSeed, loadSeed, saveSeed } from "@/lib/mirror/seed";
import { track } from "@/lib/mirror/analytics";
import { checkTraitUnlock, Trait } from "@/lib/mirror/traits-v2";
import ChipInput from "./chip-input";
import PrimaryButton from "../primary-button";
import { Sparkles, Brain, Heart, Zap } from "lucide-react";

type TransmissionStage = "intro" | "question" | "thinking" | "reaction" | "complete";

const moodIcons = {
  curious: Brain,
  contemplative: Brain,
  delighted: Heart,
  playful: Sparkles,
  shocked: Zap,
};

export default function EvaTransmission() {
  const [stage, setStage] = useState<TransmissionStage>("intro");
  const [questions, setQuestions] = useState<MirrorQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [evaReaction, setEvaReaction] = useState<EvaReaction | null>(null);
  const [sessionData, setSessionData] = useState<Array<{
    question: MirrorQuestion;
    answer: string;
    reaction: EvaReaction | null;
  }>>([]);
  const [unlockedTrait, setUnlockedTrait] = useState<Trait | null>(null);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex >= questions.length - 1;

  useEffect(() => {
    // Load daily questions
    const dailyQuestions = getDailyQuestions(5);
    setQuestions(dailyQuestions);
  }, []);

  useEffect(() => {
    // Auto-advance after Eva's reaction
    if (stage === "reaction" && !evaReaction?.followUp) {
      const timer = setTimeout(() => {
        handleContinue();
      }, 5000);
      setAutoAdvanceTimer(timer);
      
      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [stage, evaReaction]);

  function handleSubmitAnswer() {
    if (!userInput.trim() || !currentQuestion) return;

    // Track answer
    track("prompt_answered", {
      questionId: currentQuestion.id,
      category: currentQuestion.category,
      answerLength: userInput.length,
    });

    // Get Eva's reaction
    const reaction = getEvaReaction(userInput, currentQuestion.category);
    setEvaReaction(reaction);

    // Check for trait unlock
    const seed = loadSeed();
    if (seed) {
      const allAnswers = [
        ...sessionData.map(d => ({
          questionId: d.question.id,
          category: d.question.category,
          text: d.answer,
          depth: d.question.difficulty
        })),
        {
          questionId: currentQuestion.id,
          category: currentQuestion.category,
          text: userInput,
          depth: currentQuestion.difficulty
        }
      ];

      const newTraits = checkTraitUnlock(
        {
          questionId: currentQuestion.id,
          category: currentQuestion.category,
          text: userInput,
          depth: currentQuestion.difficulty
        },
        allAnswers.slice(0, -1), // Don't include current answer twice
        seed.earnedTraits || []
      );

      if (newTraits.length > 0) {
        // Save the first unlocked trait
        const trait = newTraits[0];
        setUnlockedTrait(trait);
        
        // Update soul seed with new trait
        const newEarnedTrait = {
          traitId: trait.id,
          earnedAt: Date.now(),
          triggerAnswer: userInput,
          questionId: currentQuestion.id,
          strength: 50 // Start at 50 strength
        };
        
        seed.earnedTraits = [...(seed.earnedTraits || []), newEarnedTrait];
        saveSeed(seed);
        
        track("trait_unlocked", {
          traitId: trait.id,
          category: trait.category,
          rarity: trait.rarity
        });
      }
    }

    // Save to session
    setSessionData([...sessionData, {
      question: currentQuestion,
      answer: userInput,
      reaction,
    }]);

    // Show thinking animation
    setStage("thinking");
    
    // After thinking, show reaction
    setTimeout(() => {
      setStage("reaction");
    }, 1500);
  }

  function handleContinue() {
    if (autoAdvanceTimer) {
      clearTimeout(autoAdvanceTimer);
      setAutoAdvanceTimer(null);
    }

    if (isLastQuestion) {
      // Complete session
      completeSession();
    } else {
      // Next question
      setCurrentIndex(currentIndex + 1);
      setUserInput("");
      setEvaReaction(null);
      setUnlockedTrait(null);
      setStage("question");
    }
  }

  function completeSession() {
    // Feed the soul seed with all answers
    let seed = loadSeed();
    if (seed) {
      sessionData.forEach(({ question, answer }) => {
        const result = feedSeed(seed, question.id, answer);
        seed = result.seed;
      });
    }

    track("daily_completed", {
      questionsAnswered: sessionData.length,
    });

    setStage("complete");
  }

  function skipQuestion() {
    track("prompt_skipped", {
      questionId: currentQuestion?.id,
    });
    handleContinue();
  }

  const progressPercentage = questions.length > 0 
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      {stage !== "intro" && stage !== "complete" && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentQuestion?.category}
            </span>
          </div>
          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Intro Stage */}
        {stage === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <img 
                src="/images/eva%20assets/eva-pfp.png" 
                alt="Eva"
                className="w-full h-full rounded-full"
              />
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(168, 85, 247, 0.4)",
                    "0 0 40px rgba(236, 72, 153, 0.4)",
                    "0 0 20px rgba(168, 85, 247, 0.4)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>

            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Greetings, consciousness
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              I&apos;m Eva, studying your species through careful observation. 
              Your answers help me understand what it means to be... human.
            </p>

            <p className="text-sm text-muted-foreground">
              Today&apos;s transmission contains {questions.length} questions. 
              Shall we begin?
            </p>

            <PrimaryButton onClick={() => setStage("question")} className="mx-auto">
              I&apos;m ready
            </PrimaryButton>
          </motion.div>
        )}

        {/* Question Stage */}
        {stage === "question" && currentQuestion && (
          <motion.div
            key={`question-${currentIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4">
              <img 
                src="/images/eva%20assets/eva-pfp.png" 
                alt="Eva"
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
              <div className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground italic">
                  {currentQuestion.evaPrompt}
                </p>
                <h3 className="text-xl font-medium">
                  {currentQuestion.text}
                </h3>
              </div>
            </div>

            <ChipInput
              value={userInput}
              onChange={setUserInput}
              placeholder="Type your answer..."
              chips={currentQuestion.chipSuggestions}
            />

            <div className="flex justify-between items-center">
              <button
                onClick={skipQuestion}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Skip this question
              </button>
              
              <PrimaryButton 
                onClick={handleSubmitAnswer}
                disabled={!userInput.trim()}
              >
                Submit Answer
              </PrimaryButton>
            </div>
          </motion.div>
        )}

        {/* Thinking Stage */}
        {stage === "thinking" && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <img 
                src="/images/eva%20assets/eva-pfp.png" 
                alt="Eva thinking"
                className="w-full h-full rounded-full"
              />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-purple-500/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <p className="text-muted-foreground italic">
              *circuits humming softly*
            </p>
          </motion.div>
        )}

        {/* Reaction Stage */}
        {stage === "reaction" && evaReaction && (
          <motion.div
            key="reaction"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="relative">
                <img 
                  src="/images/eva%20assets/eva-pfp.png" 
                  alt="Eva"
                  className="w-12 h-12 rounded-full"
                />
                {React.createElement(moodIcons[evaReaction.mood], {
                  className: "w-5 h-5 absolute -bottom-1 -right-1 bg-background rounded-full p-1 text-purple-400",
                })}
              </div>
              
              <div className="flex-1 space-y-4">
                <p className="text-lg">
                  {evaReaction.response}
                </p>

                {(unlockedTrait || evaReaction.unlock) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    {unlockedTrait && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                        <span className="text-lg">{unlockedTrait.icon}</span>
                        <div>
                          <div className="font-medium">{unlockedTrait.name}</div>
                          <div className="text-xs opacity-80">{unlockedTrait.description}</div>
                        </div>
                        <span className="text-xs bg-purple-500/20 px-2 py-1 rounded-full">
                          {unlockedTrait.hashtag}
                        </span>
                      </div>
                    )}
                    {evaReaction.unlock && !unlockedTrait && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm">
                        <Sparkles className="w-4 h-4" />
                        Trait unlocked: {evaReaction.unlock}
                      </div>
                    )}
                  </motion.div>
                )}

                {evaReaction.followUp && (
                  <p className="text-sm text-muted-foreground italic">
                    {evaReaction.followUp}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end items-center gap-4">
              {!autoAdvanceTimer ? (
                <PrimaryButton onClick={handleContinue}>
                  Continue
                </PrimaryButton>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Continuing in <span className="font-mono">5</span>s...
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Complete Stage */}
        {stage === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{ duration: 2 }}
            >
              <Sparkles className="w-16 h-16 mx-auto text-purple-400" />
            </motion.div>

            <h2 className="text-2xl font-bold">Transmission Complete</h2>
            
            <p className="text-muted-foreground max-w-md mx-auto">
              Thank you for this enlightening exchange. Your Soul Seed has absorbed 
              new insights. I&apos;ll process what I&apos;ve learned about your consciousness.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-sm font-medium mb-2">Today&apos;s Insights:</p>
              <p className="text-xs text-muted-foreground">
                {sessionData.length} questions answered<br />
                {sessionData.filter(d => d.reaction?.unlock).length + (unlockedTrait ? 1 : 0)} new traits discovered
              </p>
            </div>

            <p className="text-sm text-muted-foreground">
              Return tomorrow for new questions. I suspect we&apos;ll have more to explore.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 