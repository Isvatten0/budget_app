import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
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
import { DollarSign, Calendar, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import BankBalanceCard from './dashboard/BankBalanceCard'
import UpcomingBillsCard from './dashboard/UpcomingBillsCard'
import GoalsCard from './dashboard/GoalsCard'
import BudgetOverviewCard from './dashboard/BudgetOverviewCard'
import LoadingSpinner from './ui/LoadingSpinner'

const Dashboard: React.FC = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Data state
  const [currentBalance, setCurrentBalance] = useState(0)
  const [income, setIncome] = useState<RecurringIncome[]>([])
  const [expenses, setExpenses] = useState<RecurringExpense[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [forecast, setForecast] = useState<BudgetForecast | null>(null)

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
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
    try {
      const { error } = await supabase
        .from('bank_balances')
        .insert({
          user_id: user!.id,
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
      {/* Welcome message */}
      <div className="pixel-card p-6">
        <h1 className="text-2xl font-bold text-rose-pine-text mb-2">
          Welcome back, {user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-rose-pine-muted">
          Here's your budget overview for today
        </p>
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

      {/* Quick Actions */}
      <div className="pixel-card p-6">
        <h2 className="text-xl font-bold text-rose-pine-text mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="pixel-button-secondary p-4 text-left">
            <DollarSign className="w-6 h-6 mb-2 text-rose-pine-gold" />
            <h3 className="font-semibold text-rose-pine-text">Add Transaction</h3>
            <p className="text-sm text-rose-pine-muted">Record income or expense</p>
          </button>
          
          <button className="pixel-button-secondary p-4 text-left">
            <Calendar className="w-6 h-6 mb-2 text-rose-pine-pine" />
            <h3 className="font-semibold text-rose-pine-text">Add Bill</h3>
            <p className="text-sm text-rose-pine-muted">Set up recurring expense</p>
          </button>
          
          <button className="pixel-button-secondary p-4 text-left">
            <Target className="w-6 h-6 mb-2 text-rose-pine-iris" />
            <h3 className="font-semibold text-rose-pine-text">Create Goal</h3>
            <p className="text-sm text-rose-pine-muted">Set savings target</p>
          </button>
        </div>
      </div>

      {/* Status indicators */}
      {forecast && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="pixel-card p-4">
            <div className="flex items-center space-x-3">
              {forecast.discretionary > 0 ? (
                <CheckCircle className="w-6 h-6 text-rose-pine-pine" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-pine-love" />
              )}
              <div>
                <p className="text-sm text-rose-pine-muted">Budget Status</p>
                <p className="font-semibold text-rose-pine-text">
                  {forecast.discretionary > 0 ? 'On Track' : 'Needs Attention'}
                </p>
              </div>
            </div>
          </div>

          <div className="pixel-card p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-rose-pine-gold" />
              <div>
                <p className="text-sm text-rose-pine-muted">Next Pay Day</p>
                <p className="font-semibold text-rose-pine-text">
                  {forecast.nextPayDate ? formatRelativeDate(forecast.nextPayDate) : 'Not set'}
                </p>
              </div>
            </div>
          </div>

          <div className="pixel-card p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-rose-pine-iris" />
              <div>
                <p className="text-sm text-rose-pine-muted">Goals Progress</p>
                <p className="font-semibold text-rose-pine-text">
                  {forecast.goalsProgress.filter(g => g.onTrack).length} of {forecast.goalsProgress.length} on track
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