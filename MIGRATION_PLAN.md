# EduScript Exercise System Migration Plan

## Overview
This document outlines the detailed plan for migrating exercise components from `apps/web-next` to `packages/edu-exercises` to consolidate the architecture and fix the fragmented system.

## Current State Analysis

### Components in apps/web-next (TO BE MOVED)
Located in `/apps/web-next/components/exercises/displays/`:

#### Categorize Exercise Components
- `CategorizeDisplay.tsx` - Main router
- `CategorizeOriginalDisplay.tsx` - Original variation
- `CategorizeOrderingDisplay.tsx` - Ordering variation  
- `CategorizeLakeDisplay.tsx` - Lake variation
- `CategorizeVariationRouter.tsx` - Variation router

#### Selector Exercise Components
- `SelectorDisplay.tsx` - Main router
- `SelectorOnTextDisplay.tsx` - Text variation
- `SelectorImageDisplay.tsx` - Image variation
- `SelectorVariationRouter.tsx` - Variation router

#### Matching Exercise Components
- `MatchingDisplay.tsx` - Standard display
- `MatchingThreesomeDisplay.tsx` - Three-way matching
- `MatchingVariationRouter.tsx` - Variation router

#### Ordering Exercise Components
- `OrderingDisplay.tsx` - Standard display
- `OrderingAlignerDisplay.tsx` - Aligner variation
- `OrderingSingleDisplay.tsx` - Single variation
- `OrderingVariationRouter.tsx` - Variation router

#### Multiple Choice Exercise Components
- `MultipleChoiceDisplay.tsx` - Standard display
- `MultipleChoiceMatchesDisplay.tsx` - Matches variation
- `MultipleChoiceTrueFalseDisplay.tsx` - True/false variation
- `MultipleChoiceCardsDisplay.tsx` - Cards variation
- `MultipleChoiceVariationRouter.tsx` - Variation router

#### Fill Blank Exercise Components
- `FillBlanksDisplay.tsx` - Standard display
- `FillBlankSingleDisplay.tsx` - Single variation
- `FillBlankMatchesDisplay.tsx` - Matches variation
- `FillBlanksVariationRouter.tsx` - Variation router

### Components in packages/edu-exercises (EXISTING)
Located in `/packages/edu-exercises/src/components/display/`:
- `ExerciseDisplay.tsx` - Main display router
- `FillBlankExercise.tsx` - Simple implementation
- `MatchingExercise.tsx` - Simple implementation
- `MultipleChoiceExercise.tsx` - Simple implementation
- `OrderingExercise.tsx` - Simple implementation

## Migration Strategy

### Phase 1: Component Architecture

#### 1.1 New Folder Structure
```
packages/edu-exercises/src/components/
├── display/
│   ├── variations/           # NEW - All variation components
│   │   ├── categorize/
│   │   │   ├── CategorizeOriginalDisplay.tsx
│   │   │   ├── CategorizeOrderingDisplay.tsx
│   │   │   └── CategorizeLakeDisplay.tsx
│   │   ├── selector/
│   │   │   ├── SelectorOnTextDisplay.tsx
│   │   │   └── SelectorImageDisplay.tsx
│   │   ├── matching/
│   │   │   └── MatchingThreesomeDisplay.tsx
│   │   ├── ordering/
│   │   │   ├── OrderingAlignerDisplay.tsx
│   │   │   └── OrderingSingleDisplay.tsx
│   │   ├── multipleChoice/
│   │   │   ├── MultipleChoiceMatchesDisplay.tsx
│   │   │   ├── MultipleChoiceTrueFalseDisplay.tsx
│   │   │   └── MultipleChoiceCardsDisplay.tsx
│   │   └── fillBlank/
│   │       ├── FillBlankSingleDisplay.tsx
│   │       └── FillBlankMatchesDisplay.tsx
│   ├── routers/              # NEW - Variation routers
│   │   ├── CategorizeDisplay.tsx
│   │   ├── SelectorDisplay.tsx
│   │   ├── MatchingDisplay.tsx
│   │   ├── OrderingDisplay.tsx
│   │   ├── MultipleChoiceDisplay.tsx
│   │   └── FillBlankDisplay.tsx
│   ├── ExerciseDisplay.tsx   # Main router (update to use new routers)
│   └── index.ts
├── create/
│   └── ... (existing)
└── styles/
    └── ... (existing)
```

#### 1.2 Migration Steps

1. **Create new folder structure** in packages/edu-exercises
2. **Move variation components** from apps/web-next to variations/ folder
3. **Move router components** from apps/web-next to routers/ folder
4. **Update ExerciseDisplay.tsx** to use the new router components
5. **Remove old simple implementations** (or keep as fallbacks)
6. **Update exports** in index.ts files

### Phase 2: Import Updates

#### 2.1 Components to Update Imports
- All moved components will need import updates
- Remove any local styling imports
- Update @repo/api-bridge imports
- Update relative imports to new locations

#### 2.2 Apps to Update
- Search for all imports from apps/web-next/components/exercises
- Update to import from @repo/exercises

### Phase 3: Registry Integration

