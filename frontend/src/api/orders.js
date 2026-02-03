import { apiClient } from './client'

export const ordersApi = {
    createOrder: async (data) => {
        const response = await apiClient.post('/api/orders/create', data)
        return response.data
    },

    uploadPrescription: async (formData) => {
        const response = await apiClient.post('/api/orders/upload-prescription', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    getOrders: async () => {
        const response = await apiClient.get('/api/orders/')
        return response.data
    }
}
