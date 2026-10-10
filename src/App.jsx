import { useState } from 'react'
import { AppProvider, useApp } from './lib/store.jsx'
import Login from './components/Login.jsx'; import TopBar from './components/TopBar.jsx'; import Workspace from './components/Workspace.jsx'; import Home from './components/Home.jsx'; import Results from './components/Results.jsx'
import Dashboard from './components/Dashboard.jsx'; import Profile from './components/Profile.jsx'; import Admin from './components/Admin.jsx'; import Footer from './components/Footer.jsx'; import Library from './components/Library.jsx'; import { Reports } from './components/Pages.jsx'
function Shell() {
  const { tok, me, err } = useApp(), [tab, setTab] = useState('home'), [dsub, setDsub] = useState('all'), [asec, setAsec] = useState('users'), [sel, setSel] = useState({ ndmo: '', ndi: '', oe: '' }), [sq, setSq] = useState({ q: '' }), [sk, setSk] = useState(0)
  const go = n => { setTab(n.mode); setSel(s => ({ ...s, [n.mode]: n.id })); window.scrollTo(0, 0) }, onSearch = f => { setSq(f); setSk(k => k + 1); setTab('results'); window.scrollTo(0, 0) }, openDash = s => { setDsub(s); setTab('dash') }
  let body
  if (!tok) body = <Login />
  else if (!me) body = <p className="p-10 text-center text-sm text-slate-500">{err ? 'Cannot load data: ' + err : 'Loading…'}</p>
  else if (me.must_change) body = <Profile forced />
  else body = (<><TopBar tab={tab} setTab={setTab} go={go} setAsec={setAsec} onSearch={onSearch} />
    {tab === 'home' && <Home onSearch={onSearch} go={go} />}{tab === 'results' && <Results key={sk} title="Search results" init={sq} go={go} />}{tab === 'tasks' && <Results key="tasks" title="Tasks" init={{}} go={go} />}
    {tab === 'library' && <Library go={go} />}{tab === 'reports' && <Reports openDash={openDash} />}
    {['ndmo', 'ndi', 'oe'].includes(tab) && <Workspace mode={tab} selId={sel[tab]} go={go} />}
    {tab === 'dash' && <Dashboard go={go} sub={dsub} setSub={setDsub} />}{tab === 'profile' && <Profile />}{tab === 'admin' && <Admin section={asec} />}</>)
  return <div className="flex min-h-screen flex-col"><div className="flex flex-1 flex-col">{body}</div><Footer /></div>
}
export default function App() { return <AppProvider><Shell /></AppProvider> }
