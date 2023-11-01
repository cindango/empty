// src/routes/api/updateDocument/+server.js
import { supabase } from '$lib/supabaseClient';

export async function POST(request) {
  try {

    // Parse the incoming JSON request body
    const { documentId, title } = await request;

    console.log('Received request to update document:', { documentId, title });

    // Perform the database update operation here
    const { data, error } = await supabase
      .from('documents')
      .update({ title }) // Use the 'title' received from the request here
      .eq('document_id', documentId) // Use the 'documentId' received from the request here
      .eq('user_id', 'ecc11319-729d-40e9-bb99-0aca19de72ea'); // Filter by user_id to ensure the user's ownership

    console.log('Supabase update response:', { data, error });

    if (error) {
      console.error('Error updating document:', error); // Log the error for debugging
      throw new Error('Error updating document: ' + error.message);
    }

    // Log the updated data for debugging
    console.log('Updated document:', data);

    // Respond with a success message
    return new Response(JSON.stringify({ message: 'Document updated successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Handle errors and respond with an error message
    console.error('An error occurred while updating the document:', error); // Log the error for debugging
    return new Response(JSON.stringify({ error: 'An error occurred while updating the document' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
