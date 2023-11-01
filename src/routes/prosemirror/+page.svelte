<script>
    import { EditorState, Plugin } from 'prosemirror-state';
    import { EditorView } from 'prosemirror-view';
    import { Schema } from 'prosemirror-model';
    import { keymap } from 'prosemirror-keymap';
    import { undo, redo, history } from 'prosemirror-history';
    import { baseKeymap } from 'prosemirror-commands';
    import { dropCursor } from 'prosemirror-dropcursor';
    import { gapCursor } from 'prosemirror-gapcursor';
    import { keydownHandler } from 'prosemirror-keymap';
    import { inputRules, undoInputRule, emDash, ellipsis } from 'prosemirror-inputrules';

    const mySchema = new Schema({
        nodes: schema.spec.nodes,
        marks: schema.spec.marks,
    });

    const editor = new EditorView(document.querySelector('#editor'), {
        state: EditorState.create({
            schema: mySchema, // Use your schema here
            plugins: [
            history(),
            keymap({ 'Mod-z': undo, 'Mod-y': redo }),
            keymap(baseKeymap),
            dropCursor(),
            gapCursor(),
            keydownHandler({
                Backspace: undoInputRule,
            }),
            inputRules({ rules: [ellipsis, emDash] }),
            ],
        }),
    });
</script>

<div id="editor"></div>

<style>
    #editor {
        border: 1px solid #ccc;
        padding: 10px;
    }
</style>