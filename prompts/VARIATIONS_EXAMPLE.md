MULTIPLE_CHOICE Variations

ORIGINAL (current)

// Grid-based option selection
<div className="multiple-choice-original">
  <div className="question-header">
    <h3 className="question-text">{currentQuestion.question}</h3>
    {currentQuestion.image && <img src={currentQuestion.image} alt="Question visual" />}
  </div>
  <div className="options-grid">
    {currentQuestion.options.map((option, index) => (
      <button
        key={index}
        className={`option-button ${selectedAnswers.includes(index) ? 'selected' : ''}`}
        onClick={() => handleOptionSelect(index)}
      >
        <span className="option-letter">{String.fromCharCode(65 + index)}</span>
        <span className="option-text">{option}</span>
      </button>
    ))}
  </div>
  {showHint && <div className="hint">{currentQuestion.hint}</div>}
</div>

Matches Variation

// Dropdown-based question matching
<div className="multiple-choice-matches">
  <div className="instructions">Match each question with the correct answer</div>
  <div className="question-list">
    {questions.map((question, qIndex) => (
      <div key={qIndex} className="question-row">
        <div className="question-content">
          <span className="question-number">{qIndex + 1}.</span>
          <span className="question-text">{question.text}</span>
        </div>
        <select
          className="answer-dropdown"
          value={selectedAnswers[qIndex] || ''}
          onChange={(e) => handleAnswerSelect(qIndex, e.target.value)}
        >
          <option value="">Select answer...</option>
          {allAnswers.map((answer, aIndex) => (
            <option key={aIndex} value={answer}>
              {answer}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>
  <div className="progress">
    {questions.filter((_, i) => selectedAnswers[i]).length} / {questions.length} completed
  </div>
</div>

Cards Style Variation

// Visual card-based selection with images/icons
<div className="multiple-choice-cards">
  <div className="question-header">
    <h3 className="question-text">{currentQuestion.question}</h3>
  </div>
  <div className="cards-container">
    {currentQuestion.options.map((option, index) => (
      <div
        key={index}
        className={`option-card ${selectedAnswers.includes(index) ? 'selected' : ''}`}
        onClick={() => handleCardSelect(index)}
      >
        {option.image && (
          <div className="card-image">
            <img src={option.image} alt={option.text} />
          </div>
        )}
        <div className="card-content">
          <span className="card-text">{option.text}</span>
        </div>
        <div className="card-indicator">
          {selectedAnswers.includes(index) && <CheckIcon />}
        </div>
      </div>
    ))}
  </div>
  <div className="card-actions">
    <button 
      className="confirm-button" 
      disabled={selectedAnswers.length === 0}
      onClick={handleConfirm}
    >
      Confirm Selection
    </button>
  </div>
</div>

True/False Style Variation

// Boolean-style question display
<div className="multiple-choice-true-false">
  <div className="statement-container">
    <h3 className="statement">{currentQuestion.statement}</h3>
    {currentQuestion.context && (
      <div className="context">{currentQuestion.context}</div>
    )}
  </div>
  <div className="boolean-options">
    <button
      className={`boolean-button true-button ${selectedAnswer === true ? 'selected' : ''}`}
      onClick={() => handleBooleanSelect(true)}
    >
      <span className="boolean-icon">✓</span>
      <span className="boolean-text">True</span>
    </button>
    <button
      className={`boolean-button false-button ${selectedAnswer === false ? 'selected' : ''}`}
      onClick={() => handleBooleanSelect(false)}
    >
      <span className="boolean-icon">✗</span>
      <span className="boolean-text">False</span>
    </button>
  </div>
  {selectedAnswer !== null && (
    <div className="explanation-preview">
      <button onClick={() => setShowExplanation(!showExplanation)}>
        {showExplanation ? 'Hide' : 'Show'} Explanation
      </button>
      {showExplanation && (
        <div className="explanation">{currentQuestion.explanation}</div>
      )}
    </div>
  )}
</div>

FILL_BLANK Variations

Original Variation (Current)

// Standard sentence completion with input fields
<div className="fill-blank-original">
  <div className="sentence-container">
    {sentences.map((sentence, sentenceIndex) => (
      <div key={sentenceIndex} className="sentence-row">
        <div className="sentence-parts">
          {sentence.parts.map((part, partIndex) => (
            part.isBlank ? (
              <input
                key={partIndex}
                type="text"
                className={`blank-input ${part.isCorrect ? 'correct' : part.isIncorrect ? 'incorrect' : ''}`}
                value={userAnswers[sentenceIndex]?.[part.blankIndex] || ''}
                onChange={(e) => handleBlankChange(sentenceIndex, part.blankIndex, e.target.value)}
                placeholder="___"
              />
            ) : (
              <span key={partIndex} className="sentence-text">{part.text}</span>
            )
          ))}
        </div>
        {sentence.hint && (
          <button 
            className="hint-button"
            onClick={() => toggleHint(sentenceIndex)}
          >
            💡
          </button>
        )}
      </div>
    ))}
  </div>
  <div className="completion-status">
    {completedBlanks} / {totalBlanks} blanks completed
  </div>
</div>

Single Variation

// Letter-by-letter completion for single words
<div className="fill-blank-single">
  <div className="word-container">
    {words.map((word, wordIndex) => (
      <div key={wordIndex} className="word-puzzle">
        <div className="word-title">{word.definition || word.clue}</div>
        <div className="letter-grid">
          {word.letters.map((letter, letterIndex) => (
            <div key={letterIndex} className="letter-slot">
              {letter.isBlank ? (
                <input
                  type="text"
                  maxLength={1}
                  className={`letter-input ${letter.isCorrect ? 'correct' : letter.isIncorrect ? 'incorrect' : ''}`}
                  value={userInputs[wordIndex]?.[letterIndex] || ''}
                  onChange={(e) => handleLetterChange(wordIndex, letterIndex, e.target.value)}
                />
              ) : (
                <span className="letter-fixed">{letter.value}</span>
              )}
            </div>
          ))}
        </div>
        <div className="word-progress">
          {word.letters.filter(l => l.isBlank && userInputs[wordIndex]?.[word.letters.indexOf(l)]).length} / 
          {word.letters.filter(l => l.isBlank).length} letters
        </div>
      </div>
    ))}
  </div>
</div>

Matches Variation

// Column-based matching with blanks
<div className="fill-blank-matches">
  <div className="matches-container">
    <div className="left-column">
      <h4>Complete the phrases</h4>
      {leftItems.map((item, index) => (
        <div key={index} className="phrase-item">
          <span className="phrase-start">{item.start}</span>
          <span className="blank-space">____</span>
          <span className="phrase-end">{item.end}</span>
        </div>
      ))}
    </div>
    <div className="right-column">
      <h4>Choose the missing words</h4>
      <div className="word-bank">
        {availableWords.map((word, index) => (
          <button
            key={index}
            className={`word-option ${selectedWords.includes(word) ? 'selected' : ''} ${usedWords.includes(word) ? 'used' : ''}`}
            onClick={() => handleWordSelect(word)}
            disabled={usedWords.includes(word)}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  </div>
  <div className="matches-progress">
    {completedMatches} / {totalMatches} matches completed
  </div>
</div>

ORDERING Variations

Original Variation (Current)

// Word/phrase ordering with drag-and-drop
<div className="ordering-original">
  <div className="word-pool">
    {availableWords.map((word, index) => (
      <div
        key={index}
        className={`word-item ${word.isUsed ? 'used' : ''}`}
        draggable={!word.isUsed}
        onDragStart={(e) => handleDragStart(e, word)}
      >
        {word.text}
      </div>
    ))}
  </div>
  <div className="sentence-builders">
    {sentences.map((sentence, sentenceIndex) => (
      <div key={sentenceIndex} className="sentence-builder">
        <div className="sentence-label">Sentence {sentenceIndex + 1}:</div>
        <div 
          className="drop-zone"
          onDrop={(e) => handleDrop(e, sentenceIndex)}
          onDragOver={handleDragOver}
        >
          {sentence.words.map((word, wordIndex) => (
            <span key={wordIndex} className="placed-word">
              {word}
            </span>
          ))}
          {sentence.words.length === 0 && (
            <span className="placeholder">Drop words here...</span>
          )}
        </div>
      </div>
    ))}
  </div>
</div>

Single Variation

// Letter-by-letter ordering for single words
<div className="ordering-single">
  <div className="word-challenge">
    {words.map((word, wordIndex) => (
      <div key={wordIndex} className="letter-ordering">
        <div className="word-clue">{word.clue}</div>
        <div className="letter-pool">
          {word.shuffledLetters.map((letter, letterIndex) => (
            <div
              key={letterIndex}
              className={`letter-tile ${letter.isUsed ? 'used' : ''}`}
              draggable={!letter.isUsed}
              onDragStart={(e) => handleLetterDragStart(e, letter, wordIndex)}
            >
              {letter.value}
            </div>
          ))}
        </div>
        <div 
          className="letter-slots"
          onDrop={(e) => handleLetterDrop(e, wordIndex)}
          onDragOver={handleDragOver}
        >
          {word.orderedLetters.map((slot, slotIndex) => (
            <div key={slotIndex} className="letter-slot">
              {slot.letter || ''}
            </div>
          ))}
        </div>
        <div className="word-result">
          {word.orderedLetters.map(slot => slot.letter).join('')}
        </div>
      </div>
    ))}
  </div>
</div>

Aligner Variation

// Structured ordering by criteria (time, importance, size, etc.)
<div className="ordering-aligner">
  <div className="criteria-header">
    <h3>Order by: {criteria}</h3>
    <div className="scale-indicator">
      <span className="scale-start">{scaleLabels.start}</span>
      <span className="scale-arrow">→</span>
      <span className="scale-end">{scaleLabels.end}</span>
    </div>
  </div>
  <div className="alignment-container">
    <div className="items-pool">
      <h4>Items to order:</h4>
      {unorderedItems.map((item, index) => (
        <div
          key={index}
          className="alignment-item"
          draggable
          onDragStart={(e) => handleItemDragStart(e, item)}
        >
          <div className="item-content">
            {item.image && <img src={item.image} alt={item.name} />}
            <span className="item-name">{item.name}</span>
          </div>
          {item.description && (
            <div className="item-description">{item.description}</div>
          )}
        </div>
      ))}
    </div>
    <div className="alignment-scale">
      {orderSlots.map((slot, index) => (
        <div
          key={index}
          className={`order-slot ${slot.occupied ? 'occupied' : ''}`}
          onDrop={(e) => handleSlotDrop(e, index)}
          onDragOver={handleDragOver}
        >
          <div className="slot-number">{index + 1}</div>
          {slot.item && (
            <div className="slot-item">
              <span className="slot-item-name">{slot.item.name}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</div>

MATCHING 

Original Variation (Current)

// Standard two-column matching
<div className="matching-original">
  <div className="matching-columns">
    <div className="left-column">
      <h4>Match these items:</h4>
      {leftItems.map((item, index) => (
        <div
          key={index}
          className={`matching-item ${item.isMatched ? 'matched' : ''} ${selectedLeft === index ? 'selected' : ''}`}
          onClick={() => handleLeftSelect(index)}
        >
          <span className="item-content">{item.content}</span>
          {item.isMatched && <span className="match-indicator">✓</span>}
        </div>
      ))}
    </div>
    <div className="right-column">
      <h4>With these items:</h4>
      {rightItems.map((item, index) => (
        <div
          key={index}
          className={`matching-item ${item.isMatched ? 'matched' : ''} ${selectedRight === index ? 'selected' : ''}`}
          onClick={() => handleRightSelect(index)}
        >
          <span className="item-content">{item.content}</span>
          {item.isMatched && <span className="match-indicator">✓</span>}
        </div>
      ))}
    </div>
  </div>
  <div className="match-lines">
    {completedMatches.map((match, index) => (
      <svg key={index} className="match-line">
        <line 
          x1={match.leftPos.x} y1={match.leftPos.y}
          x2={match.rightPos.x} y2={match.rightPos.y}
          stroke={match.isCorrect ? '#22c55e' : '#ef4444'}
          strokeWidth="2"
        />
      </svg>
    ))}
  </div>
</div>

New Variation

// One-by-one matching with all answers visible
<div className="matching-new">
  <div className="current-item">
    <div className="item-to-match">
      <h3>Find the match for:</h3>
      <div className="featured-item">
        {currentItem.image && <img src={currentItem.image} alt={currentItem.content} />}
        <span className="item-text">{currentItem.content}</span>
      </div>
    </div>
  </div>
  <div className="answer-options">
    <h4>Choose the correct match:</h4>
    <div className="options-grid">
      {allAnswers.map((answer, index) => (
        <button
          key={index}
          className={`answer-option ${selectedAnswer === index ? 'selected' : ''} ${answer.isUsed ? 'used' : ''}`}
          onClick={() => handleAnswerSelect(index)}
          disabled={answer.isUsed}
        >
          {answer.image && <img src={answer.image} alt={answer.content} />}
          <span className="answer-text">{answer.content}</span>
          {answer.isUsed && <span className="used-indicator">Already matched</span>}
        </button>
      ))}
    </div>
  </div>
  <div className="progress-indicator">
    <div className="current-progress">{completedItems} / {totalItems}</div>
    <div className="next-button">
      <button 
        onClick={handleNext}
        disabled={selectedAnswer === null}
      >
        {completedItems === totalItems - 1 ? 'Finish' : 'Next'}
      </button>
    </div>
  </div>
</div>

Threesome Variation

// Three-column matching system
<div className="matching-threesome">
  <div className="threesome-header">
    <h3>Match items across three categories</h3>
    <div className="category-labels">
      <span className="category-label">{categories.first}</span>
      <span className="category-label">{categories.second}</span>
      <span className="category-label">{categories.third}</span>
    </div>
  </div>
  <div className="threesome-container">
    <div className="column first-column">
      {firstColumnItems.map((item, index) => (
        <div
          key={index}
          className={`threesome-item ${item.isMatched ? 'matched' : ''} ${selectedItems.first === index ? 'selected' : ''}`}
          onClick={() => handleColumnSelect('first', index)}
        >
          <span className="item-content">{item.content}</span>
          {item.connections && (
            <div className="connection-indicators">
              {item.connections.map((conn, connIndex) => (
                <span key={connIndex} className={`connection-dot ${conn.category}`} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
    <div className="column second-column">
      {secondColumnItems.map((item, index) => (
        <div
          key={index}
          className={`threesome-item ${item.isMatched ? 'matched' : ''} ${selectedItems.second === index ? 'selected' : ''}`}
          onClick={() => handleColumnSelect('second', index)}
        >
          <span className="item-content">{item.content}</span>
        </div>
      ))}
    </div>
    <div className="column third-column">
      {thirdColumnItems.map((item, index) => (
        <div
          key={index}
          className={`threesome-item ${item.isMatched ? 'matched' : ''} ${selectedItems.third === index ? 'selected' : ''}`}
          onClick={() => handleColumnSelect('third', index)}
        >
          <span className="item-content">{item.content}</span>
        </div>
      ))}
    </div>
  </div>
  <div className="threesome-actions">
    <button
      className="create-match-button"
      onClick={handleCreateMatch}
      disabled={!canCreateMatch}
    >
      Create Match
    </button>
    <div className="match-preview">
      {selectedItems.first !== null && selectedItems.second !== null && selectedItems.third !== null && (
        <div className="preview-match">
          <span>{firstColumnItems[selectedItems.first]?.content}</span>
          <span>→</span>
          <span>{secondColumnItems[selectedItems.second]?.content}</span>
          <span>→</span>
          <span>{thirdColumnItems[selectedItems.third]?.content}</span>
        </div>
      )}
    </div>
  </div>
  <div className="completed-matches">
    <h4>Completed Matches:</h4>
    {completedMatches.map((match, index) => (
      <div key={index} className="completed-match">
        <span>{match.first}</span> → <span>{match.second}</span> → <span>{match.third}</span>
        <button onClick={() => handleRemoveMatch(index)}>✕</button>
      </div>
    ))}
  </div>
</div>

CATEGORIZE Variations

Original Variation

// Drag-and-drop boxes with category containers
<div className="categorize-original">
  <div className="word-pool">
    {unassignedItems.map(item => (
      <DraggableItem key={item} onDrop={handleDrop} />
    ))}
  </div>
  <div className="categories">
    {categories.map(category => (
      <CategoryBox 
        key={category.name}
        items={category.items}
        onReceiveItem={handleCategoryDrop}
      />
    ))}
  </div>
</div>

Ordering Variation

// Pre-filled categories with wrong items to fix
<div className="categorize-ordering">
  {categories.map(category => (
    <CategoryColumn
      key={category.name}
      wrongItems={category.wrongItems}
      correctItems={category.correctItems}
      onItemMove={handleMove}
    />
  ))}
</div>

Lake Variation

// Canvas with selectable items
<div className="categorize-lake">
  <div className="instructions">{instructions}</div>
  <div className="canvas">
    {allItems.map(item => (
      <SelectableItem
        key={item}
        selected={selectedItems.includes(item)}
        onToggle={handleToggle}
      />
    ))}
  </div>
  <div className="selection-summary">
    Selected: {selectedItems.length} items
  </div>
</div>

SELECTOR Variations (NEW TYPE)

On-Text Variation

// Click to select words in sentences
<div className="selector-on-text">
  <div className="instructions">{instructions}</div>
  <div className="text-content">
    {sentences.map((sentence, sentenceIndex) => (
      <div key={sentenceIndex} className="sentence">
        {sentence.words.map((word, wordIndex) => (
          <span
            key={`${sentenceIndex}-${wordIndex}`}
            className={`word ${selectedWords.includes(`${sentenceIndex}-${wordIndex}`) ? 'selected' : ''} ${word.isTarget ? 'target' : ''}`}
            onClick={() => handleWordClick(sentenceIndex, wordIndex)}
          >
            {word.text}
          </span>
        ))}
      </div>
    ))}
  </div>
  <div className="selection-status">
    Selected: {selectedWords.length} word(s)
  </div>
</div>

Image Variation (Experimental)

// Click areas on images with coordinate detection
<div className="selector-image">
  <div className="instructions">{instructions}</div>
  <div className="image-container">
    <img 
      src={imageUrl} 
      alt="Exercise content"
      className="selectable-image"
      onClick={handleImageClick}
      onLoad={handleImageLoad}
    />
    {clickAreas.map((area, index) => (
      <div
        key={index}
        className={`click-area ${area.selected ? 'selected' : ''}`}
        style={{
          left: `${area.x}%`,
          top: `${area.y}%`,
          width: `${area.width}%`,
          height: `${area.height}%`
        }}
      />
    ))}
    {userClicks.map((click, index) => (
      <div
        key={index}
        className={`user-click ${click.isCorrect ? 'correct' : 'incorrect'}`}
        style={{
          left: `${click.x}px`,
          top: `${click.y}px`
        }}
      />
    ))}
  </div>
  <div className="click-summary">
    Clicks: {userClicks.length} | Correct: {userClicks.filter(c => c.isCorrect).length}
  </div>
</div>

