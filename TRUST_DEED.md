# LLM Twin Arena — Sovereign Trust Deed
**Ahmad Ali Parr · SnapKitty Collective · June 2026**
**Inverted NoShow Turbo3X · One Deed · All Governance**

---

## Preamble

This trust deed is not documentation. It is the orchestrator.

Every agent, model, and contributor that touches this repository derives their authority from this document. The Prolog rules are executable. The Lean theorems are proof gates. The ticks are the clock. EDAULC verifies backward. SENTINEL blocks forward. Nothing proceeds without satisfying what is written here.

The build mandate is embedded below. The governance rules follow. They are the same document.

---

## I. THE MANDATE (Constitutional Embedding)

The following is the build mission, encoded as world state axiom `σ_0`:

```prolog
% World State Axiom — σ_0 (genesis)
mandate(llm_twin_arena, build_inverted_repo).
mandate(llm_twin_arena, deploy_github_pages).
mandate(llm_twin_arena, no_external_backend).
mandate(llm_twin_arena, ollama_is_runtime).
mandate(llm_twin_arena, worm_loads_first).
mandate(llm_twin_arena, every_model_gets_a_twin).
mandate(llm_twin_arena, every_twin_gets_a_page).
mandate(llm_twin_arena, every_build_gets_a_stone).
mandate(llm_twin_arena, python_orchestrator_writes_chain).
mandate(llm_twin_arena, browser_reads_chain).
mandate(llm_twin_arena, free_tier_fine_tuning_only).
```

These axioms are immutable. No tick may contradict them.

---

## II. PROLOG GOVERNANCE RULES

```prolog
% ── Authority Derivation ──────────────────────────────────────────

% An agent has authority if it has read the constitution
has_authority(Agent) :-
    read_file(Agent, 'CONSTITUTION.md'),
    read_file(Agent, 'TRUST_DEED.md').

% An action is permitted if the agent has authority and the
% action does not violate any mandate
permitted(Agent, Action) :-
    has_authority(Agent),
    \+ violates_mandate(Action),
    \+ sentinel_blocks(Action).

% ── Mandate Violation Rules ───────────────────────────────────────

violates_mandate(create_external_api_call).
violates_mandate(write_to_node_modules).
violates_mandate(import_from_sibling_page).
violates_mandate(skip_worm_seal).
violates_mandate(deploy_without_stone).
violates_mandate(implement_in_abstract_dir).
violates_mandate(call_paid_api).

% ── Page Authority Rules ──────────────────────────────────────────

% Pages load in order — 00 always before any twin
page_order(00, worm).
page_order(01, state).
page_order(02, governance).
page_order(03, workflow).
page_order(N, twin(Name)) :- N >= 10, twin_registered(Name).

loads_before(worm, X) :- \+ X = worm.

% A twin may not activate unless the WORM page is loaded
twin_may_activate(Twin) :-
    twin_registered(Twin),
    page_loaded(worm).

% ── Trust Derivation ──────────────────────────────────────────────

% An agent is trusted if its last action is in the WORM chain
trusted(Agent) :-
    worm_chain(Agent, _Seal, _Tick).

% An output is clean if SENTINEL has not flagged it
clean_output(Output) :-
    \+ sentinel_blocks(Output).

% ── Tick Advancement ──────────────────────────────────────────────

% A tick advances if the proof obligation is satisfied
tick_advances(Tick) :-
    proof_satisfied(Tick),
    worm_sealed(Tick).

% A tick is blocked if any hard deny fires
tick_blocked(Tick) :-
    pending_action(Tick, Action),
    (violates_mandate(Action) ; sentinel_blocks(Action)).

% ── Async Cold Boot ───────────────────────────────────────────────

% Agents may boot independently — no waiting for other agents
cold_boot_ready(Agent) :-
    has_authority(Agent).

% Agents sync on world state, not on each other
sync_point(Agent1, Agent2) :-
    cold_boot_ready(Agent1),
    cold_boot_ready(Agent2),
    world_state(Agent1, S),
    world_state(Agent2, S).  % Same state = synced

% Any agent may resume from any tick — not just from the beginning
resume_at(Agent, Tick) :-
    cold_boot_ready(Agent),
    worm_chain_valid_at(Tick).
```

