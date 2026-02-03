import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { forecastingApi } from '../api/forecasting'
import { inventoryApi } from '../api/inventory'
import toast from 'react-hot-toast'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

const MOCK_TRENDS = [
  { month: 'Sep', sales: 12000, consumption: 11500 },
  { month: 'Oct', sales: 13500, consumption: 12800 },
  { month: 'Nov', sales: 11000, consumption: 14200 },
  { month: 'Dec', sales: 15800, consumption: 16500 }, // Peak season
  { month: 'Jan', sales: 14200, consumption: 13800 },
  { month: 'Feb (Proj)', sales: 16000, consumption: 15500 },
]

export default function Forecasting() {
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')

  const { data: suggestions, isLoading, isRefetching } = useQuery({
    queryKey: ['reorder-suggestions', criticalOnly, selectedCategory],
    queryFn: () => forecastingApi.getReorderSuggestions(selectedCategory || undefined, criticalOnly),
    refetchInterval: 30000, // Poll every 30 seconds
  })

  // Fetch categories dynamically to ensure they match DB
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: inventoryApi.getCategories,
    staleTime: 300000 // 5 mins
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

  // Add Simulation Mutation for "Forecasting not working" (Empty Data) fix
  const simulateMutation = useMutation({
    mutationFn: () => forecastingApi.simulateHistory(),
    onSuccess: (data) => {
      toast.success('Simulation data generated!')
      queryClient.invalidateQueries({ queryKey: ['reorder-suggestions'] })
    },
    onError: () => {
      toast.error('Simulation failed')
    }
  })

  const [hasRunForecast, setHasRunForecast] = useState(false)

  const handleRunForecast = () => {
    setHasRunForecast(true)
    batchForecastMutation.mutate()
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-display text-secondary-900 tracking-tight">Demand Intelligence</h1>
            {isRefetching && !isLoading && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-secondary-500">
            AI-powered forecasting and automated reorder suggestions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => simulateMutation.mutate()}
            disabled={simulateMutation.isPending}
            className="inline-flex items-center px-3 py-2 border border-secondary-300 rounded-lg font-medium text-xs text-secondary-700 bg-white hover:bg-secondary-50"
          >
            {simulateMutation.isPending ? 'Simulating...' : '🎲 Demo Data'}
          </button>
          <button
            onClick={handleRunForecast}
            disabled={batchForecastMutation.isPending}
            className="inline-flex items-center px-4 py-2 bg-primary-600 border border-transparent rounded-lg font-semibold text-xs text-white uppercase tracking-widest hover:bg-primary-700 shadow-lg shadow-primary-500/30"
          >
            {batchForecastMutation.isPending ? 'Calculating...' : 'Run Forecast'}
          </button>
        </div>
      </div>

      {!hasRunForecast ? (
        <div className="text-center py-24 glass-panel rounded-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-secondary-900 font-display">Ready to Forecast?</h2>
          <p className="mt-2 text-secondary-500 max-w-lg mx-auto">
            Run our advanced AI models to predict next month's demand, analyze consumption trends, and generate purchase orders.
          </p>
          <button
            onClick={handleRunForecast}
            className="mt-8 inline-flex items-center px-6 py-3 bg-primary-600 border border-transparent rounded-lg font-semibold text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 transition-all hover:scale-105"
          >
            Run Forecast Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in">
          {/* AI Analysis Block (Lazy Loaded) */}
          <div className="glass-panel p-6 rounded-xl border-l-4 border-indigo-500 bg-gradient-to-r from-indigo-50 to-white">
            <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-2">
              <span>🧠</span> AI Supply Chain Strategist
            </h3>
            <ForecastingAIBlock />
          </div>

          {/* Sales & Consumption Trends Chart */}
          <div className="glass-panel p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-secondary-900 mb-6 font-display flex items-center gap-2">
              <span>📈</span> Sales & Consumption Trends
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area type="monotone" dataKey="consumption" stroke="#10B981" fillOpacity={1} fill="url(#colorCons)" name="Consumption (Units)" />
                  <Area type="monotone" dataKey="sales" stroke="#4F46E5" fillOpacity={1} fill="url(#colorSales)" name="Sales Revenue (₹)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={criticalOnly}
                  onChange={(e) => setCriticalOnly(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-10 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
              <span className="text-sm font-medium text-secondary-700 group-hover:text-secondary-900">
                Show Critical Only
              </span>
            </label>

            <div className="h-6 w-px bg-secondary-200 hidden sm:block"></div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full sm:w-64 pl-3 pr-10 py-2 text-base border-none ring-1 ring-secondary-200 focus:ring-2 focus:ring-primary-500 sm:text-sm rounded-lg bg-secondary-50 text-secondary-900"
            >
              <option value="">All Medicine Categories</option>
              {categories && categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Reorder Suggestions */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass-panel rounded-xl overflow-hidden h-64 animate-pulse">
                    <div className="h-2 w-full bg-secondary-200" />
                    <div className="p-6 space-y-4">
                      <div className="h-6 w-3/4 bg-secondary-200 rounded" />
                      <div className="h-4 w-1/2 bg-secondary-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : suggestions && suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {suggestions.map((item) => (
                  <div
                    key={item.medicine_id}
                    className="glass-panel rounded-xl overflow-hidden card-hover flex flex-col h-full group"
                  >
                    {/* Card Header with Status Color */}
                    <div className={`h-2 w-full transition-colors duration-300 ${item.priority === 'critical' ? 'bg-danger-500' :
                      item.priority === 'low_stock' ? 'bg-warning-500' :
                        'bg-primary-500'
                      }`} />

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 mb-2">
                            {item.category || 'General'}
                          </span>
                          <h3 className="text-lg font-bold text-secondary-900 font-display line-clamp-1 group-hover:text-primary-600 transition-colors" title={item.medicine_name}>
                            {item.medicine_name}
                          </h3>
                          <p className="text-sm text-secondary-500 font-mono">{item.sku}</p>
                        </div>
                        {item.priority === 'critical' && (
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-danger-500"></span>
                          </span>
                        )}
                      </div>

                      {/* Suggestion Grid */}
                      <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-secondary-100 mb-4 bg-secondary-50/30 rounded-lg px-2">
                        <div className="text-center p-2">
                          <p className="text-xs text-secondary-500 uppercase tracking-wide font-semibold">Stock On Hand</p>
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold text-secondary-900 mt-1">
                              {item.total_physical_stock || item.current_stock}
                            </span>
                            {(item.total_physical_stock > item.current_stock) && (
                              <span className="text-xs text-danger-600 font-medium bg-danger-50 px-2 py-0.5 rounded-full mt-1">
                                {(item.total_physical_stock - item.current_stock)} Expired
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-center p-2 border-l border-secondary-200">
                          <p className="text-xs text-primary-600 uppercase tracking-wide font-semibold">Suggested Order</p>
                          <p className="text-xl font-bold text-primary-700 mt-1">{item.recommended_quantity}</p>
                        </div>
                      </div>

                      {/* Reasoning & Confidence */}
                      <div className="mb-6 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-secondary-700 uppercase">Reasoning</span>
                          </div>
                          <div className="flex items-center gap-1" title="Forecast ConfidenceScore">
                            <span className="text-[10px] font-medium text-secondary-400">Confidence</span>
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <div key={star} className={`w-1 h-3 rounded-full ${star <= (item.confidence_score ? item.confidence_score * 5 : 4) ? 'bg-success-500' : 'bg-secondary-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-secondary-600 leading-relaxed italic border-l-2 border-primary-200 pl-3">
                          "{item.reasoning}"
                        </p>
                      </div>

                      <button className="w-full mt-auto inline-flex items-center justify-center px-4 py-2.5 border border-secondary-200 rounded-lg shadow-sm text-sm font-semibold text-secondary-700 bg-white hover:bg-secondary-50 hover:text-primary-600 hover:border-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200">
                        Create Purchase Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel rounded-xl p-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary-100 mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-bold text-secondary-900 font-display">No Forecast Data</h3>
                <p className="mt-2 text-sm text-secondary-500 max-w-md mx-auto">
                  We need historical transaction data to generate forecasts.
                  Try running the "Dice" icon demo simulation above!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ForecastingAIBlock() {
  const [enabled, setEnabled] = useState(false)

  const { data: aiAnalysis, isLoading, isError, refetch } = useQuery({
    queryKey: ['forecasting-ai'],
    queryFn: () => forecastingApi.getAIAnalysis(),
    enabled: enabled, // Lazy load
    staleTime: 300000
  })

  // Trigger on button click
  const handleAnalyze = () => {
    setEnabled(true)
    refetch()
  }

  if (!enabled) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-indigo-600 mb-3">AI analysis consumes credits. Generate only when needed.</p>
        <button
          onClick={handleAnalyze}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ✨ Generate Supply Chain Strategy
        </button>
      </div>
    )
  }

  if (isLoading) return (
    <div className="flex items-center justify-center p-4">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-sm text-indigo-700 font-medium">Analyzing reorder patterns...</span>
    </div>
  )

  if (isError || aiAnalysis?.analysis?.includes("Capacity Full")) {
    return (
      <div className="bg-orange-50 p-4 rounded-md border border-orange-200">
        <p className="text-sm text-orange-800">
          ⚠️ AI Capacity Busy. Please try again in a moment.
        </p>
        <button onClick={() => refetch()} className="text-xs text-orange-600 underline mt-1">Retry</button>
      </div>
    )
  }

  return (
    <div className="text-sm text-gray-700 whitespace-pre-line prose prose-indigo max-w-none">
      {aiAnalysis?.analysis || "No strategic analysis available."}
    </div>
  )
}
