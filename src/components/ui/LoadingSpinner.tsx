import React from 'react'

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Pixel art style loading animation */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-rose-pine-overlay border-t-rose-pine-pine rounded-none animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-rose-pine-iris rounded-none animate-spin" style={{ animationDelay: '-0.5s' }}></div>
      </div>
      
      {/* Pixel dots */}
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-rose-pine-pine animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-rose-pine-iris animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-rose-pine-gold animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
      
      <p className="text-rose-pine-text font-pixel text-sm">Loading...</p>
    </div>
  )
}

export default LoadingSpinner