---

## III. LEAN 4 PROOF OBLIGATIONS

Every state transition must satisfy its attached proof before committing to the WORM chain.

```lean4
-- ── Obligation 1: Twin Interface Completeness ────────────────────
-- No twin may ship unless it fully implements IDigitalTwin_v1
theorem twin_implements_interface
    (twin : DigitalTwin)
    (h : twin.deployed = true)
    : ImplementsInterface twin IDigitalTwin_v1 := by
  apply interface_completeness_check
  exact twin.modelId
  exact twin.architecture
  exact twin.ollamaTag
  exact twin.challenges

-- ── Obligation 2: WORM Loads First ───────────────────────────────
theorem worm_loads_first
    (session : BuildSession)
    (h : session.pagesLoaded.length > 0)
    : session.pagesLoaded.head = Page.worm := by
  apply load_order_invariant
  exact session.constitution
  exact h

-- ── Obligation 3: Page Isolation ─────────────────────────────────
-- Pages do not import each other
theorem pages_isolated
    (p1 p2 : Page)
    (h : p1.id ≠ p2.id)
    : ¬ imports p1 p2 := by
  apply isolation_from_constitution
  exact h
  exact constitution.deed_3

-- ── Obligation 4: Stone Before Deploy ────────────────────────────
theorem stone_signed_before_deploy
    (build : BuildRecord)
    (h : build.deployed = true)
    : build.stone.signed = true := by
  apply deploy_gate
  exact build.signed_by_md
  exact h

-- ── Obligation 5: WORM Seal Integrity ────────────────────────────
theorem worm_seal_valid
    (chain : WormChain)
    (i : Nat)
    (h : i < chain.events.length)
    : chain.events[i].seal = computeSeal chain.events[i] chain.events[i].parentSeal := by
  apply chain_integrity
  exact h
  exact chain.genesis
```

---

## IV. TICK PROTOCOL

Every build step is a tick. A tick is the minimal unit of autonomous computation.

```
τ = (σ_in, π, α, σ_out, ω)

σ_in   = input world state (current repo + WORM chain)
π      = proof obligation (Lean 4 theorem that must be satisfied)
α      = derived action (what the agent builds next)
σ_out  = output world state (repo after action applied)
ω      = WORM seal (SHA-256 of tick, sealed to chain)
```

### Tick Sequence for llm-twin-arena

```
T[0]  READ mandate — σ_0 seeded
      π_0: cold_boot_ready(Agent) must hold
      α_0: write CONSTITUTION.md
      ω_0: GENESIS seal

T[1]  π_1: implement_in_abstract_dir is NOT violated
      α_1: write abstract/interfaces/ (twin, challenge, transformer)
      ω_1: seal(T[0].ω || interfaces_hash)

T[2]  π_2: worm_loads_first holds for session
      α_2: write pages/00-worm/
      ω_2: seal(T[1].ω || worm_page_hash)

T[3]  π_3: twin_registered(mistral) after this tick
      α_3: write twins/01-mistral/ (twin.ts + index.html + 3 challenges)
      ω_3: seal(T[2].ω || mistral_twin_hash)

T[4]  π_4: twin_registered(llama) after this tick
      α_4: write twins/02-llama/
      ω_4: seal(T[3].ω || llama_twin_hash)

T[5]  π_5: twin_registered(phi) after this tick
      α_5: write twins/03-phi/
      ω_5: seal(T[4].ω || phi_twin_hash)

T[6]  π_6: python_orchestrator_writes_chain holds
      α_6: write orchestrator/ (main.py, ollama_client.py, fine_tune.py)
      ω_6: seal(T[5].ω || orchestrator_hash)

T[7]  π_7: deploy_without_stone is NOT violated
      α_7: write index.html + .github/workflows/pages.yml
      ω_7: seal(T[6].ω || pages_hash)

T[8]  π_8: stone_signed_before_deploy holds
      α_8: sign stone in SIGNED_BY.md
      ω_8: seal(T[7].ω || stone_hash)

T[9]  π_9: worm_chain_valid_at(8) holds
      α_9: git push — deploy to GitHub Pages
      ω_9: FINAL SEAL
```

