import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { format, subDays } from 'date-fns'

const COLORS = ['#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6']

function WasteAIBlock({ startDate, endDate }) {
  const [enabled, setEnabled] = useState(false)

  const { data: aiAnalysis, isLoading, isError, refetch } = useQuery({
    queryKey: ['waste-ai', startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.get('/inventory/waste/ai-analysis', {
        params: { start_date: startDate, end_date: endDate }
      })
      return response.data
    },
    enabled: enabled,
    staleTime: 300000 // Cache for 5 mins
  })

  const handleAnalyze = () => {
    setEnabled(true)
    refetch()
  }

  if (!enabled) {
    return (
      <div className="flex justify-center py-2">
        <button
          onClick={handleAnalyze}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-2"
        >
          <span>✨</span> Click to Generate Sustainability Insights
        </button>
      </div>
    )
  }

  if (isLoading) return <div className="text-sm text-gray-500 animate-pulse">Generating sustainability insights...</div>

  if (isError) return <div className="text-sm text-red-500">Analysis unavailable.</div>

  return (
    <div className="text-sm text-gray-700 whitespace-pre-line prose prose-emerald max-w-none">
      {aiAnalysis?.analysis || "No data available for analysis."}
    </div>
  )
}

export default function WasteAnalytics() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 90), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['waste-analytics', startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.get('/inventory/waste/analytics', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
      return response.data
    },
    refetchInterval: 60000,
  })

  const { data: topWasteItems } = useQuery({
    queryKey: ['top-waste-items', startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.get('/inventory/waste/top-waste-items', {
        params: {
          start_date: startDate,
          end_date: endDate,
          limit: 10,
        },
      })
      return response.data
    },
    refetchInterval: 60000,
  })

  const { data: wasteByCategory } = useQuery({
    queryKey: ['waste-by-category', startDate, endDate],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/inventory/waste/by-category', {
          params: { start_date: startDate, end_date: endDate },
        })
        const data = response.data
        // Fallback for Hackathon: If no waste data, show mock distribution
        if (!data || data.length === 0) {
          return []
        }
        return data
      } catch (e) {
        return []
      }
    },
    refetchInterval: 60000,
  })

  if (isLoading) {
    return <div className="text-center py-12">Loading analytics...</div>
  }

  const wasteData = analytics
    ? [
      {
        name: 'Expired',
        quantity: analytics.expired.quantity,
        value: analytics.expired.value,
      },
      {
        name: 'Damaged',
        quantity: analytics.damaged.quantity,
        value: analytics.damaged.value,
      },
      {
        name: 'Recalled',
        quantity: analytics.recalled.quantity,
        value: analytics.recalled.value,
      },
      {
        name: 'Returned',
        quantity: analytics.returned.quantity,
        value: analytics.returned.value,
      },
    ]
    : []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-secondary-900 tracking-tight">Waste Analytics</h1>
          <p className="mt-1 text-sm text-secondary-500">
            Track, analyze, and minimize inventory wastage
          </p>
        </div>
        <div className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3">
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-none bg-transparent p-0 text-secondary-600 text-sm font-medium focus:ring-0"
            />
          </div>
          <span className="text-secondary-400">to</span>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-none bg-transparent p-0 text-secondary-600 text-sm font-medium focus:ring-0"
            />
          </div>
        </div>
      </div >

      {/* AI Analysis Block */}
      <div className="glass-panel p-6 rounded-xl border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50 to-white">
        <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-2">
          <span>🌱</span> AI Waste Reduction Strategy
        </h3>
        <WasteAIBlock startDate={startDate} endDate={endDate} />
      </div>

      {/* Summary Cards */}
      < div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" >
        {
          [
            {
              title: 'Total Wastage',
              value: analytics?.total.value,
              qty: analytics?.total.quantity,
              icon: '🗑️',
              color: 'bg-danger-50 text-danger-700'
            },
            {
              title: 'Expired Value',
              value: analytics?.expired.value,
              qty: analytics?.expired.quantity,
              icon: '⏰',
              color: 'bg-warning-50 text-warning-700'
            },
            {
              title: 'Damaged Value',
              value: analytics?.damaged.value,
              qty: analytics?.damaged.quantity,
              icon: '💔',
              color: 'bg-orange-50 text-orange-700'
            },
            {
              title: 'Wastage Rate',
              valueStr: `${analytics?.total.wastage_rate_percent || 0}%`,
              subStr: 'of Stock Value',
              icon: '📊',
              color: 'bg-primary-50 text-primary-700'
            },
          ].map((card, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-xl card-hover">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${card.color} bg-opacity-50`}>
                  <span className="text-2xl">{card.icon}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-secondary-500">{card.title}</p>
                <p className="text-2xl font-bold text-secondary-900 mt-1 font-display">
                  {card.valueStr || `₹${(card.value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                </p>
                <p className="text-xs text-secondary-400 mt-1">
                  {card.subStr || `${card.qty || 0} units impacted`}
                </p>
              </div>
            </div>
          ))
        }
      </div >

      {/* Charts */}
      < div className="grid grid-cols-1 lg:grid-cols-2 gap-6" >
        <div className="glass-panel p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-secondary-900 mb-6 font-display">Wastage by Type</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} name="Value (₹)" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold text-secondary-900 mb-6 font-display">Wastage by Category</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={wasteByCategory}
                  dataKey="value"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {wasteByCategory?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div >

      {/* Top Waste Items */}
      {
        topWasteItems && topWasteItems.length > 0 && (
          <div className="glass-panel rounded-xl overflow-hidden shadow-sm">
            <div className="bg-secondary-50/50 px-6 py-4 border-b border-secondary-100">
              <h2 className="text-lg font-bold text-secondary-900 font-display">Top 10 Waste Contributors</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Medicine</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Lost Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Lost Value</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-100">
                  {topWasteItems.map((item) => (
                    <tr key={item.medicine_id} className="hover:bg-secondary-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-secondary-900">
                        {item.medicine_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500 font-mono">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                          {item.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 font-medium">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-danger-600">
                        ₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }
    </div >
  )
}
