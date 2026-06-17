(function () {
  const key = 'llm-twin-arena-worm-events'
  const ticker = document.getElementById('worm-ticker')
  const log = document.getElementById('worm-log')

  function loadEvents() {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      return []
    }
  }

  function saveEvents(events) {
    localStorage.setItem(key, JSON.stringify(events, null, 2))
  }

  async function sha256(value) {
    const bytes = new TextEncoder().encode(value)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  async function appendEvent(type, payload) {
    const events = loadEvents()
    const parentSeal = events.at(-1)?.seal || 'GENESIS'
    const event = {
      tick: events.length,
      type,
      timestamp: new Date().toISOString(),
      parentSeal,
      payload
    }
    event.seal = await sha256(JSON.stringify(event))
    events.push(event)
    saveEvents(events)
    render(events)
    window.dispatchEvent(new CustomEvent('worm:event', { detail: event }))
    return event
  }

  function render(events = loadEvents()) {
    const last = events.at(-1)
    if (ticker) {
      const rows = events.slice(-5).map((event) => {
        return `<span><b>${event.tick}</b> ${event.type} ${event.seal.slice(0, 12)}...</span>`
      }).join('')
      ticker.innerHTML = rows || '<span>WORM_TICK 0 | awaiting genesis seal</span>'
      ticker.classList.remove('pulse')
      requestAnimationFrame(() => ticker.classList.add('pulse'))
    }
    if (log) log.textContent = JSON.stringify(events.slice(-12), null, 2)
  }

  function exportEvents() {
    const blob = new Blob([JSON.stringify(loadEvents(), null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'worm-events.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  window.WormChain = {
    appendEvent,
    exportEvents,
    loadEvents,
    render,
    sha256
  }

  document.getElementById('export-worm')?.addEventListener('click', exportEvents)

  appendEvent('PAGE_LOAD', { page: document.body.dataset.page || 'unknown' })
  setInterval(() => {
    appendEvent('WORM_TICK', {
      page: document.body.dataset.page || 'unknown',
      lastSeal: loadEvents().at(-1)?.seal || 'GENESIS'
    })
  }, 5000)
})()
