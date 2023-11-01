<script>
    import { enhance } from '$app/forms'
    import Tiptap from '$lib/Tiptap.svelte'
    import { debounce } from 'lodash-es';

    export let data
    export let form

    $: ({ session } = data)

    let updatedContent;

    console.log(data.documents)

    let profileForm
    let loading = false
    let fullName = data.profile?.full_name ?? ''
    let username = data.profile?.username ?? ''
    let website = data.profile?.website ?? ''
    let avatarUrl = data.profile?.avatar_url ?? ''

    const handleTiptapUpdate = debounce(async (content, index) => {
        // Update the corresponding doc content in your data array
        data.documents[index].content = content;

        // Send the updated content to the server
        const documentId = data.documents[index].document_id;
        const title = data.documents[index].title;
        updatedContent = content;
        console.log(updatedContent)

        // Submit the update
        const res = await fetch('?/updateDocument', {
            method: 'POST',
            body: new URLSearchParams({
                documentId,
                title,
                updatedContent,
            }),
        });

        if (res.ok) {
            console.log('Document updated successfully!');
        } else {
            console.error('Failed to update document');
        }
    }, 500); // wait for 500ms after the user stops typing to send the update

    const handleSubmit = () => {
        loading = true
        return async () => {
            loading = false
        }
    }

    const handleUpdateDocument = (index) => {
        loading = true;
        return async () => {
            const documentId = data.documents[index].document_id;
            const title = data.documents[index].title;

            // Submit the update
            const res = await fetch('?/updateDocument', {
                method: 'POST',
                body: new URLSearchParams({
                    documentId,
                    title,
                    updatedContent
                })
            });

            if (res.ok) {
                console.log('Document updated successfully!');
            } else {
                console.error('Failed to update document');
            }

            loading = false;
        };
    };


    const handleSignOut = () => {
        loading = true
        return async ({ update }) => {
            loading = false
            update()
        }
    }
</script>

<div class="form-widget">

	<form method="post" action="?/signout" use:enhance={handleSignOut}>
		<div>
			<button class="button block" disabled={loading}>Sign Out</button>
		</div>
	</form>

    <div>
        {#each data.documents as doc, index}
        <form on:submit|preventDefault={handleUpdateDocument(index)}>
            <input type="hidden" name="documentId" value={doc.document_id} />
                
                <div>
                    <label for="title">Title</label>
                    <input id="title" name="title" type="text" bind:value={doc.title} />
                </div>
            
                <div>
                    <label for="content">Content</label>
                    <Tiptap content={doc.html} onUpdate={(content) => handleTiptapUpdate(content, index)} />
                    <input type="hidden" name="content" bind:value={updatedContent} />
                </div>
            
            </form>
        {/each}
    </div>
</div>