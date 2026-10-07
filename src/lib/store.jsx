import { createContext, useContext, useEffect, useState, useCallback } from 'react'
const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { alert('Browser storage is full – use smaller images or export a backup.') } }
export const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('')
const mix = (h, t, a) => { const n = parseInt(h.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (t - v) * a).toString(16).padStart(2, '0')).join('') }
export function AppProvider({ children }) {
  const [user, setUser] = useState(() => sessionStorage.getItem('user'))
  const [profile, setProfile] = useState(() => load('profile', { color: '#006C35', username: 'admin' }))
  const [progress, setProgress] = useState(() => load('progress', {}))
  useEffect(() => {
    save('profile', profile); const c = /^#[0-9a-f]{6}$/i.test(profile.color) ? profile.color : '#006C35', r = document.documentElement.style
    r.setProperty('--brand', c); r.setProperty('--brand-dark', mix(c, 0, .25)); r.setProperty('--brand-light', mix(c, 255, .88))
  }, [profile])
  useEffect(() => save('progress', progress), [progress])
  const setItem = useCallback((key, patch) => setProgress(p => {
    const cur = p[key] || {}, n = { ...cur, ...patch }
    if (patch.done === true && !cur.done) n.date = new Date().toISOString()
    if (patch.done === false) n.date = null
    return { ...p, [key]: n }
  }), [])
  const v = {
    user, profile, progress, setItem,
    login: u => { sessionStorage.setItem('user', u); setUser(u) },
    logout: () => { sessionStorage.removeItem('user'); setUser(null) },
    update: patch => setProfile(p => ({ ...p, ...patch })),
    replaceAll: d => { if (d.profile) setProfile(d.profile); if (d.progress) setProgress(d.progress) },
    resetProgress: () => setProgress({}),
  }
  return <Ctx.Provider value={v}>{children}</Ctx.Provider>
}
