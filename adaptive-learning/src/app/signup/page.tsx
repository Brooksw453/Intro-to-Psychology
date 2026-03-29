import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DASHBOARD_URL, COURSE_SLUG } from '@/lib/sso';

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    redirect(profile?.role === 'instructor' ? '/instructor' : '/chapters');
  }

  // All auth is handled by the course dashboard
  redirect(`${DASHBOARD_URL}/courses/${COURSE_SLUG}`);
}
