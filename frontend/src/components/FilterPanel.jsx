const selectStyle = {
  background: '#fff',
  border: '1px solid #ffe0c2',
  color: '#0f172a',
  borderRadius: '8px',
  padding: '0 12px',
  height: '38px',
  fontSize: '13px',
  outline: 'none',
  cursor: 'pointer',
}

export default function FilterPanel({ filters, onChange, onClear }) {
  const handle = (key, val) => onChange({ ...filters, [key]: val })

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select value={filters.severity || ''} onChange={(e) => handle('severity', e.target.value)} style={selectStyle}>
        <option value="">All Severities</option>
        <option value="LOW">LOW</option>
        <option value="MEDIUM">MEDIUM</option>
        <option value="HIGH">HIGH</option>
        <option value="CRITICAL">CRITICAL</option>
      </select>

      <select value={filters.status || ''} onChange={(e) => handle('status', e.target.value)} style={selectStyle}>
        <option value="">All Statuses</option>
        <option value="Resolved">Resolved</option>
        <option value="Unresolved">Unresolved</option>
      </select>

      <select value={filters.role || ''} onChange={(e) => handle('role', e.target.value)} style={selectStyle}>
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
      </select>

      <button
        onClick={onClear}
        className="text-sm px-4 rounded-lg transition-colors hover:bg-orange-50"
        style={{ height: '38px', color: '#9a6a4a', border: '1px solid #ffe0c2', cursor: 'pointer' }}
      >
        Clear
      </button>
    </div>
  )
}