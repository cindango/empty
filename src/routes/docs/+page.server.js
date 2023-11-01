import { fail, redirect } from '@sveltejs/kit'

export const load = async ({ params, locals: { supabase, getSession } }) => {
    const session = await getSession();
    const { username } = params;
  
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
  
    const { data: documents, error: documentsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', session.user.id);
  
    if (documentsError) {
      console.error('Error fetching documents:', documentsError);
      throw fail(500, 'Internal server error');
    }
  
    return { session, profile, documents };
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
  signout: async ({ locals: { supabase, getSession } }) => {
    const session = await getSession()
    if (session) {
      await supabase.auth.signOut()
      throw redirect(303, '/')
    }
  },
}
