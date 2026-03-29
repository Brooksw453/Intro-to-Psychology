import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { verifySSOToken } from '@/lib/sso';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * SSO endpoint — receives a JWT from the Course Dashboard.
 * The user already exists in the shared Supabase (created by Dashboard).
 * Uses admin generateLink + verifyOtp to establish a session cookie
 * on this course app's domain.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${origin}/login?error=missing-token`);
  }

  // 1. Verify the JWT from the dashboard
  let payload;
  try {
    payload = await verifySSOToken(token);
  } catch {
    return NextResponse.redirect(`${origin}/login?error=invalid-token`);
  }

  // 2. Determine landing page based on role
  const isInstructorRole = ['instructor', 'admin', 'super_admin'].includes(payload.role);
  const landingPage = isInstructorRole ? '/instructor' : '/chapters';

  // 3. Generate a magic link OTP via admin, then verify it to create a session
  const adminSupabase = createAdminClient();
  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: 'magiclink',
    email: payload.email,
  });

  if (linkError || !linkData) {
    console.error('SSO generateLink failed:', linkError);
    return NextResponse.redirect(`${origin}/login?error=session-failed`);
  }

  // 4. Create redirect response and a Supabase client that sets cookies on it
  const response = NextResponse.redirect(`${origin}${landingPage}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // 5. Use the OTP token from generateLink to verify and create session
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: payload.email,
    token: linkData.properties.email_otp,
    type: 'email',
  });

  if (verifyError) {
    console.error('SSO verifyOtp failed:', verifyError);
    return NextResponse.redirect(`${origin}/login?error=session-failed`);
  }

  return response;
}
