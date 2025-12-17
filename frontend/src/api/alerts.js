import { apiClient } from './client'
import { mockAlerts } from './mockData'

export const alertsApi = {
  getAlerts: async (params) => {
    try {
      const response = await apiClient.get('/api/alerts/', { params })
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for alerts', error)
      return mockAlerts
    }
  },

  getUnacknowledged: async () => {
    try {
      const response = await apiClient.get('/api/alerts/unacknowledged')
      return response.data
    } catch (error) {
      return mockAlerts.filter(a => !a.is_acknowledged)
    }
  },

  acknowledge: async (alertId) => {
    try {
      const response = await apiClient.post(`/api/alerts/${alertId}/acknowledge`)
      return response.data
    } catch (error) {
      return { success: true, message: "Mock acknowledged" }
    }
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/api/alerts/stats')
      return response.data
    } catch (error) {
      return { total: 3, high: 1, critical: 1, medium: 1 }
    }
  },
}
