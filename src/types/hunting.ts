// Core hunting condition types
export type WindDirection = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export type Season = 'Early Season' | 'Pre-Rut' | 'Rut Chase Phase' | 'Late Season'

export type TimeOfDay = 'Morning return' | 'Midday bedded' | 'Evening field movement'

export type FoodSource = 'Ag Field' | 'Acorn Flat' | 'Clearcut Browse'

export type WeatherModifier = 'Cold front approaching' | 'Stable high pressure' | 'Post-rain movement'

export interface HuntingConditions {
  windDirection: WindDirection
  season: Season
  timeOfDay: TimeOfDay
  foodSources: FoodSource[]
  weatherModifier: WeatherModifier
}

// Map and terrain types
export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface TerrainFeature {
  id: string
  type: 'ridge' | 'saddle' | 'bench' | 'creek' | 'field_edge' | 'thick_cover'
  coordinates: [number, number][] // lat/lng polygon
  elevation?: number
  confidence: number // 0-1 confidence in detection
}

// Analysis result types
export interface BeddingZone {
  id: string
  coordinates: [number, number][]
  confidence: number
  reasoning: string
  windAdvantage: boolean
}

export interface TravelCorridor {
  id: string
  coordinates: [number, number][]
  type: 'funnel' | 'saddle' | 'bench' | 'ridge_travel'
  confidence: number
  reasoning: string
}

export interface StagingArea {
  id: string
  coordinates: [number, number][]
  confidence: number
  reasoning: string
  nearFoodSource: FoodSource
}

export interface StandRecommendation {
  id: string
  coordinates: [number, number] // single point
  confidence: number
  reasoning: string
  windSafe: boolean
  coverageArea: [number, number][] // area this stand can monitor
}

export interface AnalysisResults {
  beddingZones: BeddingZone[]
  travelCorridors: TravelCorridor[]
  stagingAreas: StagingArea[]
  standRecommendations: StandRecommendation[]
  conditions: HuntingConditions
  analysisTimestamp: Date
}

// Layer visibility controls
export interface LayerVisibility {
  topo: boolean
  wind: boolean
  bedding: boolean
  travel: boolean
  staging: boolean
  stands: boolean
}