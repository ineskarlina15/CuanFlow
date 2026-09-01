import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialize session from LocalStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (emailOrUsername, password) => {
    try {
      const response = await api.post('/authSvc/api/v1/auth/login', {
        username: emailOrUsername,
        email: emailOrUsername,
        password
      })
      // Server returns custom structure like { data: { token, userId, name, username, email, role } }
      const authData = response.data
      
      localStorage.setItem('token', authData.token)
      localStorage.setItem('user', JSON.stringify({
        id: authData.userId,
        name: authData.name,
        username: authData.username,
        email: authData.email,
        role: authData.role
      }))

      setToken(authData.token)
      setUser({
        id: authData.userId,
        name: authData.name,
        username: authData.username,
        email: authData.email,
        role: authData.role
      })
      
      return authData
    } catch (error) {
      throw error
    }
  }, [])

  const register = useCallback(async (name, username, email, password) => {
    try {
      // Body matches backend's RegisterReq: name, username, email, password, and default role (USER)
      await api.post('/authSvc/api/v1/auth/register', { name, username, email, password })
    } catch (error) {
      throw error
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    try {
      // Body matches ForgotPasswordReq
      const response = await api.post('/authSvc/api/v1/auth/forgot-password', { email })
      return response.data; // Backend returns generated token (temporarily)
    } catch (error) {
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      // Body matches ResetPasswordReq
      await api.post('/authSvc/api/v1/auth/reset-password', { token, newPassword })
    } catch (error) {
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/authSvc/api/v1/auth/logout').catch(() => {})
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
