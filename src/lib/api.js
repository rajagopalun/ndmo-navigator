const url = import.meta.env.VITE_SUPABASE_URL, key = import.meta.env.VITE_SUPABASE_ANON_KEY
export const configured = !!(url && key)
export async function rpc(name, args = {}) {
  const h = { apikey: key, 'Content-Type': 'application/json' }; if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`
  const r = await fetch(`${url}/rest/v1/rpc/${name}`, { method: 'POST', headers: h, body: JSON.stringify(args) })
  const j = await r.json().catch(() => null)
  if (!r.ok) throw new Error(j?.message || r.statusText)
  return j
}
