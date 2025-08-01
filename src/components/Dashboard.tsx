import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  calculateBudgetForecast, 
  formatCurrency, 
  formatDate, 
  formatRelativeDate 
} from '../lib/budget-utils'
import { 
  RecurringIncome, 
  RecurringExpense, 
  Goal, 
  UserSettings,
  BankBalance 
} from '../lib/supabase'
import { 
  BudgetForecast, 
  UpcomingBill, 
  GoalProgress 
} from '../lib/budget-utils'
import { DollarSign, Calendar, Target, TrendingUp, AlertTriangle, CheckCircle, Settings } from 'lucide-react'
import BankBalanceCard from './dashboard/BankBalanceCard'
import UpcomingBillsCard from './dashboard/UpcomingBillsCard'
import GoalsCard from './dashboard/GoalsCard'
import BudgetOverviewCard from './dashboard/BudgetOverviewCard'
import LoadingSpinner from './ui/LoadingSpinner'
import { achievementService, Achievement } from '../lib/achievement-service'
import AchievementToast from './ui/AchievementToast'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Data state
  const [currentBalance, setCurrentBalance] = useState(0)
  const [income, setIncome] = useState<RecurringIncome[]>([])
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [forecast, setForecast] = useState<BudgetForecast | null>(null)
  
  // Achievement state
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)
  const [showAchievementToast, setShowAchievementToast] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user?.id) {
      setError('User not authenticated')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      // Load user settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settingsError) throw settingsError
      setSettings(settingsData)

      // Load current bank balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('bank_balances')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError
      setCurrentBalance(balanceData?.amount || 0)

      // Load recurring income
      const { data: incomeData, error: incomeError } = await supabase
        .from('recurring_income')
        .select('*')
        .eq('user_id', user.id)

      if (incomeError) throw incomeError
      setIncome(incomeData || [])

      // Load recurring expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id)

      if (expensesError) throw expensesError
      setExpenses(expensesData || [])

      // Load goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)

      if (goalsError) throw goalsError
      setGoals(goalsData || [])

    } catch (err) {
      console.error('Error loading user data:', err)
      setError('Failed to load your budget data')
    } finally {
      setLoading(false)
    }
  }

  const checkForAchievements = async () => {
    if (!user?.id) return

    try {
      const newAchievements = await achievementService.checkAchievements(user.id, 'dashboard_load')
      
      if (newAchievements.length > 0) {
        setNewAchievement(newAchievements[0]) // Show the first achievement
        setShowAchievementToast(true)
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  useEffect(() => {
    if (settings && income && expenses && goals) {
      const budgetForecast = calculateBudgetForecast(
        currentBalance,
        income,
        expenses,
        goals,
        settings
      )
      setForecast(budgetForecast)
    }
  }, [currentBalance, income, expenses, goals, settings])

  const updateBankBalance = async (newBalance: number) => {
    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    try {
      const { error } = await supabase
        .from('bank_balances')
        .insert({
          user_id: user.id,
          amount: newBalance
        })

      if (error) throw error
      setCurrentBalance(newBalance)
    } catch (err) {
      console.error('Error updating bank balance:', err)
      setError('Failed to update bank balance')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="pixel-card p-6">
        <div className="flex items-center space-x-3 text-rose-pine-love">
          <AlertTriangle size={24} />
          <h2 className="text-xl font-bold">Error</h2>
        </div>
        <p className="mt-2 text-rose-pine-text">{error}</p>
        <button 
          onClick={loadUserData}
          className="pixel-button mt-4"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Achievement Toast */}
      {newAchievement && (
        <AchievementToast
          achievement={newAchievement}
          isVisible={showAchievementToast}
          onClose={() => {
            setShowAchievementToast(false)
            setNewAchievement(null)
          }}
        />
      )}
      {/* Game Header */}
      <div className="game-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="level-indicator">
              LVL {Math.floor((goals.length + expenses.length) / 3) + 1}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-rose-pine-text font-arcade">
                Welcome back, {user?.email?.split('@')[0]}! 🎮
              </h1>
              <p className="text-rose-pine-muted">
                Ready to level up your financial skills?
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-rose-pine-muted mb-1">XP Progress</div>
            <div className="xp-bar w-32">
              <div 
                className="xp-fill" 
                style={{ width: `${Math.min((goals.length + expenses.length) * 10, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Quest Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-pine-gold">{goals.length}</div>
            <div className="text-sm text-rose-pine-muted">Active Quests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-pine-pine">{expenses.length}</div>
            <div className="text-sm text-rose-pine-muted">Bills Defeated</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-pine-iris">{Math.floor(currentBalance / 100)}</div>
            <div className="text-sm text-rose-pine-muted">Gold Coins</div>
          </div>
        </div>
      </div>

      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Balance Card */}
        <BankBalanceCard 
          currentBalance={currentBalance}
          onUpdateBalance={updateBankBalance}
        />

        {/* Budget Overview Card */}
        <BudgetOverviewCard forecast={forecast} />
      </div>

      {/* Secondary grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bills Card */}
        <UpcomingBillsCard 
          upcomingBills={forecast?.upcomingBills || []}
          nextPayDate={forecast?.nextPayDate}
        />

        {/* Goals Card */}
        <GoalsCard 
          goalsProgress={forecast?.goalsProgress || []}
        />
      </div>

      {/* Quest Board */}
      <div className="game-card p-6">
        <h2 className="text-xl font-bold text-rose-pine-text mb-4 font-arcade">🎯 QUEST BOARD</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/income')}
            className="pixel-button-secondary p-4 text-left hover:bg-rose-pine-overlay transition-colors"
          >
            <DollarSign className="w-6 h-6 mb-2 text-rose-pine-gold" />
            <h3 className="font-semibold text-rose-pine-text font-arcade">💰 COLLECT GOLD</h3>
            <p className="text-sm text-rose-pine-muted">Log your income & rewards</p>
          </button>
          
          <button 
            onClick={() => navigate('/bills')}
            className="pixel-button-secondary p-4 text-left hover:bg-rose-pine-overlay transition-colors"
          >
            <Calendar className="w-6 h-6 mb-2 text-rose-pine-pine" />
            <h3 className="font-semibold text-rose-pine-text font-arcade">⚔️ BATTLE BILLS</h3>
            <p className="text-sm text-rose-pine-muted">Defeat recurring expenses</p>
          </button>
          
          <button 
            onClick={() => navigate('/goals')}
            className="pixel-button-secondary p-4 text-left hover:bg-rose-pine-overlay transition-colors"
          >
            <Target className="w-6 h-6 mb-2 text-rose-pine-iris" />
            <h3 className="font-semibold text-rose-pine-text font-arcade">🏆 EPIC QUESTS</h3>
            <p className="text-sm text-rose-pine-muted">Complete savings missions</p>
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="pixel-button-secondary p-4 text-left hover:bg-rose-pine-overlay transition-colors"
          >
            <Settings className="w-6 h-6 mb-2 text-rose-pine-muted" />
            <h3 className="font-semibold text-rose-pine-text font-arcade">⚙️ CHARACTER</h3>
            <p className="text-sm text-rose-pine-muted">Customize your settings</p>
          </button>
        </div>
      </div>

      {/* Game Stats */}
      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="game-card p-4">
            <div className="flex items-center space-x-3">
              {forecast.discretionary > 0 ? (
                <CheckCircle className="w-6 h-6 text-rose-pine-pine" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-pine-love" />
              )}
              <div>
                <p className="text-sm text-rose-pine-muted font-arcade">🎯 MISSION STATUS</p>
                <p className="font-semibold text-rose-pine-text font-arcade">
                  {forecast.discretionary > 0 ? '✅ MISSION SUCCESS!' : '⚠️ MISSION CRITICAL'}
                </p>
              </div>
            </div>
          </div>

          <div className="game-card p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-rose-pine-gold" />
              <div>
                <p className="text-sm text-rose-pine-muted font-arcade">💰 NEXT REWARD</p>
                <p className="font-semibold text-rose-pine-text font-pixel">
                  {forecast.nextPayDate ? formatRelativeDate(forecast.nextPayDate) : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          <div className="game-card p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-rose-pine-iris" />
              <div>
                <p className="text-sm text-rose-pine-muted font-arcade">🏆 QUEST PROGRESS</p>
                <p className="font-semibold text-rose-pine-text font-arcade">
                  {forecast.goalsProgress.filter(g => g.onTrack).length}/{forecast.goalsProgress.length} COMPLETE
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard