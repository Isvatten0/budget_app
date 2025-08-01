import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const saved = localStorage.getItem('theme') as Theme
    if (saved) return saved
    
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'dark'
  })

  // Function to load theme from database
  const loadThemeFromDatabase = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('user_id', user.id)
          .single()
        
        if (settings?.theme && settings.theme !== theme) {
          setThemeState(settings.theme)
        }
      }
    } catch (error) {
      console.error('Error loading theme from database:', error)
    }
  }

  // Load theme from database on mount
  useEffect(() => {
    loadThemeFromDatabase()
  }, [])

  useEffect(() => {
    // Update document class and localStorage
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const value = {
    theme,
    toggleTheme,
    setTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}