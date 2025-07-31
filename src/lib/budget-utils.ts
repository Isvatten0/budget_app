import { addDays, addWeeks, addMonths, format, isAfter, isBefore, startOfDay } from 'date-fns'
import { RecurringIncome, RecurringExpense, Goal, Transaction, UserSettings } from './supabase'

export interface BudgetForecast {
  currentBalance: number
  reservedForBills: number
  discretionary: number
  nextPayDate: Date
  upcomingBills: UpcomingBill[]
  goalsProgress: GoalProgress[]
}

export interface UpcomingBill {
  name: string
  amount: number
  dueDate: Date
  isInCurrentCycle: boolean
  needsReservation: boolean
}

export interface GoalProgress {
  goal: Goal
  progress: number
  monthlyContribution: number
  onTrack: boolean
}

export interface PayPeriod {
  start: Date
  end: Date
  income: number
  expenses: number
  net: number
}

export function calculateNextPayDate(lastPayDate: Date, frequency: string, customDays?: number): Date {
  switch (frequency) {
    case 'weekly':
      return addWeeks(lastPayDate, 1)
    case 'biweekly':
      return addWeeks(lastPayDate, 2)
    case 'monthly':
      return addMonths(lastPayDate, 1)
    case 'custom':
      return addDays(lastPayDate, customDays || 14)
    default:
      return addWeeks(lastPayDate, 2)
  }
}

export function getPayPeriodDays(frequency: string, customDays?: number): number {
  switch (frequency) {
    case 'weekly':
      return 7
    case 'biweekly':
      return 14
    case 'monthly':
      return 30
    case 'custom':
      return customDays || 14
    default:
      return 14
  }
}

export function calculatePayPeriods(
  lastPayDate: Date,
  frequency: string,
  customDays?: number,
  periods: number = 3
): PayPeriod[] {
  const payPeriods: PayPeriod[] = []
  let currentDate = new Date(lastPayDate)

  for (let i = 0; i < periods; i++) {
    const start = new Date(currentDate)
    const end = calculateNextPayDate(currentDate, frequency, customDays)
    
    payPeriods.push({
      start,
      end,
      income: 0,
      expenses: 0,
      net: 0
    })
    
    currentDate = end
  }

  return payPeriods
}

export function calculateUpcomingBills(
  expenses: RecurringExpense[],
  currentDate: Date,
  nextPayDate: Date,
  payPeriodDays: number
): UpcomingBill[] {
  const upcomingBills: UpcomingBill[] = []
  const currentCycleEnd = addDays(currentDate, payPeriodDays)

  expenses.forEach(expense => {
    let dueDate = new Date(expense.due_date)
    
    // If the due date has passed, calculate the next occurrence
    while (isBefore(dueDate, currentDate)) {
      dueDate = calculateNextPayDate(dueDate, expense.frequency, expense.custom_days)
    }

    const isInCurrentCycle = isBefore(dueDate, currentCycleEnd)
    const needsReservation = isAfter(dueDate, nextPayDate)

    upcomingBills.push({
      name: expense.name,
      amount: expense.amount,
      dueDate,
      isInCurrentCycle,
      needsReservation
    })
  })

  return upcomingBills.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
}

