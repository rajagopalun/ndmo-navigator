import { useState, useMemo, useEffect, useRef } from 'react'
import { FileDown, Mail, Send } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { universe } from '../lib/items.js'
import { exportReport, download } from '../lib/exporter.js'
import { buildMail, mailtoUrl, buildEml } from '../lib/mail.js'
const B = 'flex items-center gap-1 rounded-md border border-ksa px-2.5 py-1.5 text-xs font-medium text-ksa hover:bg-ksa-light', P = 'flex items-center gap-1 rounded-md bg-ksa px-2.5 py-1.5 text-xs font-medium text-white hover:opacity-90'
function MailModal({ mode, scope, items, onClose }) {
  const { progress, user, profile, call } = useApp(), t = new Date(), ref = useRef(null)
  const dflt = items.map(i => progress[i.key]).filter(p => p && !p.done && p.due).map(p => p.due).sort()[0] || new Date(t.getTime() + 14 * 864e5).toISOString().slice(0, 10)
  const [to, setTo] = useState(''), [extra, setExtra] = useState(''), [deadline, setDeadline] = useState(dflt), [atts, setAtts] = useState(null)
  useEffect(() => { if (mode !== 'evidence') return; const keys = items.filter(i => progress[i.key]?.files).map(i => i.key); keys.length ? call('app_get_files_bulk', { p_keys: keys }).then(setAtts).catch(() => setAtts([])) : setAtts([]) }, [])
  const m = useMemo(() => buildMail(mode, { scope, items, progress, deadline, extra, user, url: location.href.split('#')[0], color: profile.color, attCount: atts?.length || 0 }), [mode, scope, items, progress, deadline, extra, user, atts])
  const html = () => ref.current?.innerHTML || m.html, mb = ((atts || []).reduce((s, f) => s + f.data.length, 0) * .75 / 1048576).toFixed(1)
  const eml = () => { const files = []; let tot = 0; for (const f of atts || []) { tot += f.data.length; if (tot > 20e6) { alert('Attachments exceed ~15 MB – the rest were skipped.'); break } files.push(f) } download(`${scope.title.replace(/[^\w]+/g, '_').slice(0, 40)}.eml`, buildEml({ to, subject: m.subject, html: html(), files }), 'message/rfc822'); alert('Open the downloaded .eml file – it opens in Outlook as a ready-to-send draft with formatting' + (files.length ? ' and attachments.' : '.')) }
  const copyRich = async () => { try { await navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html()], { type: 'text/html' }), 'text/plain': new Blob([m.text], { type: 'text/plain' }) })]); return true } catch { alert('Copy failed – select the preview and copy it manually.'); return false } }
  const web = async () => { if (await copyRich()) { alert('Formatted email copied. After Outlook opens, click in the message body and press Ctrl+V.'); window.open(`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent('(Press Ctrl+V to paste the formatted email)')}`, '_blank') } }
  const plain = () => { navigator.clipboard?.writeText(m.text); const { url, truncated } = mailtoUrl(to, m.subject, m.text); if (truncated) alert('Long email: Outlook opens a shortened version; the full text is copied – press Ctrl+V.'); location.href = url }
  const inp = 'w-full rounded border px-2 py-1.5 text-sm'
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog"><div className="max-h-[94vh] w-full max-w-3xl overflow-auto rounded-xl bg-white p-4 shadow-xl">
    <h3 className="mb-3 text-lg font-semibold text-ksa">{mode === 'request' ? 'Email the team to start this work' : 'Submit evidence by email'}</h3>
    <div className="grid gap-2 sm:grid-cols-2"><label className="text-xs">To (team / reviewer email)<input value={to} onChange={e => setTo(e.target.value)} placeholder="team@company.com; other@company.com" className={inp} /></label>
      {mode === 'request' ? <label className="text-xs">Deadline<input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inp} /></label> : <p className="self-end text-xs text-slate-600">{atts === null ? 'Loading attachments…' : `${atts.length} attachment(s), ${mb} MB will be included`}</p>}</div>
    <label className="mt-2 block text-xs">Additional message (optional)<input value={extra} onChange={e => setExtra(e.target.value)} className={inp} /></label>
    <p className="mt-2 text-xs text-slate-500">Subject: <b>{m.subject}</b> · You can edit the formatted preview below before sending.</p>
    <div key={m.html} ref={ref} contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: m.html }} className="mt-1 max-h-80 overflow-auto rounded border p-2" />
    <div className="mt-3 flex flex-wrap gap-2"><button onClick={eml} className={P}><Send size={14} />Open in Outlook (.eml draft{mode === 'evidence' ? ' + attachments' : ''})</button><button onClick={web} className={B}>Outlook on the web (paste)</button><button onClick={plain} className={B}>Plain text (mailto)</button><button onClick={onClose} className="ml-auto text-sm text-slate-500 underline">Close</button></div></div></div>)
}
export default function ScopeButtons({ scope, prefix = '' }) {
  const app = useApp(), [m, setM] = useState(null), items = useMemo(() => universe().filter(scope.filter), [scope.title, app.nodes]), p = prefix ? prefix + ' ' : ''
  return (<><button onClick={() => exportReport({ title: scope.title, items, ...app })} className={P}><FileDown size={14} />{prefix ? `Export ${prefix} report` : 'Export PDF'}</button>
    <button onClick={() => setM('request')} className={B}><Mail size={14} />Email {p}team</button><button onClick={() => setM('evidence')} className={B}><Send size={14} />Submit {p}evidence</button>
    {m && <MailModal mode={m} scope={scope} items={items} onClose={() => setM(null)} />}</>)
}
