import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  created_at: string
}

export interface BankBalance {
  id: string
  user_id: string
  amount: number
  timestamp: string
}

export interface RecurringIncome {
  id: string
  user_id: string
  source: string
  amount: number
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom'
  next_date: string
  custom_days?: number
}

export interface RecurringExpense {
  id: string
  user_id: string
  name: string
  amount: number
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom'
  due_date: string
  custom_days?: number
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string
  notes?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  description: string
  category: string
  date: string
  is_recurring: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  pay_frequency: 'weekly' | 'biweekly' | 'monthly' | 'custom'
  last_pay_date: string
  default_currency: string
  theme: 'dark' | 'light'
  custom_days?: number
  created_at: string
  updated_at: string
}