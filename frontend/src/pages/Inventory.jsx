import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventory'
import { dashboardApi } from '../api/dashboard'
import FileUpload from '../components/FileUpload'
import toast from 'react-hot-toast'

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('expiry') // Default to FEFO
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedMedicine, setSelectedMedicine] = useState(null)

  const { data: medicines, isLoading, refetch: refetchMedicines } = useQuery({
    queryKey: ['inventory-grid', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        const result = await inventoryApi.getInventoryGrid({ search: searchTerm, category: selectedCategory, limit: 100 })
        return result || []
      } catch (error) {
        console.error('ERROR: Failed to fetch inventory grid:', error)
        return []
      }
    },
    refetchInterval: 15000,
  })

  const { data: stockLevels, refetch: refetchStockLevels } = useQuery({
    queryKey: ['stock-levels'],
    queryFn: async () => {
      const result = await inventoryApi.getStockLevels()
      return result || []
    },
    refetchInterval: 15000,
  })

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await inventoryApi.getCategories()
      return result || []
    },
    staleTime: 60000, // Cache for 1 minute
  })

  // Delete Mutation
  const deleteMedicineMutation = useMutation({
    mutationFn: inventoryApi.deleteMedicine,
    onSuccess: () => {
      toast.success('Medicine deleted successfully');
      refetchMedicines();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    }
  });

  // Derived sorted data - Backend handles basic sort, frontend just passes through for now
  const sortedMedicines = medicines || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-secondary-900 tracking-tight">Inventory</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Real-time stock tracking with FEFO (First-Expired, First-Out) monitoring
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 active:bg-primary-900 focus:outline-none focus:border-primary-900 focus:ring ring-primary-300 disabled:opacity-25 transition ease-in-out duration-150 shadow-lg shadow-primary-500/30"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Stock
        </button>
      </div>

      {/* AI Analysis Block */}
      <div className="glass-panel p-6 rounded-xl border-l-4 border-cyan-500 bg-gradient-to-r from-cyan-50 to-white">
        <h3 className="text-lg font-bold text-cyan-900 flex items-center gap-2 mb-2">
          <span>🧠</span> AI Inventory Auditor
        </h3>
        <InventoryAIBlock />
      </div>

      {/* Search and Filter */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center bg-white/50 backdrop-blur-sm border border-secondary-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex-1 relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search SKU, Name, Brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 bg-white/80 text-secondary-900 placeholder-secondary-400 transition-all duration-200 shadow-sm"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <div className="relative group">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none block w-full md:w-auto min-w-[180px] pl-4 pr-10 py-2.5 text-sm border border-secondary-200 rounded-xl bg-white text-secondary-700 cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-primary-400 transition-all duration-200 shadow-sm"
            >
              <option value="">All Categories</option>
              {categories && categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none block w-full md:w-auto min-w-[200px] pl-4 pr-10 py-2.5 text-sm border border-secondary-200 rounded-xl bg-white text-secondary-700 cursor-pointer focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 hover:border-primary-400 transition-all duration-200 shadow-sm"
            >
              <option value="expiry">Sort by Expiry (FEFO)</option>
              <option value="stock_low">Stock (Low to High)</option>
              <option value="stock_high">Stock (High to Low)</option>
              <option value="name">Name (A-Z)</option>
              <option value="newest">Newest Added</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="glass-panel rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-white">
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Batch No</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Supplier</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                      <span className="text-secondary-500 text-sm">Loading inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedMedicines && sortedMedicines.length > 0 ? (
                sortedMedicines.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      ₹{(item.price || 0).toFixed(2).replace(/\.00$/, '')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.expiry_date ? new Date(item.expiry_date).toISOString().split('T')[0] : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono text-xs">
                      {item.batch_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {item.supplier}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="group relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMedicine(item);
                            }}
                            className="p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Edit Item
                          </span>
                        </div>

                        <div className="group relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                                deleteMedicineMutation.mutate(item.medicine_id);
                              }
                            }}
                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 shadow-sm hover:shadow-md"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Delete
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-secondary-500">
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <FileUpload
          onSuccess={() => {
            setShowUploadModal(false)
            refetchMedicines()
            refetchStockLevels()
          }}
          onClose={() => setShowUploadModal(false)}
        />
      )}

      {/* Details Modal */}
      {selectedMedicine && (
        <MedicineDetailsModal
          medicine={selectedMedicine}
          onClose={() => setSelectedMedicine(null)}
        />
      )}
    </div>
  )
}


