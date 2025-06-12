// Main exports for the edu-editor package
import './styles/root.scss';
import './styles/globals.scss';

export { default as TiptapEditor } from './components/TiptapEditor';
export type { TiptapEditorRef, TiptapEditorProps } from './components/TiptapEditor/components/Editor';

// Renderer components
export { default as TiptapRenderer } from './components/TiptapRenderer/ClientRenderer';
// export { default as TiptapServerRenderer } from './components/TiptapRenderer/ServerRenderer';

// Post components (adapted for React Router)
export { default as PostHeader } from './components/shared/PostHeader';
export { default as PostContent } from './components/shared/PostContent';
export { default as PostToc } from './components/shared/PostToc';
export { default as PostReadingProgress } from './components/shared/PostReadingProgress';

// Hooks
// TODO: Using the original components is actually better than the ones Claude made. See how to adapt
// export { default as useProgress } from './hooks/useProgress';
// export { default as useToc } from './hooks/useToc';
// We would need to move this component out to the components-ui package

// Services (adapted for your API)
export type { EditorPost } from './types/post';

