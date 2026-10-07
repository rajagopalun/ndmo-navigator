import { useState, useMemo } from 'react'
import { FileDown, Mail, Send } from 'lucide-react'
import { useApp } from '../lib/store.jsx'
import { universe } from '../lib/items.js'
import { exportReport } from '../lib/exporter.js'
import { buildMail, mailtoUrl } from '../lib/mail.js'
const B = 'flex items-center gap-1 rounded border border-ksa px-2.5 py-1.5 text-xs font-medium text-ksa hover:bg-ksa-light', P = 'flex items-center gap-1 rounded bg-ksa px-2.5 py-1.5 text-xs font-medium text-white'
function MailModal({ mode, scope, items, onClose }) {
  const { progress, user } = useApp(), t = new Date()
  const dflt = items.map(i => progress[i.key]).filter(p => p && !p.done && p.due).map(p => p.due).sort()[0] || new Date(t.getTime() + 14 * 864e5).toISOString().slice(0, 10)
  const [to, setTo] = useState(''), [extra, setExtra] = useState(''), [deadline, setDeadline] = useState(dflt), [edit, setEdit] = useState(null)
  const m = useMemo(() => buildMail(mode, { scope, items, progress, deadline, extra, user, url: location.href.split('#')[0] }), [mode, scope, items, progress, deadline, extra, user])
  const body = edit ?? m.body, copy = () => navigator.clipboard?.writeText(`Subject: ${m.subject}\n\n${body}`)
  const outlook = () => { copy(); const { url, truncated } = mailtoUrl(to, m.subject, body); if (truncated) alert('The email is long, so Outlook opens with a shortened version. The full text is copied – press Ctrl+V in the email body.'); location.href = url }
  const web = () => { copy(); window.open(`https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(m.subject)}&body=${encodeURIComponent(body.slice(0, 7000))}`, '_blank') }
  const inp = 'w-full rounded border px-2 py-1.5 text-sm'
  return (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog"><div className="max-h-[92vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-4 shadow-xl">
    <h3 className="mb-3 font-semibold text-ksa">{mode === 'request' ? 'Email the team to start this work' : 'Submit evidence by email'}</h3>
    <div className="grid gap-2 sm:grid-cols-2"><label className="text-xs">To (team / reviewer email)<input value={to} onChange={e => setTo(e.target.value)} placeholder="team@company.com; other@company.com" className={inp} /></label>
      {mode === 'request' && <label className="text-xs">Deadline<input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inp} /></label>}</div>
    <label className="mt-2 block text-xs">Additional message (optional)<input value={extra} onChange={e => { setExtra(e.target.value); setEdit(null) }} className={inp} /></label>
    <p className="mt-2 text-xs text-slate-500">Subject: <b>{m.subject}</b></p>
    <textarea value={body} onChange={e => setEdit(e.target.value)} rows={14} className="mt-1 w-full rounded border p-2 font-mono text-xs" />
    <p className="mt-1 text-xs text-amber-700">{mode === 'evidence' ? 'Browsers cannot attach files automatically – attach your evidence files in Outlook before sending. ' : ''}Review the text, then send from Outlook.</p>
    <div className="mt-3 flex flex-wrap gap-2"><button onClick={outlook} className={P}><Send size={14} />Open in Outlook</button><button onClick={web} className={B}>Outlook on the web</button><button onClick={() => { copy(); alert('Copied') }} className={B}>Copy text</button><button onClick={onClose} className="ml-auto text-sm text-slate-500 underline">Close</button></div></div></div>)
}
export default function ScopeButtons({ scope, prefix = '' }) {
  const app = useApp(), [m, setM] = useState(null), items = useMemo(() => universe().filter(scope.filter), [scope.title]), p = prefix ? prefix + ' ' : ''
  return (<><button onClick={() => exportReport({ title: scope.title, items, ...app })} className={P}><FileDown size={14} />{prefix ? `Export ${prefix} report` : 'Export PDF'}</button>
    <button onClick={() => setM('request')} className={B}><Mail size={14} />Email {p}team</button><button onClick={() => setM('evidence')} className={B}><Send size={14} />Submit {p}evidence</button>
    {m && <MailModal mode={m} scope={scope} items={items} onClose={() => setM(null)} />}</>)
}
