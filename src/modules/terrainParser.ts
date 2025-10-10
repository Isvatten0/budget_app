import { TerrainFeature, MapBounds } from '../types/hunting'

/**
 * Terrain Parser Module
 * 
 * This module handles detection of terrain features from map data.
 * Currently uses simplified/mock detection for demonstration.
 * 
 * Future Enhancement: Replace with real DEM analysis using:
 * - Mapbox Terrain API
 * - USGS DEM files
 * - Contour line analysis from vector tiles
 */

// Mock elevation data generator for demonstration
function generateMockElevation(lat: number, lng: number): number {
  // Simple sine wave pattern to simulate ridges and valleys
  const ridgePattern = Math.sin(lat * 100) * Math.cos(lng * 100)
  const baseElevation = 800 + ridgePattern * 200
  return Math.max(600, baseElevation)
}

/**
 * Detect ridge features - elevated terrain with drop-offs
 * Deer bed on points and military crest, not peaks
 */
export function detectRidges(bounds: MapBounds): TerrainFeature[] {
  const ridges: TerrainFeature[] = []
  
  // Generate sample ridge points within bounds
  const latStep = (bounds.north - bounds.south) / 10
  const lngStep = (bounds.east - bounds.west) / 10
  
  for (let i = 2; i < 8; i++) {
    for (let j = 2; j < 8; j++) {
      const centerLat = bounds.south + (latStep * i)
      const centerLng = bounds.west + (lngStep * j)
      const elevation = generateMockElevation(centerLat, centerLng)
      
      // Only consider elevated areas as potential ridges
      if (elevation > 900) {
        const ridgePolygon: [number, number][] = [
          [centerLat - latStep/3, centerLng - lngStep/3],
          [centerLat - latStep/3, centerLng + lngStep/3],
          [centerLat + latStep/3, centerLng + lngStep/3],
          [centerLat + latStep/3, centerLng - lngStep/3],
          [centerLat - latStep/3, centerLng - lngStep/3]
        ]
        
        ridges.push({
          id: `ridge_${i}_${j}`,
          type: 'ridge',
          coordinates: ridgePolygon,
          elevation,
          confidence: 0.7 + Math.random() * 0.2 // 0.7-0.9 confidence
        })
      }
    }
  }
  
  return ridges
}

/**
 * Detect saddles - low points between two elevated areas
 * Natural travel corridors and funnels
 */
export function detectSaddles(bounds: MapBounds): TerrainFeature[] {
  const saddles: TerrainFeature[] = []
  
  const latStep = (bounds.north - bounds.south) / 8
  const lngStep = (bounds.east - bounds.west) / 8
  
  for (let i = 1; i < 7; i++) {
    for (let j = 1; j < 7; j++) {
      const centerLat = bounds.south + (latStep * i)
      const centerLng = bounds.west + (lngStep * j)
      const elevation = generateMockElevation(centerLat, centerLng)
      
      // Check if this is lower than surrounding areas (saddle characteristic)
      const northElev = generateMockElevation(centerLat + latStep, centerLng)
      const southElev = generateMockElevation(centerLat - latStep, centerLng)
      const eastElev = generateMockElevation(centerLat, centerLng + lngStep)
      const westElev = generateMockElevation(centerLat, centerLng - lngStep)
      
      const avgSurrounding = (northElev + southElev + eastElev + westElev) / 4
      
      if (elevation < avgSurrounding - 50) { // 50ft lower than average
        const saddlePolygon: [number, number][] = [
          [centerLat - latStep/4, centerLng - lngStep/2],
          [centerLat - latStep/4, centerLng + lngStep/2],
          [centerLat + latStep/4, centerLng + lngStep/2],
          [centerLat + latStep/4, centerLng - lngStep/2],
          [centerLat - latStep/4, centerLng - lngStep/2]
        ]
        
        saddles.push({
          id: `saddle_${i}_${j}`,
          type: 'saddle',
          coordinates: saddlePolygon,
          elevation,
          confidence: 0.8 + Math.random() * 0.15 // 0.8-0.95 confidence
        })
      }
    }
  }
  
  return saddles
}

/**
 * Detect benches - horizontal shelves on slopes
 * Key travel highways and staging areas
 */
