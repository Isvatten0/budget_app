import React, { useState, useEffect } from 'react'
import { X, Save, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { UserSettings } from '../lib/supabase'

interface SettingsModalProps {
  onClose: () => void
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [settings, setSettings] = useState({
    pay_frequency: 'biweekly' as 'weekly' | 'biweekly' | 'monthly' | 'custom',
    last_pay_date: '',
    default_currency: 'USD',
    theme: 'dark' as 'dark' | 'light',
    custom_days: 14
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setSettings({
          pay_frequency: data.pay_frequency,
          last_pay_date: data.last_pay_date,
          default_currency: data.default_currency,
          theme: data.theme,
          custom_days: data.custom_days || 14
        })
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user?.id) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          pay_frequency: settings.pay_frequency,
          last_pay_date: settings.last_pay_date,
          default_currency: settings.default_currency,
          theme: settings.theme,
          custom_days: settings.custom_days
        })

      if (error) throw error

      setSuccess('Settings saved successfully!')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="pixel-card p-6">
          <p className="text-rose-pine-text">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="pixel-card p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-rose-pine-text">Settings</h2>
          <button
            onClick={onClose}
            className="pixel-button-secondary p-2"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-rose-pine-love/20 border border-rose-pine-love text-rose-pine-text p-3 text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-rose-pine-pine/20 border border-rose-pine-pine text-rose-pine-text p-3 text-sm mb-4">
            {success}
          </div>
        )}

        {/* Settings Form */}
        <div className="space-y-4">
          {/* Pay Frequency */}
          <div>
            <label className="block text-rose-pine-text text-sm font-medium mb-2">
              Pay Frequency
            </label>
            <select
              value={settings.pay_frequency}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                pay_frequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' | 'custom' 
              }))}
              className="pixel-select w-full"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Custom Days */}
          {settings.pay_frequency === 'custom' && (
            <div>
              <label className="block text-rose-pine-text text-sm font-medium mb-2">
                Days Between Pay
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.custom_days}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  custom_days: parseInt(e.target.value) || 14 
                }))}
                className="pixel-input w-full"
                placeholder="14"
              />
            </div>
          )}

          {/* Last Pay Date */}
          <div>
            <label className="block text-rose-pine-text text-sm font-medium mb-2 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Last Pay Date
            </label>
            <input
              type="date"
              value={settings.last_pay_date}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                last_pay_date: e.target.value 
              }))}
              className="pixel-input w-full"
              required
            />
          </div>

          {/* Default Currency */}
          <div>
            <label className="block text-rose-pine-text text-sm font-medium mb-2">
              Default Currency
            </label>
            <select
              value={settings.default_currency}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                default_currency: e.target.value 
              }))}
              className="pixel-select w-full"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="CAD">CAD (C$)</option>
              <option value="AUD">AUD (A$)</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-rose-pine-text text-sm font-medium mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings(prev => ({ 
                ...prev, 
                theme: e.target.value as 'dark' | 'light' 
              }))}
              className="pixel-select w-full"
            >
              <option value="dark">Dark (Classic)</option>
              <option value="light">Light (Dawn)</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="pixel-button-secondary flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !settings.last_pay_date}
            className="pixel-button flex-1 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal