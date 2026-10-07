import { domains, controls, specifications, maturityQuestions, oeMetrics } from '../ndmoData.js'
export const dn = id => domains.find(d => d.id === id)?.name || id
export const firstLevel = mq => Object.keys(maturityQuestions[mq]?.levels || {})[0]
export const specsOfControl = c => specifications.filter(s => s.control === c)
export const specsForLevel = (mq, l) => specifications.filter(s => s.ndi.some(n => n.mq === mq && String(n.level) === String(l)))
export const levelKeys = (mq, l) => { const lv = maturityQuestions[mq].levels[l]; return [...lv.items.map((_, i) => `E:${mq}|${l}|${i}`), ...lv.loose.map((_, j) => `C:${mq}|${l}|${j}`)] }
export const resolve = code => {
  if (/\.MQ\./.test(code)) return maturityQuestions[code] ? { mode: 'ndi', id: `${code}|${firstLevel(code)}` } : null
  if (/\.OE\./.test(code)) return oeMetrics.find(m => m.code === code) ? { mode: 'oe', id: code } : null
  if (specifications.some(s => s.id === code)) return { mode: 'ndmo', id: code }
  const s = specsOfControl(code)[0]; return s ? { mode: 'ndmo', id: s.id } : null
}
export const first = mode => mode === 'ndmo' ? specifications[0].id : mode === 'oe' ? oeMetrics[0].code : (c => `${c}|${firstLevel(c)}`)(Object.keys(maturityQuestions)[0])
export const buildTree = mode => {
  if (mode === 'ndmo') return domains.map(d => ({ id: d.id, label: `${d.id} · ${d.name}`, children: controls.filter(c => c.domain === d.id).map(c => ({ id: c.id, label: `${c.id} ${c.name}`, children: specsOfControl(c.id).map(s => ({ id: s.id, label: `${s.id} ${s.name}`, leaf: true })) })) })).filter(d => d.children.length)
  const g = {}
  if (mode === 'ndi') { Object.values(maturityQuestions).forEach(q => (g[q.code.split('.')[0]] ||= []).push(q))
    return Object.entries(g).map(([d, qs]) => ({ id: d, label: `${d} · ${dn(d)}`, children: qs.map(q => ({ id: q.code, label: `${q.code} ${q.question}`, children: Object.entries(q.levels).map(([l, lv]) => ({ id: `${q.code}|${l}`, label: `Level ${l} · ${lv.name}`, leaf: true })) })) })) }
  oeMetrics.forEach(m => (g[m.domain] ||= []).push(m))
  return Object.entries(g).map(([d, ms]) => ({ id: d, label: `${d} · ${dn(d)}`, children: ms.map(m => ({ id: m.code, label: `${m.code} ${m.name}`, leaf: true })) }))
}
export const ancestors = (mode, id) => mode === 'ndmo' ? [id.split('.')[0], id.split('.').slice(0, 2).join('.')] : mode === 'ndi' ? [id.split('.')[0], id.split('|')[0]] : [id.split('.')[0]]

const firstLeaf = n => n.leaf ? n : firstLeaf(n.children[0])
export const menuFor = mode => buildTree(mode).map(d => ({ id: d.id, label: d.label, nav: { mode, id: firstLeaf(d).id } }))