#### 3.1 Update Exercise Configurations
Each exercise type configuration needs to be updated to reference the new components:

```typescript
// Example for categorize.tsx
export const categorizeExercise: ExerciseTypeConfig<CategorizeContent> = {
  // ... existing config
  DisplayComponent: lazy(() => import('../components/display/routers/CategorizeDisplay')),
  variations: {
    original: {
      name: 'original',
      displayName: 'Original',
      DisplayComponent: lazy(() => import('../components/display/variations/categorize/CategorizeOriginalDisplay'))
    },
    ordering: {
      name: 'ordering',
      displayName: 'Ordering',
      DisplayComponent: lazy(() => import('../components/display/variations/categorize/CategorizeOrderingDisplay'))
    },
    lake: {
      name: 'lake',
      displayName: 'Lake',
      DisplayComponent: lazy(() => import('../components/display/variations/categorize/CategorizeLakeDisplay'))
    }
  }
};
```

### Phase 4: Styling Consolidation

#### 4.1 Styling Rules
- **NO local CSS files** in display components
- All styling must use `@components` SCSS architecture
- Components should use existing CSS classes from the design system
- Any component-specific styles should be added to the global SCSS system

#### 4.2 Style Migration
1. Identify any local styles in apps/web-next components
2. Map to existing @components classes
3. Add any missing styles to the global SCSS system
4. Remove all local style imports

## File Move Checklist

### Categorize Exercise
- [ ] Move `CategorizeDisplay.tsx` → `components/display/routers/`
- [ ] Move `CategorizeOriginalDisplay.tsx` → `components/display/variations/categorize/`
- [ ] Move `CategorizeOrderingDisplay.tsx` → `components/display/variations/categorize/`
- [ ] Move `CategorizeLakeDisplay.tsx` → `components/display/variations/categorize/`
- [ ] Remove `CategorizeVariationRouter.tsx` (integrated into main router)

### Selector Exercise
- [ ] Move `SelectorDisplay.tsx` → `components/display/routers/`
- [ ] Move `SelectorOnTextDisplay.tsx` → `components/display/variations/selector/`
- [ ] Move `SelectorImageDisplay.tsx` → `components/display/variations/selector/`
- [ ] Remove `SelectorVariationRouter.tsx` (integrated into main router)

### Matching Exercise
- [ ] Move `MatchingDisplay.tsx` → `components/display/routers/`
- [ ] Move `MatchingThreesomeDisplay.tsx` → `components/display/variations/matching/`
- [ ] Remove `MatchingVariationRouter.tsx` (integrated into main router)

### Ordering Exercise
- [ ] Move `OrderingDisplay.tsx` → `components/display/routers/`
- [ ] Move `OrderingAlignerDisplay.tsx` → `components/display/variations/ordering/`
- [ ] Move `OrderingSingleDisplay.tsx` → `components/display/variations/ordering/`
- [ ] Remove `OrderingVariationRouter.tsx` (integrated into main router)

### Multiple Choice Exercise
- [ ] Move `MultipleChoiceDisplay.tsx` → `components/display/routers/`
- [ ] Move `MultipleChoiceMatchesDisplay.tsx` → `components/display/variations/multipleChoice/`
- [ ] Move `MultipleChoiceTrueFalseDisplay.tsx` → `components/display/variations/multipleChoice/`
- [ ] Move `MultipleChoiceCardsDisplay.tsx` → `components/display/variations/multipleChoice/`
- [ ] Remove `MultipleChoiceVariationRouter.tsx` (integrated into main router)

### Fill Blank Exercise
- [ ] Move `FillBlanksDisplay.tsx` → `components/display/routers/`
- [ ] Move `FillBlankSingleDisplay.tsx` → `components/display/variations/fillBlank/`
- [ ] Move `FillBlankMatchesDisplay.tsx` → `components/display/variations/fillBlank/`
- [ ] Remove `FillBlanksVariationRouter.tsx` (integrated into main router)

## Testing Plan

### Phase 1: Pre-migration Testing
1. Document current working state of all exercises
2. Create test cases for each exercise type and variation
3. Take screenshots of working exercises

### Phase 2: Post-migration Testing
1. Test each exercise type with all variations
2. Verify no styling regressions
3. Check all imports are resolved
4. Test exercise creation and solving workflows
5. Verify registry properly resolves components

### Phase 3: Integration Testing
1. Test with EduScript editor
2. Test with exercise preview
3. Test in production environment
4. Performance testing

## Risk Mitigation

### Potential Risks
1. **Import conflicts** - Carefully update all imports
2. **Styling breaks** - Test each component thoroughly
3. **Registry issues** - Update registry references carefully
4. **Missing dependencies** - Check all package.json files

### Rollback Plan
1. Keep backup of current working state
2. Use git branches for migration
3. Test thoroughly before merging
4. Have revert strategy ready

## Success Criteria
- [ ] All components successfully moved to packages/edu-exercises
- [ ] No broken imports or references
- [ ] All existing working exercises continue to function
- [ ] Styling consistency maintained across all exercises
- [ ] Registry properly resolves all components
- [ ] No performance regressions
- [ ] Clean separation of concerns achieved