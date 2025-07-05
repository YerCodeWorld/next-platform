# Revised EduScript Migration Strategy

## Key Findings

After analyzing the codebase, I've discovered:

1. **Two Separate Display Systems**: 
   - `packages/edu-exercises` has basic display components
   - `apps/web-next` has enhanced display components with variations, animations, and tracking

2. **Different Use Cases**:
   - `@repo/exercises` is used for builders/editors
   - `web-next` uses its own displays for actual exercise rendering

3. **Feature Divergence**:
   - web-next displays have: variations, sounds, progress tracking, locale support
   - edu-exercises displays are simpler, proof-of-concept implementations

## Revised Strategy

### Option 1: Enhanced Display Package (Recommended)

Create a new export path in `@repo/exercises` for enhanced displays while keeping basic displays:

```typescript
// packages/edu-exercises/src/index.ts
export * from './components/display/basic';  // Current simple displays
export * from './components/display/enhanced'; // New enhanced displays from web-next
```

**Benefits**:
- Backward compatibility maintained
- Clear separation between basic and enhanced displays
- Apps can choose which display system to use

### Option 2: Complete Replacement

Replace the basic displays with enhanced ones, but this risks breaking existing integrations.

## Implementation Plan (Option 1)

### Phase 1: Prepare Enhanced Display Structure

1. Create enhanced display structure in packages/edu-exercises:
```
packages/edu-exercises/src/components/display/
├── basic/              # Current displays (keep as-is)
│   ├── ExerciseDisplay.tsx
│   ├── FillBlankExercise.tsx
│   ├── MatchingExercise.tsx
│   ├── MultipleChoiceExercise.tsx
│   └── OrderingExercise.tsx
├── enhanced/           # New enhanced displays
│   ├── displays/       # Main display routers
│   ├── variations/     # Variation components
│   ├── shared/         # Shared components (Card, DragDrop, etc.)
│   ├── hooks/          # Shared hooks
│   └── index.ts
└── index.ts
```

### Phase 2: Dependency Resolution

Before moving components, we need to:

1. **Move shared components** (Card, DragDropZone, ProgressHeader, etc.)
2. **Move hooks** (useExerciseTimer, useDragDrop)
3. **Handle external dependencies**:
   - `framer-motion` - add to package.json
   - `lucide-react` - add to package.json
   - Sound files - decide on asset management

### Phase 3: Progressive Migration

1. **Start with Categorize** as proof of concept
2. **Test integration** with web-next
3. **Migrate remaining exercises** if successful

### Phase 4: Update Registry

Instead of replacing display components, add enhanced displays as an option:

```typescript
export const categorizeExercise: ExerciseTypeConfig<CategorizeContent> = {
  // ... existing config
  DisplayComponent: BasicCategorizeDisplay, // Keep for compatibility
  EnhancedDisplayComponent: EnhancedCategorizeDisplay, // New enhanced version
  variations: {
    // ... variations with enhanced displays
  }
};
```

## Immediate Next Steps

1. **Decision Required**: Should we proceed with Option 1 (enhanced displays) or Option 2 (complete replacement)?

2. **Dependencies to Add** to packages/edu-exercises:
   - framer-motion
   - lucide-react
   - Any other UI dependencies

3. **Asset Management**: 
   - Where to store sound files?
   - How to handle locale files?

4. **Style Strategy**:
   - Import web-next styles or recreate?
   - Use CSS modules or plain CSS?

## Benefits of This Approach

1. **No Breaking Changes**: Existing users of @repo/exercises continue working
2. **Progressive Enhancement**: Apps can opt-in to enhanced displays
3. **Shared Codebase**: Reduces duplication between apps
4. **Maintainability**: Single source of truth for exercise displays

## Risks and Mitigation

1. **Package Size**: Enhanced displays will increase package size
   - Mitigation: Use dynamic imports and tree-shaking

2. **Style Conflicts**: Different styling approaches
   - Mitigation: Use CSS modules or scoped styles

3. **Dependency Management**: More dependencies in the package
   - Mitigation: Mark UI dependencies as peerDependencies

## Questions for Decision

1. Should we proceed with the enhanced display approach?
2. How should we handle assets (sounds, images)?
3. What styling approach should we use?
4. Should enhanced displays be the default or opt-in?