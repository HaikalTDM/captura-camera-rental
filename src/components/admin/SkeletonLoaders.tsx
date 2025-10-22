// Skeleton loader components for better loading experience

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-full overflow-x-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 lg:p-8 h-40" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-32">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-8 bg-gray-300 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-64">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="h-16 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BookingsTableSkeleton() {
  return (
    <div className="space-y-6 max-w-full overflow-x-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 lg:p-8 h-40" />

      {/* Filters Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 h-48">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg w-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CamerasGridSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 h-40" />

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-32">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-8 bg-gray-300 rounded w-1/2" />
          </div>
        ))}
      </div>

      {/* Cameras Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-64">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-12 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-5/6" />
        <div className="h-4 bg-gray-100 rounded w-4/6" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
        <div className="w-14 h-14 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

