// packages/api-bridge/src/index.ts - Updated to include teacher profiles
export { useApi } from './hooks/useApi';
export { useUserApi, type UpdateUserPayload } from './hooks/useUserApi';
export { useTestimonyApi } from './hooks/useTestimonyApi';
export { usePostApi, type UpdatePostPayload } from './hooks/userPostApi';
export { useDynamicsApi, type UpdateDynamicPayload, type DynamicsFilters } from './hooks/useDynamicsApi';
export { useTeacherProfileApi } from './hooks/useTeacherProfileApi';
export { useExerciseApi } from './hooks/useExerciseApi';
export { useExercisePackagesApi, type ExercisePackage, type CreateExercisePackagePayload, type UpdateExercisePackagePayload, type ExercisePackageFilters, type UserProgress, type PackageExercise } from './hooks/useExercisePackagesApi';

export {
    type User,
    type CreateUserPayload,
    type Testimony,
    type CreateTestimonyPayload,
    type Post,
    type CreatePostPayload
} from './hooks/types';

export type {
    Exercise,
    CreateExercisePayload,
    ExerciseType,
    ExerciseDifficulty,
    ExerciseCategory,
    FillBlankContent,
    MatchingContent,
    MultipleChoiceContent,
    OrderingContent,
    CategorizeContent,
    SelectorContent,
    ExerciseContent
} from './hooks/types';

// Export dynamics types directly
export type {
    Dynamic,
    CreateDynamicPayload
} from './hooks/useDynamicsApi';

// Export teacher profile types directly
export type {
    TeacherProfile,
    TeacherEducation,
    TeacherExperience,
    TeacherCertification,
    TeacherProfileSection,
    CreateTeacherProfilePayload,
    UpdateTeacherProfilePayload,
    TeacherProfileFilters,
    CreateEducationPayload,
    CreateExperiencePayload,
    CreateCertificationPayload,
    CreateProfileSectionPayload
} from './hooks/useTeacherProfileApi';