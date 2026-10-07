const fmt = d => d ? new Date(d).toLocaleDateString('en-GB') : '—'
export function buildMail(mode, { scope, items, progress, deadline, extra, user, url }) {
  const rows = items.map(i => ({ ...i, p: progress[i.key] || {} })), pend = rows.filter(r => !r.p.done), done = rows.filter(r => r.p.done), L = [], t = new Date().toISOString().slice(0, 10)
  let subject
  if (mode === 'request') {
    subject = `ACTION REQUIRED – ${scope.title} – due ${fmt(deadline)}`
    L.push('Dear Team,', '', `Please complete the compliance requirement below and send the evidence by ${fmt(deadline)}.`, '', '1. REQUIREMENT', scope.title)
    if (scope.explain) L.push('', '2. EXPLANATION', scope.explain.slice(0, 900))
    if (scope.steps?.length) L.push('', 'HOW TO IMPLEMENT', ...scope.steps.map((s, i) => `  ${i + 1}) ${s}`))
    L.push('', `3. WHAT NEEDS TO BE COMPLETED (${pend.length} pending of ${rows.length})`)
    pend.slice(0, 20).forEach((r, k) => { L.push(`  ${k + 1}. ${r.title}${r.p.owner ? ` (owner: ${r.p.owner})` : ''}${r.p.due ? ` – due ${fmt(r.p.due)}` : ''}`); if (r.detail) L.push(`     Acceptance criteria: ${r.detail.slice(0, 350)}`) })
    if (pend.length > 20) L.push(`  …and ${pend.length - 20} more (see the tracker).`)
    L.push('', '4. EVIDENCE TO SUBMIT', ...(scope.evidence || pend.map(r => r.title)).slice(0, 15).map(e => `  - ${e}`), '', '5. DEADLINE', `  ${fmt(deadline)}`, '', 'Please reply with the evidence attached (PDF / screenshots / logs) and the document reference numbers.')
  } else {
    subject = `EVIDENCE SUBMITTED – ${scope.title} – ${done.length}/${rows.length} complete`
    L.push('Dear Reviewer,', '', `Please find the evidence for: ${scope.title}`, '', 'SUMMARY', `  Completed: ${done.length} of ${rows.length} (${rows.length ? Math.round(done.length * 100 / rows.length) : 0}%)`, `  Pending: ${pend.length}  |  Overdue: ${pend.filter(r => r.p.due && r.p.due < t).length}`, '', 'EVIDENCE LOGGED')
    done.slice(0, 25).forEach((r, k) => L.push(`  ${k + 1}. ${r.title}`, `     Submitted ${fmt(r.p.date)}${r.p.ref ? ` | Ref: ${r.p.ref}` : ''}${r.p.owner ? ` | Owner: ${r.p.owner}` : ''}${r.p.note ? ` | Note: ${r.p.note}` : ''}`))
    if (!done.length) L.push('  (no items marked as completed yet)')
    if (pend.length) L.push('', 'STILL OUTSTANDING', ...pend.slice(0, 10).map(r => `  - ${r.title}`))
    L.push('', 'ATTACHMENTS', '  Evidence files attached to this email (attach them before sending).')
  }
  if (extra) L.push('', extra)
  L.push('', `Tracker: ${url}`, '', 'Regards,', user)
  return { subject, body: L.join('\n') }
}
export function mailtoUrl(to, subject, body) {
  const mk = b => `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(b)}`
  let b = body, n = body.length
  while (mk(b).length > 1900 && n > 200) { n = Math.floor(n * .85); b = body.slice(0, n) + '\n…(shortened – full text copied, press Ctrl+V)' }
  return { url: mk(b), truncated: b !== body }
}
