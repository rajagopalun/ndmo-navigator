import { ChevronDown, ChevronRight } from 'lucide-react'
const pc = { P1:'bg-red-100 text-red-800', P2:'bg-amber-100 text-amber-800', P3:'bg-sky-100 text-sky-800', NCA:'bg-slate-200 text-slate-700' }
export default function ControlList({ controls, specs, openControl, onToggle, selectedSpec, onSelectSpec }) {
  return (<aside aria-label="Controls" className="space-y-2">{controls.map(c => { const open = openControl === c.id; const list = specs.filter(s => s.control === c.id)
    return (<div key={c.id} className="rounded-lg border bg-white">
      <button aria-expanded={open} onClick={() => onToggle(c.id)} className="flex w-full items-start gap-2 p-3 text-left">
        {open ? <ChevronDown size={18} className="mt-0.5 shrink-0 text-ksa" /> : <ChevronRight size={18} className="mt-0.5 shrink-0 text-slate-400" />}
        <span><span className="font-mono text-xs text-slate-500">{c.id}</span><span className="block text-sm font-semibold">{c.name}</span>
          <span className="text-xs text-slate-500">{list.length} specification{list.length !== 1 && 's'}</span></span></button>
      {open && <ul className="border-t px-2 py-1">{list.map(s => (<li key={s.id}><button onClick={() => onSelectSpec(s.id)} aria-current={selectedSpec === s.id}
        className={`flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm ${selectedSpec === s.id ? 'bg-ksa-light font-medium text-ksa-dark' : 'hover:bg-slate-50'}`}>
        <span className="font-mono text-xs">{s.id}</span><span className="flex-1">{s.name}</span><span className={`rounded px-1.5 text-xs ${pc[s.priority] || ''}`}>{s.priority}</span></button></li>))}</ul>}
    </div>) })}</aside>)
}
