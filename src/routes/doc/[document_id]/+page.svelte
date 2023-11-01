<script>
    import { enhance } from '$app/forms';
    import Tiptap from '$lib/Tiptap.svelte';
    import { debounce } from 'lodash-es';
    import { onMount } from 'svelte';
    import DocumentTitle from '$lib/DocumentTitle.svelte';
    import { pageTitle } from '$lib/store.js';

    export let data;
    let updatedContent;
    let tiptap;
    let textarea;
    let initialHeight;
  
    $: ({ session, user, document } = data);

    $: if (document?.title) {
        pageTitle.set(document.title);
    } else {
        pageTitle.set("Untitled");
    }

    function preventNewline(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            event.preventDefault();
            tiptap.focus();
        }
    }

    function adjustHeight(textareaElement) {
        if (!initialHeight) {
            initialHeight = textareaElement.clientHeight;
        }

        if (textareaElement.scrollHeight > initialHeight) {
            textareaElement.style.height = 'auto';
            textareaElement.style.height = (textareaElement.scrollHeight) + 'px';
        } else {
            textareaElement.style.height = initialHeight + 'px';
        }
    }

    onMount(() => {
        adjustHeight(textarea);
        textarea.addEventListener('keydown', preventNewline);
    });

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
    }, 300);

    const handleTiptapUpdate = debounce(async (content) => {
        // Update the content
        updatedContent = content;

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
    }, 500);

  </script>
  
  <main>
      <div class="document">
        <textarea bind:this={textarea} bind:value={document.title} autofocus="true" placeholder="Title" on:input={(event) => { adjustHeight(event.target); handleTitleUpdate(document.title); }} 
            id="title" name="title" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" rows="1"></textarea>
        <Tiptap bind:this={tiptap} content={data.document.content} onUpdate={(content) => handleTiptapUpdate(content)} />
        <input type="hidden" name="content" bind:value={updatedContent} />
      </div>
  </main>

  <style>
    main {
        padding-top: 5.5rem;
        max-width: 54rem;
        margin: 0 auto;
    }
    .document {
        margin-top: 4rem;
    }
    #title {
        font-size: 3.5rem;
        outline: none;
        border: none;
        overflow: hidden;
        resize: none;
        width: 100%;
        background-color: transparent;
        line-height: 100%;
        margin-bottom: 1rem;
    }
  </style>