export function detectBenches(bounds: MapBounds): TerrainFeature[] {
  const benches: TerrainFeature[] = []
  
  const latStep = (bounds.north - bounds.south) / 12
  const lngStep = (bounds.east - bounds.west) / 12
  
  for (let i = 2; i < 10; i++) {
    for (let j = 2; j < 10; j++) {
      const centerLat = bounds.south + (latStep * i)
      const centerLng = bounds.west + (lngStep * j)
      const elevation = generateMockElevation(centerLat, centerLng)
      
      // Check for relatively flat area on a slope
      const upElev = generateMockElevation(centerLat + latStep, centerLng)
      const downElev = generateMockElevation(centerLat - latStep, centerLng)
      
      // Bench: current elevation similar to adjacent, but slope above and below
      const elevDiff = Math.abs(upElev - downElev)
      const localFlatness = Math.abs(elevation - (upElev + downElev) / 2)
      
      if (elevDiff > 80 && localFlatness < 20) { // Slope exists but local area is flat
        const benchPolygon: [number, number][] = [
          [centerLat - latStep/6, centerLng - lngStep/2],
          [centerLat - latStep/6, centerLng + lngStep/2],
          [centerLat + latStep/6, centerLng + lngStep/2],
          [centerLat + latStep/6, centerLng - lngStep/2],
          [centerLat - latStep/6, centerLng - lngStep/2]
        ]
        
        benches.push({
          id: `bench_${i}_${j}`,
          type: 'bench',
          coordinates: benchPolygon,
          elevation,
          confidence: 0.6 + Math.random() * 0.25 // 0.6-0.85 confidence
        })
      }
    }
  }
  
  return benches
}

/**
 * Detect field edges and cover transitions
 * Critical for staging and travel corridor identification
 */
export function detectFieldEdges(bounds: MapBounds): TerrainFeature[] {
  const fieldEdges: TerrainFeature[] = []
  
  // Simulate 2-3 field edges in the area
  const numFields = 2 + Math.floor(Math.random() * 2)
  
  for (let i = 0; i < numFields; i++) {
    const fieldCenterLat = bounds.south + (bounds.north - bounds.south) * (0.3 + i * 0.3)
    const fieldCenterLng = bounds.west + (bounds.east - bounds.west) * (0.2 + i * 0.4)
    
    // Create field edge as a line/narrow polygon
    const edgeLength = (bounds.north - bounds.south) * 0.15
    const edgePolygon: [number, number][] = [
      [fieldCenterLat - edgeLength/2, fieldCenterLng - 0.0001],
      [fieldCenterLat - edgeLength/2, fieldCenterLng + 0.0001],
      [fieldCenterLat + edgeLength/2, fieldCenterLng + 0.0001],
      [fieldCenterLat + edgeLength/2, fieldCenterLng - 0.0001],
      [fieldCenterLat - edgeLength/2, fieldCenterLng - 0.0001]
    ]
    
    fieldEdges.push({
      id: `field_edge_${i}`,
      type: 'field_edge',
      coordinates: edgePolygon,
      elevation: generateMockElevation(fieldCenterLat, fieldCenterLng),
      confidence: 0.9 // High confidence for obvious field edges
    })
  }
  
  return fieldEdges
}

/**
 * Main terrain analysis function
 * Combines all terrain feature detection
 */
export function analyzeTerrainFeatures(bounds: MapBounds): TerrainFeature[] {
  const ridges = detectRidges(bounds)
  const saddles = detectSaddles(bounds)
  const benches = detectBenches(bounds)
  const fieldEdges = detectFieldEdges(bounds)
  
  return [...ridges, ...saddles, ...benches, ...fieldEdges]
}

/**
 * Utility function to find terrain features near a point
 */
export function findNearbyFeatures(
  lat: number, 
  lng: number, 
  features: TerrainFeature[], 
  radiusKm: number = 0.5
): TerrainFeature[] {
  return features.filter(feature => {
    // Simple distance check to centroid of feature
    const centroidLat = feature.coordinates.reduce((sum, coord) => sum + coord[0], 0) / feature.coordinates.length
    const centroidLng = feature.coordinates.reduce((sum, coord) => sum + coord[1], 0) / feature.coordinates.length
    
    const distance = Math.sqrt(
      Math.pow(lat - centroidLat, 2) + Math.pow(lng - centroidLng, 2)
    ) * 111 // Rough km conversion
    
    return distance <= radiusKm
  })
}