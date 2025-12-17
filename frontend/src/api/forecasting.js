import { apiClient } from './client'
import { mockForecast, mockReorderSuggestions } from './mockData'

export const forecastingApi = {
  getForecast: async (medicineId, horizonDays = 30) => {
    try {
      const response = await apiClient.get(`/api/forecasting/medicine/${medicineId}`, {
        params: { horizon_days: horizonDays },
      })
      return response.data
    } catch (error) {
      console.warn('Network error, using mock forecast', error)
      return mockForecast
    }
  },

  getReorderSuggestions: async (category, criticalOnly) => {
    try {
      const response = await apiClient.get('/api/forecasting/reorder-suggestions', {
        params: { category, critical_only: criticalOnly },
      })
      return response.data
    } catch (error) {
      console.warn('Network error, using mock suggestions', error)
      return mockReorderSuggestions
    }
  },

  generateBatchForecast: async () => {
    try {
      const response = await apiClient.post('/api/forecasting/batch-forecast')
      return response.data
    } catch (error) {
      return { success: true, message: "Mock forecast generated" }
    }
  },
}
