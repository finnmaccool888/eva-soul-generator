# EVA OG System Documentation

## Overview
The OG system recognizes and rewards early supporters of EVA with special benefits when they log in with their Twitter account.

## Features

### 1. OG Recognition
- Automatically checks Twitter username against the OG list (1,157 verified OG users)
- Shows a special welcome popup with custom OG badge image
- Awards 10,000 bonus points on first login
- Stores OG status in user profile

### 2. OG Popup
- Beautiful animated popup with:
  - Custom OG badge image
  - Personalized welcome message
  - Points award animation
  - Gradient background with sparkle effects
- Only shown once per user (tracked in localStorage)

### 3. Data Storage
All user data is stored in Supabase and tied to their Twitter account:

#### User Table
- `is_og`: Boolean flag for OG status
- Twitter handle, name, and verification status

#### User Profile Table  
- `points`: Total points including OG bonus
- `is_og_rewarded`: Tracks if OG points were awarded
- `human_score`: Average score across all sessions
- `total_questions_answered`: Total questions answered

#### Session History Table
- Tracks each question session
- Stores questions answered, human score, and points earned
- Linked to user account

#### Soul Seed & Answers
- All question answers stored in soul seed
- Analyzed responses with quality scores
- Earned traits and artifacts

## Implementation Details

### OG List
- Stored in `/src/data/ogList.json`
- 1,157 verified OG usernames
- Converted from text file to JSON for performance
- O(1) lookup using Set data structure

### OG Verification Flow
1. User logs in with Twitter
2. System checks if username is in OG list
3. If OG and first time:
   - Awards 10,000 points
   - Shows OG popup
   - Updates user profile
4. Stores OG status in database

### Files Modified
- `/src/lib/mirror/og-verification.ts` - OG checking utilities
- `/src/components/mirror/og-popup.tsx` - OG welcome popup
- `/src/lib/supabase/services.ts` - Database operations
- `/src/app/api/auth/twitter/callback/route.ts` - Auth callback
- `/src/components/mirror/mirror-app.tsx` - Main app component
- `/supabase/og-update.sql` - Database schema updates

## Testing

To test the OG system:

1. Log in with an OG username (e.g., "starlordyftw")
2. You should see the OG popup on first login
3. Check that 10,000 points were awarded
4. Verify OG status is saved in profile

## Security

- OG status can only be set during Twitter authentication
- Points can only be awarded once per account
- All data tied to verified Twitter account
- Different Twitter accounts = different soul accounts 