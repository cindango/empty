import { fail, redirect } from '@sveltejs/kit'

export const load = async ({ params, locals: { supabase, getSession } }) => {
  const session = await getSession();
  const { username, document_id } = params;

  let documentCount = 0;

  if (session) {
    const { data, error: countError } = await supabase
      .from('documents')
      .select('*', { count: 'exact' })
      .eq('user_id', session.user.id);

    if (countError) {
      console.error('Error counting documents:', countError);
      throw fail(500, 'Internal server error');
    }

    documentCount = data.length;
  }

  console.log("server", documentCount)

  return { session, documentCount };
};

export const actions = {
  createDocument: async ({ request, locals: { supabase, getSession } }) => {
    const formData = await request.formData();
    const content = formData.get('content');

    const session = await getSession();

    if (!session) {
      throw fail(401, 'Unauthorized');
    }

    const { data: newDocument, error } = await supabase
      .from('documents')
      .insert({
        user_id: session.user.id,
        title: '',
        content: content || '', // Use extracted content or empty string if undefined
      })
      .select();

    if (error) {
      console.error('Error creating document:', error);
      throw fail(500, 'Internal server error');
    }
    return newDocument[0].document_id;
  },
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()
    if (session) {
      await supabase.auth.signOut()
      throw redirect(303, '/')
    }
  },
}
