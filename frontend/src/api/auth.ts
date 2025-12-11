import { apiClient } from './client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: number
  email: string
  full_name: string
  role: string
  phone?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const formData = new URLSearchParams()
    formData.append('email', email)
    formData.append('password', password)
    
    const response = await apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },
}


