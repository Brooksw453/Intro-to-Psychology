import { createClient } from '@/lib/supabase/server';
import { getAssignment } from '@/lib/content';
import { redirect } from 'next/navigation';
import type { AssignmentDraft } from '@/lib/types';
import AssignmentWorkspace from './AssignmentWorkspace';

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId: idStr } = await params;
  const assignmentId = parseInt(idStr, 10);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Load assignment config
  let assignment;
  try {
    assignment = getAssignment(assignmentId);
  } catch {
    redirect('/chapters');
  }

  // Load existing drafts for this assignment
  const { data: draftsData } = await supabase
    .from('assignment_drafts')
    .select('*')
    .eq('user_id', user.id)
    .eq('assignment_id', assignmentId)
    .order('section_key', { ascending: true })
    .order('draft_number', { ascending: false });

  // Get the latest draft per section
  const latestDrafts = new Map<string, AssignmentDraft>();
  (draftsData || []).forEach((d: AssignmentDraft) => {
    if (!latestDrafts.has(d.section_key)) {
      latestDrafts.set(d.section_key, d);
    }
  });

  const draftsMap: Record<string, AssignmentDraft> = {};
  latestDrafts.forEach((draft, key) => {
    draftsMap[key] = draft;
  });

  return (
    <AssignmentWorkspace
      assignment={assignment}
      savedDrafts={draftsMap}
    />
  );
}
