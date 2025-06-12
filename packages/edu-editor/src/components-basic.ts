// packages/edu-editor/src/components-basic.ts
// This is a clean entry point with no dependencies on tiptap
import './styles/root.scss';
export { default as Example } from './Component';

export { default as TiptapEditor } from './components/TiptapEditor';
export type { TiptapEditorRef, TiptapEditorProps } from './components/TiptapEditor/components/Editor';