import React, { useState } from 'react'
import HuntingMap from './components/HuntingMap'
import ConditionsPanel from './components/ConditionsPanel'
import { HuntingConditions, AnalysisResults } from './types/hunting'
import { analyzeHuntingConditions } from './modules/movementEngine'
import './index.css'

function App() {
  const [conditions, setConditions] = useState<HuntingConditions>({
    windDirection: 'NW',
    season: 'Early Season',
    timeOfDay: 'Evening',
    foodSources: ['Acorn Flat'],
    weatherModifier: 'Stable high pressure'
  })

  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null)
  const [showLegend, setShowLegend] = useState(true)

  const handleAnalyze = () => {
    // For now, we'll simulate map bounds - in real implementation this would come from the map
    const mockMapBounds = {
      north: 40.7589,
      south: 40.7489,
      east: -73.9741,
      west: -73.9841
    }
    
    const results = analyzeHuntingConditions(conditions, mockMapBounds)
    setAnalysisResults(results)
  }

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Conditions Panel */}
      <ConditionsPanel
        conditions={conditions}
        onConditionsChange={setConditions}
        onAnalyze={handleAnalyze}
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend(!showLegend)}
      />

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <HuntingMap
          analysisResults={analysisResults}
          showLegend={showLegend}
        />
      </div>
    </div>
  )
}

export default App