import { apiClient } from './client'
import { mockMedicines } from './mockData'

export const inventoryApi = {
  uploadFile: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    // DEBUG: Log the API URL being used
    console.log('DEBUG: Starting upload...')
    console.log('DEBUG: Base URL:', apiClient.defaults.baseURL)
    console.log('DEBUG: Uploading file:', file.name, file.size)

    try {
      const response = await apiClient.post('/api/inventory/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minutes for large files
      })
      console.log('DEBUG: Upload success:', response.data)
      return response.data
    } catch (error) {
      console.error('DEBUG: Upload FAILED', error)

      let errorMessage = 'Upload failed'

      if (error.response) {
        console.error('DEBUG: Server Error Response:', error.response.data)
        errorMessage = error.response.data?.detail || error.response.data?.message || JSON.stringify(error.response.data)
      } else if (error.request) {
        console.error('DEBUG: No response received', error.request)
        errorMessage = 'Server not reachable (Network Error). Check if backend is running.'
      } else {
        errorMessage = error.message
      }

      const enhancedError = new Error(errorMessage)
      enhancedError.originalError = error
      throw enhancedError
    }
  },

  uploadExcel: async (file) => {
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
