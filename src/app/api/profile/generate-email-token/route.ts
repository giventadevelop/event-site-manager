import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateEmailSubscriptionTokenServer } from '@/app/profile/ApiServerActions';

export const dynamic = 'force-dynamic';

/**
 * API route to generate email subscription token for a profile.
 * Used by client components (e.g. ProfileForm) to avoid importing server-only ApiServerActions.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const profileId = body?.profileId != null ? Number(body.profileId) : NaN;

    if (!Number.isInteger(profileId) || profileId < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid profileId is required' },
        { status: 400 }
      );
    }

    const result = await generateEmailSubscriptionTokenServer(profileId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[GENERATE-EMAIL-TOKEN] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
