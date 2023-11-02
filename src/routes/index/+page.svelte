<script>
    import { onMount, tick } from 'svelte';
    import { pageTitle } from '$lib/store.js';
    import dayjs from 'dayjs';
	import utc from 'dayjs/plugin/utc';
    import relativeTime from 'dayjs/plugin/relativeTime';
	import timezone from 'dayjs/plugin/timezone';
    import lodash from 'lodash';
    const { debounce } = lodash;
	dayjs.extend(utc);
	dayjs.extend(timezone);
    dayjs.tz.setDefault("America/New_York");
    dayjs.extend(relativeTime)

    export let data;
    let today = dayjs().format('dddd, MMMM D');
    let empty = true;
    let utilsDropdown;

    let dropdowns = [];

    pageTitle.set(today);

    $: ({ session } = data);

    let loading = false;

    function dropdown(node) {
        dropdowns.push(node);

        return {
        destroy() {
            const index = dropdowns.indexOf(node);
            if (index !== -1) {
            dropdowns.splice(index, 1);
            }
        },
        };
    }

    onMount(() => {
        function handleClickOutside(event) {
            dropdowns.forEach(dropdown => {
                if (!dropdown.contains(event.target)) {
                dropdown.removeAttribute('open');
                }
            });
        }

        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    });

    const handleCreateDocument = async () => {
        loading = true;

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
            loading = false;
        }
    }

    const handleDeleteDocument = async (documentId) => {
        try {
            const formData = new FormData();
            formData.append('document_id', documentId);

            const res = await fetch('?/deleteDocument', { // replace with the correct endpoint
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                // Refresh the page or remove the document from the UI
                location.reload();
            } else {
                console.error('Failed to delete document');
            }
        } catch (err) {
            console.error('Network error:', err);
        }
    }

    let searchText = '';
    let searchResults = [];
    let searching = false;

    const fetchDocuments = async (searchText) => {
        searching = true;  // Set searching to true at the start of the search

        try {
            const res = await fetch('api/search?q=' + searchText);
            if (res.ok) {
                const data = await res.json();
                searchResults = data;
            } else {
                console.error('Failed to fetch documents');
            }
        } catch (err) {
            console.error('Network error:', err);
        } finally {
            searching = false;  // Reset searching to false at the end of the search
        }
    };

    const debouncedFetchDocuments = debounce(fetchDocuments, 500);

    const handleInput = (event) => {
        searching = true;
        searchText = event.target.value;
        debouncedFetchDocuments(searchText);
    };

    let profileForm;
    let fullName = data.user?.full_name ?? '';
    let username = data.user?.username ?? '';
    let website = data.user?.website ?? '';
  
  </script>
  
  <main>
    <div id="header">
        <div class="search">
            <input value={searchText} on:input="{handleInput}" placeholder="Search" />
        </div>
        <div class="new">
            <button on:click="{ handleCreateDocument }" disabled="{ loading }">New +</button>
        </div>
    </div>

    {#if session}
        {#if searching}
        
            <div class="spinner"></div>

        {:else if searchText && searchResults.length > 0}
            {#each searchResults as result}
                <a class="doc" href="/doc/{result.document_id}">
                    <div class="document">
                    <h2 class:empty={!result.title && !result.content}>{result.title ? result.title : 'Untitled'}</h2>
                    <smalltext class="last-updated">{dayjs(result.updated_at).fromNow()}</smalltext>
                    </div>
                </a>
            {/each}
        {:else if searchText}
            <p>Sorry, try another search :(</p>
        {:else}
            {#each data.documents as doc}
                <div class="document">
                    <a class="doc" href="/doc/{doc.document_id}">
                        <h2 class:empty={!doc.title && !doc.content}>{doc.title ? doc.title : 'Untitled'}</h2>
                        <smalltext class="last-updated">{dayjs(doc.updated_at).fromNow()}</smalltext>
                    </a>
                
                    <div class="utils">
                        <details class="dropdown dropdown-end" use:dropdown>
                            <summary class="btn"><img src="/nav/dots.svg" /></summary>
                            <ul class="p-2 shadow menu dropdown-content z-[1] w-52">
                              <li><a on:click={() => handleDeleteDocument(doc.document_id)}>Delete</a></li>
                            </ul>
                        </details>
                    </div>
                </div>
            {/each}
        {/if}
    {/if}
  </main>
  
  <style>
    main {
        max-width: 64rem;
        margin: 0 auto;
    }
    #header {
        display: flex;
        align-items: center;
        margin-bottom: 0;
        padding: 2rem 0;
        border-bottom: 1px solid rgba(255,255,255,.1);
    }
    h1 {
        font-size: 3rem;
        font-weight: 400;
    }
    #header > div {
        flex: 1;
        box-sizing: border-box;
    }
    .new {
        display: flex;
        justify-content: flex-end;
    }
    .search {
        display: flex;
    }
    .search input {
        font-size: 1rem;
        font-family: 'S-Mono';
        padding: 20px 8px 16px;
    }
    .new button {
        font-weight: bold;
        font-size: 1.5rem;
        background-color: white;
        color: black;
        width: 120px;
    }
    .sign-out {
        display: flex;
        justify-content: flex-end;
    }
    .document {
        border-bottom: 1px solid rgba(255,255,255,.1);
        transition: background 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .document:hover {
        background: rgba(255,255,255,.01);
    }
    .doc {
        text-decoration: none;
        padding: 1.5rem 1rem;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .doc h2 {
        font-weight: normal;
        font-size: 1.5rem;
        margin: 0;
    }
    .doc h2.empty {
        opacity: .4;
    }
    .doc h2.untitled {
        opacity: .3;
    }
    .utils {
        display: flex;
        align-items: center;
    }
    .utils img {
        width: 30px;
    }
    .utils summary {
        background-color: transparent;
        border: 0;
    }
    .utils .dropdown-content {
        background-color: var(--dropdown-bg);
    }
    .utils .dropdown-content li a {
        font-family: 'S-Mono';
    }
    .doc .last-updated {
        font-family: 'S-Mono', monospace;
        font-size: .9rem;
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