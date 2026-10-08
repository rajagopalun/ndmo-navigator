const fmt = d => d ? new Date(d).toLocaleDateString('en-GB') : '—'
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const light = (h, a) => { const n = parseInt(h.slice(1), 16); return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * a).toString(16).padStart(2, '0')).join('') }
const TD = 'padding:6px 8px;border:1px solid #d7dee6;vertical-align:top;font-size:13px', TH = c => `${TD};background:${c};color:#fff;text-align:left`
export function buildMail(mode, { scope, items, progress, deadline, extra, user, url, color = '#006C35', attCount = 0 }) {
  const rows = items.map(i => ({ ...i, p: progress[i.key] || {} })), pend = rows.filter(r => !r.p.done), done = rows.filter(r => r.p.done), t = new Date().toISOString().slice(0, 10), L = [], over = pend.filter(r => r.p.due && r.p.due < t).length
  const pct = rows.length ? Math.round(done.length * 100 / rows.length) : 0, ev = (scope.evidence || pend.map(r => r.title)).slice(0, 15), lt = light(color, .9)
  const h2 = s => `<h3 style="color:${color};border-bottom:2px solid ${color};padding-bottom:4px;margin:18px 0 8px;font-size:15px">${s}</h3>`
  const box = s => `<div style="background:${lt};border-left:4px solid ${color};padding:10px 12px;margin:10px 0;font-size:14px">${s}</div>`
  let subject, body
  if (mode === 'request') {
    subject = `ACTION REQUIRED – ${scope.title} – due ${fmt(deadline)}`
    L.push('Dear Team,', '', `Please complete the compliance requirement below and send the evidence by ${fmt(deadline)}.`, '', '1. REQUIREMENT', scope.title)
    if (scope.explain) L.push('', '2. EXPLANATION', scope.explain.slice(0, 900))
    if (scope.steps?.length) L.push('', 'HOW TO IMPLEMENT', ...scope.steps.map((s, i) => `  ${i + 1}) ${s}`))
    L.push('', `3. WHAT NEEDS TO BE COMPLETED (${pend.length} pending of ${rows.length})`)
    pend.slice(0, 20).forEach((r, k) => { L.push(`  ${k + 1}. ${r.title}${r.p.owner ? ` (owner: ${r.p.owner})` : ''}${r.p.due ? ` – due ${fmt(r.p.due)}` : ''}`); if (r.detail) L.push(`     Acceptance criteria: ${r.detail.slice(0, 350)}`) })
    L.push('', '4. EVIDENCE TO SUBMIT', ...ev.map(e => `  - ${e}`), '', `5. DEADLINE: ${fmt(deadline)}`, '', 'Please reply with the evidence attached (PDF / screenshots / logs) and the document reference numbers.')
    body = `<p>Dear Team,</p><p>Please complete the compliance requirement below and send the evidence by <b>${fmt(deadline)}</b>.</p>${h2('1. Requirement')}<p style="font-size:14px"><b>${esc(scope.title)}</b></p>`
      + (scope.explain ? `${h2('2. Explanation')}<p style="font-size:13px;line-height:1.5">${esc(scope.explain.slice(0, 900))}</p>` : '')
      + (scope.steps?.length ? `${h2('How to implement')}<ol style="font-size:13px;line-height:1.5">${scope.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : '')
      + `${h2(`3. What needs to be completed (${pend.length} pending of ${rows.length})`)}<table style="border-collapse:collapse;width:100%"><tr>${['#', 'Item', 'Owner', 'Due', 'Acceptance criteria'].map(x => `<th style="${TH(color)}">${x}</th>`).join('')}</tr>`
      + pend.slice(0, 20).map((r, k) => `<tr><td style="${TD}">${k + 1}</td><td style="${TD}">${esc(r.title)}</td><td style="${TD}">${esc(r.p.owner)}</td><td style="${TD}">${fmt(r.p.due)}</td><td style="${TD}">${esc((r.detail || '').slice(0, 350))}</td></tr>`).join('') + '</table>'
      + (pend.length > 20 ? `<p style="font-size:12px">…and ${pend.length - 20} more (see the tracker).</p>` : '')
      + `${h2('4. Evidence to submit')}<ul style="font-size:13px;line-height:1.5">${ev.map(e => `<li>${esc(e)}</li>`).join('')}</ul>${box(`<b>5. Deadline: ${fmt(deadline)}</b><br>Reply with the evidence attached (PDF / screenshots / logs) and the document reference numbers.`)}`
  } else {
    subject = `EVIDENCE SUBMITTED – ${scope.title} – ${done.length}/${rows.length} complete`
    L.push('Dear Reviewer,', '', `Evidence for: ${scope.title}`, '', `SUMMARY: ${done.length} of ${rows.length} completed (${pct}%), ${pend.length} pending, ${over} overdue`, '', 'EVIDENCE LOGGED')
    done.slice(0, 25).forEach((r, k) => L.push(`  ${k + 1}. ${r.title}`, `     Submitted ${fmt(r.p.date)}${r.p.ref ? ` | Ref: ${r.p.ref}` : ''}${r.p.owner ? ` | Owner: ${r.p.owner}` : ''}${r.p.files ? ` | Files: ${r.p.files}` : ''}`))
    if (!done.length) L.push('  (no items completed yet)')
    if (pend.length) L.push('', 'STILL OUTSTANDING', ...pend.slice(0, 10).map(r => `  - ${r.title}`))
    L.push('', `ATTACHMENTS: ${attCount} file(s) attached.`)
    const kpi = (l, v, c) => `<td style="${TD};text-align:center;width:25%"><div style="font-size:22px;font-weight:600;color:${c}">${v}</div><div style="font-size:11px;color:#64748b">${l}</div></td>`
    body = `<p>Dear Reviewer,</p><p>Please find the evidence for <b>${esc(scope.title)}</b>.</p>${h2('Summary')}<table style="border-collapse:collapse;width:100%"><tr>${kpi('Completed', `${done.length}/${rows.length}`, color)}${kpi('Completion', pct + '%', color)}${kpi('Pending', pend.length, '#475569')}${kpi('Overdue', over, '#dc2626')}</tr></table>`
      + `${h2('Evidence logged')}<table style="border-collapse:collapse;width:100%"><tr>${['#', 'Item', 'Submitted', 'Reference', 'Owner', 'Files'].map(x => `<th style="${TH(color)}">${x}</th>`).join('')}</tr>`
      + (done.slice(0, 25).map((r, k) => `<tr><td style="${TD}">${k + 1}</td><td style="${TD}">${esc(r.title)}</td><td style="${TD}">${fmt(r.p.date)}</td><td style="${TD}">${esc(r.p.ref)}</td><td style="${TD}">${esc(r.p.owner)}</td><td style="${TD}">${r.p.files || ''}</td></tr>`).join('') || `<tr><td style="${TD}" colspan="6">No items completed yet.</td></tr>`) + '</table>'
      + (pend.length ? `${h2('Still outstanding')}<ul style="font-size:13px">${pend.slice(0, 10).map(r => `<li>${esc(r.title)}</li>`).join('')}</ul>` : '') + box(`<b>Attachments:</b> ${attCount} evidence file(s) attached to this email.`)
  }
  if (extra) { L.push('', extra); body += `<p style="font-size:14px">${esc(extra)}</p>` }
  L.push('', `Tracker: ${url}`, '', 'Regards,', user)
  const html = `<div style="font-family:Segoe UI,Arial,sans-serif;color:#1e293b;max-width:780px"><div style="background:${color};color:#fff;padding:14px 18px;border-radius:6px 6px 0 0"><div style="font-size:12px;opacity:.85">NDMO / NDI Compliance Tracker</div><div style="font-size:20px;font-weight:600">${mode === 'request' ? 'Action required' : 'Evidence submission'}</div></div><div style="border:1px solid #d7dee6;border-top:0;padding:8px 18px 16px">${body}<p style="font-size:12px;color:#64748b;margin-top:18px">Tracker: <a href="${esc(url)}" style="color:${color}">${esc(url)}</a><br>Regards,<br><b>${esc(user)}</b></p></div></div>`
  return { subject, text: L.join('\n'), html }
}
export function mailtoUrl(to, subject, body) {
  const mk = b => `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(b)}`
  let b = body, n = body.length
  while (mk(b).length > 1900 && n > 200) { n = Math.floor(n * .85); b = body.slice(0, n) + '\n…(shortened – full text copied, press Ctrl+V)' }
  return { url: mk(b), truncated: b !== body }
}
const b64 = s => btoa(unescape(encodeURIComponent(s))), wrap = s => s.replace(/.{1,76}/g, '$&\r\n')
export function buildEml({ to, subject, html, files }) {
  const B = 'tracker_' + Date.now()
  let m = `To: ${to}\r\nSubject: =?UTF-8?B?${b64(subject)}?=\r\nX-Unsent: 1\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary="${B}"\r\n\r\n--${B}\r\nContent-Type: text/html; charset="utf-8"\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(b64(`<html><body>${html}</body></html>`))}`
  files.forEach(f => { const n = f.filename.replace(/"/g, ''); m += `--${B}\r\nContent-Type: ${f.mime || 'application/octet-stream'}; name="${n}"\r\nContent-Disposition: attachment; filename="${n}"\r\nContent-Transfer-Encoding: base64\r\n\r\n${wrap(f.data)}` })
  return m + `--${B}--\r\n`
}
