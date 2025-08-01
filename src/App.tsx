import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './components/auth/Login'
import SignUp from './components/auth/SignUp'
import Dashboard from './components/Dashboard'
import IncomePage from './components/IncomePage'
import BillsPage from './components/BillsPage'
import GoalsPage from './components/GoalsPage'
import Layout from './components/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-pine-base flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-pine-base flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <SignUp />
          </PublicRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/income" element={
          <PrivateRoute>
            <Layout>
              <IncomePage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/bills" element={
          <PrivateRoute>
            <Layout>
              <BillsPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/goals" element={
          <PrivateRoute>
            <Layout>
              <GoalsPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App