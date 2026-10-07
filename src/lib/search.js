import { domains, controls, specifications, maturityQuestions, oeMetrics } from '../ndmoData.js'
import { firstLevel, specsOfControl } from './nav.js'
const sp = s => ({ mode: 'ndmo', id: s.id })
const items = [
  ...domains.map(d => ({ type: 'Domain', sub: d.id, title: d.name, hay: `${d.id} ${d.name}`, nav: (s => s && sp(s))(specifications.find(x => x.id.startsWith(d.id + '.'))) })),
  ...controls.map(c => ({ type: 'Control', sub: c.id, title: c.name, hay: `${c.id} ${c.name} ${c.description}`, nav: (s => s && sp(s))(specsOfControl(c.id)[0]) })),
  ...specifications.map(s => ({ type: 'NDMO Specification', sub: s.id, title: s.name, hay: `${s.id} ${s.name} ${s.text}`, nav: sp(s) })),
  ...Object.values(maturityQuestions).map(q => ({ type: 'NDI Question', sub: q.code, title: q.question, hay: `${q.code} ${q.question}`, nav: { mode: 'ndi', id: `${q.code}|${firstLevel(q.code)}` } })),
  ...Object.values(maturityQuestions).flatMap(q => Object.entries(q.levels).flatMap(([l, lv]) => lv.items.map(it => ({ type: 'NDI Evidence', sub: `${q.code} · L${l}`, title: it.evidence, hay: `${q.code} ${it.evidence} ${it.criteria?.text || ''}`, nav: { mode: 'ndi', id: `${q.code}|${l}` } })))),
  ...oeMetrics.map(m => ({ type: 'NDI OE Metric', sub: `${m.code} · ${m.platform}`, title: m.name, hay: `${m.code} ${m.name} ${m.platform}`, nav: { mode: 'oe', id: m.code } })),
].filter(i => i.nav)
export function search(q, limit = 6) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean), out = {}
  if (!terms.length) return out
  for (const it of items) { const h = it.hay.toLowerCase(); if (terms.every(t => h.includes(t))) (out[it.type] ||= []).push(it) }
  for (const k in out) out[k] = out[k].slice(0, limit)
  return out
}
