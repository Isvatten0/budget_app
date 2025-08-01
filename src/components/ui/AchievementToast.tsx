import React, { useState, useEffect } from 'react'
import { Trophy, X } from 'lucide-react'

interface AchievementToastProps {
  title: string
  description: string
  isVisible: boolean
  onClose: () => void
}

const AchievementToast: React.FC<AchievementToastProps> = ({
  title,
  description,
  isVisible,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-pixel-fade-in">
      <div className="game-card p-4 min-w-80 achievement-unlocked">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Trophy className="w-8 h-8 text-rose-pine-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-rose-pine-text font-pixel text-lg">
              🏆 Achievement Unlocked!
            </h3>
            <p className="text-rose-pine-text font-pixel font-semibold mt-1">
              {title}
            </p>
            <p className="text-rose-pine-muted text-sm mt-1">
              {description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-rose-pine-overlay transition-colors"
          >
            <X className="w-4 h-4 text-rose-pine-muted" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AchievementToast