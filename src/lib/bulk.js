import { universe } from './items.js'
import { WF } from './ui.jsx'
const COLS = [['Key', 'k'], ['Regulation', 'kind'], ['Domain', 'domain'], ['Group', 'group'], ['Requirement / item', 'title'], ['Workflow Status', 'wf'], ['Owner', 'owner'], ['Reviewer', 'reviewer'], ['Department', 'dept'], ['Start Date', 'start'], ['Due Date', 'due'], ['Percent Complete', 'pct'], ['Evidence Reference', 'ref'], ['Evidence Files (read-only)', 'files'], ['Submitted Date', 'date'], ['Notes', 'note']]
const RO = ['kind', 'domain', 'group', 'title', 'files'], q = s => `"${String(s ?? '').replace(/"/g, '""')}"`
export const bulkCsv = (kind, progress) => '\ufeff' + [COLS.map(c => c[0]), ...universe().filter(i => !kind || i.kind === kind).map(i => { const p = progress[i.key] || {}, v = { k: i.key, kind: i.kind, domain: i.domain, group: i.group, title: i.title, wf: p.wf || 'Not Started', owner: p.owner, reviewer: p.reviewer, dept: p.dept, start: p.start, due: p.due, pct: p.pct ?? 0, ref: p.ref, files: p.files || 0, date: p.date?.slice(0, 10), note: p.note }; return COLS.map(c => v[c[1]]) })].map(r => r.map(q).join(',')).join('\r\n')
export function parseCsv(text) {
  const rows = []; let row = [], f = '', inq = false; text = text.replace(/^\ufeff/, '')
  for (let i = 0; i < text.length; i++) { const c = text[i]
    if (inq) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++ } else inq = false } else f += c }
    else if (c === '"') inq = true; else if (c === ',') { row.push(f); f = '' }
    else if (c === '\n') { row.push(f); rows.push(row); row = []; f = '' } else if (c !== '\r') f += c }
  if (f || row.length) { row.push(f); rows.push(row) }
  return rows
}
const nd = v => { const m = v.match(/^(\d{4})-(\d{2})-(\d{2})/) || (x => x && [0, x[3], x[2], x[1]])(v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/)); return m ? `${m[1]}-${String(m[2]).padStart(2, '0')}-${String(m[3]).padStart(2, '0')}` : null }
export function rowsFromCsv(text) {
  const [h, ...r] = parseCsv(text), idx = Object.fromEntries((h || []).map((x, i) => [x.trim(), i])), valid = new Set(universe().map(i => i.key)), rows = [], errors = []
  if (idx['Key'] === undefined) return { rows, errors: ['The file has no "Key" column – use a file exported from this tracker.'] }
  r.forEach((x, n) => { const key = x[idx['Key']]; if (!key) return; if (!valid.has(key)) { errors.push(`Line ${n + 2}: unknown key ${key}`); return }
    const o = { k: key }; let bad = false
    COLS.forEach(([name, f]) => { if (f === 'k' || RO.includes(f)) return; let v = (x[idx[name]] ?? '').trim(); if (!v) return
      if (f === 'wf') { const w = WF.find(y => y.toLowerCase() === v.toLowerCase()); if (!w) { errors.push(`${key}: unknown status "${v}"`); bad = true; return } v = w }
      if (['start', 'due', 'date'].includes(f)) { const d = nd(v); if (!d) { errors.push(`${key}: invalid date "${v}" in ${name}`); bad = true; return } v = d }
      if (f === 'pct') v = String(Math.min(100, Math.max(0, parseInt(v) || 0)))
      o[f] = v })
    if (!bad) rows.push(o) })
  return { rows, errors }
}
