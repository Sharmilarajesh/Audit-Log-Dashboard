import { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import UploadModal from './components/UploadModal'
import { ShieldCheck, Upload } from 'lucide-react'

export default function App() {
  const [showUpload, setShowUpload] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUploadSuccess = () => {
    setShowUpload(false)
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="min-h-screen" style={{ background: '#fffaf5' }}>
      {/* Navbar */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ffe0c2' }} className="px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div style={{ background: '#f97316', borderRadius: '7px' }} className="w-8 h-8 flex items-center justify-center">
              <ShieldCheck size={16} color="#fff" />
            </div>
            <span className="text-lg font-semibold" style={{ color: '#1c1c1c' }}>AuditWatch</span>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            style={{ background: '#f97316', color: '#fff', borderRadius: '7px' }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Upload size={14} />
            Upload Logs
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <DashboardPage key={refreshKey} />
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}