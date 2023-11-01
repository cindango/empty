<script>
    import { enhance } from '$app/forms';
    import Tiptap from '$lib/Tiptap.svelte';
    import { debounce } from 'lodash-es';

    export let data;

    let updatedContent;
  
    $: ({ session, profile, document } = data);
  
    let loading = false;

    const handleTitleUpdate = debounce(async (title) => {
        const documentId = data.document.document_id;

        const res = await fetch('?/updateTitle', {
            method: 'POST',
            body: new URLSearchParams({
                documentId,
                title,
            }),
        });

        if (res.ok) {
            console.log('Title updated successfully!');
        } else {
            console.error('Failed to update title');
        }
    }, 500);

    const handleTiptapUpdate = debounce(async (content) => {
        // Update the content
        updatedContent = content;
        console.log(updatedContent);

        // Get the documentId from the route params or data
        const documentId = data.document.document_id;

        // Send the updated content to the server
        const res = await fetch('?/updateDocument', {
        method: 'POST',
        body: new URLSearchParams({
            documentId,
            updatedContent,
        }),
        });

        if (res.ok) {
        console.log('Document updated successfully!');
        } else {
        console.error('Failed to update document');
        }
    }, 500); // wait for 500ms after the user stops typing to send the update
  
  </script>
  
  <main>
    <form>
      <div>
        <input bind:value={document.title} on:input={() => handleTitleUpdate(document.title)} 
            id="title" name="title" type="text" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" />
        <Tiptap content={data.document.content} onUpdate={(content) => handleTiptapUpdate(content)} />
        <input type="hidden" name="content" bind:value={updatedContent} />
      </div>
    </form>
  </main>

  <style>
    #title {
        font-size: 3rem;
        outline: none;
        border: none;
    }
  </style>