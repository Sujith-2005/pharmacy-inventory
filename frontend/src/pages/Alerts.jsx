import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsApi } from '../api/alerts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Alerts() {
  const { data: activeAlerts, isLoading: isLoadingActive } = useQuery({
    queryKey: ['alerts', 'active'],
    queryFn: () => alertsApi.getAlerts({ acknowledged: false }),
    refetchInterval: 5000,
  })

  const { data: resolvedAlerts, isLoading: isLoadingResolved } = useQuery({
    queryKey: ['alerts', 'resolved'],
    queryFn: () => alertsApi.getAlerts({ acknowledged: true }),
  })

  const queryClient = useQueryClient()

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId) => alertsApi.acknowledge(alertId),
    onSuccess: () => {
      toast.success('Alert acknowledged')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: () => {
      toast.error('Failed to acknowledge alert')
    },
  })

  const scanMutation = useMutation({
    mutationFn: () => alertsApi.runSystemScan(),
    onSuccess: (data) => {
      toast.success(data.message)
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: () => {
      toast.error('Scan failed')
    }
  })

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'critical':
        return { bg: 'bg-red-50', border: 'border-l-4 border-red-500', iconColor: 'text-red-500', iconBg: 'bg-red-100' }
      case 'high':
        return { bg: 'bg-orange-50', border: 'border-l-4 border-orange-500', iconColor: 'text-orange-500', iconBg: 'bg-orange-100' }
      default:
        return { bg: 'bg-white', border: 'border-l-4 border-yellow-500', iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100' }
    }
  }

  const getAlertIcon = (type) => {
    if (type === 'expiry_warning') return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Alerts & Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Manage low stock warnings and expiration notices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Active Alerts */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-2 w-2 rounded-full bg-red-500"></div>
            <h2 className="text-lg font-bold text-gray-900">Active Alerts ({activeAlerts?.length || 0})</h2>
          </div>

          <div className="space-y-4">
            {isLoadingActive ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
              </div>
            ) : activeAlerts?.length > 0 ? (
              activeAlerts.map((alert) => {
                const style = getSeverityStyle(alert.severity)
                return (
                  <div key={alert.id} className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4 transition-all hover:shadow-md ${style.border}`}>
                    <div className={`p-3 rounded-lg ${style.iconBg} ${style.iconColor} shrink-0`}>
                      {getAlertIcon(alert.alert_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base font-bold text-gray-900 truncate pr-2">
                          {alert.alert_type === 'expiry_warning' ? 'Expiring Soon' : 'Low Stock Warning'}
                        </h3>
                        <button
                          onClick={() => acknowledgeMutation.mutate(alert.id)}
                          className="px-3 py-1 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
                        >
                          Resolve
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-3 font-medium">
                        {format(new Date(alert.created_at), 'MMM dd, yyyy • hh:mm a')}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">No active alerts to resolve.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Resolved History */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 text-gray-500">Resolved History</h2>

          <div className="space-y-4">
            {isLoadingResolved ? (
              <div className="animate-pulse space-y-2">
                {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>)}
              </div>
            ) : resolvedAlerts?.length > 0 ? (
              resolvedAlerts.map((alert) => (
                <div key={alert.id} className="group flex items-start gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                  <div className="mt-1">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                      {alert.alert_type === 'expiry_warning' ? 'Expiry warning: ' : 'Low stock warning: '}
                      <span className="font-normal text-gray-500">{alert.message}</span>
                    </p>
                    <p className="text-xs text-green-600 mt-1 font-medium bg-green-50 inline-block px-1.5 py-0.5 rounded">Resolved</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 italic">No history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertsAIBlock() {
  const [enabled, setEnabled] = useState(false)

  const { data: aiAnalysis, isLoading, isError, refetch } = useQuery({
    queryKey: ['alerts-ai'],
    queryFn: () => alertsApi.getAIAnalysis(),
    enabled: enabled,
    staleTime: 60000
  })

  const handleAnalyze = () => {
    setEnabled(true)
    refetch()
  }

  if (!enabled) {
    return (
      <div className="text-center py-2">
        <button
          onClick={handleAnalyze}
          className="text-sm font-medium text-red-700 hover:text-red-900 hover:underline"
        >
          Click to Generate Risk Assessment
        </button>
      </div>
    )
  }

  if (isLoading) return <div className="text-sm text-gray-500 animate-pulse">Assessing system risks...</div>

  if (isError) return <div className="text-sm text-red-500">Analysis unavailable right now.</div>

  return (
    <div className="text-sm text-gray-700 whitespace-pre-line prose prose-red max-w-none">
      {aiAnalysis?.analysis || "System healthy."}
    </div>
  )
}