function MedicineDetailsModal({ medicine, onClose }) {
  const { data: batches, isLoading } = useQuery({
    queryKey: ['batches', medicine.id],
    queryFn: () => inventoryApi.getBatches(medicine.id),
    enabled: !!medicine.id,
  })

  // Calculate total stock from batches to match view
  const totalStock = batches?.reduce((sum, b) => sum + b.quantity, 0) || 0
  const activeBatches = batches?.filter(b => !b.is_expired && !b.is_damaged) || []

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">

        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">

          {/* Header */}
          <div className="sm:flex sm:items-start justify-between">
            <div className="sm:flex sm:items-start gap-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 sm:mx-0 sm:h-10 sm:w-10">
                <span className="text-xl">💊</span>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  {medicine.name}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{medicine.sku}</span>
                  <span>•</span>
                  <span>{medicine.category}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-4">
            {/* Quick Stats */}
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3 mb-6">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Total Stock</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{totalStock}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Active Batches</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">{activeBatches.length}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Standard Price (MRP)</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">₹{medicine.mrp?.toFixed(2)}</dd>
              </div>
            </dl>

            {/* Batches Table */}
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">Batch History</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch No</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">Loading batches...</td></tr>
                  ) : batches && batches.length > 0 ? (
                    batches.map((batch) => {
                      const expiryDate = new Date(batch.expiry_date)
                      const isExpired = batch.is_expired || expiryDate < new Date()
                      const daysToExpire = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24))

                      return (
                        <tr key={batch.id} className={isExpired ? 'bg-red-50' : ''}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{batch.batch_number}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {expiryDate.toLocaleDateString()}
                            {!isExpired && daysToExpire <= 90 && (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Expiring Soon
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-mono">{batch.quantity}</td>
                          <td className="px-4 py-2 text-sm">
                            {isExpired ? (
                              <span className="text-red-600 font-medium">Expired</span>
                            ) : batch.is_damaged ? (
                              <span className="text-orange-600 font-medium">Damaged</span>
                            ) : (
                              <span className="text-green-600 font-medium">Active</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr><td colSpan="4" className="px-4 py-4 text-center text-sm text-gray-500">No batches records found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function InventoryAIBlock() {
  const [enabled, setEnabled] = useState(false)

  const { data: insight, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventory-ai'],
    queryFn: () => inventoryApi.getAIAnalysis(),
    enabled: enabled,
    staleTime: 300000
  })

  // Trigger on button click
  const handleAnalyze = () => {
    setEnabled(true)
    refetch()
  }

  if (!enabled) {
    return (
      <div className="py-2 text-center">
        <button
          onClick={handleAnalyze}
          className="text-sm font-medium text-cyan-700 hover:text-cyan-900 hover:underline flex items-center justify-center gap-2 mx-auto"
        >
          <span>✨</span> Click to Analyze Stock Health
        </button>
      </div>
    )
  }

  if (isLoading) return <div className="text-sm text-gray-500 animate-pulse">Auditing inventory health...</div>

  if (isError) return <div className="text-sm text-red-500">Audit unavailable.</div>

  return (
    <div className="text-sm text-gray-700 whitespace-pre-line prose prose-cyan max-w-none">
      {insight?.insight || "Inventory looks stable."}
    </div>
  )
}
