"use client"

import { Ref, useEffect, useImperativeHandle } from "react";
import { useEditor, type UseEditorOptions } from "@tiptap/react";  // removed editor
import useForceUpdate from "./useForceUpdate";
import { TiptapEditorRef } from "../components/Editor";

export type UseTiptapEditorOptions = UseEditorOptions & {
  ref?: Ref<TiptapEditorRef>;
  placeholder?: {
    paragraph?: string;
    imageCapton?: string;
  };
};

export default function useTiptapEditor({
  ref,
  placeholder,
    
  ...editorOptions
}: UseTiptapEditorOptions) {
  const forceUpdate = useForceUpdate();
  const editor = useEditor({
    ...editorOptions,
    immediatelyRender: false
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getInstance: () => editor,
    }),
    [editor]
  );

  useEffect(() => {
    const isEditable = editorOptions.editable;
    if (!editor || editor.isEditable === isEditable) return;
    editor.setOptions({ editable: Boolean(isEditable) });
    forceUpdate();
  }, [editor, editorOptions.editable]);

  useEffect(() => {
    if (!editor) return;
    // @ts-ignore
    editor.setOptions({ editorProps: { placeholder } });
    forceUpdate();
  }, [editor, placeholder]);

  // Handle content updates when initialContent changes
  useEffect(() => {
    if (!editor || !editorOptions.content) return;
    
    // Only update if the content is different from current editor content
    const currentContent = editor.getHTML();
    const newContent = typeof editorOptions.content === 'string' ? editorOptions.content : '';
    
    if (currentContent !== newContent && newContent !== '') {
      // Preserve cursor position
      const { from, to } = editor.state.selection;
      editor.commands.setContent(editorOptions.content, false, {
        preserveWhitespace: "full"
      });
      // Restore cursor position if it's still valid
      try {
        editor.commands.setTextSelection({ from, to });
      } catch {
        // If cursor position is invalid, just focus at the end
        editor.commands.focus('end');
      }
    }
  }, [editor, editorOptions.content]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, []);

  return editor;
}
