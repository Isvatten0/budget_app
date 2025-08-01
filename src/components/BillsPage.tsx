import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { RecurringExpense } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/budget-utils'
import { Plus, Edit, Trash2, Calendar, DollarSign, X, Save } from 'lucide-react'
import LoadingSpinner from './ui/LoadingSpinner'

const BillsPage: React.FC = () => {
  const { user } = useAuth()
  const [bills, setBills] = useState<RecurringExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBill, setEditingBill] = useState<RecurringExpense | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'monthly' as 'weekly' | 'biweekly' | 'monthly' | 'custom',
    due_date: '',
    custom_days: '30',
    is_paid: false
  })

  useEffect(() => {
    if (user) {
      loadBills()
    }
  }, [user])

  const loadBills = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true })

      if (error) throw error
      setBills(data || [])
    } catch (err) {
      console.error('Error loading bills:', err)
      setError('Failed to load bills')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      const billData = {
        user_id: user.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        due_date: formData.due_date,
        custom_days: formData.frequency === 'custom' ? parseInt(formData.custom_days) : null,
        is_paid: formData.is_paid
      }

      if (editingBill) {
        // Update existing bill
        const { error } = await supabase
          .from('recurring_expenses')
          .update(billData)
          .eq('id', editingBill.id)

        if (error) throw error
      } else {
        // Add new bill
        const { error } = await supabase
          .from('recurring_expenses')
          .insert(billData)

        if (error) throw error
      }

      // Reset form and reload
      resetForm()
      await loadBills()
    } catch (err) {
      console.error('Error saving bill:', err)
      setError('Failed to save bill')
    }
  }

  const handleDelete = async (billId: string) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return

    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .delete()
        .eq('id', billId)

      if (error) throw error
      await loadBills()
    } catch (err) {
      console.error('Error deleting bill:', err)
      setError('Failed to delete bill')
    }
  }

  const handleTogglePaid = async (billId: string, currentPaidStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_expenses')
        .update({
          is_paid: !currentPaidStatus,
          last_paid_date: !currentPaidStatus ? new Date().toISOString().split('T')[0] : null
        })
        .eq('id', billId)

      if (error) throw error
      await loadBills()
    } catch (err) {
      console.error('Error updating bill payment status:', err)
      setError('Failed to update payment status')
    }
  }

  const handleEdit = (bill: RecurringExpense) => {
    setEditingBill(bill)
    setFormData({
      name: bill.name,
      amount: bill.amount.toString(),
      frequency: bill.frequency,
      due_date: bill.due_date,
      custom_days: bill.custom_days?.toString() || '30',
      is_paid: bill.is_paid || false
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      frequency: 'monthly',
      due_date: '',
      custom_days: '30',
      is_paid: false
    })
    setEditingBill(null)
    setShowAddForm(false)
  }

  const getFrequencyLabel = (frequency: string, customDays?: number) => {
    switch (frequency) {
      case 'weekly': return 'Weekly'
      case 'biweekly': return 'Bi-weekly'
      case 'monthly': return 'Monthly'
      case 'custom': return `Every ${customDays} days`
      default: return frequency
    }
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
          <h1 className="text-3xl font-bold text-rose-pine-text">Bills & Expenses</h1>
          <p className="text-rose-pine-muted mt-2">Manage your recurring bills and expenses</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="pixel-button flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Bill</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="pixel-card p-4 bg-rose-pine-love/20 border border-rose-pine-love">
          <p className="text-rose-pine-text">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="pixel-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-rose-pine-text">
              {editingBill ? 'Edit Bill' : 'Add New Bill'}
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
              {/* Bill Name */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2">
                  Bill Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pixel-input w-full"
                  placeholder="e.g., Rent, Netflix, Phone Bill"
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
                    // Only allow up to 2 decimal places
                    if (value.includes('.') && value.split('.')[1]?.length > 2) {
                      return
                    }
                    setFormData(prev => ({ ...prev, amount: value }))
                  }}
                  onBlur={(e) => {
                    // Format to 2 decimal places on blur
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

              {/* Frequency */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    frequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'custom' 
                  }))}
                  className="pixel-select w-full"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {/* Custom Days */}
              {formData.frequency === 'custom' && (
                <div>
                  <label className="block text-rose-pine-text text-sm font-medium mb-2">
                    Days Between Bills
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.custom_days}
                    onChange={(e) => setFormData(prev => ({ ...prev, custom_days: e.target.value }))}
                    className="pixel-input w-full"
                    placeholder="30"
                  />
                </div>
              )}

              {/* Due Date */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="pixel-input w-full"
                  required
                />
              </div>

              {/* Payment Status */}
              <div>
                <label className="flex items-center space-x-2 h-full">
                  <input
                    type="checkbox"
                    checked={formData.is_paid}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_paid: e.target.checked }))}
                    className="w-4 h-4 text-rose-pine-pine bg-rose-pine-surface border-rose-pine-muted rounded focus:ring-rose-pine-pine focus:ring-2"
                  />
                  <span className="text-rose-pine-text text-sm font-medium">
                    Mark as paid
                  </span>
                </label>
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
                <span>{editingBill ? 'Update' : 'Add'} Bill</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bills List */}
      <div className="space-y-4">
        {bills.length === 0 ? (
          <div className="pixel-card p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-rose-pine-muted opacity-50" />
            <h3 className="text-lg font-semibold text-rose-pine-text mb-2">No bills yet</h3>
            <p className="text-rose-pine-muted mb-4">Add your first recurring bill to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="pixel-button"
            >
              Add Your First Bill
            </button>
          </div>
        ) : (
          bills.map((bill) => (
            <div key={bill.id} className="pixel-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-rose-pine-text">{bill.name}</h3>
                    <span className="text-lg font-bold text-rose-pine-text">
                      {formatCurrency(bill.amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-rose-pine-muted">
                    <span>{getFrequencyLabel(bill.frequency, bill.custom_days)}</span>
                    <div className="flex items-center space-x-4">
                      <span>Due: {formatDate(new Date(bill.due_date))}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        bill.is_paid 
                          ? 'bg-rose-pine-pine/20 text-rose-pine-pine' 
                          : 'bg-rose-pine-love/20 text-rose-pine-love'
                      }`}>
                        {bill.is_paid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleTogglePaid(bill.id, bill.is_paid || false)}
                    className={`pixel-button-secondary p-2 ${
                      bill.is_paid 
                        ? 'text-rose-pine-love hover:bg-rose-pine-love hover:text-rose-pine-text' 
                        : 'text-rose-pine-pine hover:bg-rose-pine-pine hover:text-rose-pine-text'
                    }`}
                    aria-label={bill.is_paid ? 'Mark as unpaid' : 'Mark as paid'}
                    title={bill.is_paid ? 'Mark as unpaid' : 'Mark as paid'}
                  >
                    {bill.is_paid ? '✓' : '○'}
                  </button>
                  <button
                    onClick={() => handleEdit(bill)}
                    className="pixel-button-secondary p-2"
                    aria-label="Edit bill"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="pixel-button-secondary p-2 text-rose-pine-love hover:bg-rose-pine-love hover:text-rose-pine-text"
                    aria-label="Delete bill"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {bills.length > 0 && (
        <div className="pixel-card p-4">
          <div className="flex justify-between items-center">
            <span className="text-rose-pine-muted">Total Monthly Bills:</span>
            <span className="text-xl font-bold text-rose-pine-text">
              {formatCurrency(bills.reduce((sum, bill) => {
                const multiplier = bill.frequency === 'weekly' ? 4.33 : 
                                 bill.frequency === 'biweekly' ? 2.17 : 1
                return sum + (bill.amount * multiplier)
              }, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillsPage