law(no_implementation_in_abstract).
law(one_twin_one_page).
law(page_00_worm_loads_first).
law(github_pages_is_rom).
law(no_paid_apis).
law(ollama_is_local_runtime).
law(orchestrator_writes_worm_only).
law(sign_stone_on_completion).
law(swift_mode_lives_beside_twin_page).
law(swift_feeds_js_worm_results).

allowed(render_twin) :-
    law(page_00_worm_loads_first),
    law(one_twin_one_page).

denied(implementation_inside_abstract).
denied(external_paid_api).
denied(twin_imports_other_twin).

requires_seal(twin_page).
requires_seal(worm_event).
requires_seal(challenge_result).
requires_seal(swift_result_handoff).
requires_signature(build_completion).
