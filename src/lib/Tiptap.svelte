<script>
    import { onMount, onDestroy } from 'svelte';
    import { Editor } from '@tiptap/core';
    import StarterKit from '@tiptap/starter-kit';
    import FontFamily from '@tiptap/extension-font-family'
    import TextStyle from '@tiptap/extension-text-style'
    import Focus from '@tiptap/extension-focus'
    import Image from '@tiptap/extension-image'
    import Placeholder from '@tiptap/extension-placeholder'

    export let content;
    export let onUpdate;
    
    let element;
    let editor;

    let selectedFontFamily = 'Signifier'; // default font family

    function handleFontFamilyChange() {
        editor.chain().focus().setFontFamily(selectedFontFamily).run();
    }

    onMount(() => {
        editor = new Editor({
            element: element,
            extensions: [
                StarterKit,
                FontFamily,
                TextStyle,
                Focus,
                Image.configure({
                  inline: true,
                  allowBase64: true,
                }),
            ],
            content: content,
            onTransaction: () => {
                // force re-render so `editor.isActive` works as expected
                editor = editor;
            },
            onUpdate: ({ editor }) => {
                // Update the content and notify the parent component of changes
                onUpdate(editor.getHTML())
            },
        });
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });

    export function focus() {
        if (editor && editor.commands) {
            editor.commands.focus();
        }
    }

  </script>
  
  <div bind:this={element} />

  {#if editor}
    <div id="toolbar">
      <button
        on:click={() => editor.chain().focus().toggleHeading({ level: 1}).run()}
        class:active={editor.isActive('heading', { level: 1 })}
      >
        H1
      </button>
      <button
        on:click={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        class:active={editor.isActive('heading', { level: 2 })}
      >
        H2
      </button>
      <button on:click={() => editor.chain().focus().setParagraph().run()} class:active={editor.isActive('paragraph')}>
        P
      </button>
      <select bind:value={selectedFontFamily} on:change={handleFontFamilyChange}>
          <option value="sans-serif">Sans-serif</option>
          <option value="Signifier">Signifier</option>
          <option value="Epilogue">Epilogue</option>
          <!-- add more font options as needed -->
      </select>
    </div>
  {/if}
  
  
<style>
  #toolbar {
    position: fixed;
    top: 50px;
    left: 0;
    background: var(--custom-bg-color);
    box-shadow: 0 6px 6px rgba(0,0,0,.2);
    width: 100%;
    z-index: 99;
    display: flex;
    justify-content: center;
    padding: 4px;
    gap: 10px;
  }
  button {
    background: transparent;
    border: 0;
    color: #fff;
  }
  button.active {
    background: black;
    color: white;
  }
  :global(.tiptap) {
      outline: none;
      min-height: 550px;
  }
  :global(.tiptap p) {
    font-size: 20px;
    line-height: 1.4;
    font-weight: 100;
  }
</style>