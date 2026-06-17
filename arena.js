(function () {
  const twins = {
    mistral: {
      id: 'mistral',
      twinPath: 'twins/01-mistral',
      modelName: 'Mistral 7B',
      modelFamily: 'Mistral',
      parameterCount: '7B',
      ollamaTag: 'mistral:7b',
      contextWindow: '32k tokens',
      challenges: ['atom: Parse Guard', 'molecule: Seal Join', 'compound: Local Review CLI']
    },
    llama: {
      id: 'llama',
      twinPath: 'twins/02-llama',
      modelName: 'Llama 3.2',
      modelFamily: 'Llama',
      parameterCount: '3B',
      ollamaTag: 'llama3.2:3b',
      contextWindow: '128k tokens',
      challenges: ['atom: Tokenizer Probe', 'molecule: Context Budget', 'compound: Arena Adapter']
    },
    phi: {
      id: 'phi',
      twinPath: 'twins/03-phi',
      modelName: 'Phi-3 Mini',
      modelFamily: 'Phi',
      parameterCount: '3.8B',
      ollamaTag: 'phi3:mini',
      contextWindow: '4k tokens',
      challenges: ['atom: Small Proof', 'molecule: Memory Fit', 'compound: Offline Judge']
    }
  }

  const twinId = document.body.dataset.twin
  const twin = twins[twinId]
  const output = document.getElementById('twin-output')
  const seal = document.getElementById('twin-seal')

  async function sealTwinPage() {
    if (!twin || !window.WormChain) return
    const event = await window.WormChain.appendEvent('TWIN_PAGE_SEALED', twin)
    if (seal) seal.textContent = event.seal
  }

  async function startChallenge() {
    if (!twin || !window.WormChain) return
    const event = await window.WormChain.appendEvent('CHALLENGE_SELECTED', {
      model: twin.ollamaTag,
      challenge: twin.challenges[0],
      localCommand: `python orchestrator/main.py --model ${twin.ollamaTag} --challenge atom`
    })
    if (output) {
      output.textContent = [
        `Local Ollama command: python orchestrator/main.py --model ${twin.ollamaTag} --challenge atom`,
        `Browser WORM seal: ${event.seal}`,
        'GitHub Pages does not execute the model. Run the Python orchestrator locally.'
      ].join('\n')
    }
  }

  function fineTuneScaffold() {
    if (!twin || !output) return
    output.textContent = [
      `Free-tier scaffold target: ${twin.modelName}`,
      `Run locally: python orchestrator/fine_tune.py --model ${twin.ollamaTag}`,
      'This generates config text and a Colab notebook scaffold. It does not run paid compute.'
    ].join('\n')
  }

  async function swiftMode() {
    if (!twin || !window.WormChain) return
    const command = `cd ${twin.twinPath}/swift && swift run TwinMode atom`
    const event = await window.WormChain.appendEvent('SWIFT_MODE_HANDOFF', {
      twin: twin.id,
      command,
      role: 'architecture visualizer and transformer challenge builder',
      sealAuthority: 'browser-js-worm'
    })
    if (output) {
      output.textContent = [
        `Swift deep compute mode: ${command}`,
        'Swift emits architecture/challenge JSON locally.',
        'Paste or import that JSON into the browser flow to let JS WORM seal the result.',
        `Handoff seal: ${event.seal}`
      ].join('\n')
    }
  }

  function exportTwin() {
    if (!twin) return
    const blob = new Blob([JSON.stringify(twin, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${twin.id}-twin.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  document.querySelector('[data-action="challenge"]')?.addEventListener('click', startChallenge)
  document.querySelector('[data-action="swift"]')?.addEventListener('click', swiftMode)
  document.querySelector('[data-action="fine-tune"]')?.addEventListener('click', fineTuneScaffold)
  document.querySelector('[data-action="export"]')?.addEventListener('click', exportTwin)

  sealTwinPage()
})()
