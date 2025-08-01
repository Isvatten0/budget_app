import React from 'react'
import { TrendingUp, Shield, DollarSign } from 'lucide-react'
import { formatCurrency } from '../../lib/budget-utils'
import { BudgetForecast } from '../../lib/budget-utils'

interface BudgetOverviewCardProps {
  forecast: BudgetForecast | null
}

const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({ forecast }) => {
  if (!forecast) {
    return (
      <div className="pixel-card p-6">
        <h2 className="text-xl font-bold text-rose-pine-text mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-rose-pine-pine" />
          Budget Overview
        </h2>
        <div className="text-center text-rose-pine-muted">
          <p>Loading budget data...</p>
        </div>
      </div>
    )
  }

  const { discretionary, reservedForBills, currentBalance } = forecast

  return (
    <div className="pixel-card p-6">
      <h2 className="text-xl font-bold text-rose-pine-text mb-4 flex items-center">
        <TrendingUp className="w-6 h-6 mr-2 text-rose-pine-pine" />
        Budget Overview
      </h2>

      <div className="space-y-4">
        {/* Discretionary Spending */}
        <div className="bg-rose-pine-overlay p-4 border-2 border-rose-pine-subtle">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-rose-pine-text flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-rose-pine-gold" />
              Discretionary
            </h3>
            <span className="text-sm text-rose-pine-muted">Available to spend</span>
          </div>
          <div className="text-2xl font-bold text-rose-pine-text">
            {formatCurrency(discretionary)}
          </div>
          {discretionary < 0 && (
            <p className="text-sm text-rose-pine-love mt-1">
              ⚠️ You may need to adjust your budget
            </p>
          )}
        </div>

        {/* Reserved for Bills */}
        <div className="bg-rose-pine-overlay p-4 border-2 border-rose-pine-subtle">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-rose-pine-text flex items-center">
              <Shield className="w-4 h-4 mr-2 text-rose-pine-iris" />
              Reserved for Bills
            </h3>
            <span className="text-sm text-rose-pine-muted">Future payments</span>
          </div>
          <div className="text-2xl font-bold text-rose-pine-text">
            {formatCurrency(reservedForBills)}
          </div>
        </div>

        {/* Progress bar for visual representation */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-rose-pine-muted mb-2">
            <span>Budget Allocation</span>
            <span>{formatCurrency(currentBalance)}</span>
          </div>
          <div className="w-full bg-rose-pine-overlay h-4 border-2 border-rose-pine-subtle">
            <div 
              className="h-full bg-rose-pine-pine transition-all duration-300"
              style={{ 
                width: `${Math.min(100, (discretionary / currentBalance) * 100)}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-rose-pine-muted mt-1">
            <span>Discretionary</span>
            <span>Reserved</span>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 p-3 bg-rose-pine-surface border border-rose-pine-overlay">
          <p className="text-sm text-rose-pine-text">
            {discretionary > 0 ? (
              <>
                You have <span className="font-semibold text-rose-pine-pine">
                  {formatCurrency(discretionary)}
                </span> available for spending and saving.
              </>
            ) : (
              <>
                You need <span className="font-semibold text-rose-pine-love">
                  {formatCurrency(Math.abs(discretionary))}
                </span> more to cover your planned expenses.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="mt-4 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-rose-pine-pine"></div>
        <div className="w-2 h-2 bg-rose-pine-iris"></div>
        <div className="w-2 h-2 bg-rose-pine-gold"></div>
      </div>
    </div>
  )
}

export default BudgetOverviewCard