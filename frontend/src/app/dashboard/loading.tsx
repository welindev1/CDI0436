export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 animate-pulse">
      {/* Welcome skeleton */}
      <div className="bg-gradient-to-r from-blue-600/70 to-indigo-700/70 rounded-2xl p-6 md:p-8">
        <div className="space-y-3">
          <div className="h-7 w-64 bg-white/20 rounded-lg" />
          <div className="h-5 w-48 bg-white/20 rounded-lg" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-gray-100">
            <div className="w-10 h-10 bg-gray-200 rounded-lg mb-3" />
            <div className="h-8 w-20 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-5 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Bottom grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
            <div className="h-5 w-40 bg-gray-200 rounded mb-5" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-5 w-16 bg-gray-200 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
