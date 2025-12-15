import { apiClient } from './client'

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
    const response = await apiClient.get('/api/inventory/medicines', { params })
    return response.data
  },

  getMedicine: async (id) => {
    const response = await apiClient.get(`/api/inventory/medicines/${id}`)
    return response.data
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
