export function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-gray-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p>AI가 최저가를 찾고 있어요...</p>
    </div>
  )
}
