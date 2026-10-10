import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { rpc, configured } from './api.js'
import { setExtra } from './items.js'
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)
const mix = (h, t, a) => { const n = parseInt(h.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (t - v) * a).toString(16).padStart(2, '0')).join('') }
const toRow = r => ({ done: r.done, date: r.done_at, due: r.due || '', owner: r.owner || '', reviewer: r.reviewer || '', dept: r.dept || '', wf: r.wf, start: r.start_date || '', pct: r.pct, ref: r.ref || '', note: r.note || '', files: Number(r.files || 0), sample: r.is_sample, by: r.updated_by })
export function AppProvider({ children }) {
  const [tok, setTok] = useState(() => sessionStorage.getItem('tok')), [me, setMe] = useState(null), [settings, setSettings] = useState({ color: '#006C35' })
  const [progress, setProgress] = useState({}), [nodes, setNodes] = useState([]), [docs, setDocs] = useState([]), [err, setErr] = useState('')
  const logout = useCallback(() => { if (tok) rpc('app_logout', { tok }).catch(() => {}); sessionStorage.removeItem('tok'); setTok(null); setMe(null) }, [tok])
  const refresh = useCallback(async () => {
    if (!tok) return
    try {
      const s = await rpc('app_get_state', { tok }); setExtra(s.nodes)
      setMe(s.me); setSettings({ color: '#006C35', ...s.settings }); setNodes(s.nodes || []); setDocs(s.docs || []); setProgress(Object.fromEntries((s.progress || []).map(r => [r.item_key, toRow(r)]))); setErr('')
    } catch (e) { if (/not_authenticated/.test(e.message)) logout(); else setErr(e.message) }
  }, [tok, logout])
  useEffect(() => { refresh(); const t = setInterval(refresh, 60000), v = () => document.visibilityState === 'visible' && refresh(); document.addEventListener('visibilitychange', v); return () => { clearInterval(t); document.removeEventListener('visibilitychange', v) } }, [refresh])
  useEffect(() => { const c = /^#[0-9a-f]{6}$/i.test(settings.color) ? settings.color : '#006C35', r = document.documentElement.style; r.setProperty('--brand', c); r.setProperty('--brand-dark', mix(c, 0, .25)); r.setProperty('--brand-light', mix(c, 255, .88)) }, [settings.color])
  const call = useCallback((name, args = {}) => rpc(name, { tok, ...args }), [tok])
  const setItem = useCallback(async (key, patch) => {
    setProgress(p => { const cur = p[key] || {}, n = { ...cur, ...patch }; if (patch.done === true && !cur.done) n.date = new Date().toISOString(); if (patch.done === false) n.date = null; return { ...p, [key]: n } })
    try { await rpc('app_set_progress', { tok, k: key, patch }); if ('done' in patch) refresh() } catch (e) { refresh(); throw e }
  }, [tok, refresh])
  const v = {
    configured, tok, me, ready: !!me, err, user: me?.username, role: me?.role, canEdit: !!me && me.role !== 'viewer', isAdmin: me?.role === 'admin',
    profile: settings, settings, progress, nodes, docs, refresh, call, setItem, logout,
    login: async (u, p) => {
      const r = await rpc('app_login', { p_username: u, p_password: p }); let token = r.token
      if (r.error === 'use_ldap') { const x = await fetch('/api/ldap-login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) }); const j = await x.json().catch(() => ({})); if (!x.ok) return j.error || 'invalid_credentials'; token = j.token }
      else if (r.error) return r.error
      sessionStorage.setItem('tok', token); setTok(token); return null },
    saveSetting: async (k, val) => { await call('app_save_setting', { p_key: k, p_value: val }); await refresh() },
  }
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}
