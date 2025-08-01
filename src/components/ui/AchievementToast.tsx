import React, { useState, useEffect } from 'react'
import { Trophy, X, Star } from 'lucide-react'
import { Achievement } from '../../lib/achievement-service'

interface AchievementToastProps {
  achievement: Achievement
  isVisible: boolean
  onClose: () => void
}

const AchievementToast: React.FC<AchievementToastProps> = ({
  achievement,
  isVisible,
  onClose
}) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        onClose()
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-400/20'
      case 'rare': return 'shadow-blue-400/30'
      case 'epic': return 'shadow-purple-400/40'
      case 'legendary': return 'shadow-yellow-400/50'
      default: return 'shadow-gray-400/20'
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-pixel-fade-in">
      <div className={`game-card p-4 min-w-80 achievement-unlocked ${getRarityGlow(achievement.rarity)}`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <span className="text-3xl">{achievement.icon}</span>
              <div className="absolute -top-1 -right-1">
                <Star className="w-4 h-4 text-rose-pine-gold animate-spin" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-rose-pine-text font-arcade text-sm">
                🏆 ACHIEVEMENT UNLOCKED!
              </h3>
              <span className={`text-xs font-arcade px-2 py-1 border rounded ${getRarityColor(achievement.rarity)} border-current`}>
                {achievement.rarity.toUpperCase()}
              </span>
            </div>
            <p className="text-rose-pine-text font-arcade font-semibold text-sm">
              {achievement.name}
            </p>
            <p className="text-rose-pine-muted text-xs mt-1">
              {achievement.description}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-xs text-rose-pine-gold font-arcade">
                +{achievement.points} XP
              </span>
              <span className="text-xs text-rose-pine-muted">
                {achievement.category}
              </span>
            </div>
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