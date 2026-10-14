let flag = false
export const wantsNewTab = () => flag
if (typeof document !== 'undefined') {
  document.addEventListener('click', e => { flag = e.ctrlKey || e.metaKey || e.shiftKey }, true)
  document.addEventListener('click', () => { flag = false }, false)
  document.addEventListener('mousedown', e => { if (e.button === 1 && e.target.closest?.('button')) e.preventDefault() }, true)
  document.addEventListener('auxclick', e => { const b = e.button === 1 && e.target.closest?.('button'); if (b && !b.disabled) { e.preventDefault(); b.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })) } }, true)
}
