import { apiClient } from './client'

export const authApi = {
  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)  // OAuth2PasswordRequestForm expects 'username' field
    formData.append('password', password)
    
    const response = await apiClient.post('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  getMe: async () => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },
}
