import { specifications } from '../ndmoData.js'
import { universe } from './items.js'
import { today, inDays } from './ui.jsx'
export const buildIndex = () => { const st = Object.fromEntries(specifications.map(s => ['S:' + s.id, s.text])); return universe().map(i => ({ ...i, code: i.nav.id.split('|')[0], text: st[i.key] || '' })) }
export const isMine = (p, me) => { const o = (p.owner || '').toLowerCase(); return !!o && !!me && (o === me.username.toLowerCase() || (!!me.display_name && o === me.display_name.toLowerCase())) }
export function searchItems(all, progress, f, me) {
  const terms = (f.q || '').toLowerCase().split(/\s+/).filter(Boolean), t = today(), soon = inDays(14)
  return all.filter(i => {
    const p = progress[i.key] || {}, wf = p.wf || 'Not Started'
    if (f.kind && i.kind !== f.kind) return false
    if (f.domain && i.domain !== f.domain) return false
    if (f.wf && wf !== f.wf) return false
    if (f.owner && (p.owner || '') !== f.owner) return false
    if (f.dept && (p.dept || '') !== f.dept) return false
    if (f.from && !(p.due && p.due >= f.from)) return false
    if (f.to && !(p.due && p.due <= f.to)) return false
    if (f.mine && !isMine(p, me)) return false
    if (f.overdue && !(!p.done && p.due && p.due < t)) return false
    if (f.soon && !(!p.done && p.due && p.due >= t && p.due <= soon)) return false
    if (f.noevidence && (p.files || p.ref)) return false
    if (terms.length) { const h = `${i.code} ${i.title} ${i.group} ${i.detail} ${i.text} ${p.owner || ''} ${p.dept || ''}`.toLowerCase(); if (!terms.every(x => h.includes(x))) return false }
    return true
  })
}
