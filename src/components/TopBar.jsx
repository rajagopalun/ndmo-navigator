import { useState, useRef, useEffect } from 'react'
import { Search, X, ShieldCheck, ChevronDown, UserCircle } from 'lucide-react'
import { search } from '../lib/search.js'
import { useApp } from '../lib/store.jsx'
import { menuFor } from '../lib/nav.js'
import { universe } from '../lib/items.js'
import { exportReport } from '../lib/exporter.js'
import { SUBS } from './Dashboard.jsx'
const TABS = [['ndmo', 'NDMO'], ['ndi', 'NDI'], ['oe', 'NDI OE'], ['dash', 'Dashboard']]
const KIND = { ndmo: 'NDMO', ndi: 'NDI', oe: 'OE' }, LBL = { ndmo: 'NDMO', ndi: 'NDI', oe: 'NDI OE' }
const PS = [['password', 'Change password'], ['theme', 'Theme colour'], ['branding', 'Logo, seal & signature'], ['backup', 'Backup & data']]
export default function TopBar({ tab, setTab, go, setDsub, setPsec }) {
  const app = useApp(), { profile, user, logout } = app, [q, setQ] = useState(''), [open, setOpen] = useState(false), [menu, setMenu] = useState(null), hdr = useRef(null), groups = Object.entries(search(q))
  useEffect(() => { const h = e => { if (!hdr.current?.contains(e.target)) { setOpen(false); setMenu(null) } }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  const items = k => k === 'dash' ? SUBS.map(([s, l]) => ({ l, run: () => { setTab('dash'); setDsub(s) } }))
    : [{ l: `⬇ Export full ${LBL[k]} report`, run: () => exportReport({ title: `${LBL[k]} – full report`, items: universe().filter(i => i.kind === KIND[k]), ...app }), b: true }, ...menuFor(k).map(m => ({ l: m.label, run: () => go(m.nav) }))]
  const Drop = ({ list, right }) => <div className={`absolute z-40 mt-0 max-h-96 w-80 overflow-auto rounded-b-lg bg-white py-1 text-sm text-slate-800 shadow-xl ${right ? 'right-0' : 'left-0'}`}>{list.map((x, i) => <button key={i} onClick={() => { x.run(); setMenu(null) }} className={`block w-full px-3 py-1.5 text-left hover:bg-ksa-light ${x.b ? 'font-semibold text-ksa' : ''} ${x.sep ? 'border-t' : ''}`}>{x.l}</button>)}</div>
  return (<header ref={hdr} className="relative z-30 bg-ksa text-white shadow">
    <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4 px-4 py-2">
      <div className="flex items-center gap-2">{profile.logo ? <img src={profile.logo} alt="Logo" className="max-h-10 rounded bg-white p-0.5" /> : <ShieldCheck size={26} />}
        <div><h1 className="text-base font-semibold leading-tight">NDMO / NDI Compliance Tracker</h1><p className="text-[11px] opacity-80">NDMO v1.5 · NDI v1.1 · OE 2026</p></div></div>
      <div className="relative ml-auto w-full max-w-md"><Search aria-hidden className="absolute left-3 top-2.5 text-slate-400" size={16} /><label htmlFor="gs" className="sr-only">Search</label>
        <input id="gs" value={q} onChange={e => { setQ(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)} placeholder="Search keyword, DG.1.1, DG.MQ.1, DSI.OE.01…" className="w-full rounded-lg py-2 pl-9 pr-8 text-sm text-slate-800" />
        {q && <button aria-label="Clear" onClick={() => setQ('')} className="absolute right-2 top-2 text-slate-400"><X size={16} /></button>}
        {open && q && <div className="absolute z-40 mt-1 max-h-96 w-full overflow-auto rounded-lg bg-white p-2 text-slate-800 shadow-xl">{!groups.length && <p className="p-3 text-sm text-slate-500">No matches.</p>}
          {groups.map(([t, l]) => <div key={t}><p className="px-2 pt-2 text-xs font-semibold uppercase text-ksa">{t}</p>{l.map((r, i) => <button key={i} onClick={() => { go(r.nav); setOpen(false) }} className="block w-full rounded px-2 py-1.5 text-left hover:bg-ksa-light"><span className="font-mono text-xs text-slate-500">{r.sub}</span><span className="block truncate text-sm">{r.title}</span></button>)}</div>)}</div>}</div>
      <div className="relative"><button onClick={() => setMenu(menu === 'user' ? null : 'user')} className="flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-white/10" aria-haspopup="menu"><UserCircle size={22} />{user}<ChevronDown size={14} /></button>
        {menu === 'user' && <Drop right list={[...PS.map(([k, l]) => ({ l, run: () => { setTab('profile'); setPsec(k) } })), { l: 'Log off', sep: true, run: logout }]} />}</div></div>
    <nav className="mx-auto flex max-w-[1500px] gap-1 px-4">{TABS.map(([k, l]) => <div key={k} className="relative"><button onClick={() => { setTab(k); setMenu(menu === k ? null : k) }} aria-haspopup="menu" className={`flex items-center gap-1 rounded-t px-4 py-2 text-sm font-medium ${tab === k ? 'bg-slate-50 text-ksa' : 'hover:bg-white/10'}`}>{l}<ChevronDown size={13} /></button>{menu === k && <Drop list={items(k)} />}</div>)}</nav>
  </header>)
}
