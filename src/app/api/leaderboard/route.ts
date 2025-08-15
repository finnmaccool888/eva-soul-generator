import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { calculateTotalPoints } from '@/lib/mirror/profile';

export async function GET(request: NextRequest) {
  try {
    console.log('[Leaderboard API] Fetching global leaderboard');

    // Get the current user's actual profile from localStorage (if passed via headers)
    const userDataHeader = request.headers.get('x-user-profile');
    let currentUserData = null;
    
    if (userDataHeader) {
      try {
        currentUserData = JSON.parse(decodeURIComponent(userDataHeader));
      } catch (e) {
        console.log('[Leaderboard API] Could not parse user data header');
      }
    }

    // Use unified points calculation
    const getActualPoints = (profile: any) => {
      if (!profile) return 0;
      return calculateTotalPoints(profile);
    };

    // Create dynamic leaderboard with actual user data
    const mockLeaderboard = [
      {
        rank: 1,
        twitterHandle: 'starlordyftw',
        twitterName: 'Starlordy',
        profileImage: 'https://pbs.twimg.com/profile_images/1858173092679602176/vtZtKo9k_normal.jpg',
        points: currentUserData ? getActualPoints(currentUserData) : 11000,
        humanScore: currentUserData?.humanScore || 85,
        totalQuestionsAnswered: currentUserData?.totalQuestionsAnswered || 5,
        currentStreak: 1,
        longestStreak: 1,
        isOG: true
      },
      {
        rank: 2,
        twitterHandle: 'EvaOnlineXyz',
        twitterName: 'Eva',
        profileImage: 'https://pbs.twimg.com/profile_images/1942621801466511361/oJv9r263_normal.jpg',
        points: 11000,
        humanScore: 95,
        totalQuestionsAnswered: 10,
        currentStreak: 5,
        longestStreak: 5,
        isOG: true
      }
    ];

    return NextResponse.json({
      success: true,
      leaderboard: mockLeaderboard
    });

    // Use the leaderboard view we created, or fallback to manual query
    let query = supabase
      .from('leaderboard_view')
      .select('*')
      .limit(50);

    let { data: leaderboardData, error } = await query;

    // Fallback if view doesn't exist yet
    if (error) {
      console.log('[Leaderboard API] View not found, using manual query');
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('user_profiles')
        .select(`
          id,
          points,
          human_score,
          total_questions_answered,
          current_streak,
          longest_streak,
          is_og,
          users!inner (
            twitter_handle,
            twitter_name,
            profile_image
          )
        `)
        .gt('points', 0)
        .order('points', { ascending: false })
        .limit(50);

      if (fallbackError) {
        console.error('[Leaderboard API] Fallback query error:', fallbackError);
        return NextResponse.json(
          { error: 'Failed to fetch leaderboard data' },
          { status: 500 }
        );
      }

      // Transform fallback data to match expected format
      leaderboardData = fallbackData?.map((item, index) => ({
        rank: index + 1,
        id: item.id,
        twitter_handle: item.users.twitter_handle,
        twitter_name: item.users.twitter_name,
        profile_image: item.users.profile_image,
        points: item.points,
        human_score: item.human_score || 0,
        total_questions_answered: item.total_questions_answered || 0,
        current_streak: item.current_streak || 0,
        longest_streak: item.longest_streak || 0,
        is_og: item.is_og || false
      })) || [];
    }

    console.log(`[Leaderboard API] Found ${leaderboardData?.length || 0} users`);

    return NextResponse.json({
      success: true,
      leaderboard: leaderboardData || [],
      total: leaderboardData?.length || 0,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Leaderboard API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 