import { apiClient } from './client'

export const dashboardApi = {
  getStats: async () => {
    const response = await apiClient.get('/api/dashboard/stats')
    return response.data
  },

  getExpiryTimeline: async () => {
    const response = await apiClient.get('/api/dashboard/expiry-timeline')
    return response.data
  },

  getInventoryByCategory: async () => {
    const response = await apiClient.get('/api/dashboard/inventory-by-category')
    return response.data
  },

  getSalesTrends: async (days = 30) => {
    const response = await apiClient.get('/api/dashboard/sales-trends', {
      params: { days },
    })
    return response.data
  },

  getTopMedicines: async (limit = 10, by = 'consumption') => {
    const response = await apiClient.get('/api/dashboard/top-medicines', {
      params: { limit, by },
    })
    return response.data
  },
}
