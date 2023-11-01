export const load = async ({ params, locals: { supabase, getSession } }) => {
    const session = await getSession();
    const { username, document_id } = params;
  
    if (!session) {
      throw redirect(303, '/');
    }
  
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username, full_name, website, avatar_url')
      .eq('user_id', session.user.id)
      .single();
  
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw fail(500, 'Internal server error');
    }
  
    if (profile.username !== username) {
      throw redirect(303, '/' + profile.username);
    }
  
    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('*')
      .eq('document_id', document_id)
      .single();
  
    if (documentError) {
      console.error('Error fetching document:', documentError);
      throw fail(500, 'Internal server error');
    }
  
    return { session, profile, document };
  };
  
  export const actions = {
    updateTitle: async ({ request, locals: { supabase, getSession } }) => {
        const formData = await request.formData();
        const documentId = formData.get('documentId');
        const title = formData.get('title');
    
        const session = await getSession();
        
        if (!session) {
          throw redirect(303, '/');
        }
    
        const { data: updatedDocument, error } = await supabase
          .from('documents')
          .update({ title })
          .eq('document_id', documentId)
          .eq('user_id', session.user.id)
          .single();
    
        if (error) {
          return fail(500, 'Failed to update document');
        }
    
        return { updatedDocument };
    },
    updateDocument: async ({ request, locals: { supabase, getSession } }) => {
      const formData = await request.formData();
      const documentId = formData.get('documentId');
      const content = formData.get('updatedContent');
  
      const session = await getSession();
      
      if (!session) {
        throw redirect(303, '/');
      }
  
      const { data: updatedDocument, error } = await supabase
        .from('documents')
        .update({ content })
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
  