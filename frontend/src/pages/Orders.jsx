import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi } from '../api/orders'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

export default function Orders() {
    const queryClient = useQueryClient()
    const [file, setFile] = useState(null)
    const [formData, setFormData] = useState({
        customer_name: '',
        contact_info: '',
        notification_method: 'whatsapp',
        notes: ''
    })
    const [uploading, setUploading] = useState(false)

    const { data: orders, isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: ordersApi.getOrders
    })

    const uploadMutation = useMutation({
        mutationFn: ordersApi.uploadPrescription,
    })

    const createOrderMutation = useMutation({
        mutationFn: ordersApi.createOrder,
        onSuccess: (data) => {
            toast.success(data.message)
            setFormData({
                customer_name: '',
                contact_info: '',
                notification_method: 'whatsapp',
                notes: ''
            })
            setFile(null)
            queryClient.invalidateQueries({ queryKey: ['orders'] })
        },
        onError: (err) => {
            toast.error('Failed to create order')
        }
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.customer_name || !formData.contact_info) {
            toast.error('Name and Contact are required')
            return
        }

        let imagePath = null
        if (file) {
            setUploading(true)
            const data = new FormData()
            data.append('file', file)
            try {
                const res = await uploadMutation.mutateAsync(data)
                imagePath = res.filepath
            } catch (err) {
                toast.error('Image upload failed')
                setUploading(false)
                return
            }
            setUploading(false)
        }

        createOrderMutation.mutate({
            ...formData,
            prescription_image_path: imagePath
        })
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold font-display text-secondary-900 tracking-tight">Prescription Orders</h1>
                <p className="mt-1 text-sm text-secondary-500 font-medium">
                    Manage customer requests and notify them instantly via WhatsApp/SMS
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: New Request Form */}
                <div className="lg:col-span-1">
                    <div className="glass-panel p-6 rounded-xl shadow-sm border border-secondary-200">
                        <h2 className="text-lg font-bold text-secondary-900 mb-4">New Request</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Customer Name</label>
                                <input
                                    type="text"
                                    value={formData.customer_name}
                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                    className="w-full rounded-lg border-secondary-200 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g. Rahul Kumar"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Contact (Phone/Email)</label>
                                <input
                                    type="text"
                                    value={formData.contact_info}
                                    onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                                    className="w-full rounded-lg border-secondary-200 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="+91 99999..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Notification Channel</label>
                                <div className="flex gap-4">
                                    {['whatsapp', 'sms', 'email'].map((method) => (
                                        <label key={method} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="method"
                                                value={method}
                                                checked={formData.notification_method === method}
                                                onChange={(e) => setFormData({ ...formData, notification_method: e.target.value })}
                                                className="text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="capitalize text-sm font-medium text-secondary-600">{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Upload Prescription</label>
                                <label htmlFor="rx-file-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-secondary-300 border-dashed rounded-lg bg-secondary-50 hover:bg-white transition-colors cursor-pointer w-full">
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-secondary-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-secondary-600 justify-center">
                                            <span className="relative rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                                Upload a file
                                                <input id="rx-file-upload" name="rx-file-upload" type="file" className="sr-only" onChange={(e) => setFile(e.target.files[0])} />
                                            </span>
                                        </div>
                                        <p className="text-xs text-secondary-500">{file ? file.name : "PNG, JPG up to 5MB"}</p>
                                    </div>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={createOrderMutation.isPending || uploading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {createOrderMutation.isPending ? 'Sending...' : 'Raise Request & Notify'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Recent Orders List */}
                <div className="lg:col-span-2">
                    <div className="glass-panel rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
                        <div className="p-6 border-b border-secondary-100 bg-secondary-50/50">
                            <h2 className="text-lg font-bold text-secondary-900">Recent Requests</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-secondary-200">
                                <thead className="bg-secondary-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Method</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-secondary-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-secondary-200">
                                    {isLoading ? (
                                        <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-secondary-500">Loading...</td></tr>
                                    ) : orders?.length === 0 ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-sm text-secondary-500">No requests yet</td></tr>
                                    ) : (
                                        orders?.map((order) => (
                                            <tr key={order.id} className="hover:bg-secondary-50/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">#{order.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900 font-medium">{order.customer_name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">{order.contact_info}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                             ${order.notification_method === 'whatsapp' ? 'bg-green-100 text-green-800' :
                                                            order.notification_method === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {order.notification_method.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-500">
                                                    {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