export function calculateBudgetForecast(
  currentBalance: number,
  income: RecurringIncome[],
  expenses: RecurringExpense[],
  goals: Goal[],
  settings: UserSettings,
  transactions: Transaction[] = []
): BudgetForecast {
  const currentDate = startOfDay(new Date())
  const lastPayDate = new Date(settings.last_pay_date)
  const nextPayDate = calculateNextPayDate(lastPayDate, settings.pay_frequency, settings.custom_days)
  const payPeriodDays = getPayPeriodDays(settings.pay_frequency, settings.custom_days)

  // Calculate upcoming bills
  const upcomingBills = calculateUpcomingBills(expenses, currentDate, nextPayDate, payPeriodDays)
  
  // Calculate total income for current pay period
  const currentPeriodIncome = income.reduce((total, inc) => {
    let nextDate = new Date(inc.next_date)
    while (isBefore(nextDate, currentDate)) {
      nextDate = calculateNextPayDate(nextDate, inc.frequency, inc.custom_days)
    }
    
    if (isBefore(nextDate, addDays(currentDate, payPeriodDays))) {
      return total + inc.amount
    }
    return total
  }, 0)

  // Calculate bills in current pay period
  const currentPeriodBills = upcomingBills
    .filter(bill => bill.isInCurrentCycle)
    .reduce((total, bill) => total + bill.amount, 0)

  // Calculate bills that need reservation (beyond current pay period)
  const reservedForBills = upcomingBills
    .filter(bill => bill.needsReservation)
    .reduce((total, bill) => total + bill.amount, 0)

  // Calculate discretionary amount
  const discretionary = currentBalance + currentPeriodIncome - currentPeriodBills - reservedForBills

  // Calculate goals progress
  const goalsProgress = goals.map(goal => {
    const monthlyContribution = discretionary * 0.1 // Suggest 10% of discretionary
    const progress = (goal.current_amount / goal.target_amount) * 100
    
    let onTrack = true
    if (goal.deadline) {
      const deadline = new Date(goal.deadline)
      const monthsUntilDeadline = Math.max(1, (deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      const requiredMonthly = (goal.target_amount - goal.current_amount) / monthsUntilDeadline
      onTrack = monthlyContribution >= requiredMonthly
    }

    return {
      goal,
      progress,
      monthlyContribution,
      onTrack
    }
  })

  return {
    currentBalance,
    reservedForBills,
    discretionary: Math.max(0, discretionary),
    nextPayDate,
    upcomingBills,
    goalsProgress
  }
}

export function categorizeTransaction(description: string): string {
  const lowerDesc = description.toLowerCase()
  
  // Food categories
  if (lowerDesc.includes('grocery') || lowerDesc.includes('food') || lowerDesc.includes('restaurant') || 
      lowerDesc.includes('coffee') || lowerDesc.includes('lunch') || lowerDesc.includes('dinner')) {
    return 'Food & Dining'
  }
  
  // Transportation
  if (lowerDesc.includes('gas') || lowerDesc.includes('fuel') || lowerDesc.includes('uber') || 
      lowerDesc.includes('lyft') || lowerDesc.includes('parking') || lowerDesc.includes('transit')) {
    return 'Transportation'
  }
  
  // Entertainment
  if (lowerDesc.includes('movie') || lowerDesc.includes('netflix') || lowerDesc.includes('spotify') || 
      lowerDesc.includes('game') || lowerDesc.includes('concert') || lowerDesc.includes('bar')) {
    return 'Entertainment'
  }
  
  // Shopping
  if (lowerDesc.includes('amazon') || lowerDesc.includes('walmart') || lowerDesc.includes('target') || 
      lowerDesc.includes('clothing') || lowerDesc.includes('shirt') || lowerDesc.includes('shoes')) {
    return 'Shopping'
  }
  
  // Bills
  if (lowerDesc.includes('electric') || lowerDesc.includes('water') || lowerDesc.includes('internet') || 
      lowerDesc.includes('phone') || lowerDesc.includes('rent') || lowerDesc.includes('mortgage')) {
    return 'Bills & Utilities'
  }
  
  // Health
  if (lowerDesc.includes('doctor') || lowerDesc.includes('pharmacy') || lowerDesc.includes('medical') || 
      lowerDesc.includes('dental') || lowerDesc.includes('vision')) {
    return 'Healthcare'
  }
  
  // Income
  if (lowerDesc.includes('salary') || lowerDesc.includes('payroll') || lowerDesc.includes('deposit') || 
      lowerDesc.includes('refund') || lowerDesc.includes('bonus')) {
    return 'Income'
  }
  
  return 'Other'
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return format(date, 'MMM dd, yyyy')
}

export function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0) return `In ${diffDays} days`
  return `${Math.abs(diffDays)} days ago`
}