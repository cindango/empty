import { fail, redirect } from '@sveltejs/kit'

export const load = async ({ locals: { supabase, getSession } }) => {
    const session = await getSession();
    console.log('Test Session:', session);
  
    if (!session) {
      throw redirect(303, '/');
    }
  
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, website, avatar_url')
        .eq('user_id', session.user.id)
        .single();
  
      console.log('Profile in load function:', profile);
  
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw new Error('Failed to fetch profile');
      }
  
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', session.user.id);
  
      console.log('Documents in load function:', documents);
  
      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw new Error('Failed to fetch documents');
      }
  
      return { session, profile, documents };
    } catch (err) {
      console.error('An error occurred:', err);
      throw fail(500, 'Internal server error');
    }
  };
  

export const actions = {
  update: async ({ request, locals: { supabase, getSession } }) => {
    const formData = await request.formData()
    const fullName = formData.get('fullName')
    const username = formData.get('username')
    const website = formData.get('website')
    const avatarUrl = formData.get('avatarUrl')

    const session = await getSession()

    const { error } = await supabase.from('profiles').upsert({
      user_id: session?.user.id,
      full_name: fullName,
      username,
      website,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    })

    if (error) {
      return fail(500, {
        fullName,
        username,
        website,
        avatarUrl,
      })
    }

    return {
      fullName,
      username,
      website,
      avatarUrl,
    }
  },
  updateDocument: async ({ request, locals: { supabase, getSession } }) => {
    const formData = await request.formData();
    const documentId = formData.get('documentId');
    const title = formData.get('title');
    const html = formData.get('updatedContent');

    const session = await getSession();
    
    if (!session) {
      throw redirect(303, '/');
    }

    const { data: updatedDocument, error } = await supabase
      .from('documents')
      .update({ title, html })
      .eq('document_id', documentId)
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      return fail(500, 'Failed to update document');
    }

    return { updatedDocument };
  },
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()
    if (session) {
      await supabase.auth.signOut()
      throw redirect(303, '/')
    }
  },
}
