import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventory'
import FileUpload from '../components/FileUpload'

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  const { data: medicines, isLoading, refetch: refetchMedicines, error: medicinesError } = useQuery({
    queryKey: ['medicines', searchTerm, selectedCategory],
    queryFn: async () => {
      console.log('DEBUG: Fetching medicines with params:', { search: searchTerm, category: selectedCategory })
      try {
        const result = await inventoryApi.getMedicines({ search: searchTerm, category: selectedCategory })
        console.log('DEBUG: Medicines fetched:', result?.length || 0, 'items')
        if (result && result.length > 0) {
          console.log('DEBUG: Sample medicine:', result[0])
        }
        return result || []
      } catch (error) {
        console.error('ERROR: Failed to fetch medicines:', error)
        return []
      }
    },
    staleTime: 1000, // Consider stale after 1 second
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (React Query v5 uses gcTime instead of cacheTime)
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Always refetch on mount
  })

  const { data: stockLevels, refetch: refetchStockLevels } = useQuery({
    queryKey: ['stock-levels'],
    queryFn: async () => {
      console.log('DEBUG: Fetching stock levels')
      const result = await inventoryApi.getStockLevels()
      console.log('DEBUG: Stock levels fetched:', result?.length || 0, 'items')
      return result
    },
    staleTime: 1000, // Consider stale after 1 second
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  })

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your pharmacy inventory, track stock levels, and monitor expiries
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload Inventory File
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by medicine name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
          >
            <option value="">All Categories</option>
            <option value="antibiotic">Antibiotic</option>
            <option value="analgesic">Analgesic</option>
            <option value="antidiabetic">Antidiabetic</option>
            <option value="vitamin">Vitamin</option>
            <option value="cardiovascular">Cardiovascular</option>
            <option value="respiratory">Respiratory</option>
            <option value="gastrointestinal">Gastrointestinal</option>
            <option value="dermatological">Dermatological</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manufacturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                      <span className="text-gray-500">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : !isLoading && medicines && medicines.length > 0 ? (
                medicines.map((medicine) => {
                  const stock = stockLevels?.find((s) => s.medicine_id === medicine.id)
                  const stockQty = stock?.total_quantity || 0
                  const stockStatus = stockQty === 0 ? 'out' : stockQty < 20 ? 'low' : stockQty < 50 ? 'medium' : 'good'
                  
                  return (
                    <tr key={medicine.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 font-mono">
                          {medicine.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
                        {medicine.brand && (
                          <div className="text-xs text-gray-500">{medicine.brand}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {medicine.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {medicine.manufacturer || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              stockStatus === 'out'
                                ? 'bg-red-100 text-red-800'
                                : stockStatus === 'low'
                                ? 'bg-orange-100 text-orange-800'
                                : stockStatus === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {stockQty} units
                          </span>
                          {stock?.nearest_expiry && (
                            <span className="text-xs text-gray-500">
                              Exp: {new Date(stock.nearest_expiry).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {medicine.mrp ? `₹${medicine.mrp.toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => {
                            // TODO: Implement view details modal
                            console.log('View details for', medicine.id)
                          }}
                          className="text-primary-600 hover:text-primary-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-500 font-medium">No medicines found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || selectedCategory
                          ? 'Try adjusting your search or filters'
                          : 'Upload an inventory file to get started'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {medicines && medicines.length > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-medium">{medicines.length}</span> medicine{medicines.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUpload
          onSuccess={() => setShowUploadModal(false)}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  )
}