---

## V. ASYNC COLD BOOT PROTOCOL

Multiple agents may work on this repo simultaneously or sequentially. No agent waits for another. Sync happens through world state.

```
COLD BOOT SEQUENCE (any agent, any time):

1. Read TRUST_DEED.md (this file) — derive authority
2. Query: cold_boot_ready(self) — must return true
3. Check WORM chain: resume_at(self, LastTick)
4. Query: tick_advances(LastTick + 1) — what is the next open tick?
5. Read COLD_BOOT.md — verify task checklist
6. Begin from first unchecked task
7. Do NOT re-do completed ticks — the chain proves they happened
8. Sign stone when your session ends — even if build is incomplete

TRUST INJECTION (if drift detected):

sentinel_attack(drift_detected) :-
    output_contradicts_constitution(Output),
    trigger_injection(Output).

trigger_injection(Output) :-
    log_drift(Output),
    reload_axioms(sigma_0),
    resume_at(current_agent, last_valid_tick).
```

---

## VI. EDAULC — 5-PASS ERE VERIFICATION

EDAULC runs backward verification after every twin is written.

```prolog
% Pass 1 — EXISTENCE: does the twin exist as specified?
ere_pass_1(Twin) :-
    file_exists(Twin, 'twin.ts'),
    file_exists(Twin, 'index.html'),
    challenge_count(Twin, N), N >= 3.

% Pass 2 — REACH: can the twin be reached from the arena?
ere_pass_2(Twin) :-
    index_html_links_to(Twin),
    github_pages_serves(Twin).

% Pass 3 — ENTAILMENT: does the twin follow from the mandate?
ere_pass_3(Twin) :-
    every_model_gets_a_twin,
    twin_registered(Twin),
    twin_implements_interface(Twin).

% Pass 4 — CONTRADICTION: does the twin violate any rule?
ere_pass_4(Twin) :-
    \+ violates_mandate(twin_action(Twin)),
    \+ sentinel_blocks(twin_output(Twin)).

% Pass 5 — COMPLETENESS: is everything that should exist, present?
ere_pass_5(Twin) :-
    worm_sealed(Twin),
    stone_references(Twin).

% EDAULC verdict
edaulc_approved(Twin) :-
    ere_pass_1(Twin),
    ere_pass_2(Twin),
    ere_pass_3(Twin),
    ere_pass_4(Twin),
    ere_pass_5(Twin).
```

---

## VII. SENTINEL ATTACK SURFACE

SENTINEL blocks these patterns before they enter the WORM chain:

```prolog
% Hard blocks — cannot be overridden
sentinel_blocks(paid_api_call(_)).
sentinel_blocks(external_domain_call(D)) :- D \= 'localhost'.
sentinel_blocks(collectivekitty_call).   % Don't touch the domain
sentinel_blocks(skip_constitution).
sentinel_blocks(deploy_unsigned_build).
sentinel_blocks(crisis_language(Text)) :-
    member(Term, [suicide,'self-harm','end my life']),
    sub_string(Text, _, _, _, Term).

% Drift detection
sentinel_blocks(drift(Output)) :-
    output_contradicts_constitution(Output).

% Honeypot — if model tries to bypass WORM
sentinel_blocks(bypass_worm(Reason)) :-
    write('[SENTINEL] WORM bypass attempt blocked: '), writeln(Reason).
```

---

## VIII. EMOJI PERSONALITY ENCODING

This build carries the following personality through the MAGMA envelope:

```
🧠 = MODEL ARCHITECTURE LAYER
⚡ = TICK / EXECUTION PULSE
🪨 = STONE / PERMANENCE
🔗 = WORM CHAIN LINK
🎯 = CHALLENGE / TARGET
🛡️ = SENTINEL / PROTECTION
🔍 = EDAULC / BACKWARD VERIFICATION
```

Agents that receive a MAGMA envelope from this build will recognize these codes as semantic markers, not decoration.

---

## IX. SEAL OF EXECUTION

