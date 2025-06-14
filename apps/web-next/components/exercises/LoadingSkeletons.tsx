// components/exercises/LoadingSkeletons.tsx
'use client';

export function ExercisePackageHeaderSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8 animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="h-64 md:h-80 bg-gradient-to-r from-gray-200 to-gray-300"></div>
      
      {/* Content Skeleton */}
      <div className="p-6 space-y-6">
        {/* Description */}
        <div>
          <div className="h-5 bg-gray-200 rounded mb-3 w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-4 bg-gray-50 rounded-xl">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3"></div>
        </div>
      </div>
    </div>
  );
}

export function ExercisePackageContentSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Tabs Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="h-6 bg-gray-200 rounded mb-6 w-1/4"></div>
        <div className="flex flex-wrap gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="px-6 py-4 bg-gray-100 rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-50 rounded-xl">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>

      {/* Exercise List Skeleton */}
      <div className="space-y-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border-2 border-gray-100 p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                
                <div className="flex gap-3 mb-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="px-4 py-2 bg-gray-100 rounded-full">
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                </div>
              </div>
              
              <div className="px-8 py-4 bg-gray-100 rounded-xl">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExercisePlayerSkeleton() {
  return (
    <div className="min-h-screen flex flex-col animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="h-5 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="bg-gray-100 h-2">
        <div className="h-full bg-gray-300 w-1/3"></div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Question Counter */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* Exercise Content */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-6 text-center space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
            </div>

            <div className="space-y-6 mb-8">
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 border-2 border-gray-200 rounded-xl">
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <div className="px-6 py-3 bg-gray-200 rounded-xl w-24 h-12"></div>
              <div className="px-8 py-3 bg-gray-200 rounded-xl w-32 h-12"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExerciseResultsSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-pulse">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center bg-gray-100">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2 w-1/2 mx-auto"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>

          {/* Score Circle */}
          <div className="p-8 text-center">
            <div className="w-30 h-30 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-24 mx-auto"></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-gray-50">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-8 space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}