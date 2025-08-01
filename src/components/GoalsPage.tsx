import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Goal } from '../lib/supabase'
import { formatCurrency, formatDate } from '../lib/budget-utils'
import { Plus, Edit, Trash2, Target, DollarSign, Calendar, X, Save, TrendingUp } from 'lucide-react'
import LoadingSpinner from './ui/LoadingSpinner'

const GoalsPage: React.FC = () => {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user])

  const loadGoals = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (err) {
      console.error('Error loading goals:', err)
      setError('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      const goalData = {
        user_id: user.id,
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        deadline: formData.deadline || null,
        notes: formData.notes || null
      }

      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', editingGoal.id)

        if (error) throw error
      } else {
        // Add new goal
        const { error } = await supabase
          .from('goals')
          .insert(goalData)

        if (error) throw error
      }

      // Reset form and reload
      resetForm()
      await loadGoals()
    } catch (err) {
      console.error('Error saving goal:', err)
      setError('Failed to save goal')
    }
  }

  const handleDelete = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error
      await loadGoals()
    } catch (err) {
      console.error('Error deleting goal:', err)
      setError('Failed to delete goal')
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      deadline: goal.deadline || '',
      notes: goal.notes || ''
    })
    setShowAddForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '',
      deadline: '',
      notes: ''
    })
    setEditingGoal(null)
    setShowAddForm(false)
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100)
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-rose-pine-pine'
    if (progress >= 50) return 'bg-rose-pine-gold'
    return 'bg-rose-pine-love'
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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
          <h1 className="text-3xl font-bold text-rose-pine-text">Savings Goals</h1>
          <p className="text-rose-pine-muted mt-2">Track your progress towards financial goals</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="pixel-button flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Goal</span>
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
              {editingGoal ? 'Edit Goal' : 'Add New Goal'}
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
              {/* Goal Name */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="pixel-input w-full"
                  placeholder="e.g., Emergency Fund, Vacation, New Car"
                  required
                />
              </div>

              {/* Target Amount */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Target Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.target_amount}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow up to 2 decimal places
                    if (value.includes('.') && value.split('.')[1]?.length > 2) {
                      return
                    }
                    setFormData(prev => ({ ...prev, target_amount: value }))
                  }}
                  onBlur={(e) => {
                    // Format to 2 decimal places on blur
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      setFormData(prev => ({ ...prev, target_amount: value.toFixed(2) }))
                    }
                  }}
                  className="pixel-input w-full"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Current Amount */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Current Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.current_amount}
                  onChange={(e) => {
                    const value = e.target.value
                    // Only allow up to 2 decimal places
                    if (value.includes('.') && value.split('.')[1]?.length > 2) {
                      return
                    }
                    setFormData(prev => ({ ...prev, current_amount: value }))
                  }}
                  onBlur={(e) => {
                    // Format to 2 decimal places on blur
                    const value = parseFloat(e.target.value)
                    if (!isNaN(value)) {
                      setFormData(prev => ({ ...prev, current_amount: value.toFixed(2) }))
                    }
                  }}
                  className="pixel-input w-full"
                  placeholder="0.00"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-rose-pine-text text-sm font-medium mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                  className="pixel-input w-full"
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
                  placeholder="Add any notes about this goal..."
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
                <span>{editingGoal ? 'Update' : 'Add'} Goal</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="pixel-card p-8 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-rose-pine-muted opacity-50" />
            <h3 className="text-lg font-semibold text-rose-pine-text mb-2">No goals yet</h3>
            <p className="text-rose-pine-muted mb-4">Create your first savings goal to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="pixel-button"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount)
            const remaining = goal.target_amount - goal.current_amount
            const daysUntilDeadline = goal.deadline ? getDaysUntilDeadline(goal.deadline) : null

            return (
              <div key={goal.id} className="pixel-card p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-rose-pine-text">{goal.name}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-rose-pine-text">
                          {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                        </div>
                        <div className="text-sm text-rose-pine-muted">
                          {progress.toFixed(1)}% complete
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-rose-pine-surface h-3 border border-rose-pine-subtle mb-2">
                      <div 
                        className={`h-full ${getProgressColor(progress)} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>

                    {/* Goal Details */}
                    <div className="flex items-center justify-between text-sm text-rose-pine-muted">
                      <span>
                        {remaining > 0 
                          ? `${formatCurrency(remaining)} remaining`
                          : 'Goal completed! 🎉'
                        }
                      </span>
                                             {goal.deadline && daysUntilDeadline !== null && (
                         <span className={daysUntilDeadline < 30 ? 'text-rose-pine-love' : ''}>
                           {daysUntilDeadline > 0 
                             ? `${daysUntilDeadline} days left`
                             : daysUntilDeadline === 0
                             ? 'Due today!'
                             : `${Math.abs(daysUntilDeadline)} days overdue`
                           }
                         </span>
                       )}
                    </div>

                    {/* Notes */}
                    {goal.notes && (
                      <p className="text-sm text-rose-pine-muted mt-2 italic">
                        "{goal.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="pixel-button-secondary p-2"
                      aria-label="Edit goal"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="pixel-button-secondary p-2 text-rose-pine-love hover:bg-rose-pine-love hover:text-rose-pine-text"
                      aria-label="Delete goal"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="pixel-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-rose-pine-text">
                {goals.length}
              </div>
              <div className="text-sm text-rose-pine-muted">Total Goals</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-pine-text">
                {formatCurrency(goals.reduce((sum, goal) => sum + goal.current_amount, 0))}
              </div>
              <div className="text-sm text-rose-pine-muted">Total Saved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-rose-pine-text">
                {formatCurrency(goals.reduce((sum, goal) => sum + goal.target_amount, 0))}
              </div>
              <div className="text-sm text-rose-pine-muted">Total Target</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoalsPage