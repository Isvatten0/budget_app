import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Moon, Sun, Eye, EyeOff } from 'lucide-react'

const Login: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rose-pine-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Theme toggle */}
        <div className="flex justify-end mb-8">
          <button
            onClick={toggleTheme}
            className="pixel-button-secondary p-2"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Pixel art logo placeholder */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-rose-pine-surface border-2 border-rose-pine-overlay shadow-pixel mb-4">
            <div className="w-16 h-16 bg-rose-pine-gold mx-auto mb-2"></div>
            <div className="text-rose-pine-text font-pixel text-lg">💰</div>
          </div>
          <h1 className="text-3xl font-bold text-rose-pine-text mb-2">Budget Planner</h1>
          <p className="text-rose-pine-muted">Sign in to your account</p>
        </div>

        {/* Login form */}
        <div className="pixel-card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-pine-love/20 border border-rose-pine-love text-rose-pine-text p-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-rose-pine-text text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pixel-input w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-rose-pine-text text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pixel-input w-full pr-10"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-rose-pine-muted hover:text-rose-pine-text"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pixel-button w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="pixel-divider"></div>

          <p className="text-center text-rose-pine-muted text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-rose-pine-pine hover:text-rose-pine-iris font-medium">
              Sign up
            </Link>
          </p>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 text-center">
          <div className="flex justify-center space-x-4">
            <div className="w-2 h-2 bg-rose-pine-pine"></div>
            <div className="w-2 h-2 bg-rose-pine-iris"></div>
            <div className="w-2 h-2 bg-rose-pine-gold"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login