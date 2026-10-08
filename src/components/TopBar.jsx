import { useState, useRef, useEffect } from 'react'
import { Search, X, ShieldCheck, ChevronDown, UserCircle, SlidersHorizontal } from 'lucide-react'
import { search, TYPES, DOMAINS } from '../lib/search.js'
import { useApp } from '../lib/store.jsx'
const TABS = [['ndmo', 'NDMO'], ['ndi', 'NDI'], ['oe', 'NDI OE'], ['dash', 'Dashboard']]
export const ASEC = [['users', 'Users & roles'], ['security', 'Security & policies'], ['audit', 'Audit log'], ['branding', 'Branding & theme'], ['sample', 'Sample data'], ['backup', 'Backup & export']]
export default function TopBar({ tab, setTab, go, setAsec }) {
  const { profile, user, role, isAdmin, logout, progress, nodes } = useApp(), [q, setQ] = useState(''), [f, setF] = useState({ type: '', domain: '', status: '' }), [open, setOpen] = useState(false), [menu, setMenu] = useState(false), [showF, setShowF] = useState(false), hdr = useRef(null)
  const groups = Object.entries(search(q, f, progress, nodes)), active = f.type || f.domain || f.status
  useEffect(() => { const h = e => { if (!hdr.current?.contains(e.target)) { setOpen(false); setMenu(false) } }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  const S = 'rounded border px-2 py-1 text-xs text-slate-800'
  const Item = ({ l, run, sep }) => <button onClick={() => { run(); setMenu(false) }} className={`block w-full px-3 py-2 text-left hover:bg-ksa-light ${sep ? 'border-t' : ''}`}>{l}</button>
  return (<header ref={hdr} className="relative z-30 bg-gradient-to-r from-ksa to-ksa-dark text-white shadow">
    <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4 px-4 py-2">
      <div className="flex items-center gap-2">{profile.logo ? <img src={profile.logo} alt="Logo" className="max-h-10 rounded bg-white p-0.5" /> : <ShieldCheck size={26} />}
        <div><h1 className="text-base font-semibold leading-tight">NDMO / NDI Compliance Tracker</h1><p className="text-[11px] opacity-80">NDMO v1.5 · NDI v1.1 · OE 2026</p></div></div>
      <div className="relative ml-auto w-full max-w-lg"><Search aria-hidden className="absolute left-3 top-2.5 text-slate-400" size={16} /><label htmlFor="gs" className="sr-only">Search</label>
        <input id="gs" value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Search keyword, DG.1.1, DG.MQ.1, DSI.OE.01…" className="w-full rounded-lg py-2 pl-9 pr-16 text-sm text-slate-800" />
        <button aria-label="Search filters" onClick={() => { setShowF(!showF); setOpen(true) }} className={`absolute right-8 top-2 ${active ? 'text-ksa' : 'text-slate-400'}`}><SlidersHorizontal size={16} /></button>
        {(q || active) && <button aria-label="Clear" onClick={() => { setQ(''); setF({ type: '', domain: '', status: '' }) }} className="absolute right-2 top-2 text-slate-400"><X size={16} /></button>}
        {open && (q || showF || active) && <div className="absolute z-40 mt-1 max-h-[28rem] w-full overflow-auto rounded-lg bg-white p-2 text-slate-800 shadow-xl">
          <div className="mb-2 flex flex-wrap gap-2 border-b pb-2"><select aria-label="Type" value={f.type} onChange={e => setF({ ...f, type: e.target.value })} className={S}><option value="">All types</option>{TYPES.map(x => <option key={x}>{x}</option>)}</select>
            <select aria-label="Domain" value={f.domain} onChange={e => setF({ ...f, domain: e.target.value })} className={S}><option value="">All domains</option>{DOMAINS.map(x => <option key={x}>{x}</option>)}</select>
            <select aria-label="Status" value={f.status} onChange={e => setF({ ...f, status: e.target.value })} className={S}><option value="">Any status</option><option>Completed</option><option>Pending</option><option>Overdue</option></select></div>
          {!groups.length && <p className="p-3 text-sm text-slate-500">{q || active ? 'No matches.' : 'Type to search or pick filters.'}</p>}
          {groups.map(([t, l]) => <div key={t}><p className="px-2 pt-2 text-xs font-semibold uppercase text-ksa">{t}</p>{l.map((r, i) => <button key={i} onClick={() => { go(r.nav); setOpen(false) }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-ksa-light"><span className="font-mono text-xs text-slate-500">{r.sub}</span><span className="block truncate text-sm">{r.title}</span></button>)}</div>)}</div>}</div>
      <div className="relative"><button onClick={() => setMenu(!menu)} aria-haspopup="menu" className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm hover:bg-white/10"><UserCircle size={22} /><span className="text-left leading-tight">{user}<span className="block text-[10px] uppercase opacity-75">{role}</span></span><ChevronDown size={14} /></button>
        {menu && <div className="absolute right-0 z-40 mt-1 w-56 rounded-lg bg-white py-1 text-sm text-slate-800 shadow-xl"><Item l="Change password" run={() => setTab('profile')} />
          {isAdmin && <><p className="border-t px-3 pb-1 pt-2 text-[10px] font-semibold uppercase text-ksa">Admin panel</p>{ASEC.map(([k, l]) => <Item key={k} l={l} run={() => { setTab('admin'); setAsec(k) }} />)}</>}
          <Item l="Log off" run={logout} sep /></div>}</div></div>
    <nav className="mx-auto flex max-w-[1500px] gap-1 px-4">{TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`rounded-t-lg px-5 py-2 text-sm font-medium ${tab === k ? 'bg-slate-50 text-ksa' : 'hover:bg-white/10'}`}>{l}</button>)}</nav>
  </header>)
}
