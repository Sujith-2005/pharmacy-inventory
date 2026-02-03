
import React, { useEffect, useState } from 'react'
import { inventoryApi } from '../api/inventory'

export default function Analysis() {
    const [report, setReport] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchReport()
    }, [])

    const fetchReport = async () => {
        try {
            setLoading(true)
            const data = await inventoryApi.getAnalysisReport()
            setReport(data)
            setError(null)
        } catch (err) {
            setError('Failed to load analysis report. Please ensure the backend is running.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading Analysis...</div>
    if (error) return <div className="p-8 text-center text-red-600">{error}</div>
    if (!report) return null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventory Analysis</h1>
                    <p className="text-sm text-gray-500 mt-1">Comprehensive data insights and forecasts</p>
                </div>
                <div className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full">
                    <span className="text-xs text-gray-500">Generated: {new Date(report.generated_at).toLocaleString()}</span>
                </div>
            </div>

            {/* 1. Inventory Summary */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-500 pl-3">Inventory Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-600 font-medium">Total SKUs</p>
                        <p className="text-2xl font-bold text-blue-900">{report.inventory_summary.total_skus}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm text-green-600 font-medium">Active Batches</p>
                        <p className="text-2xl font-bold text-green-900">{report.inventory_summary.active_batches}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm text-purple-600 font-medium">Total Inventory Value</p>
                        <p className="text-2xl font-bold text-purple-900">₹{report.inventory_summary.total_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            {/* 2. Sales Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Performance</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <p className="text-sm text-indigo-600 font-medium">Total Transactions</p>
                            <p className="text-2xl font-bold text-indigo-900">{report.sales_performance.total_transactions}</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <p className="text-sm text-indigo-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold text-indigo-900">₹{report.sales_performance.total_revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">Top Selling Items</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {report.sales_performance.top_selling.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{item.qty}</td>
                                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">₹{item.revenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 3. Risks */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Risk Analysis</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                            <div>
                                <p className="text-red-700 font-bold">Expired Batches</p>
                                <p className="text-sm text-red-600">Immediate removal required</p>
                            </div>
                            <span className="text-2xl font-bold text-red-800">{report.risks.expired_batches}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                            <div>
                                <p className="text-yellow-700 font-bold">Expiring Soon (90 Days)</p>
                                <p className="text-sm text-yellow-600">Plan checking or discount</p>
                            </div>
                            <span className="text-2xl font-bold text-yellow-800">{report.risks.expiring_soon}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100">
                            <div>
                                <p className="text-orange-700 font-bold">Low Stock SKUs</p>
                                <p className="text-sm text-orange-600">Reorder needed</p>
                            </div>
                            <span className="text-2xl font-bold text-orange-800">{report.risks.low_stock_skus}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. AI Forecasts */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">AI Demand Forecasts (Top Items)</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {report.forecasts.map((item, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-lg text-primary-600 mb-2">{item.name}</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Projected Demand (30d):</span>
                                    <span className="font-medium">{item.forecast.forecasted_demand.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Recommended Order:</span>
                                    <span className="font-bold text-green-600">{item.forecast.recommended_quantity}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Confidence:</span>
                                    <span className="font-medium">{(item.forecast.confidence_score * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-gray-600 text-xs mt-2 italic border-t pt-2">"{item.forecast.reasoning}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
