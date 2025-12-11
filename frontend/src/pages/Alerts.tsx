import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { alertsApi } from '../api/alerts'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Alerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertsApi.getAlerts({ acknowledged: false }),
  })

  const queryClient = useQueryClient()

  const acknowledgeMutation = useMutation({
    mutationFn: (alertId: number) => alertsApi.acknowledge(alertId),
    onSuccess: () => {
      toast.success('Alert acknowledged')
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
    },
    onError: () => {
      toast.error('Failed to acknowledge alert')
    },
  })

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-500 text-red-800'
      case 'high':
        return 'bg-orange-50 border-orange-500 text-orange-800'
      case 'medium':
        return 'bg-yellow-50 border-yellow-500 text-yellow-800'
      default:
        return 'bg-blue-50 border-blue-500 text-blue-800'
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
      case 'stock_out':
        return '📦'
      case 'expiry_warning':
        return '⏰'
      case 'delayed_delivery':
        return '🚚'
      default:
        return '🔔'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Alerts & Notifications</h1>
        <p className="mt-2 text-sm text-gray-600">Monitor inventory alerts and take action</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading alerts...</div>
      ) : alerts && alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert: any) => (
            <div
              key={alert.id}
              className={`bg-white p-6 rounded-lg shadow border-l-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getAlertTypeIcon(alert.alert_type)}</span>
                    <span className="px-2 py-1 bg-white rounded text-xs font-medium">
                      {alert.alert_type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        alert.severity === 'critical'
                          ? 'bg-red-200 text-red-900'
                          : alert.severity === 'high'
                          ? 'bg-orange-200 text-orange-900'
                          : 'bg-yellow-200 text-yellow-900'
                      }`}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium mb-2">{alert.message}</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <button
                  onClick={() => acknowledgeMutation.mutate(alert.id)}
                  disabled={acknowledgeMutation.isPending}
                  className="ml-4 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm"
                >
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500 text-lg">No active alerts</p>
          <p className="text-gray-400 text-sm mt-2">All systems are running smoothly!</p>
        </div>
      )}
    </div>
  )
}


