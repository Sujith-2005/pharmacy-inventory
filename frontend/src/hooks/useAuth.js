import { useState, useEffect } from 'react'
import { authApi } from '../api/auth'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.getMe()
        .then((userData) => {
          setUser(userData)
        })
        .catch((error) => {
          console.error('Failed to get user:', error)
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password)
      localStorage.setItem('token', response.access_token)
      const userData = await authApi.getMe()
      setUser(userData)
    } catch (error) {
      // Remove token if login fails
      localStorage.removeItem('token')
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    // Force redirect to login page
    window.location.href = '/login'
  }

  return { user, loading, login, logout }
}
