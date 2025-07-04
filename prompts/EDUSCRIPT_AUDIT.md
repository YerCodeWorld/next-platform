Prompt

EduScript Migration Audit & Implementation Plan

🎯 Executive Summary

This audit outlines the complete migration from LanScript to EduScript, introducing powerful new features including:

- 6 new exercise variations for existing types as well as display style variations for different use cases. 
- CATEGORIZE exercise type with 3 variations 
- SELECTOR exercise type with 3 variations 
- Advanced function system (@fill, @img, @idea, @define, etc.)
- Content libraries package for auto-completion
- Complete syntax modernization

📋 Current System Changes Required

1. Package Structure Reorganization

New Package: @packages/edu-libraries

packages/edu-libraries/
├── src/
│   ├── index.ts
│   ├── animals.ts
│   ├── countries.ts
│   ├── colors.ts
│   ├── food.ts
│   ├── professions.ts
│   ├── adjectives.ts
│   └── types.ts
└── package.json

Updated Package: @packages/edu-exercises

packages/edu-exercises/src/
├── parser/lanscript/               # → parser/eduscript/
├── exercises/
│   ├── multipleChoice/
│   │   ├── original.ts
│   │   ├── matches.ts
│   ├── fillBlank/
│   │   ├── original.ts
│   │   ├── single.ts
│   │   └── matches.ts
│   ├── ordering/
│   │   ├── original.ts
│   │   ├── single.ts
│   │   └── aligner.ts
│   ├── matching/
│   │   ├── original.ts
│   │   ├── new.ts
│   │   └── threesome.ts
│   └── categorize/               # NEW
│       ├── original.ts
│       ├── ordering.ts
│       └── lake.ts
│   └── selector/               # NEW
│       ├── on-text.ts
│       └── image.ts
├── functions/                    # NEW
│   ├── fill.ts
│   ├── metadata.ts
│   ├── config.ts
│   ├── img.ts
│   └── idea.ts
└── components/                   # REMOVE COMPLETELY

- The functions could be stored in a single file since I do not know if 
their logic is that complex or if it is better to keep it like this. 

# Displays

Actual Displays

#### 4.1 Display Components
```
apps/web-next/components/exercises/displays/
├── multipleChoice/
│   ├── OriginalDisplay.tsx
│   ├── MatchesDisplay.tsx
│   ├── CardsDisplay.tsx
│   └── TrueFalseDisplay.tsx
├── fillBlank/
│   ├── OriginalDisplay.tsx
│   ├── SingleDisplay.tsx
│   └── MatchesDisplay.tsx
├── ordering/
│   ├── OriginalDisplay.tsx
│   ├── SingleDisplay.tsx
│   └── AlignerDisplay.tsx
├── matching/
│   ├── OriginalDisplay.tsx
│   ├── NewDisplay.tsx
│   └── ThreesomeDisplay.tsx
└── categorize/
    ├── OriginalDisplay.tsx
    ├── OrderingDisplay.tsx
    └── LakeDisplay.tsx
```


## 🔄 Breaking Changes & Syntax Migration

### 2. **Function Syntax Updates**

| Old LanScript | New EduScript | Status |
|---------------|---------------|---------|
| `@hint(text)` | `@idea(text)` | ✅ Replace |
| `@explanation()` | `@notes(text)` (global only) | ✅ Replace 

### New ones

- `@ins(text)` (question-level)
- `@img(URL_string)`
- `@fill(lib, amount, difficulty)` 
- `@randomize()` 
- `@var()`
- `@define()` 


### 3. **Exercise Type Syntax Changes**

#### FILL_BLANK Variations
```typescript
// Original (current): She *is* my *little|younger* sister.
// NEW Original: She *is* my *little|younger* sister. (same)
// NEW Single: W[a]te[rme]lon  
// NEW Matches: happy = *sad*
```

#### MULTIPLE_CHOICE Variations
```typescript
// Original: The sky = [blue] | red | green | [pink]
// NEW Matches: Question with <select> dropdowns
// NEW Cards: Visual card-based display
// NEW True/False: Boolean-style questions
```
#### ORDERING Variations
```typescript
// Original: The sky = I | am | not | your | friend
// NEW single: Beautiful 
// NEW Aligner: Order by fastest = eagle | cheetah | turtle (water)
```
#### MATCHES Variations
```typescript
// Original: apple = red
// OLD new: Created display for long sentences
// NEW Threesome: apple = fruit = red
```
#### CATEGORIZE (NEW Type)
```typescript
// Original: ASIA = @fill('asian countries', 5)
// Ordering: Pre-categorized items with errors to fix
// Lake: Canvas with selectable items
```
#### SELECTOR (NEW Type)
```typescript
// Original: I [is] a baseball player
// Image: Needs research. Aims to select sections in an image.
```

#### 4.2 Remove Manual Builders
- [ ] Delete `ManualBuilder.tsx`
- [ ] Delete all manual builder components
- [ ] Update `ExerciseCreator.tsx` to only use EduScript editor
- [ ] Remove manual builder options from UI

---

## 🎨 Component Implementation Details

Check the variations file.

## 📊 Impact Analysis

### **Files to Modify (Existing)**
- ✅ `packages/edu-exercises/src/index.ts`
- ✅ `packages/edu-exercises/src/registry/ExerciseRegistry.ts`
- ✅ `packages/edu-exercises/src/parser/lanscript/parser.ts` → `eduscript/parser.ts`
- ✅ `apps/web-next/components/exercises/ExerciseBuilderModal.tsx`
- ✅ `apps/web-next/components/exercises/ExercisePracticeDisplay.tsx`

### **Files to Create (New)**
- 🆕 `packages/edu-libraries/` (entire package)
- 🆕 `packages/edu-exercises/src/functions/` 
- 🆕 `packages/edu-exercises/src/exercises/categorize/` 
- 🆕 All variation files 
- 🆕 All display components 

### **Files to Delete**
- ❌ `packages/edu-exercises/src/components/create/ManualBuilder.tsx`
- ❌ All manual builder related files
- ❌ Manual builder UI components

---

## 📝 Implementation Notes

### **Critical Dependencies**
1. **Content Libraries**: Must be created before @fill() function
2. **Function System**: Must be implemented before parser updates
3. **Registry Updates**: Must support variations before UI components
4. **Display Components**: Can be implemented in parallel with variations

### **Performance Considerations**
- Cache content libraries for @fill() operations
- Lazy load variation components

### **Breaking Change Migration**
```typescript
// Auto-migration script needed for:
const migrations = {
  '@hint(' → '@idea(',
  '@explanation(' → '@notes(',
  'lanscript' → 'eduscript',
  // Update exercise type detection
};
```

---

## 🎯 Success Metrics

- [ ] All manual builders removed
- [ ] All original types and variations working
- [ ] New Types and their variations working
- [ ] Creation of simple files for libraries
- [ ] All new functions working properly
- [ ] Replacement of Monaco with CodeMirror
- [ ] New code-editor handling autocompletion, syntax highlighting, etc
- [ ] Performance maintained or improved
- [ ] Heavy error-handling when creating scripts

This represents a major evolution that will make the exercise system significantly more powerful and user-friendly. 
The removal of manual builders in favor of the enhanced EduScript language will streamline the creation process considerably.
