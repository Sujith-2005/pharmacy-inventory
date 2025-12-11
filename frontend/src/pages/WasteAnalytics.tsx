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

export default function WasteAnalytics() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 90), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['waste-analytics', startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.get('/api/waste/analytics', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
      return response.data
    },
  })

  const { data: topWasteItems } = useQuery({
    queryKey: ['top-waste-items', startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.get('/api/waste/top-waste-items', {
        params: {
          start_date: startDate,
          end_date: endDate,
          limit: 10,
        },
      })
      return response.data
    },
  })

  const { data: wasteByCategory } = useQuery({
    queryKey: ['waste-by-category', startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.get('/api/waste/by-category', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
      return response.data
    },
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
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Waste Analytics</h1>
        <p className="mt-2 text-sm text-gray-600">Track and analyze inventory wastage</p>
      </div>

      {/* Date Range Selector */}
      <div className="mb-6 flex gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                <span className="text-2xl">🗑️</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Wastage</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{analytics?.total.value.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}
                  </dd>
                  <dd className="text-sm text-gray-500">
                    {analytics?.total.quantity || 0} units
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                <span className="text-2xl">⏰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Expired</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{analytics?.expired.value.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}
                  </dd>
                  <dd className="text-sm text-gray-500">
                    {analytics?.expired.quantity || 0} units
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <span className="text-2xl">💔</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Damaged</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ₹{analytics?.damaged.value.toLocaleString('en-IN', { maximumFractionDigits: 0 }) || 0}
                  </dd>
                  <dd className="text-sm text-gray-500">
                    {analytics?.damaged.quantity || 0} units
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Wastage Rate</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {analytics?.total.wastage_rate_percent || 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Wastage by Type</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wasteData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#ef4444" name="Value (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Wastage by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={wasteByCategory}
                dataKey="value"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {wasteByCategory?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Waste Items */}
      {topWasteItems && topWasteItems.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top 10 Waste Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topWasteItems.map((item: any) => (
                  <tr key={item.medicine_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.medicine_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.category || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}


