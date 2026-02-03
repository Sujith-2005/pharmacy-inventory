import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../api/dashboard'
import { alertsApi } from '../api/alerts'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from 'recharts'
import { format } from 'date-fns'

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6']

const MOCK_TRENDS = [
  { month: 'Sep', sales: 12000, consumption: 11500 },
  { month: 'Oct', sales: 13500, consumption: 12800 },
  { month: 'Nov', sales: 11000, consumption: 14200 },
  { month: 'Dec', sales: 15800, consumption: 16500 }, // Peak season
  { month: 'Jan', sales: 14200, consumption: 13800 },
  { month: 'Feb (Proj)', sales: 16000, consumption: 15500 },
]

const MOCK_TOP_PRODUCTS = [
  { name: 'Dolo 650mg', sales: 12400, color: '#3b82f6' },
  { name: 'Azithromycin', sales: 9800, color: '#10b981' },
  { name: 'Pan D', sales: 8600, color: '#f59e0b' },
  { name: 'Shelcal 500', sales: 6400, color: '#8b5cf6' },
  { name: 'Telma 40', sales: 5200, color: '#ef4444' },
]

function AIInsightCard() {
  const [enabled, setEnabled] = useState(false)

  const { data: insight, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-ai'],
    queryFn: () => dashboardApi.getAIInsights(),
    enabled: enabled,
    staleTime: 300000,
  })

  const handleAnalyze = () => {
    setEnabled(true)
    refetch()
  }

  if (!enabled) {
    return (
      <div className="glass-panel p-6 rounded-xl border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg"><span className="text-xl">✨</span></div>
          <h3 className="text-lg font-bold text-gray-900 font-display">AI Executive Summary</h3>
        </div>
        <button
          onClick={handleAnalyze}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 shadow-md transition-colors"
        >
          Generate Insights
        </button>
      </div>
    )
  }

  return (
    <div className="glass-panel p-6 rounded-xl border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-100 rounded-lg">
          <span className="text-2xl">✨</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 font-display">AI Executive Summary</h3>
          {isLoading ? (
            <div className="mt-2 text-sm text-purple-600 animate-pulse">Analyzing dashboard metrics...</div>
          ) : isError ? (
            <div className="mt-2 text-sm text-red-500">Analysis unavailable. Please try later.</div>
          ) : (
            <div className="mt-2 text-sm text-gray-700 whitespace-pre-line prose prose-purple">
              {insight?.insight || "No insights available."}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props

  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#1e293b" className="text-sm font-bold" style={{ fontSize: '14px' }}>
        {payload.category}
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#64748b" className="text-xs" style={{ fontSize: '12px' }}>
        {`₹${value.toLocaleString()}`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  )
}

export default function Dashboard() {
  const [activeIndex, setActiveIndex] = useState(0)

  const onPieEnter = (_, index) => {
    setActiveIndex(index)
  }

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  })
  // ... existing code ...
  /* Note: I need to be careful to only replace the start of the component to add the state, 
     and then the PieChart part. But the tool requires contiguous replacement. 
     I will split this into two edits:
     1. Add `renderActiveShape` before `Dashboard` and add `activeIndex` inside `Dashboard`.
     2. Update `PieChart` to use `activeIndex`.
  */


  const { data: expiryTimeline } = useQuery({
    queryKey: ['expiry-timeline'],
    queryFn: () => dashboardApi.getExpiryTimeline(),
  })

  const { data: inventoryByCategory } = useQuery({
    queryKey: ['inventory-by-category'],
    queryFn: () => dashboardApi.getInventoryByCategory(),
  })

  const { data: salesTrends } = useQuery({
    queryKey: ['sales-trends'],
    queryFn: () => dashboardApi.getSalesTrends(30),
  })

  const { data: alerts } = useQuery({
    queryKey: ['alerts-unacknowledged'],
    queryFn: () => alertsApi.getUnacknowledged(),
  })

  if (statsLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display text-secondary-900 tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary-500 font-medium">
            Real-time overview of your pharmacy's health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700 ring-1 ring-inset ring-success-600/20">
            <span className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></span>
            System Operational
          </span>
        </div>
      </div>

      {/* AI Insight Card */}
      <AIInsightCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Stock Value */}
        <div className="glass-panel rounded-xl p-6 card-hover relative group overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary-100 rounded-full blur-2xl opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-primary-50 rounded-lg">
              <span className="text-2xl text-primary-600">₹</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Total Stock Value</p>
              <h3 className="text-2xl font-bold text-secondary-900 mt-1">
                ₹{stats?.total_stock_value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Total SKUs */}
        <div className="glass-panel rounded-xl p-6 card-hover relative overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Total SKUs</p>
              <h3 className="text-2xl font-bold text-secondary-900 mt-1">{stats?.total_skus}</h3>
            </div>
          </div>
        </div>

        {/* Low Stock Items - Warning */}
        <div className="glass-panel rounded-xl p-6 card-hover relative overflow-hidden border-l-4 border-warning-500">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-warning-50 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Low Stock Alert</p>
              <h3 className="text-2xl font-bold text-warning-600 mt-1">{stats?.low_stock_count}</h3>
            </div>
          </div>
        </div>

        {/* Expiring Soon - Danger */}
        <div className="glass-panel rounded-xl p-6 card-hover relative overflow-hidden border-l-4 border-danger-500">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-danger-50 rounded-lg">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Expiring (90 Days)</p>
              <h3 className="text-2xl font-bold text-danger-600 mt-1">{stats?.expiring_soon_count}</h3>
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="glass-panel rounded-xl p-6 card-hover relative overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-50 rounded-lg">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Active Alerts</p>
              <h3 className="text-2xl font-bold text-secondary-900 mt-1">{stats?.total_alerts}</h3>
            </div>
          </div>
        </div>

        {/* Wastage Value */}
        <div className="glass-panel rounded-xl p-6 card-hover relative overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-gray-100 rounded-lg">
              <span className="text-2xl">🗑️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-500">Wastage (30d)</p>
              <h3 className="text-2xl font-bold text-gray-700 mt-1">
                ₹{stats?.wastage_value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts Section */}
        <div className="glass-panel rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 font-display">Expiry Risk Timeline</h2>
            <select className="text-sm border-none bg-secondary-50 text-secondary-600 rounded-lg focus:ring-0 cursor-pointer">
              <option>Coming 6 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expiryTimeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Value (₹)" />
              </BarChart>
            </ResponsiveContainer>

          </div>
        </div>

        {/* Inventory Distribution */}
        <div className="glass-panel rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-secondary-900 mb-6 font-display">Inventory by Category</h2>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart style={{ outline: 'none', cursor: 'pointer' }}>
                <Pie
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  data={inventoryByCategory}
                  dataKey="total_value"
                  nameKey="category"
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  onMouseEnter={onPieEnter}
                  isAnimationActive
                  style={{ outline: 'none' }}
                >
                  {inventoryByCategory?.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="none"
                      style={{ outline: 'none' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                  contentStyle={{
                    borderRadius: '10px',
                    border: 'none',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
                    fontSize: '13px'
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: '18px',
                    fontSize: '13px',
                    lineHeight: '20px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sales Trends & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3 width) - Stacked Charts */}
        <div className="lg:col-span-2 space-y-8">

          {/* 1. Sales & Consumption Trends */}
          <div className="glass-panel rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900 mb-6 font-display">Sales & Consumption Trends</h2>
            {true ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-secondary-400">
                No sales data available for this period
              </div>
            )}
          </div>

          {/* 2. Top Selling Products (New Visualization to fill gap) */}
          <div className="glass-panel rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-secondary-900 mb-6 font-display">Top Selling Medicines (This Month)</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_TOP_PRODUCTS} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="sales" name="Sales (₹)" radius={[0, 4, 4, 0]} barSize={24}>
                    {MOCK_TOP_PRODUCTS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - Alerts (Stretched) */}
        <div className="glass-panel rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-secondary-900 font-display">Critical Alerts</h2>
            <span className="text-xs font-medium text-primary-600 hover:text-primary-700 cursor-pointer">View All</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar" style={{ maxHeight: '600px' }}>
            {alerts && alerts.length > 0 ? (
              alerts.slice(0, 10).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border border-l-4 transition-all hover:translate-x-1 ${alert.severity === 'critical'
                    ? 'border-l-danger-500 bg-danger-50 border-danger-100'
                    : alert.severity === 'high'
                      ? 'border-l-warning-500 bg-warning-50 border-warning-100'
                      : 'border-l-primary-500 bg-primary-50 border-primary-100'
                    }`}
                >
                  <p className="text-sm font-semibold text-secondary-900">{alert.message}</p>
                  <div className="flex items-center mt-2 gap-2">
                    <span className="text-xs text-secondary-500 font-medium">
                      {format(new Date(alert.created_at), 'MMM dd • HH:mm')}
                    </span>
                    {alert.severity === 'critical' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-danger-100 text-danger-700 uppercase tracking-wide">
                        Critical
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-secondary-400">
                <p>No active alerts</p>
                <p className="text-xs mt-1">System is running smoothly</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
