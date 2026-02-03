import { apiClient } from './client'
import {
  mockDashboardStats,
  mockExpiryTimeline,
  mockInventoryByCategory,
  mockSalesTrends,
  mockTopMedicines
} from './mockData'

export const dashboardApi = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/stats')
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for stats', error)
      return mockDashboardStats
    }
  },

  getExpiryTimeline: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/expiry-timeline')
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for timeline', error)
      return mockExpiryTimeline
    }
  },

  getInventoryByCategory: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/inventory-by-category')
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for categories', error)
      return mockInventoryByCategory
    }
  },

  getSalesTrends: async (days = 30) => {
    try {
      const response = await apiClient.get('/api/dashboard/sales-trends', {
        params: { days },
      })
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for sales trends', error)
      return mockSalesTrends
    }
  },

  getTopMedicines: async (limit = 10, by = 'consumption') => {
    try {
      const response = await apiClient.get('/api/dashboard/top-medicines', {
        params: { limit, by },
      })
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for top medicines', error)
      return mockTopMedicines
    }
  },

  getAIInsights: async () => {
    try {
      const response = await apiClient.get('/api/dashboard/ai-insights')
      return response.data
    } catch (error) {
      return { insight: "AI Analysis unavailable (Simulated): Inventory levels are stable, but antibiotic stock is low." }
    }
  },
}
