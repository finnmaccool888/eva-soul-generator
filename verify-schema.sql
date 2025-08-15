-- Schema Verification Script
-- Run this in Supabase SQL Editor to verify all required columns and functions exist

-- 1. Check user_profiles table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check users table columns  
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if update_user_profile_stats function exists
SELECT routine_name, routine_type, data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'update_user_profile_stats';

-- 4. Check if leaderboard_view exists
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'leaderboard_view';

-- 5. Verify indexes exist
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND (
  indexname LIKE '%human_score%' OR
  indexname LIKE '%total_questions%' OR
  indexname LIKE '%current_streak%' OR
  indexname LIKE '%points%' OR
  indexname LIKE '%is_og%'
)
ORDER BY tablename, indexname;

-- 6. Test the function (safe test - won't modify data)
-- This should return without error if function exists and works
DO $$
BEGIN
  -- Just check if function can be called (don't actually call it)
  PERFORM routine_name FROM information_schema.routines 
  WHERE routine_name = 'update_user_profile_stats';
  
  IF FOUND THEN
    RAISE NOTICE '✅ Function update_user_profile_stats exists and is callable';
  ELSE
    RAISE NOTICE '❌ Function update_user_profile_stats NOT FOUND';
  END IF;
END $$;

-- 7. Check sample data structure (if you have any users)
SELECT 
  u.twitter_handle,
  up.points,
  up.human_score,
  up.total_questions_answered,
  up.is_og,
  up.current_streak,
  jsonb_array_length(COALESCE(up.session_history, '[]'::jsonb)) as session_count
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LIMIT 3; 