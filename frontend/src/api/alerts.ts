import { apiClient } from './client'

export interface Alert {
  id: number
  alert_type: string
  medicine_id?: number
  batch_id?: number
  message: string
  severity: string
  is_acknowledged: boolean
  created_at: string
}

export const alertsApi = {
  getAlerts: async (params?: {
    alert_type?: string
    acknowledged?: boolean
    severity?: string
  }) => {
    const response = await apiClient.get('/api/alerts/', { params })
    return response.data
  },

  getUnacknowledged: async () => {
    const response = await apiClient.get('/api/alerts/unacknowledged')
    return response.data
  },

  acknowledge: async (alertId: number) => {
    const response = await apiClient.post(`/api/alerts/${alertId}/acknowledge`)
    return response.data
  },

  getStats: async () => {
    const response = await apiClient.get('/api/alerts/stats')
    return response.data
  },
}


