# LLM Twin Arena Constitution

## Immutable Laws

1. `abstract/` has NO implementation — interfaces only.
2. Each twin lives in `twins/NN-name/`.
3. One twin, one page.
4. Page 00 WORM loads before any twin activates.
5. GitHub Pages is the ROM.
6. No paid APIs.
7. No external domain required.
8. Ollama is the local runtime.
9. Python orchestrator lives in `orchestrator/`.
10. Python writes WORM events; it does not render UI.
11. Every build must be signed in `SIGNED_BY.md`.
12. Swift twin mode lives in `twins/NN-name/swift/`.
13. Swift handles architecture visualization and transformer challenge building locally.
14. JavaScript WORM remains the browser seal authority; Swift feeds it results.
15. Browser twin pages may call local Ollama directly through loopback.
16. Browser LLM output must be sealed into JS WORM.
17. Ada-style contracts express Shadow Orchestrator preconditions, postconditions, and hard-deny cases.
18. Generated contracts are WORM-sealed and exportable.
19. The page is the orchestrator: browser ROM, local runtimes, proofs, contracts, and WORM chain are one operational surface.

## Runtime Boundary

GitHub Pages shows the arena as static files. Ollama runs locally at `http://localhost:11434`. The Python orchestrator runs locally and writes WORM events for browser/manual inspection.

Swift mode is a local compute lane beside each HTML twin page. It emits structured architecture and challenge JSON, then the browser WORM chain seals the handoff.

Ollama In A Box is the browser-local run lane. It calls the user's local Ollama loopback endpoint and seals prompts/results into JS WORM. GitHub Pages does not host a model or external backend.

Ada Contract Builder is the governance lane. It turns user trust fields into an Ada-style contract and seals each generated version into JS WORM.
