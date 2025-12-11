import { apiClient } from './client'

export interface DashboardStats {
  total_stock_value: number
  total_skus: number
  low_stock_count: number
  expiring_soon_count: number
  total_alerts: number
  wastage_value: number
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
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

  getSalesTrends: async (days: number = 30) => {
    const response = await apiClient.get('/api/dashboard/sales-trends', {
      params: { days },
    })
    return response.data
  },

  getTopMedicines: async (limit: number = 10, by: string = 'consumption') => {
    const response = await apiClient.get('/api/dashboard/top-medicines', {
      params: { limit, by },
    })
    return response.data
  },
}


