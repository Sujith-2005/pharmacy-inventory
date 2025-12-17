import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pharmacy-inventory-backend.onrender.com'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,   // MUST be backend root only
})

// Attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
