import { useState, useRef, useEffect } from 'react'
import { Search, X, ShieldCheck, LogOut } from 'lucide-react'
import { search } from '../lib/search.js'
import { useApp } from '../lib/store.jsx'
const TABS = [['ndmo', 'NDMO'], ['ndi', 'NDI'], ['oe', 'NDI OE'], ['dash', 'Dashboard'], ['profile', 'Profile']]
export default function TopBar({ tab, setTab, go }) {
  const { profile, user, logout } = useApp(), [q, setQ] = useState(''), [open, setOpen] = useState(false), box = useRef(null), groups = Object.entries(search(q))
  useEffect(() => { const h = e => { if (!box.current?.contains(e.target)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  return (<header className="bg-ksa text-white shadow">
    <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4 px-4 py-2">
      <div className="flex items-center gap-2">{profile.logo ? <img src={profile.logo} alt="Logo" className="max-h-10 rounded bg-white p-0.5" /> : <ShieldCheck size={26} />}
        <div><h1 className="text-base font-semibold leading-tight">NDMO / NDI Compliance Tracker</h1><p className="text-[11px] opacity-80">NDMO v1.5 · NDI v1.1 · OE 2026</p></div></div>
      <div ref={box} className="relative ml-auto w-full max-w-md">
        <Search aria-hidden className="absolute left-3 top-2.5 text-slate-400" size={16} /><label htmlFor="gs" className="sr-only">Search</label>
        <input id="gs" value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Search keyword, DG.1.1, DG.MQ.1, DSI.OE.01…" className="w-full rounded-lg py-2 pl-9 pr-8 text-sm text-slate-800" />
        {q && <button aria-label="Clear" onClick={() => setQ('')} className="absolute right-2 top-2 text-slate-400"><X size={16} /></button>}
        {open && q && <div className="absolute z-30 mt-1 max-h-96 w-full overflow-auto rounded-lg bg-white p-2 text-slate-800 shadow-xl">
          {!groups.length && <p className="p-3 text-sm text-slate-500">No matches.</p>}
          {groups.map(([t, l]) => <div key={t}><p className="px-2 pt-2 text-xs font-semibold uppercase text-ksa">{t}</p>{l.map((r, i) => <button key={i} onClick={() => { go(r.nav); setOpen(false) }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-ksa-light"><span className="font-mono text-xs text-slate-500">{r.sub}</span><span className="block truncate text-sm">{r.title}</span></button>)}</div>)}</div>}
      </div>
      <span className="text-xs">{user}</span><button onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={18} /></button></div>
    <nav className="mx-auto flex max-w-[1500px] gap-1 px-4">{TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`rounded-t px-4 py-2 text-sm font-medium ${tab === k ? 'bg-slate-50 text-ksa' : 'hover:bg-white/10'}`}>{l}</button>)}</nav>
  </header>)
}
