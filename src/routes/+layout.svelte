<script>
    import '../fonts.css'
	import '../styles.css'
    import '@fontsource/epilogue';
    import { page } from '$app/stores';
	import { goto, invalidate } from '$app/navigation'
	import { onMount, onDestroy } from 'svelte'
    import { enhance } from '$app/forms';
    import { pageTitle } from '$lib/store.js';

	export let data
    let dropdown
    let showDropdown = false;
    let y = 0;
    let dim = false;
    let scroll = false;
    let isDocument = false;

    $: {
        if ($page.route.id === "/doc/[document_id]") {
            isDocument = true;
        } else {
            isDocument = false;
        }
    }

	$: ({ supabase, session } = data)

    $: scroll = y > 100;
    $: if (scroll && isDocument) {
        dim = true;
    } else {
        dim = false;
    }

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((event, _session) => {
            if (_session?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }
        });

        window.addEventListener('click', handleWindowClick);

        return () => {
            data.subscription.unsubscribe();
            window.removeEventListener('click', handleWindowClick);
        };
	})
    
    function toggleDropdown() {
        showDropdown = !showDropdown;
    }

    function handleWindowClick(event) {
        if (!document.querySelector('.dropdown').contains(event.target)) {
            showDropdown = false;
        }
    }

    const handleSignOut = () => {
        toggleDropdown();
        return async ({ update }) => {
            update()
            goto('/');
        }
    }
</script>

<svelte:head>
	<title>empty.page</title>
</svelte:head>

<svelte:window bind:scrollY={y} />

<div class="container">
    {#if session}
        <nav>
            <div class="left navbar-left">
                {#if !isDocument}<a href="/index"><img src="/nav/e.svg" /></a>{:else}<a href="/index"><img src="/nav/back.svg" /></a>{/if}
            </div>

            <div class="center" class:dim={dim}>
                {$pageTitle}
            </div>
            
            <div class="right navbar-right">
                {#if data.session && !isDocument}
                    <div class="dropdown" bind:this={dropdown}>
                        <img src="/nav/dots.svg" on:click={toggleDropdown} />
                        
                        {#if showDropdown}
                        <div class="dropdown-menu">
                            <li class="profile">
                                <div class="name">{data.session.user.user_metadata.full_name}</div>
                                <div class="email">{data.session.user.email}</div>
                            </li>
                            <li>
                                <hr />
                            </li>
                            <li class="sign-out">
                                <form method="post" action="?/signout" use:enhance={handleSignOut}>
                                    <button>Sign Out</button>
                                </form>
                            </li>
                        </div>
                        {/if}
                    </div>
                {/if}
            </div>
        </nav>
    {/if}
    <slot {pageTitle}></slot>
</div>

<style>
    nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #000;
        text-align: center;
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        font-size: 1.1rem;
        z-index: 999;
        height: 50px;
    }
    nav > div {
        height: 48px;
    }
    .left, .right {
        flex: 0 0 25%; /* 0 0 means the item won't grow or shrink, and 25% sets the basis */
        align-items: center;
    }
    .left {
        display: flex;
        justify-content: flex-start;
    }
    .right {
        display: flex;
        justify-content: flex-end;
    }
    .center {
        flex: 0 0 50%; /* 0 0 means the item won't grow or shrink, and 50% sets the basis */
        display: flex;
        justify-content: center;
        align-items: center;
        transition: .5s opacity;
        font-family: 'S-Mono', monospace;
        font-size: 14px;
    }
    .center.dim {
        opacity: .45;
        transition: 1s opacity;
    }
    .dropdown {
        position: relative;
    }
    .dropdown img {
        cursor: pointer;
    }
    .dropdown-menu {
        position: absolute;
        top: 110%;
        right: 10%;
        background-color: var(--dropdown-bg);
        width: 240px;
        font-size: 13px;
        padding: 6px 0;
        box-shadow: 3px 3px 16px rgba(0,0,0,.3);
    }
    .dropdown-menu * {
        font-family: 'S-Mono';
    }
    .dropdown-menu li {
        padding: 8px 16px;
        text-align: left;
        list-style: none;
    }
    .dropdown-menu li.profile {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }
    .dropdown-menu li.profile .email {
        color: rgba(255,255,255,.7);
        font-size: 12px;
    }
    .dropdown-menu li.sign-out {
        padding: 0 16px;
    }
    .dropdown-menu li hr {
        border-color: rgba(0,0,0,.5);
    }
    .dropdown-menu button {
        background-color: transparent;
        border: 0;
        font-size: 13px;
        font-weight: normal;
        padding: 8px 0;
        font-family: 'S-Mono';
        width: 100%;
        text-align: left;
    }

    .dropdown-item:hover {
        background-color: lightgray;
    }
    .logo {
        display: block;
        position: fixed;
        left: 20px;
        top: 20px;
        text-decoration: none;
        font-weight: bold;
        width: 40px;
        height: 40px;
        display: flex;
        border: 1px solid transparent;
        align-items: center;
        justify-content: center;
        line-height: 20px;
        font-size: 20px;
        border-bottom: 2px solid;
        font-family: Arial, Helvetica, sans-serif;
    }
    .logo:hover {
        border: 1px solid;
        border-bottom: 2px solid;
    }
</style>