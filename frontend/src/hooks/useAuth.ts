import { useState, useEffect } from 'react'
import { authApi } from '../api/auth'

interface User {
  id: number
  email: string
  full_name: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: any) => Promise<void>
}

let authState: AuthContextType = {
  user: null,
  loading: true,
  login: async () => { },
  logout: () => { },
  register: async () => { },
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      authApi.getMe()
        .then((userData) => {
          setUser(userData)
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password)
    localStorage.setItem('token', response.access_token)
    const userData = await authApi.getMe()
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const register = async (userData: any) => {
    await authApi.register(userData)
    await login(userData.email, userData.password)
  }

  return { user, loading, login, logout, register }
}

