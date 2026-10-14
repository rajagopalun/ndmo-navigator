import { useState, useMemo, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { buildIndex } from '../lib/search.js'
export default function SearchBox({ onSearch, go, big, placeholder = 'Search requirement ID or keyword' }) {
  const { nodes, langKey } = useApp(), [q, setQ] = useState(''), [open, setOpen] = useState(false), [hi, setHi] = useState(-1), ref = useRef(null)
  const idx = useMemo(buildIndex, [nodes, langKey])
  const sug = useMemo(() => { const t = q.trim().toLowerCase(); if (!t) return []; const terms = t.split(/\s+/)
    return idx.filter(i => terms.every(x => `${i.code} ${i.title} ${i.group}`.toLowerCase().includes(x))).sort((a, b) => b.code.toLowerCase().startsWith(t) - a.code.toLowerCase().startsWith(t)).slice(0, 8) }, [q, idx])
  useEffect(() => { const h = e => { if (!ref.current?.contains(e.target)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  const pick = i => { setOpen(false); setQ(''); go(i.nav) }, run = () => { setOpen(false); onSearch(q); setQ('') }
  const key = e => { if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, sug.length - 1)) } else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, -1)) } else if (e.key === 'Enter') { e.preventDefault(); hi >= 0 ? pick(sug[hi]) : run() } else if (e.key === 'Escape') setOpen(false) }
  return (<div ref={ref} className={`relative w-full ${big ? '' : 'max-w-sm'}`}><Search aria-hidden className={`absolute start-3 text-slate-400 ${big ? 'top-3.5' : 'top-2.5'}`} size={big ? 20 : 16} />
    <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); setHi(-1) }} onFocus={() => setOpen(true)} onKeyDown={key} role="combobox" aria-expanded={open && sug.length > 0} aria-label="Search requirements" placeholder={placeholder}
      className={big ? 'w-full rounded-full border border-slate-300 bg-white py-3 pe-28 ps-12 text-base text-slate-800 shadow-sm' : 'w-full rounded-lg py-2 pe-3 ps-9 text-sm text-slate-800'} />
    {big && <button type="button" onClick={run} className="absolute end-1.5 top-1.5 rounded-full bg-ksa px-5 py-2 text-sm font-medium text-white">Search</button>}
    {open && q.trim() && <ul role="listbox" className="absolute z-50 mt-1 max-h-96 w-full overflow-auto rounded-xl border bg-white py-1 text-slate-800 shadow-xl">
      {sug.map((i, n) => <li key={i.key} role="option" aria-selected={n === hi}><button type="button" onMouseEnter={() => setHi(n)} onClick={() => pick(i)} className={`flex w-full items-start gap-2 px-3 py-2 text-start text-sm ${n === hi ? 'bg-ksa-light' : ''}`}><span className="shrink-0 rounded bg-ksa-light px-1.5 font-mono text-xs text-ksa-dark">{i.code}</span><span className="min-w-0 flex-1 break-words">{i.title}</span></button></li>)}
      <li><button type="button" onClick={run} className="w-full border-t px-3 py-2 text-start text-xs text-ksa">Search all results for “{q}”</button></li></ul>}</div>)
}
