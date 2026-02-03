import axios from 'axios'

const API_BASE_URL =
  "http://localhost:8000/api"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// IMPORTANT: do NOT redirect on 401 here
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
)
