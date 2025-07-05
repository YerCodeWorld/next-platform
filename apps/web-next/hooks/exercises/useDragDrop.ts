'use client';
import { useState, useCallback } from 'react';

interface DragDropState<T> {
  draggedItem: T | null;
  draggedFromIndex: number | null;
  draggedOverIndex: number | null;
}

export function useDragDrop<T>() {
  const [state, setState] = useState<DragDropState<T>>({
    draggedItem: null,
    draggedFromIndex: null,
    draggedOverIndex: null
  });

  const handleDragStart = useCallback((item: T, index: number) => {
    setState({
      draggedItem: item,
      draggedFromIndex: index,
      draggedOverIndex: null
    });
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setState((prev) => ({
      ...prev,
      draggedOverIndex: index
    }));
  }, []);

  const handleDragLeave = useCallback(() => {
    setState((prev) => ({
      ...prev,
      draggedOverIndex: null
    }));
  }, []);

  const handleDrop = useCallback(<T extends any>(
    items: T[],
    dropIndex: number,
    onReorder: (newItems: T[]) => void
  ) => {
    const { draggedFromIndex } = state;
    
    if (draggedFromIndex === null || draggedFromIndex === dropIndex) {
      setState({
        draggedItem: null,
        draggedFromIndex: null,
        draggedOverIndex: null
      });
      return;
    }

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedFromIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);
    
    onReorder(newItems);
    
    setState({
      draggedItem: null,
      draggedFromIndex: null,
      draggedOverIndex: null
    });
  }, [state]);

  const reset = useCallback(() => {
    setState({
      draggedItem: null,
      draggedFromIndex: null,
      draggedOverIndex: null
    });
  }, []);

  return {
    ...state,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    reset
  };
}