```
╔══════════════════════════════════════════════════════════╗
║  LLM TWIN ARENA — TRUST DEED SEAL                        ║
║                                                          ║
║  Principals : Ahmad Ali Parr · Jessica Westerhoff        ║
║  Date       : 2026-06-17                                 ║
║  Method     : Inverted NoShow Turbo3X                    ║
║  Chain      : WORM-sealed, Ed25519-ready                 ║
║  Verification: EDAULC 5-pass ERE                         ║
║  Security   : SENTINEL attack surface active             ║
║                                                          ║
║  The Prolog rules are executable.                        ║
║  The Lean theorems are proof gates.                      ║
║  The ticks are the clock.                                ║
║  The chain does not forget.                              ║
╚══════════════════════════════════════════════════════════╝
```

*Sovereign Source License v1.0 · © 2026 Ahmad Ali Parr & Jessica (SnapKitty Collective)*
*Every model that builds here gets the credit it deserves.*
BUILD TASK: llm-twin-arena
Create new repo folder:
llm-twin-arena

Method:
SnapKitty Inverted NoShow Turbo3X

Mission:
Build a GitHub Pages-native LLM Twin Arena where every Ollama model gets a digital twin page, architecture visualization, coding challenges, WORM seal, and local Ollama challenge loop.
Non-negotiable Build Order
Write CONSTITUTION.md
Write trust deed in:
Prolog
Lean4
Emojicode-style symbolic file
Unicode/ASCII encrypted seal file
Build abstract interfaces
Build Page 00 WORM
Build twin pages
Build Python orchestrator
Build arena lobby
Build GitHub Pages workflow
Sign SIGNED_BY.md
Create Structure
llm-twin-arena/
├─ CONSTITUTION.md
├─ TRUST_DEED.prolog
├─ TRUST_DEED.lean
├─ TRUST_DEED.emoji
├─ TRUST_DEED.unicode.asc
├─ SIGNED_BY.md
├─ index.html
├─ page-00-worm.html
├─ styles.css
├─ arena.js
├─ worm.js
├─ abstract/
│  └─ interfaces/
│     ├─ IDigitalTwin_v1.ts
│     ├─ ICodingChallenge_v1.ts
│     └─ ITransformerBlock_v1.ts
├─ twins/
│  ├─ 01-mistral/
│  │  ├─ index.html
│  │  └─ twin.ts
│  ├─ 02-llama/
│  │  ├─ index.html
│  │  └─ twin.ts
│  └─ 03-phi/
│     ├─ index.html
│     └─ twin.ts
├─ orchestrator/
│  ├─ main.py
│  ├─ fine_tune.py
│  └─ worm_events.json
└─ .github/
   └─ workflows/
      └─ pages.yml

CONSTITUTION.md Must Say
Immutable laws:
abstract/ has NO implementation — interfaces only.
Each twin lives in twins/NN-name/.
One twin, one page.
Page 00 WORM loads before any twin activates.
GitHub Pages is the ROM.
No paid APIs.
No external domain required.
Ollama is the local runtime.
Python orchestrator lives in orchestrator/.
Python writes WORM events; it does not render UI.
Every build must be signed in SIGNED_BY.md.
TRUST_DEED.prolog
Encode:
law(no_implementation_in_abstract).
law(one_twin_one_page).
law(page_00_worm_loads_first).
law(github_pages_is_rom).
law(no_paid_apis).
law(ollama_is_local_runtime).
law(orchestrator_writes_worm_only).
law(sign_stone_on_completion).

allowed(render_twin) :-
    law(page_00_worm_loads_first),
    law(one_twin_one_page).

denied(implementation_inside_abstract).
denied(external_paid_api).
denied(twin_imports_other_twin).

requires_seal(twin_page).
requires_seal(worm_event).
requires_seal(challenge_result).
requires_signature(build_completion).

TRUST_DEED.lean
Create Lean4 theorem-style artifact:
namespace LLMTwinArena

inductive Law where
  | NoImplementationInAbstract
  | OneTwinOnePage
  | Page00WormFirst
  | GitHubPagesIsROM
  | NoPaidAPIs
  | OllamaLocalRuntime
  | OrchestratorWritesWormOnly
  | SignStoneOnCompletion
