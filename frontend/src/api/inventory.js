import { apiClient } from './client'
import { mockMedicines } from './mockData'

export const inventoryApi = {
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/api/inventory/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  uploadExcel: async (file) => {
    // Legacy endpoint for backward compatibility
    return inventoryApi.uploadFile(file)
  },

  getMedicines: async (params) => {
    try {
      const response = await apiClient.get('/api/inventory/medicines', { params })
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for medicines', error)
      return mockMedicines
    }
  },

  getMedicine: async (id) => {
    try {
      const response = await apiClient.get(`/api/inventory/medicines/${id}`)
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for medicine details', error)
      return mockMedicines.find(m => m.id === Number(id))
    }
  },

  getBatches: async (medicineId) => {
    const response = await apiClient.get(`/api/inventory/medicines/${medicineId}/batches`)
    return response.data
  },

  getStockLevels: async (lowStockOnly) => {
    const response = await apiClient.get('/api/inventory/stock-levels', {
      params: { low_stock_only: lowStockOnly },
    })
    return response.data
  },
}
