import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs" style={{ color: '#9a6a4a' }}>
        Showing <span style={{ color: '#1c1c1c', fontWeight: 500 }}>{from}</span> to{' '}
        <span style={{ color: '#1c1c1c', fontWeight: 500 }}>{to}</span> of{' '}
        <span style={{ color: '#1c1c1c', fontWeight: 500 }}>{total.toLocaleString()}</span> results
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{ background: '#fff', border: '1px solid #ffe0c2' }}
        >
          <ChevronLeft size={15} style={{ color: '#9a6a4a' }} />
        </button>
        <span className="text-xs" style={{ color: '#9a6a4a' }}>
          Page <span style={{ color: '#1c1c1c', fontWeight: 500 }}>{page}</span> of{' '}
          <span style={{ color: '#1c1c1c', fontWeight: 500 }}>{totalPages}</span>
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{ background: '#fff', border: '1px solid #ffe0c2' }}
        >
          <ChevronRight size={15} style={{ color: '#9a6a4a' }} />
        </button>
      </div>
    </div>
  )
}