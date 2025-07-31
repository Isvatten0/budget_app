import React, { useState } from 'react'
import { DollarSign, Edit3, Save, X } from 'lucide-react'
import { formatCurrency } from '../../lib/budget-utils'

interface BankBalanceCardProps {
  currentBalance: number
  onUpdateBalance: (newBalance: number) => Promise<void>
}

const BankBalanceCard: React.FC<BankBalanceCardProps> = ({ currentBalance, onUpdateBalance }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newBalance, setNewBalance] = useState(currentBalance.toString())
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    const balance = parseFloat(newBalance)
    if (isNaN(balance)) return

    setLoading(true)
    try {
      await onUpdateBalance(balance)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update balance:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setNewBalance(currentBalance.toString())
    setIsEditing(false)
  }

  return (
    <div className="pixel-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-rose-pine-text flex items-center">
          <DollarSign className="w-6 h-6 mr-2 text-rose-pine-gold" />
          Bank Balance
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="pixel-button-secondary p-2"
            aria-label="Edit balance"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="balance" className="block text-rose-pine-text text-sm font-medium mb-2">
              Current Balance
            </label>
            <input
              id="balance"
              type="number"
              step="0.01"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="pixel-input w-full text-2xl font-bold text-center"
              placeholder="0.00"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="pixel-button flex-1 flex items-center justify-center space-x-2"
            >
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="pixel-button-secondary flex items-center justify-center space-x-2"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-4xl font-bold text-rose-pine-text mb-2">
            {formatCurrency(currentBalance)}
          </div>
          <p className="text-rose-pine-muted text-sm">
            Available to spend
          </p>
        </div>
      )}

      {/* Decorative pixel elements */}
      <div className="mt-4 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-rose-pine-gold"></div>
        <div className="w-2 h-2 bg-rose-pine-pine"></div>
        <div className="w-2 h-2 bg-rose-pine-iris"></div>
      </div>
    </div>
  )
}

export default BankBalanceCard