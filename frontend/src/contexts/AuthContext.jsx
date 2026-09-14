import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        const parsed = JSON.parse(storedUser)
        setUser(parsed)

        // Sync latest profile data (like avatarUrl) in background
        api.get('/authSvc/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${storedToken}` }
        }).then(res => {
          const data = res?.data || (res?.name ? res : null)
          if (data) {
            setUser(prev => {
              if (!prev) return prev
              const updated = {
                ...prev,
                name: data.name || prev.name,
                avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : prev.avatarUrl,
                role: data.role || prev.role
              }
              localStorage.setItem('user', JSON.stringify(updated))
              return updated
            })
          }
        }).catch(() => {})
      } catch (e) {
        // ignore parse error
      }
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
      const authData = response.data
      
      const userPayload = {
        id: authData.userId,
        name: authData.name,
        username: authData.username,
        email: authData.email,
        role: authData.role,
        avatarUrl: authData.avatarUrl || null
      }

      localStorage.setItem('token', authData.token)
      localStorage.setItem('user', JSON.stringify(userPayload))

      setToken(authData.token)
      setUser(userPayload)

      // If avatarUrl was not included in authData, fetch profile to retrieve it
      if (!authData.avatarUrl) {
        api.get('/authSvc/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${authData.token}` }
        }).then(res => {
          const data = res?.data || (res?.name ? res : null)
          if (data?.avatarUrl) {
            setUser(prev => {
              const updated = { ...prev, avatarUrl: data.avatarUrl }
              localStorage.setItem('user', JSON.stringify(updated))
              return updated
            })
          }
        }).catch(() => {})
      }
      
      return authData
    } catch (error) {
      throw error
    }
  }, [])

  const register = useCallback(async (name, username, email, password, phone) => {
    try {
      await api.post('/authSvc/api/v1/auth/register', { name, username, email, password, phone })
    } catch (error) {
      throw error
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    try {
      const response = await api.post('/authSvc/api/v1/auth/forgot-password', { email })
      return response.data;
    } catch (error) {
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
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
