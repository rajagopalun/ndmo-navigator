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
const customTree = (nodes, mode, parent = null) => nodes.filter(n => n.mode === mode && (n.parent_id || null) === parent).map(n => { const ch = customTree(nodes, mode, n.id); return { id: 'X:' + n.id, label: n.title, custom: true, ...(ch.length ? { children: ch } : { leaf: true }) } })
export const buildTree = (mode, nodes = []) => {
  let t
  if (mode === 'ndmo') t = domains.map(d => ({ id: d.id, label: `${d.id} · ${d.name}`, children: controls.filter(c => c.domain === d.id).map(c => ({ id: c.id, label: `${c.id} ${c.name}`, children: specsOfControl(c.id).map(s => ({ id: s.id, label: `${s.id} ${s.name}`, leaf: true })) })) })).filter(d => d.children.length)
  else if (mode === 'ndi') { const g = {}; Object.values(maturityQuestions).forEach(q => (g[q.code.split('.')[0]] ||= []).push(q))
    t = Object.entries(g).map(([d, qs]) => ({ id: d, label: `${d} · ${dn(d)}`, children: qs.map(q => ({ id: q.code, label: `${q.code} ${q.question}`, children: Object.entries(q.levels).map(([l, lv]) => ({ id: `${q.code}|${l}`, label: `Level ${l} · ${lv.name}`, leaf: true })) })) })) }
  else { const g = {}; oeMetrics.forEach(m => (g[m.domain] ||= []).push(m)); t = Object.entries(g).map(([d, ms]) => ({ id: d, label: `${d} · ${dn(d)}`, children: ms.map(m => ({ id: m.code, label: `${m.code} ${m.name}`, leaf: true })) })) }
  return [...t, ...customTree(nodes, mode)]
}
export const ancestors = (mode, id, nodes = []) => {
  if (id.startsWith('X:')) { const a = [id]; let c = nodes.find(n => 'X:' + n.id === id); while (c?.parent_id) { a.push('X:' + c.parent_id); c = nodes.find(n => n.id === c.parent_id) } return a }
  return mode === 'ndmo' ? [id.split('.')[0], id.split('.').slice(0, 2).join('.')] : mode === 'ndi' ? [id.split('.')[0], id.split('|')[0]] : [id.split('.')[0]]
}
export const leafKeys = (mode, id) => id.startsWith('X:') ? [id] : mode === 'ndmo' ? ['S:' + id] : mode === 'oe' ? ['M:' + id] : (([mq, l]) => levelKeys(mq, l))(id.split('|'))
export const keysOf = (mode, n) => n.leaf ? leafKeys(mode, n.id) : [...(n.custom ? [n.id] : []), ...n.children.flatMap(c => keysOf(mode, c))]
export const siblingIds = (nodes, id) => { for (const n of nodes) { if (n.id === id) return nodes.map(x => x.id); if (n.children) { const r = siblingIds(n.children, id); if (r) return r } } return null }
export const branchIds = nodes => nodes.flatMap(n => n.children ? [n.id, ...branchIds(n.children)] : [])
const firstLeaf = n => n.leaf ? n : firstLeaf(n.children[0])
export const menuFor = (mode, nodes = []) => buildTree(mode, nodes).map(d => ({ id: d.id, label: d.label, nav: { mode, id: firstLeaf(d).id } }))
export const findNode = (nodes, id) => { for (const n of nodes) { if (n.id === id) return n; const r = n.children && findNode(n.children, id); if (r) return r } return null }
export const pathTo = (nodes, id) => { for (const n of nodes) { if (n.id === id) return [n]; const r = n.children && pathTo(n.children, id); if (r) return [n, ...r] } return null }
