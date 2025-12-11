import { apiClient } from './client'

export interface Forecast {
  medicine_id: number
  medicine_name: string
  sku: string
  forecasted_demand: number
  reorder_point: number
  recommended_quantity: number
  confidence_score: number
  reasoning: string
}

export const forecastingApi = {
  getForecast: async (medicineId: number, horizonDays: number = 30) => {
    const response = await apiClient.get(`/api/forecasting/medicine/${medicineId}`, {
      params: { horizon_days: horizonDays },
    })
    return response.data
  },

  getReorderSuggestions: async (category?: string, criticalOnly?: boolean) => {
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


