<script>
    import { onMount, tick } from 'svelte';
    import { debounce } from 'lodash';
    import { goto } from '$app/navigation';
    import { browser } from '$app/environment';
    import { page } from '$app/stores';
    import { pageTitle } from '$lib/store.js';
    import { Auth } from '@supabase/auth-ui-svelte'
    import { env } from '$env/dynamic/public'

    pageTitle.set("");

    export let data;
    let ready = false;
    let loading = false;

    if ($page.url.searchParams.has('loading')) {
       loading = $page.url.searchParams.get('loading')
    }

    $: ({ session, documentCount } = data);

    onMount(async () => {
        ready = true;
        if (loading) {
            if (session !== null && documentCount !== null) {
                if (documentCount < 1) {
                        handleCreateDocument();
                } else {
                    if (browser) {
                        goto('/index');
                    }
                }
            } else {
                location.reload();
            }
        }
    });


    const handleCreateDocument = async () => {

        try {
            const res = await fetch('?/createDocument', {
                method: 'POST',
                body: new URLSearchParams({ content: '' }),
            });

            if (res.ok) {
                const responseData = await res.json(); // Parse the main response
                const parsedData = JSON.parse(responseData.data); 
                const documentId = parsedData[0]; // Access the first element of the array
                window.location.href = "/doc/" + documentId;
            } else {
                console.error('Failed to create document');
            }
        } catch (err) {
            console.error('Network error:', err);
        } finally {
        }
    };

</script>
  
<main>
    <div id="header">
        {#if ready}
            {#if !loading && !session}
                <img style="width: 120px;" src="/ep_logo_w.svg" />

                <h1>Write something.</h1>

                <div id="auth">
                    <Auth
                        supabaseClient={data.supabase}
                        providers={['google']}
                        view="magic_link"
                        redirectTo={env.PUBLIC_AUTH_REDIRECT_URL}
                        showLinks={false}
                    />
                </div>
            {/if}
        {:else}
            <div class="spinner"></div>
        {/if}
    </div>
</main>

<style>
    #header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
        margin-bottom: 0;
        padding: 5rem 0;
        position: absolute;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
    }
    p {
        max-width: 800px;
        line-height: 1.75rem;
        font-size: 1.15rem;
    }
    h1 {
        font-size: 8rem;
        font-weight: 400;
        font-family: 'Slack Light';
        text-align: center;
    }
    :global(#auth > div) {
        /*display: flex;
        gap: 10rem;
        margin: 0 10rem;
        align-items: center;*/
    }
    :global(#auth > div div, #auth > div form) {
        flex: 1;
    }
    :global(.supabase-auth-ui_ui-divider, #auth-magic-link) {
        display: none !important;
    }
    :global(.supabase-auth-ui_ui-container button.supabase-auth-ui_ui-button) {
        font-family: 'S-Mono';
        font-weight: normal;
        font-size: 1rem;
        padding: 1rem 2rem;
        gap: 20px;
    }
    .spinner {
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        border-top: 4px solid #fff;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>