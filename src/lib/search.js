import { domains, controls, specifications, maturityQuestions, oeMetrics } from '../ndmoData.js'
const items = [
  ...domains.map(d => ({ type:'Domain', id:d.id, title:d.name, sub:d.id, domain:d.id, hay:`${d.id} ${d.name}` })),
  ...controls.map(c => ({ type:'Control', id:c.id, title:c.name, sub:c.id, domain:c.domain, control:c.id, hay:`${c.id} ${c.name} ${c.description}` })),
  ...specifications.map(s => ({ type:'Specification', id:s.id, title:s.name, sub:s.id, domain:s.id.split('.')[0], control:s.control, spec:s.id, hay:`${s.id} ${s.name} ${s.text}` })),
  ...Object.values(maturityQuestions).map(q => ({ type:'NDI Question', id:q.code, title:q.question, sub:q.code, domain:q.code.split('.')[0],
    spec:specifications.find(s => s.ndi.some(n => n.mq === q.code))?.id, hay:`${q.code} ${q.question}` })),
  ...oeMetrics.map(m => ({ type:'NDI OE Metric', id:m.code, title:m.name, sub:`${m.code} · ${m.platform}`, domain:m.domain, hay:`${m.code} ${m.name} ${m.platform}` })),
]
export function search(q, limit = 8) {
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean); if (!terms.length) return {}
  const out = {}
  for (const it of items) {
    const h = it.hay.toLowerCase(); if (!terms.every(t => h.includes(t))) continue
    const score = (it.id.toLowerCase() === q.toLowerCase() ? 100 : 0) + (it.title.toLowerCase().includes(terms[0]) ? 5 : 0)
    ;(out[it.type] ||= []).push({ ...it, score })
  }
  for (const k in out) out[k] = out[k].sort((a, b) => b.score - a.score).slice(0, limit)
  return out
}
