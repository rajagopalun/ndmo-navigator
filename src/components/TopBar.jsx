import { useState, useRef, useEffect } from 'react'
import { ShieldCheck, ChevronDown, UserCircle, Languages } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import SearchBox from './SearchBox.jsx'
export const ASEC = [['users', 'Users & roles'], ['security', 'Security & policies'], ['audit', 'Activity & operations logs'], ['branding', 'Branding & theme'], ['sample', 'Sample data'], ['library', 'Library files'], ['backup', 'Backup & export']]
const TABS = [['home', 'Home'], ['dash', 'Dashboard'], ['tasks', 'Tasks'], ['reports', 'Reports'], ['library', 'Library']], REG = [['ndmo', 'NDMO'], ['ndi', 'NDI'], ['oe', 'NDI OE'], ['pdpl', 'PDPL']]
export default function TopBar({ tab, go, setAsec, onSearch, setTab }) {
  const { profile, settings, user, role, isAdmin, logout, lang, setLang } = useApp(), [menu, setMenu] = useState(false), ref = useRef(null)
  useEffect(() => { const h = e => { if (!ref.current?.contains(e.target)) setMenu(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  const Item = ({ l, run, sep, admin }) => <button onClick={() => { run(); setMenu(false) }} data-noi18n={admin ? '' : undefined} className={`block w-full px-3 py-2 text-start hover:bg-ksa-light ${sep ? 'border-t' : ''}`}>{l}</button>
  const T = ({ k, l }) => <a href={'#/' + k} className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-medium transition ${tab === k ? 'bg-slate-50 text-ksa' : 'text-white/90 hover:bg-white/10'}`}>{l}</a>
  return (<header className="relative z-30 bg-gradient-to-r from-ksa to-ksa-dark text-white shadow">
    <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-3 px-4 py-2">
      <a href="#/home" className="flex items-center gap-2 text-start" aria-label="Home">{profile.logo ? <img src={profile.logo} alt="Logo" className="max-h-10 rounded bg-white p-0.5" /> : <ShieldCheck size={26} />}
        <span><span className="block text-base font-semibold leading-tight">{settings.title || 'NDMO / NDI Compliance Tracker'}</span><span className="block text-[11px] opacity-80">{settings.subtitle ?? 'NDMO v1.5 · NDI v1.1 · OE 2026'}</span></span></a>
      <div className="ms-auto flex w-full max-w-md items-center gap-2"><SearchBox go={go} onSearch={q => onSearch({ q })} />
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label="Language" title="English / العربية" className="flex shrink-0 items-center gap-1 rounded-lg border border-white/40 px-2 py-1.5 text-xs hover:bg-white/10"><Languages size={15} />{lang === 'ar' ? 'English' : 'العربية'}</button></div>
      <div className="relative" ref={ref}><button onClick={() => setMenu(!menu)} aria-haspopup="menu" className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm hover:bg-white/10"><UserCircle size={22} /><span className="text-start leading-tight">{user}<span className="block text-[10px] uppercase opacity-75">{role}</span></span><ChevronDown size={14} /></button>
        {menu && <div className="absolute end-0 z-40 mt-1 w-60 rounded-lg bg-white py-1 text-sm text-slate-800 shadow-xl"><Item l="Change password" run={() => setTab('profile')} />
          {isAdmin && <div data-noi18n><p className="border-t px-3 pb-1 pt-2 text-[10px] font-semibold uppercase text-ksa">Admin panel</p>{ASEC.map(([k, l]) => <Item key={k} admin l={l} run={() => setAsec(k)} />)}</div>}<Item l="Log off" run={logout} sep /></div>}</div></div>
    <nav aria-label="Main" className="mx-auto flex max-w-[1500px] items-end gap-1 overflow-x-auto px-4">{TABS.map(([k, l]) => <T key={k} k={k} l={l} />)}<span className="mx-2 mb-2 h-5 w-px bg-white/30" />{REG.map(([k, l]) => <T key={k} k={k} l={l} />)}</nav></header>)
}
