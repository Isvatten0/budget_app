import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { RecurringIncome } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/budget-utils'
import { Plus, Edit, Trash2, DollarSign, Calendar, X, Save, TrendingUp, Briefcase, Gift } from 'lucide-react'
import LoadingSpinner from './ui/LoadingSpinner'

interface IncomeEntry {
  id: string
  user_id: string
  source: string
  amount: number
  type: 'paycheck' | 'side_job' | 'gift' | 'other'
  date: string
  notes?: string
  created_at: string
}

const IncomePage: React.FC = () => {
  const { user } = useAuth()
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([])
  const [recurringIncome, setRecurringIncome] = useState<RecurringIncome[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<IncomeEntry | null>(null)
  
  const [formData, setFormData] = useState({
    source: '',
    amount: '',
    type: 'paycheck' as 'paycheck' | 'side_job' | 'gift' | 'other',
    date: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      loadIncome()
    }
  }, [user])

  const loadIncome = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      
      // Load one-time income entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('income_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (entriesError) throw entriesError

      // Load recurring income
      const { data: recurringData, error: recurringError } = await supabase
        .from('recurring_income')
        .select('*')
        .eq('user_id', user.id)
        .order('next_date', { ascending: true })

      if (recurringError) throw recurringError

      setIncomeEntries(entriesData || [])
      setRecurringIncome(recurringData || [])
    } catch (err) {
      console.error('Error loading income:', err)
      setError('Failed to load income data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      const incomeData = {
        user_id: user.id,
        source: formData.source,
        amount: parseFloat(formData.amount),
        type: formData.type,
        date: formData.date,
        notes: formData.notes || null
      }

      if (editingEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('income_entries')
          .update(incomeData)
          .eq('id', editingEntry.id)

        if (error) throw error
      } else {
        // Add new entry
        const { error } = await supabase
          .from('income_entries')
          .insert(incomeData)

        if (error) throw error
      }

      // Reset form and reload
      resetForm()
      await loadIncome()
    } catch (err) {
      console.error('Error saving income:', err)
      setError('Failed to save income entry')
    }
  }

  const handleDelete = async (entryId: string) => {
    if (!window.confirm('Are you sure you want to delete this income entry?')) return

    try {
      const { error } = await supabase
        .from('income_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      await loadIncome()
    } catch (err) {
      console.error('Error deleting income:', err)
      setError('Failed to delete income entry')
    }
  }

  const handleEdit = (entry: IncomeEntry) => {
    setEditingEntry(entry)
    setFormData({
      source: entry.source,
      amount: entry.amount.toString(),
      type: entry.type,
      date: entry.date,
      notes: entry.notes || ''
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      source: '',
      amount: '',
      type: 'paycheck',
      date: '',
      notes: ''
    })
    setEditingEntry(null)
    setShowAddForm(false)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'paycheck': return <Briefcase size={16} />
      case 'side_job': return <TrendingUp size={16} />
      case 'gift': return <Gift size={16} />
      default: return <DollarSign size={16} />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'paycheck': return 'Paycheck'
      case 'side_job': return 'Side Job'
      case 'gift': return 'Gift'
      case 'other': return 'Other'
      default: return type
    }
  }

  const getMonthlyIncome = () => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    return incomeEntries
      .filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear
      })
      .reduce((sum, entry) => sum + entry.amount, 0)
  }

  const getAveragePaycheck = () => {
    const paychecks = incomeEntries.filter(entry => entry.type === 'paycheck')
    if (paychecks.length === 0) return 0
    return paychecks.reduce((sum, entry) => sum + entry.amount, 0) / paychecks.length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-rose-pine-text">Income & Paychecks</h1>
          <p className="text-rose-pine-muted mt-2">Track your income sources and paychecks</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="pixel-button flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Income</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="pixel-card p-4 bg-rose-pine-love/20 border border-rose-pine-love">
          <p className="text-rose-pine-text">{error}</p>
        </div>
      )}

      {/* Income Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="pixel-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-pine-text">
              {formatCurrency(getMonthlyIncome())}
            </div>
            <div className="text-sm text-rose-pine-muted">This Month</div>
          </div>
        </div>
        <div className="pixel-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-pine-text">
              {formatCurrency(getAveragePaycheck())}
            </div>
            <div className="text-sm text-rose-pine-muted">Avg Paycheck</div>
          </div>
        </div>
        <div className="pixel-card p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-pine-text">
              {incomeEntries.length}
            </div>
            <div className="text-sm text-rose-pine-muted">Total Entries</div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="pixel-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-rose-pine-text">
              {editingEntry ? 'Edit Income' : 'Add New Income'}
            </h2>
            <button
              onClick={resetForm}
              className="pixel-button-secondary p-2"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Source */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  className="pixel-input w-full"
                  placeholder="e.g., Main Job, Freelance, Birthday Gift"
                  required
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value.includes('.') && value.split('.')[1]?.length > 2) {
                      return
                    }
                    setFormData(prev => ({ ...prev, amount: value }))
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      setFormData(prev => ({ ...prev, amount: value.toFixed(2) }))
                    }
                  }}
                  className="pixel-input w-full"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'paycheck' | 'side_job' | 'gift' | 'other' 
                  }))}
                  className="pixel-select w-full"
                >
                  <option value="paycheck">Paycheck</option>
                  <option value="side_job">Side Job</option>
                  <option value="gift">Gift</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date Received
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="pixel-input w-full"
                  required
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-rose-pine-text text-sm font-medium mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="pixel-input w-full h-20 resize-none"
                  placeholder="Add any notes about this income..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="pixel-button-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="pixel-button flex-1 flex items-center justify-center space-x-2"
              >
                <Save size={16} />
                <span>{editingEntry ? 'Update' : 'Add'} Income</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income Entries List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-rose-pine-text">Recent Income</h2>
        {incomeEntries.length === 0 ? (
          <div className="pixel-card p-8 text-center">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-rose-pine-muted opacity-50" />
            <h3 className="text-lg font-semibold text-rose-pine-text mb-2">No income entries yet</h3>
            <p className="text-rose-pine-muted mb-4">Add your first income entry to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="pixel-button"
            >
              Add Your First Income
            </button>
          </div>
        ) : (
          incomeEntries.map((entry) => (
            <div key={entry.id} className="pixel-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(entry.type)}
                      <h3 className="font-semibold text-rose-pine-text">{entry.source}</h3>
                      <span className="pixel-badge text-xs">
                        {getTypeLabel(entry.type)}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-rose-pine-text">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-rose-pine-muted">
                    <span>Received: {formatDate(new Date(entry.date))}</span>
                    {entry.notes && (
                      <span className="italic">"{entry.notes}"</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="pixel-button-secondary p-2"
                    aria-label="Edit income"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="pixel-button-secondary p-2 text-rose-pine-love hover:bg-rose-pine-love hover:text-rose-pine-text"
                    aria-label="Delete income"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default IncomePage