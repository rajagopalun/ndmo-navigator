import { useState, useRef, useEffect } from 'react'
import { Search, X, ShieldCheck } from 'lucide-react'
import { search } from '../lib/search.js'
export default function TopBar({ onPick }) {
  const [q, setQ] = useState(''); const [open, setOpen] = useState(false); const box = useRef(null)
  const res = search(q); const groups = Object.entries(res)
  useEffect(() => { const h = e => { if (!box.current?.contains(e.target)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  return (
    <header className="bg-ksa text-white shadow">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
        <div className="flex items-center gap-2"><ShieldCheck aria-hidden size={26} /><div><h1 className="text-lg font-semibold leading-tight">NDMO / NDI Compliance Navigator</h1>
          <p className="text-xs text-emerald-100">NDMO Standards v1.5 · NDI v1.1 · OE (Nov 2025)</p></div></div>
        <div ref={box} className="relative ml-auto w-full max-w-xl">
          <label htmlFor="gs" className="sr-only">Search</label>
          <Search aria-hidden className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input id="gs" value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Search keyword, spec (DG.1.1), NDI code (DG.MQ.1, DSI.OE.01)…"
            className="w-full rounded-lg py-2 pl-9 pr-9 text-sm text-slate-800 placeholder-slate-400" />
          {q && <button aria-label="Clear search" onClick={() => setQ('')} className="absolute right-2 top-2 text-slate-400"><X size={18} /></button>}
          {open && q && (
            <div role="listbox" className="absolute z-30 mt-1 max-h-96 w-full overflow-auto rounded-lg bg-white p-2 text-slate-800 shadow-xl">
              {!groups.length && <p className="p-3 text-sm text-slate-500">No matches.</p>}
              {groups.map(([type, list]) => (<div key={type}><p className="px-2 pt-2 text-xs font-semibold uppercase text-ksa">{type}</p>
                {list.map(r => (<button key={r.type + r.id} role="option" onClick={() => { onPick(r); setOpen(false) }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-ksa-light">
                  <span className="text-xs font-mono text-slate-500">{r.sub}</span><span className="block truncate text-sm">{r.title}</span></button>))}</div>))}
            </div>)}
        </div>
      </div>
    </header>)
}
