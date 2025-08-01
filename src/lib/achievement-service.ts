import { supabase } from './supabase'

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'savings' | 'budgeting' | 'goals' | 'streaks' | 'milestones'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points: number
  requirements: any
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  earned_at: string
  progress?: any
  achievement?: Achievement
}

export interface UserStats {
  id: string
  user_id: string
  total_balance_high: number
  total_saved: number
  goals_completed: number
  bills_paid_on_time: number
  days_streak: number
  longest_streak: number
  last_activity_date: string
  created_at: string
  updated_at: string
}

export interface ProfileBadge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  rarity: string
  created_at: string
}

export interface UserProfileBadge {
  id: string
  user_id: string
  badge_id: string
  earned_at: string
  is_equipped: boolean
  badge?: ProfileBadge
}

class AchievementService {
  // Check and award achievements based on user actions
  async checkAchievements(userId: string, action: string, data?: any): Promise<Achievement[]> {
    const newAchievements: Achievement[] = []
    
    try {
      // Get user's current stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      // Get user's existing achievements
      const { data: existingAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)

      const earnedAchievementIds = existingAchievements?.map(ua => ua.achievement_id) || []

      // Get all available achievements
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')

      if (!allAchievements) return newAchievements

      // Check each achievement
      for (const achievement of allAchievements) {
        if (earnedAchievementIds.includes(achievement.id)) continue

        const isEarned = await this.checkAchievementRequirement(userId, achievement, userStats, action, data)
        
        if (isEarned) {
          // Award the achievement
          await this.awardAchievement(userId, achievement.id)
          newAchievements.push(achievement)
        }
      }

      return newAchievements
    } catch (error) {
      console.error('Error checking achievements:', error)
      return newAchievements
    }
  }

  private async checkAchievementRequirement(
    userId: string, 
    achievement: Achievement, 
    userStats: UserStats | null,
    action: string,
    data?: any
  ): Promise<boolean> {
    const { type, value } = achievement.requirements

    switch (type) {
      case 'balance_threshold':
        return await this.checkBalanceThreshold(userId, value)
      
      case 'goals_created':
        return await this.checkGoalsCreated(userId, value)
      
      case 'goals_completed':
        return await this.checkGoalsCompleted(userId, value)
      
      case 'bills_added':
        return await this.checkBillsAdded(userId, value)
      
      case 'income_entries':
        return await this.checkIncomeEntries(userId, value)
      
      case 'app_usage_streak':
        return await this.checkAppUsageStreak(userId, value)
      
      case 'budget_streak':
        return await this.checkBudgetStreak(userId, value)
      
      case 'income_log_streak':
        return await this.checkIncomeLogStreak(userId, value)
      
      case 'bills_on_time_streak':
        return await this.checkBillsOnTimeStreak(userId, value)
      
      default:
        return false
    }
  }

  private async checkBalanceThreshold(userId: string, threshold: number): Promise<boolean> {
    const { data: balances } = await supabase
      .from('bank_balances')
      .select('amount')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)

    return balances?.[0]?.amount >= threshold || false
  }

  private async checkGoalsCreated(userId: string, count: number): Promise<boolean> {
    const { count: goalsCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return (goalsCount || 0) >= count
  }

  private async checkGoalsCompleted(userId: string, count: number): Promise<boolean> {
    const { data: goals } = await supabase
      .from('goals')
      .select('current_amount, target_amount')
      .eq('user_id', userId)

    const completedGoals = goals?.filter(goal => goal.current_amount >= goal.target_amount).length || 0
    return completedGoals >= count
  }

  private async checkBillsAdded(userId: string, count: number): Promise<boolean> {
    const { count: billsCount } = await supabase
      .from('recurring_expenses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return (billsCount || 0) >= count
  }

  private async checkIncomeEntries(userId: string, count: number): Promise<boolean> {
    const { count: incomeCount } = await supabase
      .from('income_entries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return (incomeCount || 0) >= count
  }

  private async checkAppUsageStreak(userId: string, days: number): Promise<boolean> {
    // This would need to be implemented with daily login tracking
    // For now, return false
    return false
  }

  private async checkBudgetStreak(userId: string, days: number): Promise<boolean> {
    // This would need to be implemented with daily budget compliance tracking
    // For now, return false
    return false
  }

  private async checkIncomeLogStreak(userId: string, days: number): Promise<boolean> {
    // This would need to be implemented with daily income logging tracking
    // For now, return false
    return false
  }

  private async checkBillsOnTimeStreak(userId: string, days: number): Promise<boolean> {
    // This would need to be implemented with bill payment tracking
    // For now, return false
    return false
  }

  private async awardAchievement(userId: string, achievementId: string): Promise<void> {
    await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId
      })
  }

  // Get user's achievements
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    return data || []
  }

  // Get user's stats
  async getUserStats(userId: string): Promise<UserStats | null> {
    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single()

    return data
  }

  // Get all available achievements
  async getAllAchievements(): Promise<Achievement[]> {
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .order('points', { ascending: true })

    return data || []
  }

  // Get user's profile badges
  async getUserProfileBadges(userId: string): Promise<UserProfileBadge[]> {
    const { data } = await supabase
      .from('user_profile_badges')
      .select(`
        *,
        badge:profile_badges(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false })

    return data || []
  }

  // Get all available profile badges
  async getAllProfileBadges(): Promise<ProfileBadge[]> {
    const { data } = await supabase
      .from('profile_badges')
      .select('*')
      .order('rarity', { ascending: true })

    return data || []
  }

  // Equip/unequip a profile badge
  async toggleBadgeEquipped(userId: string, badgeId: string, isEquipped: boolean): Promise<void> {
    await supabase
      .from('user_profile_badges')
      .update({ is_equipped: isEquipped })
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
  }
}

export const achievementService = new AchievementService()