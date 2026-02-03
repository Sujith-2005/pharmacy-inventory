
import React, { useState } from 'react'
import { inventoryApi } from '../api/inventory'

export default function PriceComparison() {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchTerm.trim()) return

        setLoading(true)
        setSearched(true)
        try {
            const data = await inventoryApi.comparePrices(searchTerm)
            setResults(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-display">Medicine Price Comparison</h1>
            <p className="text-gray-500 mb-8">Compare prices across major pharmacies and find the best deals</p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-10">
                <div className="relative flex shadow-md rounded-lg overflow-hidden border border-gray-300">
                    <input
                        type="text"
                        className="flex-1 px-6 py-4 text-lg focus:outline-none"
                        placeholder="Search for generic or branded medicine (e.g. Paracetamol)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-4 font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Searching...' : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Results */}
            <div className="space-y-4">
                {searched && !loading && (!results || results.length === 0) && (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
                        No results found for "{searchTerm}". Try a different medicine.
                    </div>
                )}

                {results && results.map((item, idx) => (
                    <div
                        key={idx}
                        className={`bg-white rounded-xl shadow-sm border p-6 transition-all hover:shadow-md ${item.is_lowest ? 'border-green-500 ring-1 ring-green-100' : 'border-gray-200'}`}
                    >
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                            {/* Left: Vendor Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{item.competitor}</h3>
                                    {item.is_lowest && (
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            Lowest Price
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                                    <div>
                                        <span className="text-gray-400 block text-xs">Form</span>
                                        <span className="font-medium">{item.form}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-xs">Quantity</span>
                                        <span className="font-medium">{item.quantity}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Middle: Discount */}
                            <div className="text-left md:text-center">
                                <span className="text-gray-400 block text-xs">Discount</span>
                                <span className="font-bold text-green-600 text-lg">{item.discount_percent}% OFF</span>
                            </div>

                            {/* Right: Price */}
                            <div className="text-right">
                                <span className="text-gray-400 block text-xs">Price</span>
                                <div className="flex items-baseline justify-end gap-2">
                                    <span className="text-gray-400 line-through text-sm">₹{item.original_price}</span>
                                    <span className="text-3xl font-bold text-blue-600">₹{item.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
