import { apiClient } from './client'

export interface Medicine {
  id: number
  sku: string
  name: string
  category?: string
  manufacturer?: string
  brand?: string
  mrp?: number
  cost?: number
}

export interface Batch {
  id: number
  batch_number: string
  quantity: number
  expiry_date: string
  is_expired: boolean
}

export const inventoryApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    // Removed /api prefix as it is already in baseURL
    const response = await apiClient.post('/inventory/upload', formData)
    return response.data
  },

  uploadExcel: async (file: File) => {
    // Legacy endpoint for backward compatibility
    return inventoryApi.uploadFile(file)
  },

  getMedicines: async (params?: { category?: string; search?: string }) => {
    const response = await apiClient.get('/inventory/medicines', { params })
    return response.data
  },

  getMedicine: async (id: number) => {
    const response = await apiClient.get(`/inventory/medicines/${id}`)
    return response.data
  },

  getBatches: async (medicineId: number) => {
    const response = await apiClient.get(`/inventory/medicines/${medicineId}/batches`)
    return response.data
  },

  getStockLevels: async (lowStockOnly?: boolean) => {
    const response = await apiClient.get('/inventory/stock-levels', {
      params: { low_stock_only: lowStockOnly },
    })
    return response.data
  },
}


