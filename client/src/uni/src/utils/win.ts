export function openInNewTab(url: string) {
  const win = window.open(url, '_blank')
  if (win) {
    win.focus()
  }
}
