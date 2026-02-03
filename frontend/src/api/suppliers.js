import { apiClient } from './client'

export const suppliersApi = {
    getSuppliers: async (activeOnly = true) => {
        const response = await apiClient.get('/suppliers/', {
            params: { active_only: activeOnly },
        })
        return response.data
    },

    getSupplier: async (id) => {
        const response = await apiClient.get(`/suppliers/${id}`)
        return response.data
    },

    createSupplier: async (data) => {
        const response = await apiClient.post('/suppliers/', data)
        return response.data
    },

    updateSupplier: async (id, data) => {
        const response = await apiClient.put(`/suppliers/${id}`, data)
        return response.data
    },

    deleteSupplier: async (id) => {
        const response = await apiClient.delete(`/suppliers/${id}`)
        return response.data
    },

    createPurchaseOrder: async (data) => {
        const response = await apiClient.post('/suppliers/purchase-orders', data)
        return response.data
    },

    getPurchaseOrders: async (supplierId = null, status = null) => {
        const params = {}
        if (supplierId) params.supplier_id = supplierId
        if (status) params.status = status

        const response = await apiClient.get('/suppliers/purchase-orders', { params })
        return response.data
    },

    getAIAnalysis: async () => {
        try {
            const response = await apiClient.get('/suppliers/ai-analysis')
            return response.data
        } catch (error) {
            return { analysis: "AI Analysis unavailable." }
        }
    }
}
