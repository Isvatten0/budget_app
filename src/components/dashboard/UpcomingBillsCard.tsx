import React from 'react'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'
import { formatCurrency, formatDate, formatRelativeDate } from '../../lib/budget-utils'
import { UpcomingBill } from '../../lib/budget-utils'

interface UpcomingBillsCardProps {
  upcomingBills: UpcomingBill[]
  nextPayDate: Date | undefined
}

const UpcomingBillsCard: React.FC<UpcomingBillsCardProps> = ({ upcomingBills, nextPayDate }) => {
  const currentCycleBills = upcomingBills.filter(bill => bill.isInCurrentCycle)
  const futureBills = upcomingBills.filter(bill => bill.needsReservation)

  return (
    <div className="pixel-card p-6">
      <h2 className="text-xl font-bold text-rose-pine-text mb-4 flex items-center">
        <Calendar className="w-6 h-6 mr-2 text-rose-pine-pine" />
        Upcoming Bills
      </h2>

      {upcomingBills.length === 0 ? (
        <div className="text-center text-rose-pine-muted py-8">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No upcoming bills</p>
          <p className="text-sm">Add recurring expenses to see them here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Pay Cycle Bills */}
          {currentCycleBills.length > 0 && (
            <div>
              <h3 className="font-semibold text-rose-pine-text mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-rose-pine-gold" />
                This Pay Cycle
              </h3>
              <div className="space-y-2">
                {currentCycleBills.map((bill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-rose-pine-overlay border border-rose-pine-subtle"
                  >
                    <div>
                      <p className="font-medium text-rose-pine-text">{bill.name}</p>
                      <p className="text-sm text-rose-pine-muted">
                        Due {formatRelativeDate(bill.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-pine-text">
                        {formatCurrency(bill.amount)}
                      </p>
                      <p className="text-xs text-rose-pine-muted">
                        {formatDate(bill.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Future Bills */}
          {futureBills.length > 0 && (
            <div>
              <h3 className="font-semibold text-rose-pine-text mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-rose-pine-love" />
                Future Bills (Reserved)
              </h3>
              <div className="space-y-2">
                {futureBills.map((bill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-rose-pine-overlay border border-rose-pine-subtle"
                  >
                    <div>
                      <p className="font-medium text-rose-pine-text">{bill.name}</p>
                      <p className="text-sm text-rose-pine-muted">
                        Due {formatRelativeDate(bill.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-rose-pine-text">
                        {formatCurrency(bill.amount)}
                      </p>
                      <p className="text-xs text-rose-pine-muted">
                        {formatDate(bill.dueDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 p-3 bg-rose-pine-surface border border-rose-pine-overlay">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-rose-pine-muted">Total this cycle:</span>
              <span className="font-semibold text-rose-pine-text">
                {formatCurrency(currentCycleBills.reduce((sum, bill) => sum + bill.amount, 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-rose-pine-muted">Total reserved:</span>
              <span className="font-semibold text-rose-pine-text">
                {formatCurrency(futureBills.reduce((sum, bill) => sum + bill.amount, 0))}
              </span>
            </div>
            {nextPayDate && (
              <div className="mt-2 pt-2 border-t border-rose-pine-overlay">
                <p className="text-xs text-rose-pine-muted">
                  Next pay day: {formatRelativeDate(nextPayDate)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="mt-4 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-rose-pine-pine"></div>
        <div className="w-2 h-2 bg-rose-pine-love"></div>
        <div className="w-2 h-2 bg-rose-pine-gold"></div>
      </div>
    </div>
  )
}

export default UpcomingBillsCard