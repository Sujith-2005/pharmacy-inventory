import { apiClient } from './client'

export const forecastingApi = {
  getForecast: async (medicineId, horizonDays = 30) => {
    const response = await apiClient.get(`/api/forecasting/medicine/${medicineId}`, {
      params: { horizon_days: horizonDays },
    })
    return response.data
  },

  getReorderSuggestions: async (category, criticalOnly) => {
    const response = await apiClient.get('/api/forecasting/reorder-suggestions', {
      params: { category, critical_only: criticalOnly },
    })
    return response.data
  },

  generateBatchForecast: async () => {
    const response = await apiClient.post('/api/forecasting/batch-forecast')
    return response.data
  },
}
