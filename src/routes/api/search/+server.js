export const GET = async ({ url, params, locals: { supabase, getSession } }) => {
  const session = await getSession();
  const searchText = url.searchParams.get('q');

  if (!session) {
    return { status: 401, body: 'Unauthorized' };
  }

  const documentsQuery = supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })
    .eq('user_id', session.user.id);

  if (searchText) {
    documentsQuery.textSearch('title_content', searchText, {type: 'websearch'});
  }

  const { data: search, error: documentsError } = await documentsQuery;

  if (documentsError) {
    return { status: 500, body: 'Internal server error' };
  }

  console.log("search", search)

  return new Response(JSON.stringify(search));
}