import { ldapConfigured, mk, sbRpc } from './_lib.js'
export default async function handler(req, res) {
  const w = await sbRpc('app_whoami', { tok: (req.body || {}).tok })
  if (!w.ok || w.data?.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
  const e = process.env, out = { configured: ldapConfigured(), url: e.LDAP_URL || null, baseDn: e.LDAP_BASE_DN || null, secretSet: !!e.LDAP_SHARED_SECRET, serviceAccount: !!e.LDAP_BIND_DN, bindOk: null }
  if (out.configured && e.LDAP_BIND_DN) { const c = mk(); try { await c.bind(e.LDAP_BIND_DN, e.LDAP_BIND_PASSWORD || ''); out.bindOk = true } catch (x) { out.bindOk = false; out.error = String(x.message).slice(0, 160) } finally { await c.unbind().catch(() => {}) } }
  return res.status(200).json(out)
}
