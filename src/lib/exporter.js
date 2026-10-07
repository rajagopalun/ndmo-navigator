import { universe } from './items.js'
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const d = v => v ? new Date(v).toLocaleDateString('en-GB') : ''
export const exportKind = (app, kind, domain, title) => exportReport({ title, items: universe().filter(i => i.kind === kind && (!domain || i.domain === domain)), ...app })
export function exportReport({ title, items, progress, profile, user }) {
  const rows = items.map(i => ({ ...i, p: progress[i.key] || {} })), done = rows.filter(r => r.p.done).length, color = profile.color || '#006C35', groups = {}
  rows.forEach(r => (groups[r.group] ||= []).push(r))
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
body{font-family:Segoe UI,Arial,sans-serif;margin:24px;color:#1e293b;font-size:12px}
header{display:flex;align-items:center;gap:16px;border-bottom:4px solid ${color};padding-bottom:10px}header img{max-height:60px}
h1{font-size:20px;margin:0;color:${color}}h2{font-size:13px;background:${color};color:#fff;padding:5px 8px;margin:18px 0 0}
table{width:100%;border-collapse:collapse}td,th{border:1px solid #cbd5e1;padding:4px 6px;vertical-align:top;text-align:left}th{background:#f1f5f9}
.ok{color:${color};font-weight:600}.no{color:#b45309}footer{display:flex;justify-content:space-between;align-items:flex-end;margin-top:40px;page-break-inside:avoid}
footer img{max-height:90px}.sig{text-align:center;border-top:1px solid #64748b;padding-top:4px;min-width:220px}
@media print{h2{break-after:avoid}tr{break-inside:avoid}}</style></head><body>
<header>${profile.logo ? `<img src="${profile.logo}">` : ''}<div><h1>${esc(title)}</h1><div>Generated ${d(new Date())} by ${esc(user)}</div></div></header>
<p><b>${done}</b> of <b>${rows.length}</b> completed (${rows.length ? Math.round(done * 100 / rows.length) : 0}%)</p>
${Object.entries(groups).map(([g, rs]) => `<h2>${esc(g)}</h2><table><tr><th>Item</th><th>Status</th><th>Submitted</th><th>Due</th><th>Owner</th><th>Evidence reference / notes</th></tr>${rs.map(r => `<tr><td>${esc(r.title)}${r.detail ? `<br><i>${esc(r.detail)}</i>` : ''}</td><td class="${r.p.done ? 'ok' : 'no'}">${r.p.done ? 'Completed' : 'Pending'}</td><td>${d(r.p.date)}</td><td>${d(r.p.due)}</td><td>${esc(r.p.owner)}</td><td>${esc(r.p.ref)}${r.p.note ? '<br>' + esc(r.p.note) : ''}</td></tr>`).join('')}</table>`).join('')}
<footer><div class="sig">${profile.signature ? `<img src="${profile.signature}"><br>` : '<br><br>'}Authorised signature</div><div>${profile.seal ? `<img src="${profile.seal}">` : ''}</div></footer>
<script>window.onload=()=>setTimeout(()=>window.print(),400)</script></body></html>`
  const w = window.open('', '_blank'); if (!w) return alert('Please allow pop-ups, then click Export again.')
  w.document.write(html); w.document.close()
}

export const download = (name, text, type = 'text/csv') => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click() }
