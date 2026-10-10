import { Client } from 'ldapts'
const env = process.env
export const ldapConfigured = () => !!(env.LDAP_URL && env.LDAP_BASE_DN)
const esc = s => String(s).replace(/[\\*()\0]/g, c => '\\' + c.charCodeAt(0).toString(16).padStart(2, '0'))
export const mk = () => new Client({ url: env.LDAP_URL, timeout: 8000, connectTimeout: 8000, tlsOptions: { rejectUnauthorized: env.LDAP_TLS_INSECURE !== 'true' } })
export async function ldapCheck(username, password) {
  if (!username || !password) return false   // an empty password would be an anonymous bind
  const c = mk()
  try {
    if (env.LDAP_BIND_DN) await c.bind(env.LDAP_BIND_DN, env.LDAP_BIND_PASSWORD || '')
    const { searchEntries } = await c.search(env.LDAP_BASE_DN, { scope: 'sub', filter: `(${env.LDAP_USER_ATTR || 'sAMAccountName'}=${esc(username)})`, attributes: ['dn'], sizeLimit: 2 })
    if (searchEntries.length !== 1) return false
    const u = mk()
    try { await u.bind(searchEntries[0].dn, password); return true } finally { await u.unbind().catch(() => {}) }
  } catch { return false } finally { await c.unbind().catch(() => {}) }
}
export async function sbRpc(name, args) {
  const key = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY, url = env.VITE_SUPABASE_URL || env.SUPABASE_URL, h = { apikey: key, 'Content-Type': 'application/json' }
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`
  const r = await fetch(`${url}/rest/v1/rpc/${name}`, { method: 'POST', headers: h, body: JSON.stringify(args) })
  return { ok: r.ok, data: await r.json().catch(() => null) }
}
