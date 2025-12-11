import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { forecastingApi } from '../api/forecasting'
import toast from 'react-hot-toast'

export default function Forecasting() {
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['reorder-suggestions', criticalOnly, selectedCategory],
    queryFn: () => forecastingApi.getReorderSuggestions(selectedCategory || undefined, criticalOnly),
  })

  const queryClient = useQueryClient()

  const batchForecastMutation = useMutation({
    mutationFn: () => forecastingApi.generateBatchForecast(),
    onSuccess: (data) => {
      toast.success(`Generated forecasts for ${data.count} medicines`)
      queryClient.invalidateQueries({ queryKey: ['reorder-suggestions'] })
    },
    onError: () => {
      toast.error('Failed to generate forecasts')
    },
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'low_stock':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'at_risk':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demand Forecasting & Reordering</h1>
          <p className="mt-2 text-sm text-gray-600">AI-powered demand forecasting and reorder suggestions</p>
        </div>
        <button
          onClick={() => batchForecastMutation.mutate()}
          disabled={batchForecastMutation.isPending}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {batchForecastMutation.isPending ? 'Generating...' : 'Generate Forecasts'}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={criticalOnly}
            onChange={(e) => setCriticalOnly(e.target.checked)}
            className="mr-2"
          />
          Show critical/low stock only
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2"
        >
          <option value="">All Categories</option>
          <option value="antibiotic">Antibiotic</option>
          <option value="analgesic">Analgesic</option>
          <option value="antidiabetic">Antidiabetic</option>
          <option value="vitamin">Vitamin</option>
        </select>
      </div>

      {/* Reorder Suggestions */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">Loading suggestions...</div>
        ) : suggestions && suggestions.length > 0 ? (
          suggestions.map((item: any) => (
            <div
              key={item.medicine_id}
              className={`bg-white p-6 rounded-lg shadow border-l-4 ${getPriorityColor(item.priority)}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{item.medicine_name}</h3>
                  <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                  {item.category && (
                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {item.category}
                    </span>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}
                >
                  {item.priority.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-500">Current Stock</p>
                  <p className="text-lg font-semibold">{item.current_stock}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Forecasted Demand</p>
                  <p className="text-lg font-semibold">{item.forecasted_demand.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reorder Point</p>
                  <p className="text-lg font-semibold">{item.reorder_point}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Recommended Qty</p>
                  <p className="text-lg font-semibold text-primary-600">{item.recommended_quantity}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">
                  <strong>Reasoning:</strong> {item.reasoning}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Confidence: {(item.confidence_score * 100).toFixed(0)}%
                </p>
              </div>

              <button className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm">
                Create Purchase Order
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No reorder suggestions found. All items are well-stocked.
          </div>
        )}
      </div>
    </div>
  )
}


