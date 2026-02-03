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
      const response = await apiClient.post('/inventory/upload', formData, {
        timeout: 300000, // 5 minutes for large files
      })
      console.log('DEBUG: Upload success:', response.data)
      return response.data
    } catch (error) {
      console.error('DEBUG: Upload FAILED', error)
      if (error.response) {
        console.error("DEBUG: Response Status:", error.response.status);
        console.error("DEBUG: Response Data:", error.response.data);
      }
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
      const response = await apiClient.get('/inventory/medicines', { params })
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for medicines', error)
      return mockMedicines
    }
  },

  getInventoryGrid: async (params) => {
    const response = await apiClient.get('/inventory/grid', { params })
    return response.data
  },

  getMedicine: async (id) => {
    try {
      const response = await apiClient.get(`/inventory/medicines/${id}`)
      return response.data
    } catch (error) {
      console.warn('Network error, using mock data for medicine details', error)
      return mockMedicines.find(m => m.id === Number(id))
    }
  },

  getBatches: async (medicineId) => {
    const response = await apiClient.get(`/inventory/medicines/${medicineId}/batches`)
    return response.data
  },

  getStockLevels: async (lowStockOnly) => {
    const response = await apiClient.get('/inventory/stock-levels', {
      params: { low_stock_only: lowStockOnly },
    })
    return response.data
  },

  getCategories: async () => {
    try {
      const response = await apiClient.get('/inventory/categories')
      return response.data
    } catch (error) {
      console.warn('Network error, using default categories', error)
      return ['Antibiotic', 'Pain Relief', 'Vitamin', 'General']
    }
  },
  getAIAnalysis: async () => {
    try {
      const response = await apiClient.get('/inventory/ai-analysis')
      return response.data
    } catch (error) {
      console.warn('Network error, using mock AI data', error)
      return { analysis: "AI Service Unavailable. Check backend connection." }
    }
  },
  getAnalysisReport: async () => {
    const response = await apiClient.get('/inventory/analysis-report')
    return response.data
  },
  comparePrices: async (query) => {
    const response = await apiClient.get('/inventory/price-comparison', { params: { query } })
    return response.data
  },

  deleteMedicine: async (id) => {
    const response = await apiClient.delete(`/inventory/medicines/${id}`)
    return response.data
  }
}
