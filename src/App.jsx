import { useState, useMemo } from 'react'
import { domains, controls, specifications } from './ndmoData.js'
import TopBar from './components/TopBar.jsx'; import DomainTabs from './components/DomainTabs.jsx'
import ControlList from './components/ControlList.jsx'; import SpecDetail from './components/SpecDetail.jsx'
export default function App() {
  const [domain, setDomain] = useState(domains[0].id); const [openControl, setOpenControl] = useState(null); const [specId, setSpecId] = useState(null)
  const dControls = useMemo(() => controls.filter(c => c.domain === domain), [domain])
  const spec = specifications.find(s => s.id === specId)
  const pick = r => { setDomain(r.domain); setOpenControl(r.control || null); setSpecId(r.spec || null) }
  const selectDomain = id => { setDomain(id); setOpenControl(null); setSpecId(null) }
  return (<div className="min-h-screen"><TopBar onPick={pick} /><DomainTabs domains={domains} active={domain} onSelect={selectDomain} />
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[22rem_1fr]">
      <div>{dControls.length ? <ControlList controls={dControls} specs={specifications} openControl={openControl} onToggle={id => setOpenControl(o => o === id ? null : id)} selectedSpec={specId} onSelectSpec={setSpecId} />
        : <p className="rounded-lg border bg-white p-4 text-sm text-slate-600">This domain’s controls and specifications are issued by the National Cybersecurity Authority (NCA); the NDMO standards document does not list them.</p>}</div>
      <SpecDetail key={specId} spec={spec} control={controls.find(c => c.id === spec?.control)} /></main></div>)
}
