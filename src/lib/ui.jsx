export const WF = ['Not Started', 'In Progress', 'Evidence Submitted', 'Under Review', 'Verified Compliant', 'Partially Compliant', 'Non-Compliant']
export const WFC = { 'Not Started': 'bg-slate-100 text-slate-600', 'In Progress': 'bg-sky-100 text-sky-700', 'Evidence Submitted': 'bg-amber-100 text-amber-800', 'Under Review': 'bg-violet-100 text-violet-700', 'Verified Compliant': 'bg-emerald-100 text-emerald-700', 'Partially Compliant': 'bg-orange-100 text-orange-700', 'Non-Compliant': 'bg-red-100 text-red-700' }
export const WFH = { 'Not Started': '#94a3b8', 'In Progress': '#0ea5e9', 'Evidence Submitted': '#f59e0b', 'Under Review': '#8b5cf6', 'Verified Compliant': '#10b981', 'Partially Compliant': '#f97316', 'Non-Compliant': '#dc2626' }
export const Badge = ({ s }) => <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ${WFC[s] || WFC['Not Started']}`}>{s || 'Not Started'}</span>
export const Card = ({ title, children, className = '' }) => <section className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{title && <h3 className="mb-3 text-sm font-semibold text-ksa">{title}</h3>}{children}</section>
export const Kpi = ({ l, v, c = '', sub }) => <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><p className="text-xs text-slate-500">{l}</p><p className={`text-2xl font-semibold ${c}`}>{v}</p>{sub && <p className="text-[11px] text-slate-400">{sub}</p>}</div>
export const Bar = ({ pct }) => <div className="h-1.5 overflow-hidden rounded bg-slate-200"><div className="h-full rounded bg-ksa" style={{ width: pct + '%' }} /></div>
export const pctOf = (a, b) => b ? Math.round(a * 100 / b) : 0
export const today = () => new Date().toISOString().slice(0, 10)
export const inDays = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
