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
  uploadExcel: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post('/api/inventory/upload-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getMedicines: async (params?: { category?: string; search?: string }) => {
    const response = await apiClient.get('/api/inventory/medicines', { params })
    return response.data
  },

  getMedicine: async (id: number) => {
    const response = await apiClient.get(`/api/inventory/medicines/${id}`)
    return response.data
  },

  getBatches: async (medicineId: number) => {
    const response = await apiClient.get(`/api/inventory/medicines/${medicineId}/batches`)
    return response.data
  },

  getStockLevels: async (lowStockOnly?: boolean) => {
    const response = await apiClient.get('/api/inventory/stock-levels', {
      params: { low_stock_only: lowStockOnly },
    })
    return response.data
  },
}


