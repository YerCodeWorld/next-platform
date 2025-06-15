'use client';

import React, { useState, useEffect } from 'react';
import '../../../styles/exercises/variables.css';
import '../../../styles/exercises/base.css';

interface OrderingPlayerProps {
  question: {
    id: string;
    text: string;
    items: Array<{
      id: string;
      text: string;
      correctPosition: number;
    }>;
    hint?: string;
  };
  locale: string;
  showImmediateFeedback: boolean;
  onAnswerSubmit: (answer: any, isCorrect: boolean) => void;
  showHint: boolean;
  disabled: boolean;
}

export default function OrderingPlayer({
  question,
  locale,
  showImmediateFeedback,
  onAnswerSubmit,
  showHint,
  disabled
}: OrderingPlayerProps) {
  const [orderedItems, setOrderedItems] = useState<typeof question.items>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<{ isCorrect: boolean; correctOrder: any[] } | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const labels = {
    en: {
      orderItems: 'Drag items to arrange them in the correct order',
      checkOrder: 'Check Order',
      correct: 'Correct!',
      incorrect: 'Incorrect',
      hint: 'Hint',
      correctOrder: 'Correct order',
      position: 'Position'
    },
    es: {
      orderItems: 'Arrastra los elementos para ordenarlos correctamente',
      checkOrder: 'Verificar Orden',
      correct: '¡Correcto!',
      incorrect: 'Incorrecto',
      hint: 'Pista',
      correctOrder: 'Orden correcto',
      position: 'Posición'
    }
  };

  const t = labels[locale as 'en' | 'es'] || labels.en;

  useEffect(() => {
    const shuffled = [...question.items].sort(() => Math.random() - 0.5);
    setOrderedItems(shuffled);
  }, [question]);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (disabled || hasSubmitted) return;
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem || disabled || hasSubmitted) return;

    const draggedIndex = orderedItems.findIndex(item => item.id === draggedItem);
    if (draggedIndex === -1) return;

    const newItems = [...orderedItems];
    const [draggedElement] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, draggedElement);

    setOrderedItems(newItems);
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    if (disabled || hasSubmitted) return;

    const isCorrect = orderedItems.every((item, index) => 
      item.correctPosition === index + 1
    );

    const correctOrder = [...question.items].sort((a, b) => 
      a.correctPosition - b.correctPosition
    );

    setSubmittedAnswer({ isCorrect, correctOrder });
    setHasSubmitted(true);
    onAnswerSubmit({ orderedItems }, isCorrect);
  };

  return (
    <div className="exercise-container">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          {question.text}
        </h3>
        <p className="text-sm text-gray-600">{t.orderItems}</p>
      </div>

      {showHint && question.hint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-yellow-800 mb-1">{t.hint}</h4>
          <p className="text-sm text-yellow-700">{question.hint}</p>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {orderedItems.map((item, index) => (
          <div
            key={item.id}
            draggable={!disabled && !hasSubmitted}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="p-4 border-2 rounded-lg cursor-move transition-all duration-200 bg-white hover:shadow-md flex items-center"
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 mr-4">
              {index + 1}
            </div>
            <span className="text-gray-800 font-medium">{item.text}</span>
          </div>
        ))}
      </div>

      {!hasSubmitted && (
        <div className="flex justify-center">
          <button onClick={handleSubmit} disabled={disabled} className="btn btn-primary btn-lg px-8">
            {t.checkOrder}
          </button>
        </div>
      )}

      {hasSubmitted && showImmediateFeedback && submittedAnswer && (
        <div className="mt-6 p-4 bg-white border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {locale === 'es' ? 'Resultado:' : 'Result:'}
            </span>
            <span className={`font-bold ${submittedAnswer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {submittedAnswer.isCorrect ? t.correct : t.incorrect}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}