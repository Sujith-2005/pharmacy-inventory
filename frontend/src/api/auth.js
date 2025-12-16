import { apiClient } from './client'

export const authApi = {
  login: async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)   // required by OAuth2PasswordRequestForm
    formData.append('password', password)

    const response = await apiClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}
