-- Profile Dashboard Schema Updates
-- Run this in Supabase SQL editor to add profile dashboard features

-- Add streak tracking to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_activity_date DATE DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC';

-- Update session_history table for better tracking
ALTER TABLE session_history ADD COLUMN IF NOT EXISTS session_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE session_history ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT FALSE; -- if user finished all 5 questions

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_current_streak ON user_profiles(current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_longest_streak ON user_profiles(longest_streak DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_points ON user_profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_session_history_date ON session_history(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_history_complete ON session_history(is_complete);

-- Create a view for leaderboard (optional, can also do in API)
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    up.id,
    u.twitter_handle,
    u.twitter_name,
    u.profile_image,
    up.points,
    up.human_score,
    up.total_questions_answered,
    up.current_streak,
    up.longest_streak,
    up.is_og,
    ROW_NUMBER() OVER (ORDER BY up.points DESC, up.human_score DESC) as rank
FROM user_profiles up
JOIN users u ON up.user_id = u.id
WHERE up.points > 0
ORDER BY up.points DESC, up.human_score DESC;

-- Sample data check queries (commented out)
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_profiles';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'session_history';
-- SELECT * FROM leaderboard_view LIMIT 10; 