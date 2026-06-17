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
  sealTwinPage()
})()
