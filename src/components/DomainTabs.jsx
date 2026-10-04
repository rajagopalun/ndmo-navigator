export default function DomainTabs({ domains, active, onSelect }) {
  return (<nav aria-label="NDMO domains" className="border-b bg-white"><div role="tablist" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4">
    {domains.map(d => (<button key={d.id} role="tab" aria-selected={active === d.id} onClick={() => onSelect(d.id)}
      className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${active === d.id ? 'border-ksa text-ksa' : 'border-transparent text-slate-600 hover:text-ksa'}`}>
      <span className="mr-1 font-mono text-xs text-slate-400">{d.id}</span>{d.name}</button>))}
  </div></nav>)
}
