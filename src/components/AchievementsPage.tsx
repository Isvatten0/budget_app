import React, { useState, useEffect } from 'react'
import { Trophy, Star, Lock, CheckCircle, Target, DollarSign, Calendar, TrendingUp } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { achievementService, Achievement, UserAchievement } from '../lib/achievement-service'

const AchievementsPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAchievements()
  }, [])

  const loadAchievements = async () => {
    try {
      const [allAchievements, userEarned] = await Promise.all([
        achievementService.getAllAchievements(),
        achievementService.getUserAchievements((await supabase.auth.getUser()).data.user?.id || '')
      ])
      
      setAchievements(allAchievements)
      setUserAchievements(userEarned)
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-green-400'
      case 'rare': return 'text-blue-400'
      case 'epic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-green-500/20'
      case 'rare': return 'shadow-blue-500/20'
      case 'epic': return 'shadow-purple-500/20'
      case 'legendary': return 'shadow-yellow-500/20'
      default: return 'shadow-gray-500/20'
    }
  }

  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-pine-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-rose-pine-text">Loading achievements...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-pine-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="game-card p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <Trophy className="w-8 h-8 text-rose-pine-gold" />
            <h1 className="text-3xl font-bold text-rose-pine-text">Achievements</h1>
          </div>
          <p className="text-rose-pine-muted">
            Complete challenges to earn achievements and level up your financial skills!
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-pine-gold">{userAchievements.length}</div>
            <div className="text-sm text-rose-pine-muted">Earned</div>
          </div>
          <div className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-pine-pine">{achievements.length}</div>
            <div className="text-sm text-rose-pine-muted">Total</div>
          </div>
          <div className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-pine-iris">
              {Math.round((userAchievements.length / achievements.length) * 100)}%
            </div>
            <div className="text-sm text-rose-pine-muted">Completion</div>
          </div>
          <div className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-pine-rose">
              {userAchievements.reduce((sum, ua) => {
                const achievement = achievements.find(a => a.id === ua.achievement_id)
                return sum + (achievement?.points || 0)
              }, 0)}
            </div>
            <div className="text-sm text-rose-pine-muted">Total XP</div>
          </div>
        </div>

        {/* Achievement Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => {
            const isEarned = isAchievementEarned(achievement.id)
            
            return (
              <div 
                key={achievement.id} 
                className={`game-card p-4 transition-all duration-200 hover:scale-105 ${
                  isEarned ? 'border-rose-pine-gold' : 'border-rose-pine-overlay'
                } ${getRarityGlow(achievement.rarity)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <span className="text-3xl">{achievement.icon}</span>
                      {isEarned && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle className="w-5 h-5 text-rose-pine-gold" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-bold text-rose-pine-text text-sm">
                        {achievement.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 border rounded ${getRarityColor(achievement.rarity)} border-current`}>
                        {achievement.rarity.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-rose-pine-muted text-xs mb-2">
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-rose-pine-gold" />
                        <span className="text-xs text-rose-pine-gold font-semibold">
                          +{achievement.points} XP
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {achievement.category === 'savings' && <Target className="w-3 h-3 text-rose-pine-pine" />}
                        {achievement.category === 'budgeting' && <TrendingUp className="w-3 h-3 text-rose-pine-iris" />}
                        {achievement.category === 'goals' && <Trophy className="w-3 h-3 text-rose-pine-gold" />}
                        {achievement.category === 'streaks' && <Calendar className="w-3 h-3 text-rose-pine-rose" />}
                        {achievement.category === 'milestones' && <DollarSign className="w-3 h-3 text-rose-pine-foam" />}
                        <span className="text-xs text-rose-pine-muted capitalize">
                          {achievement.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AchievementsPage