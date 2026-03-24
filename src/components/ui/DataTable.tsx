import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DataTable({ columns, data, searchable = true, searchPlaceholder = 'Rechercher...', pageSize = 10, onRowClick = null, actions = null }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Filter
  const filtered = data.filter(row => {
    if (!search) return true;
    const s = search.toLowerCase();
    return columns.some(col => {
      const val = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]) : '';
      return String(val).toLowerCase().includes(s);
    });
  });

  // Sort
  const sorted = sortCol !== null ? [...filtered].sort((a, b) => {
    const col = columns[sortCol];
    const aVal = typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor];
    const bVal = typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor];
    const cmp = String(aVal).localeCompare(String(bVal), 'fr', { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  }) : filtered;

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (idx) => {
    if (sortCol === idx) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(idx);
      setSortDir('asc');
    }
  };

  return (
    <div>
      {(searchable || actions) && (
        <div className="filter-bar">
          {searchable && (
            <div className="search-input-wrap">
              <Search size={16} />
              <input className="search-input" placeholder={searchPlaceholder} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {actions}
          </div>
        </div>
      )}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} onClick={() => col.sortable !== false && handleSort(i)} style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}>
                  {col.header}
                  {sortCol === i && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Aucun résultat</td></tr>
            ) : paginated.map((row, ri) => (
              <tr key={row.id || ri} onClick={() => onRowClick?.(row)}>
                {columns.map((col, ci) => (
                  <td key={ci}>
                    {col.render ? col.render(row) : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
          <span>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
          <div className="pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              return <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
            })}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
