import { ChevronUp, ChevronDown } from 'lucide-react'

const SEVERITY_BADGES = {
  LOW: {
    bg: '#f0fdf4',
    text: '#166534',
    border: '#dcfce7',
    dot: '#22c55e',
  },
  MEDIUM: {
    bg: '#fffbeb',
    text: '#92400e',
    border: '#fef3c7',
    dot: '#f59e0b',
  },
  HIGH: {
    bg: '#fef2f2',
    text: '#991b1b',
    border: '#fee2e2',
    dot: '#ef4444',
  },
  CRITICAL: {
    bg: '#fdf2f8',
    text: '#9d174d',
    border: '#fce7f3',
    dot: '#ec4899',
  },
}

const STATUS_BADGES = {
  Resolved: {
    bg: '#f0fdf4',
    text: '#166534',
    border: '#dcfce7',
    dot: '#22c55e',
  },
  Unresolved: {
    bg: '#fef2f2',
    text: '#991b1b',
    border: '#fee2e2',
    dot: '#ef4444',
  },
}

const COLUMNS = [
  { label: 'Actor',         field: 'actor',     sortable: true  },
  { label: 'Role',          field: 'role',      sortable: false },
  { label: 'Action',        field: 'action',    sortable: false },
  { label: 'Resource',      field: 'resource',  sortable: false },
  { label: 'Resource Type', field: 'resourceType', sortable: false },
  { label: 'IP Address',    field: 'ipAddress', sortable: false },
  { label: 'Region',        field: 'region',    sortable: false },
  { label: 'Severity',      field: 'severity',  sortable: true  },
  { label: 'Status',        field: 'status',    sortable: false },
  { label: 'Timestamp',     field: 'timestamp', sortable: true  },
]

export default function LogTable({ logs, sortField, sortOrder, onSort }) {
  const renderSort = (field) => {
    const isSorted = sortField === field
    const isAsc = isSorted && sortOrder === 'asc'
    const isDesc = isSorted && sortOrder === 'desc'

    return (
      <div className="inline-flex flex-col ml-1 -space-y-1 select-none">
        <ChevronUp
          size={11}
          style={{
            color: isAsc ? '#f97316' : '#9a6a4a',
            strokeWidth: isAsc ? 3.5 : 2
          }}
        />
        <ChevronDown
          size={11}
          style={{
            color: isDesc ? '#f97316' : '#9a6a4a',
            strokeWidth: isDesc ? 3.5 : 2
          }}
        />
      </div>
    )
  }

  return (
    <div className="overflow-auto rounded-xl custom-scrollbar" style={{ border: '1px solid #ffe0c2', maxHeight: '500px' }}>
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10">
          <tr style={{ borderBottom: '1px solid #ffe0c2' }}>
            {COLUMNS.map((col) => (
              <th
                key={col.field}
                onClick={() => col.sortable && onSort(col.field)}
                className="px-4 py-3 text-left whitespace-nowrap font-medium bg-[#fff7f0]"
                style={{ color: '#9a6a4a', cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && renderSort(col.field)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center py-16 text-sm" style={{ color: '#c4a882', background: '#fff' }}>
                No logs found
              </td>
            </tr>
          ) : (
            logs.map((log, index) => (
              <tr
                key={log._id}
                style={{ borderBottom: '1px solid #fff0e6', background: '#fff' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fffaf5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
              >
                <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: '#0f172a' }}>{log.actor}</td>
                <td className="px-4 py-3 capitalize whitespace-nowrap" style={{ color: '#374151' }}>{log.role}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={{ color: '#374151' }}>{log.action}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={{ color: '#374151' }}>{log.resource}</td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#374151' }}>{log.resourceType}</td>
                <td className="px-4 py-3 whitespace-nowrap font-mono text-xs" style={{ color: '#374151' }}>{log.ipAddress}</td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: '#374151' }}>{log.region}</td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: SEVERITY_BADGES[log.severity]?.bg || '#f3f4f6',
                      color: SEVERITY_BADGES[log.severity]?.text || '#374151',
                      borderColor: SEVERITY_BADGES[log.severity]?.border || '#e5e7eb'
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: SEVERITY_BADGES[log.severity]?.dot || '#9ca3af' }}
                    />
                    {log.severity}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: STATUS_BADGES[log.status]?.bg || '#f3f4f6',
                      color: STATUS_BADGES[log.status]?.text || '#374151',
                      borderColor: STATUS_BADGES[log.status]?.border || '#e5e7eb'
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: STATUS_BADGES[log.status]?.dot || '#9ca3af' }}
                    />
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: '#9a6a4a' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}