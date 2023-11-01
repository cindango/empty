export const load = async ({ params, locals: { supabase, getSession } }) => {
    const session = await getSession();
    const { username, document_id } = params;
  
    if (!session) {
      throw redirect(303, '/');
    }
  
    const { data: user, error: profileError } = await supabase
      .from('users')
      .select('username, full_name, website')
      .eq('id', session.user.id)
      .single();
  
    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw fail(500, 'Internal server error');
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
  
    return { session, user, document };
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
  
      // Generate a random encryption key (this should be kept secret and only shared with the user)
      const key = window.crypto.subtle.generateKey(
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"]
      );
  
      // Encrypt the content
      const encoder = new TextEncoder();
      const contentBuffer = encoder.encode(content);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedContentBuffer = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv,
        },
        key,
        contentBuffer
      );
  
      // Convert the encrypted content to a base64 string
      const encryptedContent = btoa(String.fromCharCode(...new Uint8Array(encryptedContentBuffer)));
  
      // Update the document in the database with the encrypted content
      const { data: updatedDocument, error } = await supabase
        .from('documents')
        .update({ content: encryptedContent, iv: btoa(String.fromCharCode(...iv)) })
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
  