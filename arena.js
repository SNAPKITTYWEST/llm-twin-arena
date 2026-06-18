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
      challenges: [
        { level: 'atom', title: 'Parse Guard', prompt: 'Write a pure function that validates a JSON WORM event has tick, model, challenge, result, and seal. Return code and one test case.' },
        { level: 'molecule', title: 'Seal Join', prompt: 'Given two WORM events, produce a deterministic parent-child summary without mutating either input. Return TypeScript.' },
        { level: 'compound', title: 'Local Review CLI', prompt: 'Design a tiny local CLI that calls Ollama, records the response, and appends a sealed challenge result.' }
      ]
    },
    llama: {
      id: 'llama',
      twinPath: 'twins/02-llama',
      modelName: 'Llama 3.2',
      modelFamily: 'Llama',
      parameterCount: '3B',
      ollamaTag: 'llama3.2:3b',
      contextWindow: '128k tokens',
      challenges: [
        { level: 'atom', title: 'Tokenizer Probe', prompt: 'Return the smallest useful prompt that exposes token boundary assumptions. Explain why it works.' },
        { level: 'molecule', title: 'Context Budget', prompt: 'Write a function that trims messages while preserving a WORM event footer. Return JavaScript.' },
        { level: 'compound', title: 'Arena Adapter', prompt: 'Build a local Ollama adapter that streams a response and records the final WORM seal.' }
      ]
    },
    phi: {
      id: 'phi',
      twinPath: 'twins/03-phi',
      modelName: 'Phi-3 Mini',
      modelFamily: 'Phi',
      parameterCount: '3.8B',
      ollamaTag: 'phi3:mini',
      contextWindow: '4k tokens',
      challenges: [
        { level: 'atom', title: 'Small Proof', prompt: 'Write a tiny invariant check that refuses empty challenge prompts. Return code and explanation.' },
        { level: 'molecule', title: 'Memory Fit', prompt: 'Summarize a long challenge into a compact local prompt with explicit constraints.' },
        { level: 'compound', title: 'Offline Judge', prompt: 'Create a local-only judge that grades a response and seals the result.' }
      ]
    },
    nemotron: {
      id: 'nemotron',
      twinPath: 'twins/04-nemotron',
      modelName: 'Nemotron-Mini-4B',
      modelFamily: 'NVIDIA Nemotron',
      parameterCount: '4B',
      ollamaTag: 'nemotron',
      contextWindow: 'local Ollama runtime dependent',
      modelMap: 'nvidia/NVIDIA-Nemotron-3-Nano-4B-GGUF',
      architecture: {
        layers: 32,
        heads: 32,
        hiddenDimension: 2048,
        attention: 'GQA'
      },
      challenges: [
        { level: 'atom', title: 'Attention Mechanism', prompt: 'Implement a grouped-query attention shape check for 32 heads and hidden dimension 2048. Return code.' },
        { level: 'molecule', title: 'Tokenizer', prompt: 'Build a tokenizer probe that records edge-case tokens and prepares the result for JS WORM sealing.' },
        { level: 'compound', title: 'Embedding Layer', prompt: 'Create an embedding-layer inspector that reports hidden dimension 2048 and emits a sealed handoff payload.' }
      ]
    }
  }

  const twinId = document.body.dataset.twin
  const twin = twins[twinId]
  const activeModel = twin || {
    id: 'arena',
    twinPath: '.',
    modelName: 'Arena Lobby',
    ollamaTag: 'nemotron-mini-snapkitty:latest',
    challenges: [
      { level: 'arena', title: 'Build Shadow Orchestrator', prompt: 'Generate a concise constitution for a local-first LLM twin arena.' }
    ]
  }
  const output = document.getElementById('twin-output')
  const seal = document.getElementById('twin-seal')
  let currentAbort = null
  let lastShadowManifest = null
  let adaSealTimer = null
  let lastAdaContract = ''
  let lastAgentManifest = null
  let battleAbort1 = null
  let battleAbort2 = null
  let chosenClass = 'oracle'
  let activeCaps = new Set(['run_local_ollama', 'seal_worm_events', 'judge_challenges'])
  let blockedCaps = new Set(['paid_api_call'])

  const AGENT_CLASSES = {
    sentinel: {
      icon: '🛡️', name: 'SENTINEL',
      desc: 'Blocks threats. Enforces governance. Never negotiates.',
      stats: { speed: 38, power: 92, trust: 100 },
      caps: ['seal_worm_events', 'reject_violations', 'judge_challenges'],
      blocked: ['paid_api_call', 'skip_worm_seal', 'deploy_unsigned_build']
    },
    oracle: {
      icon: '🔮', name: 'ORACLE',
      desc: 'Pure inference. Sees all, states what is true.',
      stats: { speed: 72, power: 84, trust: 80 },
      caps: ['run_local_ollama', 'seal_worm_events', 'judge_challenges'],
      blocked: ['paid_api_call']
    },
    builder: {
      icon: '⚙️', name: 'BUILDER',
      desc: 'Generates code, contracts, shadow orchestrators.',
      stats: { speed: 78, power: 68, trust: 76 },
      caps: ['run_local_ollama', 'seal_worm_events', 'build_contracts', 'generate_code', 'export_json'],
      blocked: ['paid_api_call', 'deploy_unsigned_build']
    },
    archivist: {
      icon: '📜', name: 'ARCHIVIST',
      desc: 'Seals, stores, retrieves. Memory is the mission.',
      stats: { speed: 55, power: 58, trust: 96 },
      caps: ['seal_worm_events', 'export_json', 'build_contracts'],
      blocked: ['paid_api_call', 'skip_worm_seal', 'deploy_unsigned_build']
    },
    berserker: {
      icon: '⚡', name: 'BERSERKER',
      desc: 'Maximum velocity. Swift compute. No limits except the chain.',
      stats: { speed: 100, power: 88, trust: 48 },
      caps: ['run_local_ollama', 'swift_compute', 'generate_code', 'fine_tune'],
      blocked: ['paid_api_call']
    }
  }

  const ALL_CAPS = ['run_local_ollama','seal_worm_events','build_contracts','generate_code','judge_challenges','export_json','swift_compute','fine_tune','reject_violations']
  const ALL_BLOCKED = ['paid_api_call','skip_worm_seal','deploy_unsigned_build','external_domain_call','bypass_worm']

  let wizardCurrentStep = 0
  let twinConfig = { name: '', modelTag: 'nemotron', modelName: 'Nemotron-Mini-4B', avatarDataUrl: null, personality: '', endpoint: 'http://127.0.0.1:11434' }
  let ttsEnabled = true

  function challengeText(challenge) {
    return `${challenge.level}: ${challenge.title}\n${challenge.prompt}`
  }

  async function sealTwinPage() {
    if (!twin || !window.WormChain) return
    const event = await window.WormChain.appendEvent('TWIN_PAGE_SEALED', twin)
    if (seal) seal.textContent = event.seal
  }

  function terminalWrite(node, text) {
    node.textContent += text
    node.scrollTop = node.scrollHeight
  }

  async function streamOllama({ endpoint, model, prompt, onToken, signal }) {
    const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      body: JSON.stringify({ model, prompt, stream: true }),
      signal
    })
    if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`)
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let full = ''
    let doneSeen = false
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        const chunk = JSON.parse(line)
        if (chunk.response) {
          full += chunk.response
          onToken(chunk.response, chunk)
        }
        if (chunk.done === true) doneSeen = true
      }
    }
    if (buffer.trim()) {
      const chunk = JSON.parse(buffer)
      if (chunk.response) {
        full += chunk.response
        onToken(chunk.response, chunk)
      }
      if (chunk.done === true) doneSeen = true
    }
    return { full, doneSeen }
  }

  function ensureOllamaBox() {
    if (!twin || document.getElementById('ollama-box')) return
    document.querySelector('[data-action="challenge"]')?.remove()
    const panel = document.createElement('section')
    panel.className = 'panel ollama-box'
    panel.id = 'ollama-box'
    panel.innerHTML = `
      <div class="box-head">
        <div>
          <p class="eyebrow">Ollama In A Box</p>
          <h2>Live LLM Terminal</h2>
        </div>
        <span class="runtime-pill" id="ollama-status">checking</span>
      </div>
      <div class="runtime-grid">
        <label>Endpoint
          <input id="ollama-endpoint" value="http://127.0.0.1:11434" spellcheck="false">
        </label>
        <label>Twin tag
          <input id="ollama-model" value="${twin.ollamaTag}" spellcheck="false">
        </label>
      </div>
      <label>User Input
        <textarea id="ollama-prompt" spellcheck="false">${challengeText(twin.challenges[0])}</textarea>
      </label>
      <div class="challenge-strip">
        ${twin.challenges.map((challenge, index) => `<button class="button mini-button" data-challenge-index="${index}">${challenge.level}: ${challenge.title}</button>`).join('')}
      </div>
      <div class="actions">
        <button class="button" data-action="ollama-run">Run LLM In Browser</button>
        <button class="button" data-action="ollama-stop">Stop</button>
        <button class="button" data-action="ollama-copy">Copy Output</button>
      </div>
      <div id="ollama-output" class="log live-output" aria-live="polite"></div>
      <p class="seal-line">Response WORM seal: <code id="ollama-response-seal">waiting</code></p>
    `
    document.querySelector('.architecture')?.insertAdjacentElement('afterend', panel)
    panel.querySelectorAll('[data-challenge-index]').forEach((button) => {
      button.addEventListener('click', () => {
        const selected = twin.challenges[Number(button.dataset.challengeIndex)]
        document.getElementById('ollama-prompt').value = challengeText(selected)
      })
    })
    panel.querySelector('[data-action="ollama-run"]').addEventListener('click', runOllama)
    panel.querySelector('[data-action="ollama-stop"]').addEventListener('click', stopOllama)
    panel.querySelector('[data-action="ollama-copy"]').addEventListener('click', copyOllamaOutput)
    checkOllama()
  }

  async function checkOllama() {
    const status = document.getElementById('ollama-status')
    const endpoint = document.getElementById('ollama-endpoint')?.value || 'http://127.0.0.1:11434'
    if (!status) return
    try {
      const response = await fetch(`${endpoint}/api/tags`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      const count = (data.models || []).length
      status.textContent = `online ${count}`
      status.dataset.state = 'online'
    } catch {
      status.textContent = 'offline'
      status.dataset.state = 'offline'
    }
  }

  async function runOllama() {
    if (!twin || !window.WormChain) return
    const endpoint = document.getElementById('ollama-endpoint').value
    const model = document.getElementById('ollama-model').value.trim()
    const prompt = document.getElementById('ollama-prompt').value.trim()
    const live = document.getElementById('ollama-output')
    const responseSeal = document.getElementById('ollama-response-seal')
    if (!prompt) {
      live.textContent = 'SENTINEL BLOCK: prompt is empty.'
      return
    }
    currentAbort = new AbortController()
    live.textContent = ''
    responseSeal.textContent = 'streaming'
    await window.WormChain.appendEvent('OLLAMA_STREAM_START', {
      twin: twin.id,
      model,
      promptHash: await window.WormChain.sha256(prompt)
    })
    try {
      const result = await streamOllama({
        endpoint,
        model,
        prompt,
        signal: currentAbort.signal,
        onToken: (token) => terminalWrite(live, token)
      })
      if (!result.doneSeen) throw new Error('stream ended before done=true')
      const event = await window.WormChain.appendEvent('OLLAMA_STREAM_DONE', {
        twin: twin.id,
        model,
        promptHash: await window.WormChain.sha256(prompt),
        responseHash: await window.WormChain.sha256(result.full),
        response: result.full
      })
      responseSeal.textContent = event.seal
      if (seal) seal.textContent = event.seal
      if (output) output.textContent = `Live browser LLM response sealed: ${event.seal}`
    } catch (error) {
      const message = error.name === 'AbortError'
        ? 'STREAM STOPPED BY USER'
        : `STREAM ERROR: ${error.message}`
      terminalWrite(live, `\n${message}`)
      const event = await window.WormChain.appendEvent('OLLAMA_STREAM_ERROR', {
        twin: twin.id,
        model,
        reason: message
      })
      responseSeal.textContent = event.seal
      if (seal) seal.textContent = event.seal
    } finally {
      currentAbort = null
      checkOllama()
    }
  }

  function stopOllama() {
    currentAbort?.abort()
  }

  async function copyOllamaOutput() {
    const text = document.getElementById('ollama-output')?.textContent || ''
    await navigator.clipboard?.writeText(text)
  }

  function ensureShadowOrchestrator() {
    if (document.getElementById('shadow-orchestrator')) return
    const host = document.createElement('section')
    host.className = 'panel shadow-box'
    host.id = 'shadow-orchestrator'
    host.innerHTML = `
      <div class="box-head">
        <div>
          <p class="eyebrow">Shadow Orchestrator Creator</p>
          <h2>Build Happening Live</h2>
        </div>
        <span class="runtime-pill" id="shadow-status">ready</span>
      </div>
      <div class="runtime-grid">
        <label>Endpoint
          <input id="shadow-endpoint" value="http://127.0.0.1:11434" spellcheck="false">
        </label>
        <label>Builder model
          <input id="shadow-model" value="${activeModel.ollamaTag}" spellcheck="false">
        </label>
      </div>
      <button class="button" data-action="shadow-build">Build Shadow Orchestrator for ${activeModel.id}</button>
      <div id="shadow-terminal" class="log live-output" aria-live="polite"></div>
      <p class="seal-line">Final shadow WORM seal: <code id="shadow-seal">waiting</code></p>
      <button class="button" data-action="shadow-download" disabled>Download Shadow Orchestrator</button>
    `
    const anchor = document.getElementById('ollama-box') || document.querySelector('.twin-grid') || document.querySelector('.architecture') || document.querySelector('.hero')
    anchor.insertAdjacentElement('afterend', host)
    host.querySelector('[data-action="shadow-build"]').addEventListener('click', buildShadowOrchestrator)
    host.querySelector('[data-action="shadow-download"]').addEventListener('click', downloadShadowOrchestrator)
  }

  async function buildTick(terminal, label, payload) {
    terminalWrite(terminal, `${label}...  `)
    const event = await window.WormChain.appendEvent('SHADOW_ORCHESTRATOR_TICK', payload)
    terminalWrite(terminal, `✓ ${event.seal.slice(0, 16)}...\n`)
    return event
  }

  async function buildShadowOrchestrator() {
    if (!window.WormChain) return
    const terminal = document.getElementById('shadow-terminal')
    const finalSeal = document.getElementById('shadow-seal')
    const status = document.getElementById('shadow-status')
    const download = document.querySelector('[data-action="shadow-download"]')
    const endpoint = document.getElementById('shadow-endpoint').value
    const model = document.getElementById('shadow-model').value.trim()
    const target = activeModel.id
    terminal.textContent = ''
    finalSeal.textContent = 'building'
    status.textContent = 'building'
    status.dataset.state = 'online'
    download.disabled = true

    lastShadowManifest = {
      target,
      model,
      createdAt: new Date().toISOString(),
      ticks: [],
      constitution: ''
    }

    const tick0 = await buildTick(terminal, 'T[0] Writing CONSTITUTION.md', { target, model, file: 'CONSTITUTION.md' })
    lastShadowManifest.ticks.push(tick0)
    terminalWrite(terminal, '\n--- streamed constitution ---\n')
    try {
      const constitutionPrompt = [
        `Write the constitution text for a local-first LLM twin shadow orchestrator named ${target}.`,
        'Keep it concise. Include WORM-first, no paid APIs, local Ollama runtime, and browser JS sealing.'
      ].join('\n')
      const streamed = await streamOllama({
        endpoint,
        model,
        prompt: constitutionPrompt,
        signal: undefined,
        onToken: (token) => {
          lastShadowManifest.constitution += token
          terminalWrite(terminal, token)
        }
      })
      if (!streamed.doneSeen) throw new Error('constitution stream ended before done=true')
    } catch (error) {
      terminalWrite(terminal, `\nCONSTITUTION STREAM ERROR: ${error.message}\n`)
      lastShadowManifest.constitutionError = error.message
    }
    terminalWrite(terminal, '\n--- ticks ---\n')
    for (const [label, file] of [
      ['T[1] Writing abstract/interfaces/', 'abstract/interfaces'],
      ['T[2] Writing pages/00-worm/', 'pages/00-worm'],
      [`T[3] Registering twin ${target}`, `twins/${target}`],
      ['T[4] Sealing to WORM', 'orchestrator/worm_events.json']
    ]) {
      const event = await buildTick(terminal, label, { target, model, file })
      lastShadowManifest.ticks.push(event)
    }
    const final = await window.WormChain.appendEvent('SHADOW_ORCHESTRATOR_COMPLETE', {
      target,
      model,
      manifestHash: await window.WormChain.sha256(JSON.stringify(lastShadowManifest))
    })
    lastShadowManifest.finalSeal = final.seal
    finalSeal.textContent = final.seal
    status.textContent = 'complete'
    download.disabled = false
    terminalWrite(terminal, `\nFINAL WORM SEAL ${final.seal}\n`)
  }

  function downloadShadowOrchestrator() {
    if (!lastShadowManifest) return
    const blob = new Blob([JSON.stringify(lastShadowManifest, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `shadow-orchestrator-${lastShadowManifest.target}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function adaIdentifier(value) {
    const cleaned = (value || 'Shadow_Orchestrator')
      .replace(/[^a-zA-Z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '')
    return cleaned || 'Shadow_Orchestrator'
  }

  function parseList(value) {
    return (value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  function renderAdaContract() {
    const agent = document.getElementById('ada-agent')?.value || activeModel.id
    const allowed = parseList(document.getElementById('ada-allowed')?.value)
    const denied = parseList(document.getElementById('ada-denied')?.value)
    const proof = document.getElementById('ada-proof')?.value || 'Proof_Satisfied(Action)'
    const signer = document.getElementById('ada-signer')?.value || 'Unsigned'
    const packageName = adaIdentifier(`${agent}_Shadow_Orchestrator`)
    const allowedCases = allowed.length
      ? allowed.map((item) => `     -- allow: ${item}`).join('\n')
      : '     -- allow: local_runtime_action'
    const deniedCases = denied.length
      ? denied.map((item) => `         ${adaIdentifier(item)}(Action) => raise Governance_Violation,`).join('\n')
      : '         violates_mandate(Action) => raise Governance_Violation,'

    return `-- Signed trust deed authority: ${signer}
-- Agent: ${agent}
${allowedCases}

package ${packageName} is
  procedure Execute_Action
    (Agent : in Agent_Type; Action : in Action_Type)
  with
    Pre  => Has_Authority(Agent)
            and ${proof}
            and not Sentinel_Blocks(Action),
    Post => WORM_Sealed(Action) and Chain_Valid,
    Contract_Cases => (
${deniedCases}
         others                   => State_Advanced
    );
end ${packageName};
`
  }

  async function refreshAdaContract({ sealNow = true } = {}) {
    const outputNode = document.getElementById('ada-output')
    const sealNode = document.getElementById('ada-seal')
    if (!outputNode) return
    lastAdaContract = renderAdaContract()
    outputNode.textContent = lastAdaContract
    if (!sealNow || !window.WormChain) return
    clearTimeout(adaSealTimer)
    adaSealTimer = setTimeout(async () => {
      const event = await window.WormChain.appendEvent('ADA_CONTRACT_GENERATED', {
        target: activeModel.id,
        contractHash: await window.WormChain.sha256(lastAdaContract),
        signer: document.getElementById('ada-signer')?.value || 'Unsigned'
      })
      if (sealNode) sealNode.textContent = event.seal
    }, 450)
  }

  function ensureAdaContractBuilder() {
    if (document.getElementById('ada-contract-builder')) return
    const host = document.createElement('section')
    host.className = 'panel ada-box'
    host.id = 'ada-contract-builder'
    host.innerHTML = `
      <div class="box-head">
        <div>
          <p class="eyebrow">Ada Contract Builder</p>
          <h2>Shadow Orchestrator Contract</h2>
        </div>
        <span class="runtime-pill" data-state="online">live</span>
      </div>
      <div class="runtime-grid">
        <label>Agent Name
          <input id="ada-agent" value="${activeModel.id}" spellcheck="false">
        </label>
        <label>Who signs the trust deed
          <input id="ada-signer" value="Jessica Westerhoff / SnapKitty Collective" spellcheck="false">
        </label>
      </div>
      <label>What it's allowed to do
        <input id="ada-allowed" value="run local Ollama, seal WORM events, build shadow orchestrators" spellcheck="false">
      </label>
      <label>What it's never allowed to do
        <input id="ada-denied" value="paid_api_call, skip_worm_seal, deploy_unsigned_build" spellcheck="false">
      </label>
      <label>What proof it must satisfy before acting
        <input id="ada-proof" value="Proof_Satisfied(Action)" spellcheck="false">
      </label>
      <pre id="ada-output" class="log live-output"></pre>
      <p class="seal-line">Ada contract WORM seal: <code id="ada-seal">waiting</code></p>
      <button class="button" data-action="ada-download">Download Contract</button>
    `
    const anchor = document.getElementById('shadow-orchestrator') || document.getElementById('ollama-box') || document.querySelector('.revelation-panel') || document.querySelector('.hero')
    anchor.insertAdjacentElement('afterend', host)
    host.querySelectorAll('input').forEach((input) => {
      input.addEventListener('input', () => refreshAdaContract())
    })
    host.querySelector('[data-action="ada-download"]').addEventListener('click', downloadAdaContract)
    refreshAdaContract()
  }

  function downloadAdaContract() {
    if (!lastAdaContract) lastAdaContract = renderAdaContract()
    const agent = adaIdentifier(document.getElementById('ada-agent')?.value || activeModel.id)
    const blob = new Blob([lastAdaContract], { type: 'text/x-ada' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${agent}_shadow_orchestrator.ada`
    link.click()
    URL.revokeObjectURL(url)
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

  document.querySelector('[data-action="challenge"]')?.addEventListener('click', () => document.getElementById('ollama-prompt')?.focus())
  document.querySelector('[data-action="swift"]')?.addEventListener('click', swiftMode)
  document.querySelector('[data-action="fine-tune"]')?.addEventListener('click', fineTuneScaffold)
  document.querySelector('[data-action="export"]')?.addEventListener('click', exportTwin)

  if (twin) ensureOllamaBox()
  ensureShadowOrchestrator()
  ensureAdaContractBuilder()
  ensureAgentBuilder()
  ensureArenaBattle()
  ensureWormViewer()
  sealTwinPage()
  window.addEventListener('worm:event', onWormEvent)
  initTwinBuilder()

  // ── GAME LAYER ──────────────────────────────────────────────

  function triggerSealBurst() {
    const ticker = document.querySelector('.ticker')
    if (!ticker) return
    ticker.classList.remove('worm-seal-burst')
    void ticker.offsetWidth
    ticker.classList.add('worm-seal-burst')
    setTimeout(() => ticker.classList.remove('worm-seal-burst'), 800)
  }

  function onWormEvent(e) {
    renderWormNode(e.detail)
    triggerSealBurst()
  }

  function insertAfterLast(el) {
    const order = ['#worm-viewer','#arena-battle','#agent-builder','#ada-contract-builder','#shadow-orchestrator','#ollama-box','.revelation-panel','.hero']
    for (const sel of order) {
      const anchor = document.querySelector(sel)
      if (anchor && anchor !== el) { anchor.insertAdjacentElement('afterend', el); return }
    }
    document.querySelector('.shell')?.appendChild(el)
  }

  // ── WORM CHAIN VIEWER ────────────────────────────────────────

  function ensureWormViewer() {
    if (document.getElementById('worm-viewer')) return
    const host = document.createElement('section')
    host.className = 'panel worm-viewer'
    host.id = 'worm-viewer'
    host.innerHTML = `
      <div class="box-head">
        <div><p class="eyebrow">Chain View</p><h2>WORM Live Feed</h2></div>
        <span class="runtime-pill" data-state="online">LIVE</span>
      </div>
      <div class="worm-nodes" id="worm-nodes-list"></div>
      <button class="button" data-action="export-chain">Export Chain JSON</button>
    `
    insertAfterLast(host)
    host.querySelector('[data-action="export-chain"]').addEventListener('click', () => window.WormChain?.exportEvents())
    const events = window.WormChain?.loadEvents() || []
    events.slice(-20).forEach(renderWormNode)
  }

  function renderWormNode(event) {
    const list = document.getElementById('worm-nodes-list')
    if (!list) return
    const isTick = event.type === 'WORM_TICK'
    const isPage = event.type === 'PAGE_LOAD'
    const node = document.createElement('div')
    node.className = `worm-node${isTick ? ' tick-event' : ''}${isPage ? ' page-event' : ''}`
    node.innerHTML = `
      <div class="node-type">${event.type}</div>
      <div class="node-seal">${event.seal}</div>
      <div class="node-meta">
        <span class="node-tick">T[${event.tick}]</span>
        <span class="node-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
      </div>
    `
    list.appendChild(node)
    list.scrollTop = list.scrollHeight
  }

  // ── ARENA BATTLE ─────────────────────────────────────────────

  function ensureArenaBattle() {
    if (document.getElementById('arena-battle')) return
    const twinKeys = Object.keys(twins)
    const opts = twinKeys.map(k => `<option value="${twins[k].ollamaTag}">${twins[k].modelName}</option>`).join('')
    const host = document.createElement('section')
    host.className = 'panel battle-panel'
    host.id = 'arena-battle'
    host.innerHTML = `
      <div class="box-head">
        <div><p class="eyebrow">Arena Battle</p><h2>Twin vs Twin</h2></div>
        <span class="runtime-pill" id="battle-status">ready</span>
      </div>
      <label>Endpoint<input id="battle-endpoint" value="http://127.0.0.1:11434" spellcheck="false"></label>
      <label>Battle Prompt
        <textarea id="battle-prompt" spellcheck="false">Write a 3-line proof that local inference beats cloud inference. Be direct and fast.</textarea>
      </label>
      <div class="runtime-grid">
        <label>Fighter 1
          <select id="battle-model-1" style="width:100%;background:#07080c;border:1px solid var(--line);border-radius:6px;padding:11px;color:var(--text);font:inherit">${opts}</select>
        </label>
        <label>Fighter 2
          <select id="battle-model-2" style="width:100%;background:#07080c;border:1px solid var(--line);border-radius:6px;padding:11px;color:var(--text);font:inherit">${opts}</select>
        </label>
      </div>
      <button class="button" data-action="battle-run">⚔️ START BATTLE</button>
      <div class="battle-streams">
        <div class="battle-stream">
          <div class="battle-header">
            <span class="battle-name" id="battle-name-1">Fighter 1</span>
            <span class="battle-tps" id="battle-tps-1">— t/s</span>
          </div>
          <details style="margin-bottom:6px">
            <summary style="color:var(--muted);font-size:0.75rem;cursor:pointer;padding:4px 0">Reasoning</summary>
            <div class="log" id="battle-reason-1" style="max-height:120px;font-size:0.74rem;color:var(--purple);margin-top:6px"></div>
          </details>
          <div class="log battle-output live-output" id="battle-out-1" aria-live="polite"></div>
        </div>
        <div class="battle-stream">
          <div class="battle-header">
            <span class="battle-name" id="battle-name-2">Fighter 2</span>
            <span class="battle-tps" id="battle-tps-2">— t/s</span>
          </div>
          <details style="margin-bottom:6px">
            <summary style="color:var(--muted);font-size:0.75rem;cursor:pointer;padding:4px 0">Reasoning</summary>
            <div class="log" id="battle-reason-2" style="max-height:120px;font-size:0.74rem;color:var(--purple);margin-top:6px"></div>
          </details>
          <div class="log battle-output live-output" id="battle-out-2" aria-live="polite"></div>
        </div>
      </div>
      <div class="verdict-panel" id="battle-verdict" style="display:none">
        <p class="eyebrow">WORM VERDICT</p>
        <p class="verdict-text" id="verdict-text"></p>
        <p class="seal-line">Seal: <code id="verdict-seal"></code></p>
      </div>
    `
    insertAfterLast(host)
    host.querySelector('[data-action="battle-run"]').addEventListener('click', runBattle)
    if (twinKeys.length > 1) host.querySelector('#battle-model-2').value = twins[twinKeys[1]].ollamaTag
  }

  async function runBattle() {
    const endpoint = document.getElementById('battle-endpoint').value
    const m1 = document.getElementById('battle-model-1').value.trim()
    const m2 = document.getElementById('battle-model-2').value.trim()
    const rawPrompt = document.getElementById('battle-prompt').value.trim()
    const out1 = document.getElementById('battle-out-1')
    const out2 = document.getElementById('battle-out-2')
    const reason1 = document.getElementById('battle-reason-1')
    const reason2 = document.getElementById('battle-reason-2')
    const tps1El = document.getElementById('battle-tps-1')
    const tps2El = document.getElementById('battle-tps-2')
    const verdict = document.getElementById('battle-verdict')
    const status = document.getElementById('battle-status')
    if (!rawPrompt) return
    out1.textContent = ''; out2.textContent = ''
    if (reason1) reason1.textContent = ''
    if (reason2) reason2.textContent = ''
    verdict.style.display = 'none'
    status.textContent = 'fighting'; status.dataset.state = 'online'
    document.getElementById('battle-name-1').textContent = m1
    document.getElementById('battle-name-2').textContent = m2

    // Prepend reasoning instruction
    const prompt = `Think step by step before answering. Show your reasoning briefly, then give your final answer.\n\n${rawPrompt}`

    const start = Date.now()
    let t1 = 0, t2 = 0
    if (window.WormChain) await window.WormChain.appendEvent('BATTLE_START', { m1, m2, promptHash: await window.WormChain.sha256(prompt) })
    battleAbort1 = new AbortController()
    battleAbort2 = new AbortController()

    // Split <think>...</think> or reasoning: prefix from final answer
    function routeToken(tok, reasonEl, outputEl, counter, elapsed) {
      counter.total = (counter.total || 0) + 1
      const fullSoFar = (counter.buf || '') + tok
      counter.buf = fullSoFar
      // Detect <think> block
      if (fullSoFar.includes('<think>') || counter.inThink) {
        counter.inThink = true
        if (reasonEl) terminalWrite(reasonEl, tok)
        if (fullSoFar.includes('</think>')) { counter.inThink = false; counter.buf = '' }
      } else {
        terminalWrite(outputEl, tok)
      }
    }

    const c1 = {}, c2 = {}
    await Promise.allSettled([
      streamOllama({ endpoint, model: m1, prompt, signal: battleAbort1.signal,
        onToken: tok => {
          t1++
          routeToken(tok, reason1, out1, c1)
          tps1El.textContent = `${(t1 / ((Date.now()-start)/1000)).toFixed(1)} t/s · ${t1} tok`
        }
      }),
      streamOllama({ endpoint, model: m2, prompt, signal: battleAbort2.signal,
        onToken: tok => {
          t2++
          routeToken(tok, reason2, out2, c2)
          tps2El.textContent = `${(t2 / ((Date.now()-start)/1000)).toFixed(1)} t/s · ${t2} tok`
        }
      })
    ])

    status.textContent = 'sealed'; status.dataset.state = 'complete'
    if (window.WormChain) {
      const elapsed = (Date.now() - start) / 1000
      const r1tps = t1 / elapsed, r2tps = t2 / elapsed
      const winner = r1tps >= r2tps ? m1 : m2
      const event = await window.WormChain.appendEvent('BATTLE_DONE', { m1, m2, t1, t2, elapsed: elapsed.toFixed(2), winner })
      triggerSealBurst()
      verdict.style.display = 'grid'
      document.getElementById('verdict-text').textContent = `${winner} wins · ${Math.max(r1tps,r2tps).toFixed(1)} t/s · ${Math.max(t1,t2)} tokens`
      document.getElementById('verdict-seal').textContent = event.seal
    }
  }

  // ── AGENT BUILDER ────────────────────────────────────────────

  function ensureAgentBuilder() {
    if (document.getElementById('agent-builder')) return
    const host = document.createElement('section')
    host.className = 'panel agent-builder'
    host.id = 'agent-builder'
    host.innerHTML = `
      <div class="box-head">
        <div><p class="eyebrow">KittyVerse Preview</p><h2>Build Your Sovereign Agent</h2></div>
        <span class="runtime-pill" data-state="online">SIM</span>
      </div>
      <div>
        <p class="eyebrow">Choose Class</p>
        <div class="agent-class-grid" id="agent-class-grid">
          ${Object.entries(AGENT_CLASSES).map(([id, cls]) => `
            <div class="agent-class-card${id === chosenClass ? ' chosen' : ''}" data-class-id="${id}">
              <span class="class-icon">${cls.icon}</span>
              <span class="class-name">${cls.name}</span>
              <span class="class-desc">${cls.desc}</span>
            </div>
          `).join('')}
        </div>
      </div>
      <label>Agent Name
        <input id="agent-name" value="AGENT_ORACLE_01" spellcheck="false">
      </label>
      <div>
        <p class="eyebrow">Capabilities — click to toggle</p>
        <div class="cap-row" id="cap-grid">
          ${ALL_CAPS.map(c => `<button class="cap-chip${activeCaps.has(c) ? ' on' : ''}" data-cap="${c}" data-grid="caps">${c}</button>`).join('')}
        </div>
      </div>
      <div>
        <p class="eyebrow">Never Allowed</p>
        <div class="cap-row" id="blocked-grid">
          ${ALL_BLOCKED.map(c => `<button class="cap-chip${blockedCaps.has(c) ? ' blocked-on' : ''}" data-cap="${c}" data-grid="blocked">${c}</button>`).join('')}
        </div>
      </div>
      <div>
        <p class="eyebrow">Agent Stats</p>
        <div class="stat-grid" id="stat-grid">${buildStatHTML(AGENT_CLASSES[chosenClass].stats)}</div>
      </div>
      <button class="button" data-action="deploy-agent">⚡ DEPLOY AGENT</button>
      <div class="boot-log" id="boot-log" style="display:none"></div>
      <div class="agent-profile-card" id="agent-profile" style="display:none"></div>
    `
    insertAfterLast(host)
    host.querySelectorAll('.agent-class-card').forEach(card => card.addEventListener('click', () => selectAgentClass(card.dataset.classId)))
    host.querySelectorAll('.cap-chip').forEach(chip => chip.addEventListener('click', () => toggleCap(chip)))
    host.querySelector('[data-action="deploy-agent"]').addEventListener('click', deployAgent)
  }

  function buildStatHTML(stats) {
    return `
      <div class="stat-row">
        <div class="stat-head"><span>Speed</span><span id="stat-speed-lbl">${stats.speed}%</span></div>
        <div class="stat-track"><div class="stat-fill g" id="stat-speed" style="width:${stats.speed}%"></div></div>
      </div>
      <div class="stat-row">
        <div class="stat-head"><span>Power</span><span id="stat-power-lbl">${stats.power}%</span></div>
        <div class="stat-track"><div class="stat-fill o" id="stat-power" style="width:${stats.power}%"></div></div>
      </div>
      <div class="stat-row">
        <div class="stat-head"><span>Trust</span><span id="stat-trust-lbl">${stats.trust}%</span></div>
        <div class="stat-track"><div class="stat-fill p" id="stat-trust" style="width:${stats.trust}%"></div></div>
      </div>
    `
  }

  function selectAgentClass(id) {
    if (!AGENT_CLASSES[id]) return
    chosenClass = id
    const cls = AGENT_CLASSES[id]
    document.querySelectorAll('.agent-class-card').forEach(c => c.classList.toggle('chosen', c.dataset.classId === id))
    activeCaps = new Set(cls.caps)
    blockedCaps = new Set(cls.blocked)
    document.querySelectorAll('[data-grid="caps"]').forEach(chip => chip.classList.toggle('on', activeCaps.has(chip.dataset.cap)))
    document.querySelectorAll('[data-grid="blocked"]').forEach(chip => chip.classList.toggle('blocked-on', blockedCaps.has(chip.dataset.cap)))
    const s = document.getElementById('stat-speed')
    const p = document.getElementById('stat-power')
    const t = document.getElementById('stat-trust')
    if (s && p && t) {
      s.style.width = '0%'; p.style.width = '0%'; t.style.width = '0%'
      requestAnimationFrame(() => requestAnimationFrame(() => {
        s.style.width = cls.stats.speed + '%'; document.getElementById('stat-speed-lbl').textContent = cls.stats.speed + '%'
        p.style.width = cls.stats.power + '%'; document.getElementById('stat-power-lbl').textContent = cls.stats.power + '%'
        t.style.width = cls.stats.trust + '%'; document.getElementById('stat-trust-lbl').textContent = cls.stats.trust + '%'
      }))
    }
  }

  function toggleCap(chip) {
    const cap = chip.dataset.cap
    if (chip.dataset.grid === 'caps') {
      if (activeCaps.has(cap)) { activeCaps.delete(cap); chip.classList.remove('on') }
      else { activeCaps.add(cap); chip.classList.add('on') }
    } else {
      if (blockedCaps.has(cap)) { blockedCaps.delete(cap); chip.classList.remove('blocked-on') }
      else { blockedCaps.add(cap); chip.classList.add('blocked-on') }
    }
  }

  async function typeToLog(logEl, text, delay) {
    for (const ch of text) {
      logEl.textContent += ch
      logEl.scrollTop = logEl.scrollHeight
      await new Promise(r => setTimeout(r, delay))
    }
  }

  async function deployAgent() {
    const name = (document.getElementById('agent-name')?.value || '').trim() || 'AGENT_01'
    const cls = AGENT_CLASSES[chosenClass]
    const log = document.getElementById('boot-log')
    const profile = document.getElementById('agent-profile')
    const btn = document.querySelector('[data-action="deploy-agent"]')
    log.style.display = 'block'; profile.style.display = 'none'; log.textContent = ''; btn.disabled = true
    const caps = [...activeCaps], blocked = [...blockedCaps]
    const bootLines = [
      `> AGENT DEPLOY INITIATED`,
      `> NAME    : ${name.toUpperCase()}`,
      `> CLASS   : ${cls.name} ${cls.icon}`,
      `> CONSTITUTION CHECK...`,
      `  ✓ has_authority(${name}) — TRUE`,
      `> LOADING CAPABILITIES:`,
      ...caps.map(c => `  + ${c}`),
      `> COMPILING RESTRICTIONS:`,
      ...blocked.map(c => `  ✗ ${c}`),
      `> GENERATING ADA CONTRACT...`,
    ]
    for (const line of bootLines) {
      await typeToLog(log, line + '\n', 14)
      await new Promise(r => setTimeout(r, 55))
    }
    const contract = buildAgentAdaContract(name, cls, caps, blocked)
    await typeToLog(log, `  ✓ CONTRACT COMPILED\n`, 10)
    await new Promise(r => setTimeout(r, 180))
    await typeToLog(log, `> SEALING TO WORM CHAIN...\n`, 14)
    let sealStr = 'NO_WORM'
    if (window.WormChain) {
      const event = await window.WormChain.appendEvent('AGENT_DEPLOYED', {
        name, agentClass: chosenClass, capabilities: caps, blocked,
        contractHash: await window.WormChain.sha256(contract)
      })
      sealStr = event.seal
      triggerSealBurst()
    }
    await typeToLog(log, `  ✓ SEAL: ${sealStr.slice(0, 32)}...\n`, 8)
    await new Promise(r => setTimeout(r, 280))
    await typeToLog(log, `\n> ${name.toUpperCase()} ONLINE\n> STATUS : SOVEREIGN\n> CHAIN  : CONFIRMED\n`, 12)
    lastAgentManifest = { name, agentClass: chosenClass, capabilities: caps, blocked, contract, seal: sealStr, builtAt: new Date().toISOString() }
    renderAgentProfile(name, cls, caps, blocked, contract, sealStr)
    profile.style.display = 'grid'
    btn.disabled = false
  }

  function buildAgentAdaContract(name, cls, caps, blocked) {
    const id = (name || 'AGENT').replace(/[^a-zA-Z0-9_]/g, '_').replace(/^_+|_+$/g, '') || 'AGENT'
    const allowedLines = caps.length ? caps.map(c => `     -- allow: ${c}`).join('\n') : '     -- allow: local_runtime_action'
    const deniedLines = blocked.length
      ? blocked.map(c => `         ${c.replace(/[^a-zA-Z0-9_]/g, '_')}(Action) => raise Governance_Violation,`).join('\n')
      : '         violates_mandate(Action) => raise Governance_Violation,'
    return `-- Agent: ${name} | Class: ${cls.name}
-- Built in KittyVerse Agent Builder · SnapKitty Collective
${allowedLines}

package ${id}_Agent is
  procedure Execute_Action
    (Agent : in Agent_Type; Action : in Action_Type)
  with
    Pre  => Has_Authority(Agent)
            and Proof_Satisfied(Action)
            and not Sentinel_Blocks(Action),
    Post => WORM_Sealed(Action) and Chain_Valid,
    Contract_Cases => (
${deniedLines}
         others => State_Advanced
    );
end ${id}_Agent;
`
  }

  function renderAgentProfile(name, cls, caps, blocked, contract, seal) {
    const profile = document.getElementById('agent-profile')
    if (!profile) return
    profile.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div>
          <span class="agent-lvl">Agent Profile — Deployed</span>
          <h2 style="color:var(--orange);margin-top:4px">${cls.icon} ${name}</h2>
        </div>
        <span class="runtime-pill" data-state="online">${cls.name}</span>
      </div>
      <div class="xp-bar"><div class="xp-fill" id="xp-fill"></div></div>
      <div style="color:var(--muted);font-size:0.82rem">
        <span style="color:var(--green)">${caps.length} capabilities</span> ·
        <span style="color:var(--red)">${blocked.length} restrictions</span> ·
        <span>seal: ${seal.slice(0,16)}...</span>
      </div>
      <pre class="log" style="max-height:180px;font-size:0.74rem">${contract}</pre>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="button" data-action="dl-ada">Download .ada</button>
        <button class="button" data-action="dl-json">Download manifest.json</button>
      </div>
    `
    profile.querySelector('[data-action="dl-ada"]').addEventListener('click', () => {
      const blob = new Blob([contract], { type: 'text/x-ada' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${name}_agent.ada`; a.click()
      URL.revokeObjectURL(url)
    })
    profile.querySelector('[data-action="dl-json"]').addEventListener('click', () => {
      if (!lastAgentManifest) return
      const blob = new Blob([JSON.stringify(lastAgentManifest, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${name}_manifest.json`; a.click()
      URL.revokeObjectURL(url)
    })
    setTimeout(() => {
      const xp = document.getElementById('xp-fill')
      if (xp) xp.style.width = AGENT_CLASSES[chosenClass]?.stats.trust + '%'
    }, 120)
  }

  // ── TWIN BUILDER ─────────────────────────────────────────────

  function initTwinBuilder() {
    const saved = localStorage.getItem('llm-twin-arena-my-twin')
    if (saved) {
      try {
        twinConfig = { ...twinConfig, ...JSON.parse(saved) }
        buildTwinChatSection()
        return
      } catch {}
    }
    showWizard()
  }

  function showWizard() {
    if (document.getElementById('twin-wizard')) return
    const overlay = document.createElement('div')
    overlay.id = 'twin-wizard'
    overlay.className = 'twin-wizard-overlay'
    overlay.innerHTML = `
      <div class="twin-wizard-card">
        <div class="wizard-progress" id="wizard-progress">
          <div class="wizard-dot active" data-dot="0"></div>
          <div class="wizard-dot" data-dot="1"></div>
          <div class="wizard-dot" data-dot="2"></div>
        </div>
        <div class="wizard-stage" id="wizard-stage"></div>
        <div class="wizard-nav">
          <button class="button mini-button" id="wizard-skip" style="opacity:0.55">Skip</button>
          <button class="button mini-button" id="wizard-back" style="display:none">← Back</button>
          <button class="button" id="wizard-next">Continue →</button>
        </div>
      </div>
    `
    document.body.appendChild(overlay)
    overlay.querySelector('#wizard-skip').addEventListener('click', dismissWizard)
    overlay.querySelector('#wizard-back').addEventListener('click', () => goWizardStep(wizardCurrentStep - 1))
    overlay.querySelector('#wizard-next').addEventListener('click', advanceWizard)
    wizardCurrentStep = 0
    renderWizardStep(0)
  }

  function renderWizardStep(n) {
    const stage = document.getElementById('wizard-stage')
    const nextBtn = document.getElementById('wizard-next')
    const backBtn = document.getElementById('wizard-back')
    if (!stage) return
    document.querySelectorAll('.wizard-dot').forEach((d, i) => {
      d.classList.toggle('active', i === n)
      d.classList.toggle('done', i < n)
    })
    if (backBtn) backBtn.style.display = n > 0 ? '' : 'none'

    if (n === 0) {
      nextBtn.textContent = 'Continue →'
      stage.innerHTML = `
        <h2 class="wizard-title">Build Your Digital Twin</h2>
        <p class="wizard-sub">Upload a photo. Pick a model. Your avatar speaks every response back to you in real time.</p>
        <div class="avatar-upload-zone" id="avatar-zone">
          <div class="avatar-circle" id="avatar-circle">
            ${twinConfig.avatarDataUrl ? `<img src="${twinConfig.avatarDataUrl}" alt="avatar">` : '<span class="avatar-plus">+</span>'}
          </div>
          <p class="avatar-upload-hint">Click to upload your photo · or drag and drop</p>
          <input type="file" accept="image/*" id="avatar-file" style="display:none">
        </div>
      `
      const zone = stage.querySelector('#avatar-zone')
      const fileInput = stage.querySelector('#avatar-file')
      zone.addEventListener('click', () => fileInput.click())
      fileInput.addEventListener('change', e => { const f = e.target.files?.[0]; if (f) loadAvatarFile(f) })
      zone.addEventListener('dragover', e => { e.preventDefault(); document.getElementById('avatar-circle')?.classList.add('drag-over') })
      zone.addEventListener('dragleave', () => document.getElementById('avatar-circle')?.classList.remove('drag-over'))
      zone.addEventListener('drop', e => {
        e.preventDefault()
        document.getElementById('avatar-circle')?.classList.remove('drag-over')
        const f = e.dataTransfer?.files?.[0]
        if (f) loadAvatarFile(f)
      })

    } else if (n === 1) {
      nextBtn.textContent = 'Launch My Twin →'
      const models = [
        { tag: 'nemotron', name: 'Nemotron', sub: '4B · NVIDIA' },
        { tag: 'mistral:7b', name: 'Mistral', sub: '7B · Fast' },
        { tag: 'llama3.2:3b', name: 'Llama', sub: '3B · Context' },
        { tag: 'phi3:mini', name: 'Phi-3', sub: '3.8B · Compact' },
      ]
      stage.innerHTML = `
        <h2 class="wizard-title">Name & Power Your Twin</h2>
        <label>Your twin's name
          <input id="wizard-name" value="${twinConfig.name || ''}" placeholder="Ahmad" spellcheck="false">
        </label>
        <div>
          <p class="eyebrow" style="margin-bottom:10px">Choose the model</p>
          <div class="wizard-model-grid">
            ${models.map(m => `
              <div class="wizard-model-card${twinConfig.modelTag === m.tag ? ' chosen' : ''}" data-tag="${m.tag}" data-name="${m.name}">
                <span class="model-tag">${m.name}</span>
                <span class="model-sub">${m.sub}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <label>Personality <span style="color:var(--muted);font-size:0.72rem">(optional)</span>
          <textarea id="wizard-personality" spellcheck="false" style="min-height:72px" placeholder="Describe how your twin thinks and talks...">${twinConfig.personality || ''}</textarea>
        </label>
      `
      stage.querySelectorAll('.wizard-model-card').forEach(card => {
        card.addEventListener('click', () => {
          stage.querySelectorAll('.wizard-model-card').forEach(c => c.classList.remove('chosen'))
          card.classList.add('chosen')
          twinConfig.modelTag = card.dataset.tag
          twinConfig.modelName = card.dataset.name
        })
      })

    } else if (n === 2) {
      nextBtn.textContent = '⚡ Start Talking'
      const avatarHtml = twinConfig.avatarDataUrl
        ? `<img src="${twinConfig.avatarDataUrl}" alt="avatar" style="width:100px;height:100px;border-radius:50%;object-fit:cover;border:3px solid var(--green)">`
        : `<div style="width:100px;height:100px;border-radius:50%;border:3px solid var(--green);background:var(--panel-2);display:flex;align-items:center;justify-content:center;font-size:2.5rem">🤖</div>`
      stage.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:10px 0">
          ${avatarHtml}
          <h2 class="wizard-title">${twinConfig.name || 'Your Twin'} is ready</h2>
          <p class="wizard-sub">Powered by <strong style="color:var(--green)">${twinConfig.modelName}</strong></p>
          <p class="wizard-sub" style="font-size:0.82rem">Your avatar will speak every response back to you using your browser's voice engine — no cloud, no API key.</p>
        </div>
      `
    }
  }

  function loadAvatarFile(file) {
    const reader = new FileReader()
    reader.onload = ev => {
      twinConfig.avatarDataUrl = ev.target.result
      const circle = document.getElementById('avatar-circle')
      if (circle) circle.innerHTML = `<img src="${twinConfig.avatarDataUrl}" alt="avatar">`
      // Also update existing chat avatar if open
      const chatImg = document.getElementById('chat-avatar-img')
      if (chatImg && chatImg.tagName === 'IMG') chatImg.src = twinConfig.avatarDataUrl
    }
    reader.readAsDataURL(file)
  }

  function advanceWizard() {
    if (wizardCurrentStep === 1) {
      const nameEl = document.getElementById('wizard-name')
      const persEl = document.getElementById('wizard-personality')
      if (nameEl) twinConfig.name = nameEl.value.trim() || 'Twin'
      if (persEl) twinConfig.personality = persEl.value.trim()
    }
    if (wizardCurrentStep >= 2) { completeTwinSetup(); return }
    goWizardStep(wizardCurrentStep + 1)
  }

  function goWizardStep(n) {
    wizardCurrentStep = n
    renderWizardStep(n)
  }

  function dismissWizard() {
    document.getElementById('twin-wizard')?.remove()
  }

  function completeTwinSetup() {
    localStorage.setItem('llm-twin-arena-my-twin', JSON.stringify(twinConfig))
    dismissWizard()
    buildTwinChatSection()
  }

  // ── TWIN CHAT ─────────────────────────────────────────────────

  function buildTwinChatSection() {
    if (document.getElementById('twin-chat-section')) return
    const section = document.createElement('section')
    section.id = 'twin-chat-section'
    section.className = 'twin-chat-section'
    const avatarHtml = twinConfig.avatarDataUrl
      ? `<img src="${twinConfig.avatarDataUrl}" alt="${twinConfig.name}" class="chat-avatar-img" id="chat-avatar-img">`
      : `<div class="chat-avatar-no-img" id="chat-avatar-img">🤖</div>`
    section.innerHTML = `
      <div class="twin-chat-header">
        <div>
          <p class="eyebrow">Your Digital Twin</p>
          <h2 style="color:var(--green);margin:0">${twinConfig.name || 'Twin'}</h2>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
          <span class="runtime-pill" id="twin-ollama-status">checking</span>
          <button class="button mini-button" id="tts-btn">🔊 Voice</button>
          <button class="button mini-button" id="simple-mode-btn">👁 Simple</button>
          <button class="button mini-button" id="twin-reset-btn" style="opacity:0.6">Reset</button>
        </div>
      </div>
      <div class="twin-chat-layout">
        <div class="twin-avatar-panel">
          <div class="chat-avatar-wrapper">${avatarHtml}</div>
          <p class="twin-name-tag">${twinConfig.name || 'TWIN'}</p>
          <p class="twin-model-tag">${twinConfig.modelName || twinConfig.modelTag}</p>
          <div class="wave-bars" id="wave-bars">
            ${'<div class="wave-bar"></div>'.repeat(7)}
          </div>
        </div>
        <div class="twin-messages-panel">
          <div class="chat-messages" id="chat-messages"></div>
          <div class="chat-input-row">
            <input id="chat-input" placeholder="Talk to your twin..." spellcheck="false" autocomplete="off">
            <button class="button" id="chat-send">Send</button>
          </div>
        </div>
      </div>
    `
    const topline = document.querySelector('.topline')
    if (topline) topline.insertAdjacentElement('afterend', section)
    else document.querySelector('.shell')?.insertBefore(section, document.querySelector('.shell')?.firstChild)

    section.querySelector('#chat-send').addEventListener('click', sendTwinMessage)
    section.querySelector('#chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTwinMessage() }
    })
    section.querySelector('#tts-btn').addEventListener('click', () => {
      ttsEnabled = !ttsEnabled
      const btn = section.querySelector('#tts-btn')
      btn.textContent = ttsEnabled ? '🔊 Voice' : '🔇 Voice'
      btn.style.opacity = ttsEnabled ? '1' : '0.5'
      if (!ttsEnabled) { window.speechSynthesis?.cancel(); setAvatarSpeaking(false) }
    })
    section.querySelector('#simple-mode-btn').addEventListener('click', () => {
      document.body.classList.toggle('simple-mode')
      section.querySelector('#simple-mode-btn').textContent = document.body.classList.contains('simple-mode') ? '⚙ Full' : '👁 Simple'
    })
    section.querySelector('#twin-reset-btn').addEventListener('click', () => {
      if (!confirm('Reset your twin and start the wizard again?')) return
      localStorage.removeItem('llm-twin-arena-my-twin')
      section.remove()
      twinConfig = { name: '', modelTag: 'nemotron', modelName: 'Nemotron-Mini-4B', avatarDataUrl: null, personality: '', endpoint: 'http://127.0.0.1:11434' }
      wizardCurrentStep = 0
      showWizard()
    })

    checkTwinOllama()
    addBubble(`Hi — I'm ${twinConfig.name || 'your twin'}, running on ${twinConfig.modelName}. Talk to me.`, 'twin')
  }

  async function checkTwinOllama() {
    const pill = document.getElementById('twin-ollama-status')
    if (!pill) return
    try {
      const r = await fetch(`${twinConfig.endpoint}/api/tags`)
      if (!r.ok) throw new Error()
      pill.textContent = 'online'; pill.dataset.state = 'online'
    } catch {
      pill.textContent = 'offline'; pill.dataset.state = ''
    }
  }

  async function sendTwinMessage() {
    const input = document.getElementById('chat-input')
    const sendBtn = document.getElementById('chat-send')
    const userMsg = input?.value.trim()
    if (!userMsg) return
    input.value = ''
    sendBtn.disabled = true
    addBubble(userMsg, 'user')

    const sys = twinConfig.personality
      ? `You are ${twinConfig.name}, a digital twin. ${twinConfig.personality}. Respond naturally in character.`
      : `You are ${twinConfig.name}, a digital twin. Respond as ${twinConfig.name} would — same voice, same perspective. Be conversational and direct.`

    const fullPrompt = `${sys}\n\nUser: ${userMsg}\n${twinConfig.name}:`
    const twinBubble = addBubble('', 'twin')
    let fullResponse = ''

    try {
      await streamOllama({
        endpoint: twinConfig.endpoint,
        model: twinConfig.modelTag,
        prompt: fullPrompt,
        signal: undefined,
        onToken: tok => {
          fullResponse += tok
          twinBubble.textContent = fullResponse
          const msgs = document.getElementById('chat-messages')
          if (msgs) msgs.scrollTop = msgs.scrollHeight
        }
      })
      if (window.WormChain) {
        await window.WormChain.appendEvent('TWIN_CHAT', {
          twin: twinConfig.name, model: twinConfig.modelTag,
          userHash: await window.WormChain.sha256(userMsg),
          responseHash: await window.WormChain.sha256(fullResponse)
        })
      }
      if (ttsEnabled) speakText(fullResponse)
    } catch (err) {
      twinBubble.textContent = `[Error: ${err.message}]`
    }
    sendBtn.disabled = false
  }

  function addBubble(text, who) {
    const msgs = document.getElementById('chat-messages')
    if (!msgs) return null
    const bubble = document.createElement('div')
    bubble.className = `chat-bubble ${who}`
    bubble.textContent = text
    msgs.appendChild(bubble)
    msgs.scrollTop = msgs.scrollHeight
    return bubble
  }

  function speakText(text) {
    if (!window.speechSynthesis || !ttsEnabled) return
    window.speechSynthesis.cancel()
    const clean = text.replace(/```[\s\S]*?```/g, '...code...').replace(/[#*`>]/g, '').slice(0, 900)
    const utt = new SpeechSynthesisUtterance(clean)
    utt.rate = 0.93
    utt.pitch = 1.0
    utt.onstart  = () => setAvatarSpeaking(true)
    utt.onend    = () => setAvatarSpeaking(false)
    utt.onerror  = () => setAvatarSpeaking(false)
    window.speechSynthesis.speak(utt)
  }

  function setAvatarSpeaking(on) {
    const img   = document.getElementById('chat-avatar-img')
    const waves = document.getElementById('wave-bars')
    if (img)   img.classList.toggle('speaking', on)
    if (waves) waves.classList.toggle('active', on)
  }
})()
