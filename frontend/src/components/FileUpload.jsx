import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventory'
import toast from 'react-hot-toast'

export default function FileUpload({ onSuccess, onClose }) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState(null)

  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('file', file)

      const response = await inventoryApi.uploadFile(file)
      return response
    },
    onSuccess: (data) => {
      setUploadResult(data)
      setUploadProgress(100)

      if (data.error_count === 0) {
        toast.success(
          `Upload successful! ${data.success_count} items processed.`,
          { duration: 5000 }
        )
      } else {
        toast.error(
          `Upload completed with ${data.error_count} errors. ${data.success_count} items processed.`,
          { duration: 7000 }
        )
      }

      if (data.warning_count > 0) {
        toast(`⚠️ ${data.warning_count} warnings`, { duration: 5000 })
      }

      // Wait a moment for backend to fully commit data, then invalidate and refetch
      // Use longer delay to ensure backend has fully committed and is ready
      setTimeout(async () => {
        try {
          console.log('DEBUG: Starting query invalidation and refetch...')

          // Invalidate all related queries first
          await queryClient.invalidateQueries({ queryKey: ['medicines'] })
          await queryClient.invalidateQueries({ queryKey: ['stock-levels'] })
          await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
          await queryClient.invalidateQueries({ queryKey: ['alerts'] })

          // Force refetch and wait for completion to ensure data is loaded
          const [medicinesResult, stockResult, dashboardResult] = await Promise.all([
            queryClient.refetchQueries({ queryKey: ['medicines'], exact: false }),
            queryClient.refetchQueries({ queryKey: ['stock-levels'], exact: false }),
            queryClient.refetchQueries({ queryKey: ['dashboard'], exact: false })
          ])

          // Log for debugging
          console.log('DEBUG: Refetch completed')

          // Extract data from results
          const medicinesData = medicinesResult?.[0]?.state?.data || medicinesResult?.[0]?.data || []
          const stockData = stockResult?.[0]?.state?.data || stockResult?.[0]?.data || []

          console.log(`DEBUG: Medicines count: ${medicinesData.length}, Stock levels count: ${stockData.length}`)

          if (medicinesData.length === 0 && data.success_count > 0) {
            console.warn('WARNING: Upload succeeded but no medicines returned. Check backend logs and expiry dates.')
          } else if (medicinesData.length > 0) {
            console.log('✅ Data successfully loaded:', medicinesData.length, 'medicines')
          }

          // Close modal after data is loaded
          if (onSuccess) {
            onSuccess()
          }
        } catch (error) {
          console.error('Error refetching data after upload:', error)
          // Still close modal even if refetch fails
          if (onSuccess) {
            onSuccess()
          }
        }
      }, 1000) // 1 second delay to ensure backend commit is complete
    },
    onError: (error) => {
      setUploadProgress(0)
      const errorMessage = error.response?.data?.detail || 'Upload failed. Please try again.'
      toast.error(errorMessage, { duration: 7000 })
    },
  })

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const file = files[0]

    if (file) {
      validateAndSetFile(file)
    }
  }, [])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file) => {
    // Check file type
    const validExtensions = ['.xlsx', '.xls', '.csv', '.json']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!validExtensions.includes(fileExtension)) {
      toast.error('Invalid file type. Please upload Excel (.xlsx, .xls), CSV (.csv), or JSON (.json) files.')
      return
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit.')
      return
    }

    setSelectedFile(file)
    setUploadResult(null)
    setUploadProgress(0)
  }

  const handleUpload = () => {
    if (selectedFile) {
      setUploadProgress(0)
      // Simulate progress (actual progress would come from axios interceptors in production)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      uploadMutation.mutate(selectedFile, {
        onSettled: () => {
          clearInterval(progressInterval)
        },
      })
    }
  }

  const handleDownloadTemplate = (format) => {
    try {
      // Hardcoded to 8000 to resolve user's local port mismatch
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const url = `${baseUrl}/api/inventory/download-template?format=${format}`

      // Direct navigation is most reliable for downloads
      window.location.href = url

      toast.success(`Downloading ${format.toUpperCase()} template...`)
    } catch (error) {
      toast.error('Failed to initiate download')
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Inventory File</h2>
            <p className="text-sm text-gray-600 mt-1">
              Upload Excel, CSV, or JSON files to update your inventory
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Download Templates */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Download Template:</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownloadTemplate('excel')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Excel Template
              </button>
              <button
                onClick={() => handleDownloadTemplate('csv')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                CSV Template
              </button>
              <button
                onClick={() => handleDownloadTemplate('json')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                JSON Template
              </button>
            </div>
          </div>

          {/* Upload Area */}
          {!uploadResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragging
                ? 'border-primary-500 bg-primary-50'
                : selectedFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
                }`}
            >
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">or</p>
                  </div>
                  <label className="inline-block">
                    <span className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer transition-colors text-sm font-medium">
                      Browse Files
                    </span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv,.json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: Excel (.xlsx, .xls), CSV (.csv), JSON (.json) • Max size: 10MB
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload Progress */}
          {uploadMutation.isPending && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Upload Results */}
          {uploadResult && (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-semibold text-green-900">Upload Summary</h3>
                </div>
                {uploadResult.data_type && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Data Type: {uploadResult.data_type.charAt(0).toUpperCase() + uploadResult.data_type.slice(1)}
                    </span>
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-700">Total Rows Processed</p>
                    <p className="text-2xl font-bold text-green-900">{uploadResult.total_rows}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-700">Successfully Processed</p>
                    <p className="text-2xl font-bold text-green-900">{uploadResult.success_count}</p>
                  </div>
                  {uploadResult.error_count > 0 && (
                    <div>
                      <p className="text-sm text-red-700">Errors</p>
                      <p className="text-2xl font-bold text-red-900">{uploadResult.error_count}</p>
                    </div>
                  )}
                  {uploadResult.warning_count > 0 && (
                    <div>
                      <p className="text-sm text-yellow-700">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-900">{uploadResult.warning_count}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Errors */}
              {uploadResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-red-900 mb-2">Errors ({uploadResult.errors.length})</h4>
                  <ul className="space-y-1">
                    {uploadResult.errors.map((error, idx) => (
                      <li key={idx} className="text-xs text-red-700">{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {uploadResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-yellow-900 mb-2">Warnings ({uploadResult.warnings.length})</h4>
                  <ul className="space-y-1">
                    {uploadResult.warnings.map((warning, idx) => (
                      <li key={idx} className="text-xs text-yellow-700">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Data (for non-inventory files) */}
              {uploadResult.preview && uploadResult.preview.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Data Preview (First {uploadResult.preview.length} rows)</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="bg-blue-100">
                          {Object.keys(uploadResult.preview[0]).map((key) => (
                            <th key={key} className="px-2 py-1 text-left font-medium text-blue-900">{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResult.preview.map((row, idx) => (
                          <tr key={idx} className="border-b border-blue-200">
                            {Object.values(row).map((value, colIdx) => (
                              <td key={colIdx} className="px-2 py-1 text-blue-800">{String(value)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Columns Info (for generic files) */}
              {uploadResult.columns && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Detected Columns</h4>
                  <div className="flex flex-wrap gap-2">
                    {uploadResult.columns.map((col, idx) => (
                      <span key={idx} className="px-2 py-1 bg-white rounded text-xs text-gray-700 border border-gray-300">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {uploadResult ? 'Close' : 'Cancel'}
            </button>
          )}
          {!uploadResult && selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
