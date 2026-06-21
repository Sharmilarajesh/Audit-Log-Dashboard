import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { uploadLogs } from '../api'
import { X, FileSpreadsheet, Upload, Download, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'

const REQUIRED_COLUMNS = ['actor','role','action','resource','resourceType','ipAddress','region','severity','status','timestamp']

export default function UploadModal({ onClose, onSuccess }) {
  const inputRef = useRef()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [rowCount, setRowCount] = useState(0)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState([])
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const parseFile = (f) => {
    setError(''); setSuccess(''); setPreview([]); setValidationErrors([])
    if (!f.name.endsWith('.xlsx')) { setError('Only .xlsx files are accepted'); return }
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
        if (rows.length === 0) { setError('Excel file is empty'); return }
        const missing = REQUIRED_COLUMNS.filter(c => !Object.keys(rows[0]).includes(c))
        if (missing.length > 0) { setError(`Missing columns: ${missing.join(', ')}`); return }
        setFile(f)
        setRowCount(rows.length)
        setPreview(rows.slice(0, 5))
      } catch (err) {
        setError('Failed to parse Excel file. Please ensure it is a valid, uncorrupted .xlsx spreadsheet.')
        setFile(null)
        setPreview([])
      }
    }
    reader.onerror = () => {
      setError('Failed to read file. If it is open in Excel, please close Excel and try selecting it again.')
      setFile(null)
      setPreview([])
    }
    try {
      reader.readAsBinaryString(f)
    } catch (err) {
      setError('Failed to load file. Please try again.')
      setFile(null)
      setPreview([])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); setError(''); setSuccess(''); setValidationErrors([])
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
        const normalized = rows.map(row => {
          let isoTimestamp
          try {
            isoTimestamp = row.timestamp instanceof Date
              ? row.timestamp.toISOString()
              : new Date(row.timestamp).toISOString()
            if (isoTimestamp === 'Invalid Date' || isNaN(new Date(isoTimestamp).getTime())) {
              throw new Error()
            }
          } catch (err) {
            isoTimestamp = row.timestamp || ''
          }
          return {
            ...row,
            severity: String(row.severity).toUpperCase(),
            timestamp: isoTimestamp
          }
        })
        const res = await uploadLogs(normalized)
        setSuccess(res.data.message)
        setFile(null); setPreview([])
        setTimeout(() => onSuccess(), 1200)
      } catch (err) {
        const data = err.response?.data
        if (data?.errors?.length > 0) {
          setValidationErrors(data.errors)
          setError(data.message)
        } else {
          setError(data?.message || err.message || 'Upload failed')
        }
      } finally {
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setError('File read error. If you edited the file, please re-select or drop the file again.')
      setLoading(false)
    }
    try {
      reader.readAsBinaryString(file)
    } catch (err) {
      setError('Failed to load file. Please select it again.')
      setLoading(false)
    }
  }

  const handleDownloadSample = () => {
    const sample = [
      { actor: 'priya.nair@company.com', role: 'admin', action: 'DELETE_USER', resource: '/api/users/334', resourceType: 'USER', ipAddress: '192.168.1.45', region: 'ap-south-1', severity: 'HIGH', status: 'Unresolved', timestamp: '2025-06-14T08:32:11Z' },
      { actor: 'john.doe@company.com', role: 'viewer', action: 'VIEW_USER', resource: '/api/users/120', resourceType: 'USER', ipAddress: '10.0.0.1', region: 'us-east-1', severity: 'LOW', status: 'Resolved', timestamp: '2025-06-14T09:00:00Z' }
    ]
    const ws = XLSX.utils.json_to_sheet(sample)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Logs')
    XLSX.writeFile(wb, 'sample_logs.xlsx')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-2xl shadow-xl flex flex-col"
        style={{ background: '#fff', border: '1px solid #ffe0c2', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid #ffe0c2' }}>
          <div>
            <h2 className="text-base font-semibold" style={{ color: '#1c1c1c' }}>Upload Audit Logs</h2>
            <p className="text-xs mt-0.5" style={{ color: '#9a6a4a' }}>Upload an .xlsx file — all rows validated before storing</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-orange-50 transition-colors">
            <X size={18} style={{ color: '#9a6a4a' }} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto">

          {/* Drop Zone */}
          <div
            onClick={() => inputRef.current.click()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && parseFile(e.dataTransfer.files[0]) }}
            onDragOver={(e) => e.preventDefault()}
            className="rounded-xl cursor-pointer flex flex-col items-center justify-center py-8 gap-3 transition-colors"
            style={{ border: '2px dashed #fbbf24', background: '#fffaf5' }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0]) {
                  parseFile(e.target.files[0])
                  e.target.value = ''
                }
              }}
            />
            <div style={{ background: '#fff7ed', borderRadius: '10px' }} className="p-3">
              <FileSpreadsheet size={26} style={{ color: '#f97316' }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: '#1c1c1c' }}>Drop your Excel file here or click to browse</p>
              <p className="text-xs mt-1" style={{ color: '#9a6a4a' }}>Only .xlsx files accepted</p>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={16} style={{ color: '#f97316' }} />
                <span className="text-sm font-medium" style={{ color: '#1c1c1c' }}>{file.name}</span>
                <span className="text-xs" style={{ color: '#9a6a4a' }}>{rowCount.toLocaleString()} rows</span>
              </div>
              <button onClick={() => { setFile(null); setPreview([]); setValidationErrors([]) }}>
                <X size={15} style={{ color: '#9a6a4a' }} />
              </button>
            </div>
          )}

          {/* File-level error (missing columns etc) */}
          {error && validationErrors.length === 0 && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-lg" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
              <AlertCircle size={15} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
              <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
            </div>
          )}

          {/* Validation Error Table */}
          {validationErrors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                <AlertTriangle size={15} style={{ color: '#dc2626', flexShrink: 0 }} />
                <p className="text-sm font-medium" style={{ color: '#dc2626' }}>{error}</p>
              </div>
              <div className="text-xs px-4 py-3 rounded-lg mb-4" style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#b45309' }}>
                <span className="font-semibold block mb-1">⚠️ Crucial Note on Upload Errors:</span>
                Since validation failed, <strong>no logs were saved to the database</strong>. 
                Please open your original Excel spreadsheet, locate the exact row numbers shown below (Row 2 is the first data row), fix the problems, and re-upload the spreadsheet.
              </div>
              <p className="text-xs font-medium mb-2" style={{ color: '#9a6a4a' }}>
                Fix the following rows in your Excel file and re-upload:
              </p>
              <div className="rounded-lg overflow-hidden custom-scrollbar" style={{ border: '1px solid #fecaca', maxHeight: '220px', overflowY: 'auto' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: '#dc2626' }}>Row</th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: '#dc2626' }}>Field</th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: '#dc2626' }}>Issue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationErrors.map((err, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #fee2e2', background: i % 2 === 0 ? '#fff' : '#fff5f5' }}>
                        <td className="px-3 py-2 font-mono font-medium" style={{ color: '#991b1b' }}>{err.row}</td>
                        <td className="px-3 py-2 font-mono" style={{ color: '#374151' }}>{err.field}</td>
                        <td className="px-3 py-2" style={{ color: '#374151' }}>{err.issue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={15} style={{ color: '#16a34a' }} />
              <p className="text-sm" style={{ color: '#16a34a' }}>{success}</p>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && validationErrors.length === 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: '#9a6a4a' }}>Preview — first 5 rows</p>
              <div className="overflow-x-auto rounded-lg custom-scrollbar" style={{ border: '1px solid #ffe0c2' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: '#fff7f0', borderBottom: '1px solid #ffe0c2' }}>
                      {REQUIRED_COLUMNS.map(col => (
                        <th key={col} className="px-3 py-2 text-left whitespace-nowrap font-medium" style={{ color: '#9a6a4a' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #fff0e6' }}>
                        {REQUIRED_COLUMNS.map(col => (
                          <td key={col} className="px-3 py-2 whitespace-nowrap" style={{ color: '#374151' }}>{String(row[col])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ background: '#f97316', color: '#fff' }}
            >
              <Upload size={14} />
              {loading ? 'Uploading...' : 'Upload Logs'}
            </button>
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa' }}
            >
              <Download size={14} />
              Download Sample Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}