import { useState, useRef, useEffect } from 'react'
import { Search, ShieldCheck, ChevronDown, UserCircle } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
export const ASEC = [['users', 'Users & roles'], ['security', 'Security & policies'], ['audit', 'Audit log'], ['branding', 'Branding & theme'], ['sample', 'Sample data'], ['backup', 'Backup & export']]
const TABS = [['home', 'Home'], ['dash', 'Dashboard'], ['tasks', 'My Tasks'], ['all', 'All Requirements'], ['evidence', 'Evidence Library'], ['reports', 'Reports'], ['reg', 'Regulatory Library']], REG = [['ndmo', 'NDMO'], ['ndi', 'NDI'], ['oe', 'NDI OE']]
export default function TopBar({ tab, setTab, go, setAsec, onSearch }) {
  const { profile, user, role, isAdmin, logout } = useApp(), [q, setQ] = useState(''), [menu, setMenu] = useState(false), ref = useRef(null)
  useEffect(() => { const h = e => { if (!ref.current?.contains(e.target)) setMenu(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  const Item = ({ l, run, sep }) => <button onClick={() => { run(); setMenu(false) }} className={`block w-full px-3 py-2 text-left hover:bg-ksa-light ${sep ? 'border-t' : ''}`}>{l}</button>
  const T = ({ k, l, run }) => <button onClick={run || (() => setTab(k))} className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition ${tab === k ? 'bg-slate-50 text-ksa' : 'text-white/90 hover:bg-white/10'}`}>{l}</button>
  return (<header className="relative z-30 bg-gradient-to-r from-ksa to-ksa-dark text-white shadow">
    <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-2">
      <button onClick={() => setTab('home')} className="flex items-center gap-2 text-left" aria-label="Home">{profile.logo ? <img src={profile.logo} alt="Logo" className="max-h-10 rounded bg-white p-0.5" /> : <ShieldCheck size={26} />}
        <span><span className="block text-base font-semibold leading-tight">NDMO / NDI Compliance Tracker</span><span className="block text-[11px] opacity-80">NDMO v1.5 · NDI v1.1 · OE 2026</span></span></button>
      <form onSubmit={e => { e.preventDefault(); onSearch({ q }); setQ('') }} className="relative ml-auto w-full max-w-sm"><Search aria-hidden className="absolute left-3 top-2.5 text-slate-400" size={16} /><input value={q} onChange={e => setQ(e.target.value)} aria-label="Search requirements" placeholder="Search requirement ID or keyword" className="w-full rounded-lg py-2 pl-9 pr-3 text-sm text-slate-800" /></form>
      <div className="relative" ref={ref}><button onClick={() => setMenu(!menu)} aria-haspopup="menu" className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm hover:bg-white/10"><UserCircle size={22} /><span className="text-left leading-tight">{user}<span className="block text-[10px] uppercase opacity-75">{role}</span></span><ChevronDown size={14} /></button>
        {menu && <div className="absolute right-0 z-40 mt-1 w-56 rounded-lg bg-white py-1 text-sm text-slate-800 shadow-xl"><Item l="Change password" run={() => setTab('profile')} />
          {isAdmin && <><p className="border-t px-3 pb-1 pt-2 text-[10px] font-semibold uppercase text-ksa">Admin panel</p>{ASEC.map(([k, l]) => <Item key={k} l={l} run={() => { setTab('admin'); setAsec(k) }} />)}</>}<Item l="Log off" run={logout} sep /></div>}</div></div>
    <nav aria-label="Main" className="mx-auto flex max-w-[1500px] items-end gap-1 overflow-x-auto px-4">{TABS.map(([k, l]) => <T key={k} k={k} l={l} />)}<span className="mx-2 mb-2 h-5 w-px bg-white/30" />{REG.map(([k, l]) => <T key={k} k={k} l={l} run={() => go({ mode: k, id: '' })} />)}</nav></header>)
}
