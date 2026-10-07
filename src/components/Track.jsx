import { useState } from 'react'
import { useApp } from '../lib/store.jsx'
const today = () => new Date().toISOString().slice(0, 10)
export default function Track({ k, children, extra }) {
  const { progress, setItem } = useApp(), p = progress[k] || {}, [open, setOpen] = useState(false)
  const over = !p.done && p.due && p.due < today()
  const F = ({ l, f, type = 'text' }) => <label className="text-xs text-slate-600">{l}<input type={type} value={p[f] || ''} onChange={e => setItem(k, { [f]: e.target.value })} className="mt-0.5 w-full rounded border px-2 py-1 text-sm" /></label>
  return (<div className={`rounded border bg-white p-2 ${p.done ? 'border-ksa' : ''}`}>
    <label className="flex cursor-pointer gap-2 text-sm"><input type="checkbox" checked={!!p.done} onChange={e => setItem(k, { done: e.target.checked })} className="mt-1" /><span className="flex-1">{children}</span></label>
    {extra && <div className="ml-6 mt-1">{extra}</div>}
    <div className="ml-6 mt-1 flex flex-wrap items-center gap-3 text-xs">
      {p.done && <span className="font-medium text-ksa">✔ Submitted {new Date(p.date).toLocaleDateString('en-GB')}</span>}
      {over && <span className="font-medium text-red-600">Overdue (due {p.due})</span>}
      {!p.done && p.due && !over && <span className="text-slate-500">Due {p.due}</span>}
      <button onClick={() => setOpen(!open)} className="text-ksa underline">{open ? 'Hide details' : 'Due date, owner, evidence…'}</button></div>
    {open && <div className="ml-6 mt-2 grid gap-2 sm:grid-cols-2">
      <F l="Due date" f="due" type="date" /><F l="Owner" f="owner" />
      {p.done && <label className="text-xs text-slate-600">Submitted date<input type="date" value={(p.date || '').slice(0, 10)} onChange={e => e.target.value && setItem(k, { date: new Date(e.target.value).toISOString() })} className="mt-0.5 w-full rounded border px-2 py-1 text-sm" /></label>}
      <F l="Evidence reference (file name / link / document no.)" f="ref" /><F l="Notes" f="note" /></div>}
  </div>)
}
