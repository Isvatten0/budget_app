import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Settings, PiggyBank, TrendingUp, Calendar, Target, X, DollarSign } from 'lucide-react'
import FloatingDecorations from './ui/FloatingDecorations'
import SettingsModal from './SettingsModal'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { signOut, user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
  }

  const handleTabClick = (tab: string) => {
    navigate(`/${tab}`)
  }

  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/dashboard' || path === '/') return 'dashboard'
    if (path === '/income') return 'income'
    if (path === '/bills') return 'bills'
    if (path === '/goals') return 'goals'
    return 'dashboard'
  }

  return (
    <div className="min-h-screen bg-rose-pine-base">
      {/* Header */}
      <header className="bg-rose-pine-surface border-b-2 border-rose-pine-overlay shadow-pixel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-rose-pine-gold border-2 border-rose-pine-overlay shadow-pixel flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-rose-pine-base" />
              </div>
              <h1 className="text-xl font-bold text-rose-pine-text font-arcade">BUDGET ADVENTURE</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <button 
                onClick={() => handleTabClick('dashboard')}
                className={`pixel-button-secondary px-3 py-2 text-sm transition-all ${
                  getActiveTab() === 'dashboard' ? 'bg-rose-pine-pine text-rose-pine-text' : ''
                }`}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Dashboard
              </button>
              <button 
                onClick={() => handleTabClick('income')}
                className={`pixel-button-secondary px-3 py-2 text-sm transition-all ${
                  getActiveTab() === 'income' ? 'bg-rose-pine-pine text-rose-pine-text' : ''
                }`}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Income
              </button>
              <button 
                onClick={() => handleTabClick('bills')}
                className={`pixel-button-secondary px-3 py-2 text-sm transition-all ${
                  getActiveTab() === 'bills' ? 'bg-rose-pine-pine text-rose-pine-text' : ''
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Bills
              </button>
              <button 
                onClick={() => handleTabClick('goals')}
                className={`pixel-button-secondary px-3 py-2 text-sm transition-all ${
                  getActiveTab() === 'goals' ? 'bg-rose-pine-pine text-rose-pine-text' : ''
                }`}
              >
                <Target className="w-4 h-4 mr-2" />
                Goals
              </button>
            </nav>

            {/* Right side controls */}
            <div className="flex items-center space-x-2">
              {/* Settings */}
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="pixel-button-secondary p-2" 
                aria-label="Settings"
              >
                <Settings size={20} />
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="pixel-button-secondary px-3 py-2 text-sm flex items-center space-x-2"
                >
                  <div className="w-6 h-6 bg-rose-pine-iris rounded-none"></div>
                  <span>{user?.email?.split('@')[0]}</span>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 pixel-card p-2 z-50">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-rose-pine-text hover:bg-rose-pine-overlay flex items-center space-x-2"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Floating pixel art decorations */}
      <div className="fixed bottom-8 right-8 pointer-events-none">
        <div className="w-16 h-16 bg-rose-pine-gold border-2 border-rose-pine-overlay shadow-pixel piggy-bank flex items-center justify-center">
          <PiggyBank className="w-8 h-8 text-rose-pine-base" />
        </div>
      </div>
      
      {/* Random floating decorations */}
      <FloatingDecorations />

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal onClose={() => setIsSettingsOpen(false)} />
      )}

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout