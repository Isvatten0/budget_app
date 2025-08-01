import React, { useState, useEffect } from 'react'
import { 
  PiggyBank, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Sword,
  Shield,
  Zap,
  Target,
  Gamepad2,
  Crown
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { BudgetCategory, BudgetCategoryTransaction } from '../lib/supabase'

interface DebtMonster {
  name: string
  health: number
  maxHealth: number
  description: string
  icon: string
  color: string
}

const BudgetCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [transactions, setTransactions] = useState<BudgetCategoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [showDebtMonster, setShowDebtMonster] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | null>(null)
  const [totalAllocated, setTotalAllocated] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [debtMonster, setDebtMonster] = useState<DebtMonster | null>(null)

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    allocated_amount: '',
    color: '#31748f',
    icon: '💰'
  })

  const [transactionForm, setTransactionForm] = useState({
    category_id: '',
    description: '',
    amount: '',
    transaction_date: '',
    type: 'expense' as 'expense' | 'refund'
  })

  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustments: {} as Record<string, number>
  })

  const categoryIcons = ['💰', '🛒', '🎮', '🍕', '🚗', '🛍️', '💸', '🏠', '💊', '✈️', '🎬', '📚', '🏋️', '🎨', '🎵', '🍺', '☕', '🍦', '🎪', '🎯']

  const categoryColors = [
    '#31748f', '#eb6f92', '#f6c177', '#9ccfd8', '#c4a7e7', '#ebbcba',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'
  ]

  useEffect(() => {
    loadBudgetData()
  }, [])

  useEffect(() => {
    calculateTotals()
    checkForDebtMonster()
  }, [categories, transactions])

  const loadBudgetData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [categoriesResponse, transactionsResponse] = await Promise.all([
        supabase
          .from('budget_categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('budget_category_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('transaction_date', { ascending: false })
      ])

      if (categoriesResponse.data) setCategories(categoriesResponse.data)
      if (transactionsResponse.data) setTransactions(transactionsResponse.data)
    } catch (error) {
      console.error('Error loading budget data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotals = () => {
    const allocated = categories.reduce((sum, cat) => sum + cat.allocated_amount, 0)
    const spent = categories.reduce((sum, cat) => sum + (cat.allocated_amount - cat.current_balance), 0)
    setTotalAllocated(allocated)
    setTotalSpent(spent)
  }

  const checkForDebtMonster = () => {
    const totalIncome = 2000 // This should come from user's actual income
    const totalNeeded = totalAllocated + 500 // Add buffer for bills/goals
    
    if (totalNeeded > totalIncome) {
      const deficit = totalNeeded - totalIncome
      const health = Math.min(100, Math.max(10, (deficit / totalIncome) * 100))
      
      setDebtMonster({
        name: 'The Debt Monster',
        health: Math.round(health),
        maxHealth: 100,
        description: `Your budget categories are consuming ${Math.round((totalNeeded / totalIncome) * 100)}% of your income! Defeat this monster by adjusting your allocations.`,
        icon: '👹',
        color: '#eb6f92'
      })
      setShowDebtMonster(true)
    } else {
      setDebtMonster(null)
      setShowDebtMonster(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('budget_categories')
        .insert({
          user_id: user.id,
          name: categoryForm.name,
          description: categoryForm.description,
          allocated_amount: parseFloat(categoryForm.allocated_amount),
          current_balance: parseFloat(categoryForm.allocated_amount), // Start with full balance
          color: categoryForm.color,
          icon: categoryForm.icon
        })

      if (error) throw error

      setCategoryForm({ name: '', description: '', allocated_amount: '', color: '#31748f', icon: '💰' })
      setShowAddCategory(false)
      loadBudgetData()
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('budget_category_transactions')
        .insert({
          user_id: user.id,
          category_id: transactionForm.category_id,
          description: transactionForm.description,
          amount: parseFloat(transactionForm.amount),
          transaction_date: transactionForm.transaction_date,
          type: transactionForm.type
        })

      if (error) throw error

      setTransactionForm({ category_id: '', description: '', amount: '', transaction_date: '', type: 'expense' })
      setShowAddTransaction(false)
      loadBudgetData()
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const handleAdjustCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Update each category with the adjusted amount
      for (const [categoryId, newAmount] of Object.entries(adjustmentForm.adjustments)) {
        const category = categories.find(c => c.id === categoryId)
        if (category) {
          const difference = newAmount - category.allocated_amount
          
          await supabase
            .from('budget_categories')
            .update({ 
              allocated_amount: newAmount,
              current_balance: category.current_balance + difference
            })
            .eq('id', categoryId)
        }
      }

      setAdjustmentForm({ adjustments: {} })
      setShowDebtMonster(false)
      loadBudgetData()
    } catch (error) {
      console.error('Error adjusting categories:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const getCategoryProgress = (category: BudgetCategory) => {
    const spent = category.allocated_amount - category.current_balance
    return (spent / category.allocated_amount) * 100
  }

  const getCategoryStatus = (category: BudgetCategory) => {
    const progress = getCategoryProgress(category)
    if (progress >= 90) return { status: 'danger', text: 'Almost Empty!' }
    if (progress >= 75) return { status: 'warning', text: 'Getting Low' }
    if (progress >= 50) return { status: 'info', text: 'Halfway There' }
    return { status: 'success', text: 'Plenty Left' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-pine-base p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-rose-pine-text">Loading budget categories...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-pine-base p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="game-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <PiggyBank className="w-8 h-8 text-rose-pine-gold" />
              <h1 className="text-3xl font-bold text-rose-pine-text">Budget Categories</h1>
            </div>
            <button
              onClick={() => setShowAddCategory(true)}
              className="pixel-button flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>
          <p className="text-rose-pine-muted">
            Manage your spending categories like digital envelopes. Each pay period, they refill with your allocated amounts!
          </p>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-pine-gold">{formatCurrency(totalAllocated)}</div>
            <div className="text-sm text-rose-pine-muted">Total Allocated</div>
          </div>
          <div className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-pine-pine">{formatCurrency(totalSpent)}</div>
            <div className="text-sm text-rose-pine-muted">Total Spent</div>
          </div>
          <div className="game-card p-4 text-center">
            <div className="text-2xl font-bold text-rose-pine-iris">
              {formatCurrency(totalAllocated - totalSpent)}
            </div>
            <div className="text-sm text-rose-pine-muted">Remaining</div>
          </div>
        </div>

        {/* Budget Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => {
            const progress = getCategoryProgress(category)
            const status = getCategoryStatus(category)
            const categoryTransactions = transactions.filter(t => t.category_id === category.id)
            
            return (
              <div key={category.id} className="game-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-rose-pine-text">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-rose-pine-muted">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Allocated: </span>
                    <span className="text-rose-pine-text">{formatCurrency(category.allocated_amount)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Remaining: </span>
                    <span className="text-rose-pine-text">{formatCurrency(category.current_balance)}</span>
                  </div>
                  
                  <div className="text-sm">
                    <span className="text-rose-pine-muted">Spent: </span>
                    <span className="text-rose-pine-text">
                      {formatCurrency(category.allocated_amount - category.current_balance)}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-rose-pine-overlay rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        status.status === 'danger' ? 'bg-rose-pine-love' :
                        status.status === 'warning' ? 'bg-rose-pine-gold' :
                        status.status === 'info' ? 'bg-rose-pine-pine' : 'bg-rose-pine-iris'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-center">
                    <span className={`font-semibold ${
                      status.status === 'danger' ? 'text-rose-pine-love' :
                      status.status === 'warning' ? 'text-rose-pine-gold' :
                      status.status === 'info' ? 'text-rose-pine-pine' : 'text-rose-pine-iris'
                    }`}>
                      {status.text}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(category)
                      setTransactionForm({ ...transactionForm, category_id: category.id })
                      setShowAddTransaction(true)
                    }}
                    className="pixel-button-secondary flex-1 text-sm"
                  >
                    Add Expense
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(category)
                      setTransactionForm({ 
                        ...transactionForm, 
                        category_id: category.id,
                        type: 'refund'
                      })
                      setShowAddTransaction(true)
                    }}
                    className="pixel-button-secondary flex-1 text-sm"
                  >
                    Add Refund
                  </button>
                </div>

                {/* Recent Transactions */}
                {categoryTransactions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-rose-pine-overlay">
                    <h4 className="text-sm font-semibold text-rose-pine-text mb-2">Recent Activity</h4>
                    <div className="space-y-2">
                      {categoryTransactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between text-xs">
                          <div className="truncate flex-1">
                            <div className="text-rose-pine-text truncate">{transaction.description}</div>
                            <div className="text-rose-pine-muted">{formatDate(transaction.transaction_date)}</div>
                          </div>
                          <div className={`font-semibold ${
                            transaction.type === 'expense' ? 'text-rose-pine-love' : 'text-rose-pine-pine'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Debt Monster Modal */}
        {showDebtMonster && debtMonster && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="game-card p-8 w-full max-w-2xl">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{debtMonster.icon}</div>
                <h2 className="text-3xl font-bold text-rose-pine-love mb-2">
                  {debtMonster.name} Appears!
                </h2>
                <p className="text-rose-pine-muted mb-4">
                  {debtMonster.description}
                </p>
                
                {/* Monster Health Bar */}
                <div className="w-full bg-rose-pine-overlay rounded-full h-4 mb-4">
                  <div 
                    className="h-4 rounded-full bg-gradient-to-r from-rose-pine-love to-rose-pine-gold transition-all duration-500"
                    style={{ width: `${debtMonster.health}%` }}
                  ></div>
                </div>
                <div className="text-sm text-rose-pine-muted">
                  Monster Health: {debtMonster.health}/{debtMonster.maxHealth}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-rose-pine-text text-center">
                  ⚔️ Defeat the Monster by Adjusting Your Budget! ⚔️
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <div key={category.id} className="p-3 bg-rose-pine-overlay rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span>{category.icon}</span>
                          <span className="font-semibold text-rose-pine-text">{category.name}</span>
                        </div>
                        <span className="text-sm text-rose-pine-muted">
                          Current: {formatCurrency(category.allocated_amount)}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={category.allocated_amount}
                        onChange={(e) => setAdjustmentForm({
                          ...adjustmentForm,
                          adjustments: {
                            ...adjustmentForm.adjustments,
                            [category.id]: parseFloat(e.target.value) || 0
                          }
                        })}
                        className="pixel-input w-full text-sm"
                        placeholder="New amount"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleAdjustCategories}
                    className="pixel-button flex-1 flex items-center justify-center space-x-2"
                  >
                    <Sword className="w-4 h-4" />
                    <span>Defeat Monster!</span>
                  </button>
                  <button
                    onClick={() => setShowDebtMonster(false)}
                    className="pixel-button-secondary flex-1"
                  >
                    Retreat for Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="game-card p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-rose-pine-text mb-4">Add Budget Category</h2>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="e.g., Groceries"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="e.g., Food and household items"
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Allocated Amount (per pay period)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={categoryForm.allocated_amount}
                    onChange={(e) => setCategoryForm({ ...categoryForm, allocated_amount: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="200.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto">
                    {categoryIcons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, icon })}
                        className={`p-2 text-lg rounded border-2 ${
                          categoryForm.icon === icon 
                            ? 'border-rose-pine-pine bg-rose-pine-pine/20' 
                            : 'border-rose-pine-overlay hover:border-rose-pine-subtle'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setCategoryForm({ ...categoryForm, color })}
                        className={`w-8 h-8 rounded border-2 ${
                          categoryForm.color === color 
                            ? 'border-rose-pine-text' 
                            : 'border-rose-pine-overlay hover:border-rose-pine-subtle'
                        }`}
                        style={{ backgroundColor: color }}
                      ></button>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="pixel-button flex-1"
                  >
                    Add Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(false)}
                    className="pixel-button-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Transaction Modal */}
        {showAddTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="game-card p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-rose-pine-text mb-4">
                Add {transactionForm.type === 'expense' ? 'Expense' : 'Refund'}
              </h2>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={transactionForm.category_id}
                    onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value })}
                    className="pixel-select w-full"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name} ({formatCurrency(category.current_balance)} remaining)
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                    className="pixel-input w-full"
                    placeholder={transactionForm.type === 'expense' ? 'e.g., Grocery shopping' : 'e.g., Returned item'}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    className="pixel-input w-full"
                    placeholder="25.50"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={transactionForm.transaction_date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, transaction_date: e.target.value })}
                    className="pixel-input w-full"
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="pixel-button flex-1"
                  >
                    Add {transactionForm.type === 'expense' ? 'Expense' : 'Refund'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddTransaction(false)}
                    className="pixel-button-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BudgetCategoriesPage