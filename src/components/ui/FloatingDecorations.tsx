import React, { useState, useEffect } from 'react'

interface FloatingDecoration {
  id: string
  icon: string
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

const FloatingDecorations: React.FC = () => {
  const [decorations, setDecorations] = useState<FloatingDecoration[]>([])

  const decorationIcons = ['💰', '💎', '⭐', '🏆', '🎯', '🔥', '⚡', '💫', '✨', '🌟']

  useEffect(() => {
    const addRandomDecoration = () => {
      const newDecoration: FloatingDecoration = {
        id: Math.random().toString(36).substr(2, 9),
        icon: decorationIcons[Math.floor(Math.random() * decorationIcons.length)],
        x: Math.random() * (window.innerWidth - 100),
        y: Math.random() * (window.innerHeight - 100),
        size: Math.random() * 20 + 10, // 10-30px
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2 // 2-5 seconds
      }

      setDecorations(prev => [...prev, newDecoration])

      // Remove decoration after animation
      setTimeout(() => {
        setDecorations(prev => prev.filter(d => d.id !== newDecoration.id))
      }, (newDecoration.duration + newDecoration.delay) * 1000)
    }

    // Add decoration every 3-8 seconds
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        addRandomDecoration()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {decorations.map(decoration => (
        <div
          key={decoration.id}
          className="absolute animate-random-float"
          style={{
            left: decoration.x,
            top: decoration.y,
            fontSize: decoration.size,
            animationDelay: `${decoration.delay}s`,
            animationDuration: `${decoration.duration}s`
          }}
        >
          {decoration.icon}
        </div>
      ))}
    </div>
  )
}

export default FloatingDecorations