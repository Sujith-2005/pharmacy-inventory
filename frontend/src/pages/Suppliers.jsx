import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersApi } from '../api/suppliers'
import { inventoryApi } from '../api/inventory'
import { PlusIcon, PhoneIcon, EnvelopeIcon, DocumentTextIcon, CheckCircleIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function Suppliers() {
    const [showPOModal, setShowPOModal] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedSupplier, setSelectedSupplier] = useState(null)
    const [poSuccess, setPoSuccess] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Form states
    const [newSupplier, setNewSupplier] = useState({ name: '', email: '', phone: '', address: '', lead_time_days: 7 })
    const [poItems, setPoItems] = useState([{ medicine_id: '', quantity: 1 }])

    const queryClient = useQueryClient()

    // Fetch Suppliers
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => suppliersApi.getSuppliers(false), // Get all, even inactive if needed (though API defaults to active)
    })

    // Fetch Medicines for PO
    const { data: medicines } = useQuery({
        queryKey: ['medicines-list'],
        queryFn: async () => {
            try {
                const res = await inventoryApi.getMedicines({ limit: 100 })
                return res || []
            } catch (e) {
                return []
            }
        },
        enabled: showPOModal
    })

    // Create Supplier Mutation
    const createSupplierMutation = useMutation({
        mutationFn: (data) => suppliersApi.createSupplier(data),
        onSuccess: () => {
            toast.success('Supplier added successfully')
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
            closeModal()
        },
        onError: (err) => {
            toast.error('Failed to add supplier')
            console.error(err)
        }
    })

    // Update Supplier Mutation
    const updateSupplierMutation = useMutation({
        mutationFn: ({ id, data }) => suppliersApi.updateSupplier(id, data),
        onSuccess: () => {
            toast.success('Supplier updated successfully')
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
            closeModal()
        },
        onError: (err) => {
            toast.error('Failed to update supplier')
            console.error(err)
        }
    })

    // Delete Supplier Mutation
    const deleteSupplierMutation = useMutation({
        mutationFn: (id) => suppliersApi.deleteSupplier(id),
        onSuccess: () => {
            toast.success('Supplier deleted successfully')
            queryClient.invalidateQueries({ queryKey: ['suppliers'] })
        },
        onError: (err) => {
            toast.error('Failed to delete supplier')
            console.error(err)
        }
    })

    // Create PO Mutation
    const createPOMutation = useMutation({
        mutationFn: (data) => suppliersApi.createPurchaseOrder(data),
        onSuccess: (data) => {
            setPoSuccess(true)
            toast.success(`PO ${data.po_number} created!`)
            setTimeout(() => {
                setShowPOModal(false)
                setPoSuccess(false)
                setSelectedSupplier(null)
                setPoItems([{ medicine_id: '', quantity: 1 }])
            }, 2000)
        },
        onError: (err) => {
            toast.error('Failed to create purchase order')
            console.error(err)
        }
    })

    const handleCreatePO = (supplier) => {
        setSelectedSupplier(supplier)
        setShowPOModal(true)
        setPoSuccess(false)
    }

    const handleEdit = (supplier) => {
        setIsEditing(true)
        setNewSupplier({
            id: supplier.id,
            name: supplier.name,
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            lead_time_days: supplier.lead_time_days || 7
        })
        setShowAddModal(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
            deleteSupplierMutation.mutate(id)
        }
    }

    const closeModal = () => {
        setShowAddModal(false)
        setIsEditing(false)
        setNewSupplier({ name: '', email: '', phone: '', address: '', lead_time_days: 7 })
    }

    const submitSupplier = (e) => {
        e.preventDefault()
        if (isEditing) {
            updateSupplierMutation.mutate({ id: newSupplier.id, data: newSupplier })
        } else {
            createSupplierMutation.mutate(newSupplier)
        }
    }

    const submitPO = () => {
        // Validate items
        const validItems = poItems.filter(i => i.medicine_id && i.quantity > 0)
        if (validItems.length === 0) {
            toast.error('Please add at least one valid item')
            return
        }

        const payload = {
            supplier_id: selectedSupplier.id,
            items: validItems.map(i => ({
                medicine_id: parseInt(i.medicine_id),
                quantity: parseInt(i.quantity)
            }))
        }
        createPOMutation.mutate(payload)
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-display text-secondary-900 tracking-tight">Suppliers</h1>
                    <p className="mt-1 text-sm text-secondary-500">Manage supplier relationships and procurement</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Supplier
                </button>
            </div>

            {/* AI Supplier Analysis Block */}
            <div className="glass-panel p-6 rounded-xl border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white">
                <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <span>🤝</span> AI Vendor Optimization
                </h3>
                <SuppliersAIBlock />
            </div>

            {/* Suppliers Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : suppliers && suppliers.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {suppliers.map((supplier) => (
                        <div key={supplier.id} className="glass-panel rounded-xl p-6 card-hover group relative">
                            {/* Actions */}
                            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(supplier)}
                                    className="p-1 text-secondary-400 hover:text-primary-600 hover:bg-secondary-100 rounded"
                                    title="Edit"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(supplier.id)}
                                    className="p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex justify-between items-start">
                                <div className="bg-primary-50 rounded-lg p-3">
                                    <span className="text-2xl">🏭</span>
                                </div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${supplier.is_active ? 'bg-success-50 text-success-700' : 'bg-secondary-100 text-secondary-700'
                                    }`}>
                                    {supplier.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-secondary-900 font-display">{supplier.name}</h3>
                            </div>

                            <div className="mt-6 space-y-3 pt-6 border-t border-secondary-100">
                                {supplier.email && (
                                    <div className="flex items-center text-sm text-secondary-600">
                                        <EnvelopeIcon className="h-4 w-4 mr-2 text-primary-400" />
                                        {supplier.email}
                                    </div>
                                )}
                                {supplier.phone && (
                                    <div className="flex items-center text-sm text-secondary-600">
                                        <PhoneIcon className="h-4 w-4 mr-2 text-primary-400" />
                                        {supplier.phone}
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-sm font-medium text-secondary-500">{supplier.lead_time_days} day lead time</span>
                                </div>
                                <button
                                    onClick={() => handleCreatePO(supplier)}
                                    className="text-primary-600 hover:text-primary-800 text-sm font-semibold flex items-center group-hover:translate-x-1 transition-transform"
                                >
                                    Create PO
                                    <DocumentTextIcon className="h-4 w-4 ml-1" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-secondary-50 rounded-xl border border-dashed border-secondary-300">
                    <p className="text-secondary-500">No suppliers found. Add one to get started.</p>
                </div>
            )}

            {/* Add/Edit Supplier Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-secondary-900">
                                {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
                            </h3>
                            <button onClick={closeModal} className="text-secondary-400 hover:text-secondary-500">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={submitSupplier} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border-secondary-300 focus:ring-primary-500 focus:border-primary-500"
                                    value={newSupplier.name}
                                    onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full rounded-lg border-secondary-300 focus:ring-primary-500 focus:border-primary-500"
                                        value={newSupplier.email}
                                        onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        className="w-full rounded-lg border-secondary-300 focus:ring-primary-500 focus:border-primary-500"
                                        value={newSupplier.phone}
                                        onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Address</label>
                                <textarea
                                    className="w-full rounded-lg border-secondary-300 focus:ring-primary-500 focus:border-primary-500"
                                    rows="2"
                                    value={newSupplier.address}
                                    onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Lead Time (Days)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border-secondary-300 focus:ring-primary-500 focus:border-primary-500"
                                    value={newSupplier.lead_time_days}
                                    onChange={e => setNewSupplier({ ...newSupplier, lead_time_days: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex gap-3 mt-6 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                                >
                                    {createSupplierMutation.isPending || updateSupplierMutation.isPending ? 'Saving...' : (isEditing ? 'Update Supplier' : 'Add Supplier')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PO Modal */}
            {showPOModal && (
                <div className="fixed inset-0 bg-secondary-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200">
                        {poSuccess ? (
                            <div className="text-center py-6">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100 mb-4">
                                    <CheckCircleIcon className="h-8 w-8 text-success-600" />
                                </div>
                                <h3 className="text-lg font-medium text-secondary-900">PO Sent Successfully!</h3>
                                <p className="text-sm text-secondary-500 mt-2">Purchase Order has been created for {selectedSupplier?.name}.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-secondary-900">Generate Purchase Order</h3>
                                    <button onClick={() => setShowPOModal(false)} className="text-secondary-400 hover:text-secondary-500">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-3 bg-secondary-50 rounded-lg border border-secondary-200">
                                        <p className="text-sm font-medium text-secondary-700">Supplier</p>
                                        <p className="text-sm text-secondary-500">{selectedSupplier?.name}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-secondary-700 mb-2">Order Items</label>
                                        {poItems.map((item, idx) => (
                                            <div key={idx} className="flex gap-2 mb-2">
                                                <select
                                                    className="flex-1 rounded-md border-secondary-300 text-sm focus:ring-primary-500 focus:border-primary-500"
                                                    value={item.medicine_id}
                                                    onChange={e => {
                                                        const newItems = [...poItems]
                                                        newItems[idx].medicine_id = e.target.value
                                                        setPoItems(newItems)
                                                    }}
                                                >
                                                    <option value="">Select Medicine</option>
                                                    {medicines && medicines.map(m => (
                                                        <option key={m.id} value={m.id}>{m.name} ({m.sku})</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    placeholder="Qty"
                                                    className="w-24 rounded-md border-secondary-300 text-sm focus:ring-primary-500 focus:border-primary-500"
                                                    value={item.quantity}
                                                    onChange={e => {
                                                        const newItems = [...poItems]
                                                        newItems[idx].quantity = e.target.value
                                                        setPoItems(newItems)
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setPoItems([...poItems, { medicine_id: '', quantity: 1 }])}
                                            className="text-sm text-primary-600 font-medium hover:text-primary-700"
                                        >
                                            + Add Item
                                        </button>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={() => setShowPOModal(false)}
                                            className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg text-sm font-medium text-secondary-700 hover:bg-secondary-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={submitPO}
                                            disabled={createPOMutation.isPending}
                                            className="flex-1 px-4 py-2 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                                        >
                                            {createPOMutation.isPending ? 'Processing...' : 'Create PO'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

function SuppliersAIBlock() {
    const [enabled, setEnabled] = useState(false)

    const { data: aiAnalysis, isLoading, isError, refetch } = useQuery({
        queryKey: ['suppliers-ai'],
        queryFn: () => suppliersApi.getAIAnalysis(),
        enabled: enabled,
        staleTime: 300000
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
                    className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
                >
                    Click to Analyze Vendor Performance
                </button>
            </div>
        )
    }

    if (isLoading) return <div className="text-sm text-gray-500 animate-pulse">Analyzing vendor performance...</div>

    if (isError) return <div className="text-sm text-red-500">Analysis unavailable right now.</div>

    return (
        <div className="text-sm text-gray-700 whitespace-pre-line prose prose-blue max-w-none">
            {aiAnalysis?.analysis || "No supplier data available."}
        </div>
    )
}
