"use server";

import { auth } from '@clerk/nextjs/server';
import { getTenantId } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { UserProfileDTO } from '@/types';

// Do NOT import ApiServerActions at top level (per .cursor/rules/nextjs_api_routes.mdc):
// ApiServerActions imports @clerk/nextjs/server, which would pull server-only code into
// the client bundle when ProfileForm (client) imports this file. Use dynamic import inside
// the server actions that delegate to ApiServerActions so the client never bundles it.

/**
 * Server action to trigger profile reconciliation after authentication
 * This ensures mobile payment profiles get updated with proper Clerk user data
 */
export async function triggerProfileReconciliationServer() {
  try {
    console.log('[PROFILE-RECONCILIATION-SERVER] 🚀 Profile reconciliation server action called');

    // Get the authenticated user
    const { userId } = await auth();
    console.log('[PROFILE-RECONCILIATION-SERVER] 🔍 Auth result:', { userId, hasUserId: !!userId });

    if (!userId) {
      console.log('[PROFILE-RECONCILIATION-SERVER] ❌ No authenticated user found');
      return {
        success: false,
        error: 'Unauthorized',
        details: 'User not authenticated'
      };
    }

    console.log('[PROFILE-RECONCILIATION-SERVER] 👤 User authenticated:', userId);

    // 1. Fetch Clerk user data to get current names and email
    const clerkUserResponse = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!clerkUserResponse.ok) {
      console.error('[PROFILE-RECONCILIATION-SERVER] ❌ Failed to fetch Clerk user data:', clerkUserResponse.status);
      return {
        success: false,
        error: 'Failed to fetch user data',
        details: `Clerk API returned ${clerkUserResponse.status}`
      };
    }

    const clerkUser = await clerkUserResponse.json();
    const email = clerkUser.email_addresses?.[0]?.email_address;
    const firstName = clerkUser.first_name;
    const lastName = clerkUser.last_name;

    console.log('[PROFILE-RECONCILIATION-SERVER] 📊 Clerk user data:', {
      userId,
      email,
      firstName,
      lastName
    });

    if (!email) {
      console.log('[PROFILE-RECONCILIATION-SERVER] ❌ No email found for user');
      return {
        success: false,
        error: 'No email found for user',
        details: 'User has no email address'
      };
    }

    // 2. Lookup existing profile by email (per nextjs_api_routes.mdc: use fetchWithJwtRetry)
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error('API base URL not configured');
    }
    const profileUrl = `${apiBaseUrl}/api/user-profiles?email.equals=${encodeURIComponent(email)}`;
    const profileRes = await fetchWithJwtRetry(profileUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, '[triggerProfileReconciliationServer] profile-lookup');

    if (!profileRes.ok) {
      console.log('[PROFILE-RECONCILIATION-SERVER] ❌ Failed to lookup profile by email:', profileRes.status);
      return {
        success: false,
        error: 'Failed to lookup profile',
        details: `Backend API returned ${profileRes.status}`
      };
    }

    const profiles = await profileRes.json();
    if (!Array.isArray(profiles) || profiles.length === 0) {
      console.log('[PROFILE-RECONCILIATION-SERVER] ℹ️ No existing profile found by email');
      return {
        success: true,
        message: 'No existing profile found',
        reconciliationNeeded: false
      };
    }

    const existingProfile = profiles[0];
    console.log('[PROFILE-RECONCILIATION-SERVER] 📋 Found existing profile:', {
      profileId: existingProfile.id,
      profileUserId: existingProfile.userId,
      profileFirstName: existingProfile.firstName,
      profileLastName: existingProfile.lastName,
      currentClerkUserId: userId
    });

    // 3. Check if profile needs reconciliation
    const needsUserIdUpdate = existingProfile.userId !== userId;
    const needsNameUpdate = !existingProfile.firstName ||
                           existingProfile.firstName.trim() === '' ||
                           !existingProfile.lastName ||
                           existingProfile.lastName.trim() === '' ||
                           existingProfile.firstName === 'Pending' ||
                           existingProfile.lastName === 'User';

    const needsReconciliation = needsUserIdUpdate || needsNameUpdate;

    console.log('[PROFILE-RECONCILIATION-SERVER] 🔍 Reconciliation check:', {
      needsUserIdUpdate,
      needsNameUpdate,
      needsReconciliation
    });

    if (!needsReconciliation) {
      console.log('[PROFILE-RECONCILIATION-SERVER] ✅ Profile is already up-to-date');
      return {
        success: true,
        message: 'Profile is up-to-date',
        reconciliationNeeded: false
      };
    }

    // 4. Perform profile reconciliation
    console.log('[PROFILE-RECONCILIATION-SERVER] 🔄 Starting profile reconciliation');

    const updatePayload: Partial<UserProfileDTO> = {
      id: existingProfile.id,
      userId: userId, // Always update to current Clerk user ID
      tenantId: getTenantId(), // CRITICAL: Always include tenantId for multi-tenant support
      updatedAt: new Date().toISOString()
    };

    // Update names if they're empty or different from Clerk data
    if (firstName && (!existingProfile.firstName || existingProfile.firstName.trim() === '' || existingProfile.firstName === 'Pending')) {
      updatePayload.firstName = firstName;
    }

    if (lastName && (!existingProfile.lastName || existingProfile.lastName.trim() === '' || existingProfile.lastName === 'User')) {
      updatePayload.lastName = lastName;
    }

    console.log('[PROFILE-RECONCILIATION-SERVER] 📝 Update payload:', updatePayload);

    // Update the profile (per nextjs_api_routes.mdc: use fetchWithJwtRetry)
    const updateUrl = `${apiBaseUrl}/api/user-profiles/${existingProfile.id}`;
    const updateRes = await fetchWithJwtRetry(updateUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json'
      },
      body: JSON.stringify(updatePayload)
    }, '[triggerProfileReconciliationServer] profile-update');

    if (!updateRes.ok) {
      const errorText = await updateRes.text();
      console.error('[PROFILE-RECONCILIATION-SERVER] ❌ Profile update failed:', updateRes.status, errorText);
      return {
        success: false,
        error: 'Profile update failed',
        details: `Backend returned ${updateRes.status}: ${errorText}`
      };
    }

    const updatedProfile = await updateRes.json();
    console.log('[PROFILE-RECONCILIATION-SERVER] ✅ Profile reconciled successfully:', {
      profileId: updatedProfile.id,
      newUserId: updatedProfile.userId,
      newFirstName: updatedProfile.firstName,
      newLastName: updatedProfile.lastName
    });

    return {
      success: true,
      message: 'Profile reconciled successfully',
      reconciliationNeeded: true,
      profile: updatedProfile
    };

  } catch (error) {
    console.error('[PROFILE-RECONCILIATION-SERVER] ❌ Error during profile reconciliation:', error);
    return {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Update user profile action - delegates to ApiServerActions
 * Uses centralized updateUserProfileServer which handles JWT authentication
 */
export async function updateUserProfileAction(profileId: number, payload: Partial<UserProfileDTO>): Promise<UserProfileDTO | null> {
  console.log('[Profile Action] Updating profile:', profileId, 'with payload:', payload);
  const { updateUserProfileServer } = await import('./ApiServerActions');
  return updateUserProfileServer(profileId, payload);
}

/**
 * Create user profile action - delegates to ApiServerActions
 * Uses centralized createUserProfileServer
 */
export async function createUserProfileAction(payload: Omit<UserProfileDTO, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfileDTO | null> {
  const { createUserProfileServer } = await import('./ApiServerActions');
  return createUserProfileServer(payload);
}

export async function resubscribeEmailAction(email: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[RESUBSCRIBE-EMAIL-SERVER] 🚀 Resubscribe email server action called');
    console.log('[RESUBSCRIBE-EMAIL-SERVER] 📧 Email:', email);
    console.log('[RESUBSCRIBE-EMAIL-SERVER] 🔑 Token:', token);

    // Get API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error('API base URL not configured');
    }

    // Get tenant ID
    const tenantId = getTenantId();

    // Call backend (per nextjs_api_routes.mdc: use fetchWithJwtRetry)
    const url = `${apiBaseUrl}/api/user-profiles/resubscribe-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&tenantId=${encodeURIComponent(tenantId)}`;
    const response = await fetchWithJwtRetry(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, '[resubscribeEmailAction]');

    if (response.ok) {
      console.log('[RESUBSCRIBE-EMAIL-SERVER] ✅ Email resubscribed successfully');
      return {
        success: true,
        message: 'Successfully resubscribed to email notifications!'
      };
    } else {
      const errorText = await response.text();
      console.error('[RESUBSCRIBE-EMAIL-SERVER] ❌ Resubscribe failed:', response.status, errorText);

      // Handle specific error cases
      if (response.status === 400) {
        return {
          success: false,
          message: 'Invalid email address or token. Please try again.'
        };
      } else if (response.status === 404) {
        return {
          success: false,
          message: 'Email not found in our system. Please contact support.'
        };
      } else if (response.status === 401) {
        return {
          success: false,
          message: 'Authentication failed. Please refresh the page and try again.'
        };
      }

      return {
        success: false,
        message: `Failed to resubscribe: ${response.status} ${errorText}`
      };
    }
  } catch (error) {
    console.error('[RESUBSCRIBE-EMAIL-SERVER] ❌ Error resubscribing email:', error);
    return {
      success: false,
      message: `Error resubscribing: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function unsubscribeEmailAction(email: string, token: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('[UNSUBSCRIBE-EMAIL-SERVER] 🚀 Unsubscribe email server action called');
    console.log('[UNSUBSCRIBE-EMAIL-SERVER] 📧 Email:', email);
    console.log('[UNSUBSCRIBE-EMAIL-SERVER] 🔑 Token:', token);

    // Get API base URL
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBaseUrl) {
      throw new Error('API base URL not configured');
    }

    // Get tenant ID
    const tenantId = getTenantId();

    // Call backend (per nextjs_api_routes.mdc: use fetchWithJwtRetry)
    const url = `${apiBaseUrl}/api/user-profiles/unsubscribe-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}&tenantId=${encodeURIComponent(tenantId)}`;
    const response = await fetchWithJwtRetry(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }, '[unsubscribeEmailAction]');

    if (response.ok) {
      console.log('[UNSUBSCRIBE-EMAIL-SERVER] ✅ Email unsubscribed successfully');
      return {
        success: true,
        message: 'Successfully unsubscribed from email notifications!'
      };
    } else {
      const errorText = await response.text();
      console.error('[UNSUBSCRIBE-EMAIL-SERVER] ❌ Unsubscribe failed:', response.status, errorText);

      // Handle specific error cases
      if (response.status === 400) {
        return {
          success: false,
          message: 'Invalid email address or token. Please try again.'
        };
      } else if (response.status === 404) {
        return {
          success: false,
          message: 'Email not found in our system. Please contact support.'
        };
      } else if (response.status === 401) {
        return {
          success: false,
          message: 'Authentication failed. Please refresh the page and try again.'
        };
      }

      return {
        success: false,
        message: `Failed to unsubscribe: ${response.status} ${errorText}`
      };
    }
  } catch (error) {
    console.error('[UNSUBSCRIBE-EMAIL-SERVER] ❌ Error unsubscribing email:', error);
    return {
      success: false,
      message: `Error unsubscribing: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}