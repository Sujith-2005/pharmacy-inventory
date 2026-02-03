import { apiClient } from './client'
import { mockAlerts } from './mockData'

export const alertsApi = {
  getAlerts: async (params) => {
    try {
      const response = await apiClient.get('/alerts/', { params })
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for alerts', error)
      return mockAlerts
    }
  },

  getUnacknowledged: async () => {
    try {
      const response = await apiClient.get('/alerts/unacknowledged')
      return response.data
    } catch (error) {
      return mockAlerts.filter(a => !a.is_acknowledged)
    }
  },

  acknowledge: async (alertId) => {
    const response = await apiClient.post(`/alerts/${alertId}/acknowledge`)
    return response.data
  },

  runSystemScan: async () => {
    const response = await apiClient.post('/alerts/run-system-scan')
    return response.data
  },

  getStats: async () => {
    try {
      const response = await apiClient.get('/alerts/stats')
      return response.data
    } catch (error) {
      return { total: 3, high: 1, critical: 1, medium: 1 }
    }
  },

  getAIAnalysis: async () => {
    try {
      const response = await apiClient.get('/alerts/ai-analysis')
      return response.data
    } catch (error) {
      return { analysis: "AI Analysis unavailable." }
    }
  },
}
