export function resetMobileViewport() {
  if (typeof window === 'undefined') {
    return
  }

  const active = document.activeElement
  if (active instanceof HTMLElement) {
    active.blur()
  }

  const scrollTop = () => {
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }

  scrollTop()
  window.requestAnimationFrame(scrollTop)
  window.setTimeout(scrollTop, 100)
  window.setTimeout(scrollTop, 300)
}
