export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <div className="animate-pulse">
          <img
            src="/bnoverseas-logo.webp"
            alt="BN Overseas"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>

        <p className="text-gray-600 text-lg animate-pulse">Loading...</p>
      </div>
    </div>
  )
}