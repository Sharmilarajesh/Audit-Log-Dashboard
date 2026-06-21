import { useEffect, useState } from 'react'
import { getLogs } from '../api'
import LogTable from '../components/LogTable'
import FilterPanel from '../components/FilterPanel'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'
import { Database, ShieldAlert, AlertTriangle } from 'lucide-react'

const LIMIT = 10

export default function DashboardPage() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [sortField, setSortField] = useState('timestamp')
  const [sortOrder, setSortOrder] = useState('desc')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({ total: 0, high: 0, unresolved: 0 })

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await getLogs({ page, limit: LIMIT, search, sortField, sortOrder, ...filters })
      setLogs(res.data.logs)
      setTotal(res.data.total)
      setTotalPages(res.data.totalPages)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const fetchStats = async () => {
    try {
      const [all, high, unresolved] = await Promise.all([
        getLogs({ page: 1, limit: 1 }),
        getLogs({ page: 1, limit: 1, severity: 'HIGH' }),
        getLogs({ page: 1, limit: 1, status: 'Unresolved' }),
      ])
      setStats({ total: all.data.total, high: high.data.total, unresolved: unresolved.data.total })
    } catch (err) { console.error(err) }
  }

  useEffect(() => { fetchLogs() }, [page, search, filters, sortField, sortOrder])
  useEffect(() => { fetchStats() }, [])

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortOrder('desc') }
    setPage(1)
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: '#1c1c1c' }}>Audit Log Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9a6a4a' }}>Monitor and investigate system activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Logs', value: stats.total, icon: Database, iconColor: '#f97316', bg: '#fff7ed' },
          { label: 'HIGH Severity', value: stats.high, icon: ShieldAlert, iconColor: '#dc2626', bg: '#fef2f2' },
          { label: 'Unresolved', value: stats.unresolved, icon: AlertTriangle, iconColor: '#d97706', bg: '#fffbeb' },
        ].map(({ label, value, icon: Icon, iconColor, bg }) => (
          <div key={label} className="rounded-xl px-5 py-4 flex items-center gap-4" style={{ background: '#fff', border: '1px solid #ffe0c2' }}>
            <div className="rounded-lg p-2.5" style={{ background: bg }}>
              <Icon size={20} style={{ color: iconColor }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: '#9a6a4a' }}>{label}</p>
              <p className="text-2xl font-semibold" style={{ color: '#1c1c1c' }}>{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="rounded-xl px-4 py-3 flex flex-wrap gap-3 items-center" style={{ background: '#fff', border: '1px solid #ffe0c2' }}>
        <SearchBar onSearch={(v) => { setSearch(v); setPage(1) }} />
        <FilterPanel
          filters={filters}
          onChange={(v) => { setFilters(v); setPage(1) }}
          onClear={() => { setFilters({}); setPage(1) }}
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-sm" style={{ color: '#c4a882' }}>Loading...</div>
      ) : (
        <>
          <LogTable logs={logs} sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
          {total > 0 && (
            <Pagination page={page} totalPages={totalPages} total={total} limit={LIMIT} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  )
}