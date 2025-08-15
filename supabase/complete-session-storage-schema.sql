-- Complete Session Storage Schema
-- Run this in Supabase SQL editor to add detailed session storage

-- Create sessions table to store session metadata
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  session_date DATE DEFAULT CURRENT_DATE,
  is_complete BOOLEAN DEFAULT FALSE,
  questions_answered INTEGER DEFAULT 0,
  human_score INTEGER DEFAULT NULL,
  points_earned INTEGER DEFAULT 0,
  streak_day INTEGER DEFAULT 1, -- which day in their current streak
  session_duration_seconds INTEGER DEFAULT NULL
);

-- Create session_questions table to store individual Q&A pairs
CREATE TABLE IF NOT EXISTS session_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL, -- 1-5 for the order in session
  question_id VARCHAR(50) NOT NULL, -- question ID from the questions pool
  question_text TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  answer_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answer_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  character_count INTEGER DEFAULT 0,
  word_count INTEGER DEFAULT 0,
  
  -- Eva's response data
  eva_response_text TEXT DEFAULT NULL,
  eva_response_mood VARCHAR(50) DEFAULT NULL, -- shocked, curious, contemplative, playful
  eva_response_received_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  -- Scoring breakdown for this specific question
  base_score INTEGER DEFAULT 30,
  length_bonus INTEGER DEFAULT 0,
  detail_bonus INTEGER DEFAULT 0,
  personal_bonus INTEGER DEFAULT 0,
  engagement_bonus INTEGER DEFAULT 0,
  total_question_score INTEGER DEFAULT 30
);

-- Create session_analytics table for detailed scoring breakdown
CREATE TABLE IF NOT EXISTS session_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  chip_only_answers INTEGER DEFAULT 0,
  thoughtful_answers INTEGER DEFAULT 0,
  average_answer_length DECIMAL(8,2) DEFAULT 0,
  detail_level VARCHAR(20) DEFAULT 'minimal', -- minimal, basic, detailed, comprehensive
  feedback_points TEXT[] DEFAULT '{}', -- array of feedback strings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_complete ON sessions(is_complete);
CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_session_questions_order ON session_questions(session_id, question_order);
CREATE INDEX IF NOT EXISTS idx_session_analytics_session_id ON session_analytics(session_id);

-- Update existing session_history table to reference new sessions table
ALTER TABLE session_history ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES sessions(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_session_history_session_id ON session_history(session_id);

-- Create a comprehensive view for session data
CREATE OR REPLACE VIEW session_details_view AS
SELECT 
    s.id as session_id,
    s.user_id,
    u.twitter_handle,
    u.twitter_name,
    s.created_at,
    s.completed_at,
    s.session_date,
    s.is_complete,
    s.questions_answered,
    s.human_score,
    s.points_earned,
    s.streak_day,
    s.session_duration_seconds,
    sa.chip_only_answers,
    sa.thoughtful_answers,
    sa.average_answer_length,
    sa.detail_level,
    sa.feedback_points,
    (
        SELECT json_agg(
            json_build_object(
                'question_order', sq.question_order,
                'question_id', sq.question_id,
                'question_text', sq.question_text,
                'user_answer', sq.user_answer,
                'answer_submitted_at', sq.answer_submitted_at,
                'answer_edited_at', sq.answer_edited_at,
                'character_count', sq.character_count,
                'word_count', sq.word_count,
                'eva_response_text', sq.eva_response_text,
                'eva_response_mood', sq.eva_response_mood,
                'eva_response_received_at', sq.eva_response_received_at,
                'total_question_score', sq.total_question_score
            ) ORDER BY sq.question_order
        )
        FROM session_questions sq 
        WHERE sq.session_id = s.id
    ) as questions_and_answers
FROM sessions s
JOIN users u ON s.user_id = u.id
LEFT JOIN session_analytics sa ON sa.session_id = s.id
ORDER BY s.created_at DESC;

-- Sample queries (commented out)
-- SELECT * FROM session_details_view WHERE user_id = 'your-user-id' LIMIT 5;
-- SELECT * FROM sessions WHERE user_id = 'your-user-id' ORDER BY created_at DESC;
-- SELECT * FROM session_questions WHERE session_id = 'session-id' ORDER BY question_order; 