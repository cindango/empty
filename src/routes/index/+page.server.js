import { fail, redirect } from '@sveltejs/kit'

export const load = async ({ params, locals: { supabase, getSession } }) => {
    const session = await getSession();
    const { username } = params;
  
    if (session) {
      const { data: user, error: profileError } = await supabase
        .from('users')
        .select('username, full_name, website')
        .eq('id', session.user.id)
        .single();
    
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw fail(500, 'Internal server error');
      }
    
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false })
        .eq('user_id', session.user.id)
    
      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw fail(500, 'Internal server error');
      }
      
      return { session, user, documents };
    } else {
      throw redirect(301, '/')
    }
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
        content: content, // Use extracted content
      })
      .select();

      if (error) {
        console.error('Error creating document:', error);
        throw fail(500, 'Internal server error');
      }
      return newDocument[0].document_id;
  },
  deleteDocument: async ({ request, locals: { supabase, getSession } }) => {
    const formData = await request.formData();
    const documentId = formData.get('document_id'); // assuming you're sending the document's ID as 'document_id'

    const session = await getSession();

    if (!session) {
      throw fail(401, 'Unauthorized');
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('document_id', documentId) // delete where document_id matches
      .eq('user_id', session.user.id); // additional check to ensure users delete only their own documents

    if (error) {
        console.error('Error deleting document:', error);
        throw fail(500, 'Internal server error');
    }
    return { message: "Document deleted successfully." }; // response after successful deletion
  },
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()
    if (session) {
      await supabase.auth.signOut()
      throw redirect(303, '/')
    }
  },
}
