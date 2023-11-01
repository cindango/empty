<!-- DocumentTitle.svelte -->
<script>
    import { onMount } from 'svelte';
    export let title;
    export let placeholder = 'Title';
    export let empty = false;

    let textarea;
    let initialHeight;

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
    });
  </script>

    <textarea bind:this={textarea} class:untitled={empty} bind:value={title} placeholder="Title" readonly on:input={(event) => { adjustHeight(event.target); handleTitleUpdate(document.title); }} 
        id="title" name="title" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" rows="1"></textarea>
  
  <style>
    textarea {
      font-size: 3rem;
      outline: none;
      border: none;
      overflow: hidden;
      resize: none;
      width: 100%;
      background-color: transparent;
      cursor: pointer;
    }
    textarea.untitled {
      color: rgba(255,255,255,.5);
    }
  </style>
  