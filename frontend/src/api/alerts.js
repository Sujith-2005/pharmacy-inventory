import { apiClient } from './client'

export const alertsApi = {
  getAlerts: async (params) => {
    const response = await apiClient.get('/api/alerts/', { params })
    return response.data
  },

  getUnacknowledged: async () => {
    const response = await apiClient.get('/api/alerts/unacknowledged')
    return response.data
  },

  acknowledge: async (alertId) => {
    const response = await apiClient.post(`/api/alerts/${alertId}/acknowledge`)
    return response.data
  },

  getStats: async () => {
    const response = await apiClient.get('/api/alerts/stats')
    return response.data
  },
}
