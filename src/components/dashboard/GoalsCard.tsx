import React from 'react'
import { Target, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../../lib/budget-utils'
import { GoalProgress } from '../../lib/budget-utils'

interface GoalsCardProps {
  goalsProgress: GoalProgress[]
}

const GoalsCard: React.FC<GoalsCardProps> = ({ goalsProgress }) => {
  const onTrackGoals = goalsProgress.filter(goal => goal.onTrack)
  const offTrackGoals = goalsProgress.filter(goal => !goal.onTrack)

  return (
    <div className="pixel-card p-6">
      <h2 className="text-xl font-bold text-rose-pine-text mb-4 flex items-center">
        <Target className="w-6 h-6 mr-2 text-rose-pine-iris" />
        Savings Goals
      </h2>

      {goalsProgress.length === 0 ? (
        <div className="text-center text-rose-pine-muted py-8">
          <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No savings goals</p>
          <p className="text-sm">Create goals to track your progress</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* On Track Goals */}
          {onTrackGoals.length > 0 && (
            <div>
              <h3 className="font-semibold text-rose-pine-text mb-2 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-rose-pine-pine" />
                On Track ({onTrackGoals.length})
              </h3>
              <div className="space-y-3">
                {onTrackGoals.map((goalProgress, index) => (
                  <div
                    key={index}
                    className="p-3 bg-rose-pine-overlay border border-rose-pine-subtle"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-rose-pine-text">{goalProgress.goal.name}</h4>
                      <span className="text-sm font-semibold text-rose-pine-pine">
                        {goalProgress.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-rose-pine-muted mb-2">
                      <span>
                        {formatCurrency(goalProgress.goal.current_amount)} / {formatCurrency(goalProgress.goal.target_amount)}
                      </span>
                      <span>
                        {goalProgress.goal.deadline && `Due: ${new Date(goalProgress.goal.deadline).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="w-full bg-rose-pine-surface h-2 border border-rose-pine-subtle">
                      <div 
                        className="h-full bg-rose-pine-pine transition-all duration-300"
                        style={{ width: `${Math.min(100, goalProgress.progress)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-rose-pine-muted mt-1">
                      Suggested monthly: {formatCurrency(goalProgress.monthlyContribution)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Off Track Goals */}
          {offTrackGoals.length > 0 && (
            <div>
              <h3 className="font-semibold text-rose-pine-text mb-2 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-rose-pine-love" />
                Needs Attention ({offTrackGoals.length})
              </h3>
              <div className="space-y-3">
                {offTrackGoals.map((goalProgress, index) => (
                  <div
                    key={index}
                    className="p-3 bg-rose-pine-overlay border border-rose-pine-subtle"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-rose-pine-text">{goalProgress.goal.name}</h4>
                      <span className="text-sm font-semibold text-rose-pine-love">
                        {goalProgress.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-rose-pine-muted mb-2">
                      <span>
                        {formatCurrency(goalProgress.goal.current_amount)} / {formatCurrency(goalProgress.goal.target_amount)}
                      </span>
                      <span>
                        {goalProgress.goal.deadline && `Due: ${new Date(goalProgress.goal.deadline).toLocaleDateString()}`}
                      </span>
                    </div>
                    <div className="w-full bg-rose-pine-surface h-2 border border-rose-pine-subtle">
                      <div 
                        className="h-full bg-rose-pine-love transition-all duration-300"
                        style={{ width: `${Math.min(100, goalProgress.progress)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-rose-pine-love mt-1">
                      Need to save more to stay on track
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 p-3 bg-rose-pine-surface border border-rose-pine-overlay">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-rose-pine-muted">Total saved:</span>
              <span className="font-semibold text-rose-pine-text">
                {formatCurrency(goalsProgress.reduce((sum, goal) => sum + goal.goal.current_amount, 0))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-rose-pine-muted">Total target:</span>
              <span className="font-semibold text-rose-pine-text">
                {formatCurrency(goalsProgress.reduce((sum, goal) => sum + goal.goal.target_amount, 0))}
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-rose-pine-overlay">
              <p className="text-xs text-rose-pine-muted">
                {onTrackGoals.length} of {goalsProgress.length} goals on track
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="mt-4 flex justify-center space-x-2">
        <div className="w-2 h-2 bg-rose-pine-iris"></div>
        <div className="w-2 h-2 bg-rose-pine-pine"></div>
        <div className="w-2 h-2 bg-rose-pine-love"></div>
      </div>
    </div>
  )
}

export default GoalsCard