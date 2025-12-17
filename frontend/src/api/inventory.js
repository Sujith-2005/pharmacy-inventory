import { apiClient } from './client'
import { mockMedicines } from './mockData'

export const inventoryApi = {
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await apiClient.post('/api/inventory/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Increase timeout for large files
        timeout: 60000,
      })
      return response.data
    } catch (error) {
      console.error('Upload failed:', error)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const message = error.response.data?.detail || error.response.data?.message || 'Upload failed'
        throw new Error(message)
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error('No response from server. Please check your connection.')
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error('Error preparing upload: ' + error.message)
      }
    }
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
