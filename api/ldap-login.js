import { ldapConfigured, ldapCheck, sbRpc } from './_lib.js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' })
  const { username, password } = req.body || {}
  if (!ldapConfigured() || !process.env.LDAP_SHARED_SECRET) return res.status(503).json({ error: 'ldap_not_configured' })
  if (!(await ldapCheck(username, password))) return res.status(401).json({ error: 'invalid_credentials' })
  const r = await sbRpc('app_ldap_session', { p_username: username, p_secret: process.env.LDAP_SHARED_SECRET })
  if (!r.ok || r.data?.error) return res.status(403).json({ error: r.data?.error || 'not_allowed' })
  return res.status(200).json({ token: r.data.token })
}
