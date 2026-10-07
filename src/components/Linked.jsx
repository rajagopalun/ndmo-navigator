import { resolve } from '../lib/nav.js'
export default function Linked({ text, go }) {
  return <>{String(text).split(/\b([A-Z]{2,4}\.(?:MQ\.|OE\.)?\d+(?:\.\d+)?)\b/).map((p, i) => {
    const r = i % 2 ? resolve(p) : null
    return r ? <button key={i} onClick={() => go(r)} className="font-mono text-ksa underline decoration-dotted hover:bg-ksa-light">{p}</button> : p
  })}</>
}
