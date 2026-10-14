import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './lib/store.jsx'
import { wantsNewTab } from './lib/newtab.js'
import Login from './components/Login.jsx'; import TopBar from './components/TopBar.jsx'; import Workspace from './components/Workspace.jsx'; import Home from './components/Home.jsx'; import Results from './components/Results.jsx'
import Dashboard from './components/Dashboard.jsx'; import Profile from './components/Profile.jsx'; import Admin from './components/Admin.jsx'; import Footer from './components/Footer.jsx'; import Library from './components/Library.jsx'; import { Reports } from './components/Pages.jsx'
const parse = () => { const h = decodeURIComponent(location.hash.replace(/^#\/?/, '')), i = h.indexOf('/'); return i < 0 ? { tab: h || 'home', arg: '' } : { tab: h.slice(0, i), arg: h.slice(i + 1) } }
function Shell() {
  const { tok, me, err, lang, langKey } = useApp(), [r, setR] = useState(parse), [sq, setSq] = useState({ q: '' }), [sk, setSk] = useState(0)
  useEffect(() => { const h = () => { setR(parse()); window.scrollTo(0, 0) }; window.addEventListener('hashchange', h); return () => window.removeEventListener('hashchange', h) }, [])
  const nav = hash => wantsNewTab() ? window.open(location.pathname + hash, '_blank') : (location.hash = hash)
  const go = n => nav('#/' + n.mode + '/' + encodeURIComponent(n.id)), setTab = k => nav('#/' + k), setAsec = s => nav('#/admin/' + s), openDash = s => nav('#/dash/' + s)
  const onSearch = f => { setSq(f); setSk(k => k + 1); location.hash = '#/results'; setR(parse()) }
  const tab = r.tab
  let body
  if (!tok) body = <Login />
  else if (!me) body = <p className="p-10 text-center text-sm text-slate-500">{err ? 'Cannot load data: ' + err : 'Loading…'}</p>
  else if (me.must_change) body = <Profile forced />
  else body = (<><TopBar tab={tab} setTab={setTab} go={go} setAsec={setAsec} onSearch={onSearch} />
    {(tab === 'home' || !tab) && <Home onSearch={onSearch} go={go} />}{tab === 'results' && <Results key={sk} title="Search results" init={sq} go={go} />}{tab === 'tasks' && <Results key="tasks" title="Tasks" init={{}} go={go} />}
    {tab === 'library' && <Library go={go} />}{tab === 'reports' && <Reports openDash={openDash} />}
    {['ndmo', 'ndi', 'oe', 'pdpl'].includes(tab) && <Workspace mode={tab} selId={r.arg} go={go} />}
    {tab === 'dash' && <Dashboard go={go} sub={r.arg || 'all'} setSub={openDash} />}{tab === 'profile' && <Profile />}{tab === 'admin' && <Admin section={r.arg || 'users'} />}</>)
  return <div key={langKey} dir={lang === 'ar' ? 'rtl' : 'ltr'} className="flex min-h-screen flex-col"><div className="flex flex-1 flex-col">{body}</div><Footer /></div>
}
export default function App() { return <AppProvider><Shell /></AppProvider> }
