import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const t = setTimeout(() => onSearch(value), 500)
    return () => clearTimeout(t)
  }, [value])

  return (
    <div className="relative flex-1">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#c4a882' }} />
      <input
        type="text"
        placeholder="Search by actor, action, resource..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full text-sm pl-9 pr-4 rounded-lg outline-none transition-colors"
        style={{ height: '38px', background: '#fff', border: '1px solid #ffe0c2', color: '#0f172a' }}
        onFocus={(e) => e.target.style.borderColor = '#f97316'}
        onBlur={(e) => e.target.style.borderColor = '#ffe0c2'}
      />
    </div>
  )
}