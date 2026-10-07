import { useState } from 'react'
import { AppProvider, useApp } from './lib/store.jsx'
import { first } from './lib/nav.js'
import Login from './components/Login.jsx'; import TopBar from './components/TopBar.jsx'; import Workspace from './components/Workspace.jsx'
import Dashboard from './components/Dashboard.jsx'; import Profile from './components/Profile.jsx'
function Shell() {
  const { user } = useApp(), [tab, setTab] = useState('ndmo'), [sel, setSel] = useState({ ndmo: first('ndmo'), ndi: first('ndi'), oe: first('oe') })
  const go = n => { setTab(n.mode); setSel(s => ({ ...s, [n.mode]: n.id })); window.scrollTo(0, 0) }
  if (!user) return <Login />
  return (<div className="min-h-screen"><TopBar tab={tab} setTab={setTab} go={go} />
    {['ndmo', 'ndi', 'oe'].includes(tab) && <Workspace mode={tab} selId={sel[tab]} go={go} />}
    {tab === 'dash' && <Dashboard go={go} />}{tab === 'profile' && <Profile />}</div>)
}
export default function App() { return <AppProvider><Shell /></AppProvider> }