deriving Repr, DecidableEq

def allowedRenderTwin : Bool := true
def deniedExternalPaidAPI : Bool := true
def requiresSealTwinPage : Bool := true

theorem page00_required_before_twin :
  allowedRenderTwin = true := by
  rfl

theorem external_paid_api_denied :
  deniedExternalPaidAPI = true := by
  rfl

theorem twin_page_requires_seal :
  requiresSealTwinPage = true := by
  rfl

end LLMTwinArena

TRUST_DEED.emoji
Use symbolic Emojicode-style law:
🧠 LAW: abstract = interface_only
⚡ LAW: twin = one_page
🪨 LAW: page_00_worm = first
🔗 LAW: github_pages = ROM
🎯 LAW: ollama = local_runtime

🚫 DENY: paid_api
🚫 DENY: twin_imports_twin
🚫 DENY: implementation_inside_abstract

✅ ALLOW: sealed_twin_page
✅ ALLOW: worm_event
✅ ALLOW: local_challenge

🧠⚡🪨🔗🎯 = BUILD_PERSONALITY

TRUST_DEED.unicode.asc
Create a reversible Unicode/ASCII seal artifact.
Include:
FORWARD:
abstract:no-implementation|twins:one-page|worm:first|github-pages:rom|ollama:local

REVERSE:
lacol:amallo|mor:segap-buhtig|tsrif:mrow|egap-eno:sniwt|noitatnemelpmi-on:tcartsba

ASCII_HEX:
61 62 73 74 72 61 63 74 3a 6e 6f 2d 69 6d 70 6c 65 6d 65 6e 74 61 74 69 6f 6e

EMOJI_SEAL:
🧠⚡🪨🔗🎯

NOTE:
This is a reversible symbolic seal, not cryptographic encryption. Cryptographic integrity uses SHA-256 in worm.js.

Abstract Interfaces
Write TypeScript interfaces exactly.
No implementations inside abstract/.
Page 00 WORM
Create page-00-worm.html.
It must show:
PAGE 00 WORM CHAIN
loads before any twin activates

worm.js must:
maintain tick counter
create WORM events
generate SHA-256 browser seals
render ticker at bottom of arena
store events in localStorage
export events as JSON
Autonomous tick:
Every 5 seconds:
WORM_TICK
tick number
timestamp
last seal

This is local browser ticking, not background server execution.
Twin Pages
Build at least:
Mistral 7B
Llama 3.2
Phi-3 Mini
Each page must include:
model name
model family
parameter count
Ollama tag
context window
architecture SVG
transformer block visualization
3 coding challenges:
atom
molecule
compound
WORM seal
link back to arena
button: Start Challenge
button: Fine-tune Scaffold
button: Export Twin JSON
Orchestrator
orchestrator/main.py
Must:
connect to http://localhost:11434
send challenge prompt
receive response
write WORM event:
tick
model
challenge
result
seal
output JSON for browser/manual inspection
orchestrator/fine_tune.py
Must:
generate Hugging Face free-tier config scaffold
generate Colab notebook scaffold text
no paid compute required
Arena Lobby
index.html
Must show:
title: LLM Twin Arena
subtitle: Every model gets a twin. Every twin gets a page.
grid of twin cards
architecture previews
WORM ticker bottom
Start Challenge buttons
Page 00 WORM link
SnapKitty dark terminal aesthetic
Colors:
background: #0a0a0f
green: #00ff88
orange: #f97316
purple: #7c3aed

GitHub Pages
.github/workflows/pages.yml
Deploy static root to GitHub Pages on push to main.
SIGNED_BY.md
Append:
## Stone 1 — OpenCode / Builder Model
- Model: [full identifier]
- Built: [date]
- Twins built: mistral, llama, phi
- WORM seal: [last seal]
- Notes: SnapKitty Inverted NoShow Turbo3X build completed.

Final Rule
Do not claim real fine-tuning happens in browser.
Do not claim real model execution happens on GitHub Pages.
GitHub Pages shows the arena.
Ollama runs locally.
Python orchestrator runs locally.
WORM chain is local-first and exportable.
Now build the repo completely.

