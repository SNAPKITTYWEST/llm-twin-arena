#!/usr/bin/env python3
"""Local Ollama challenge runner for LLM Twin Arena.

GitHub Pages does not execute models. This script runs locally, calls Ollama at
localhost, and writes WORM events for browser/manual inspection.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
EVENTS_PATH = ROOT / "worm_events.json"
OLLAMA_URL = "http://localhost:11434/api/generate"

CHALLENGES = {
    "atom": "Solve the atom challenge with a small, testable code answer.",
    "molecule": "Solve the molecule challenge by composing two clean functions.",
    "compound": "Solve the compound challenge with a local CLI design and tests.",
}


def load_events() -> list[dict[str, Any]]:
    if not EVENTS_PATH.exists():
        return []
    return json.loads(EVENTS_PATH.read_text(encoding="utf-8"))


def seal_event(event: dict[str, Any]) -> str:
    body = json.dumps(event, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(body.encode("utf-8")).hexdigest()


def append_event(model: str, challenge: str, result: str, response: str) -> dict[str, Any]:
    events = load_events()
    event = {
        "tick": len(events),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "model": model,
        "challenge": challenge,
        "result": result,
        "parentSeal": events[-1]["seal"] if events else "GENESIS",
        "response": response,
    }
    event["seal"] = seal_event(event)
    events.append(event)
    EVENTS_PATH.write_text(json.dumps(events, indent=2) + "\n", encoding="utf-8")
    return event


def call_ollama(model: str, prompt: str) -> str:
    payload = json.dumps({"model": model, "prompt": prompt, "stream": False}).encode("utf-8")
    request = urllib.request.Request(
        OLLAMA_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            data = json.loads(response.read().decode("utf-8"))
            return data.get("response", "")
    except urllib.error.URLError as exc:
        return f"OLLAMA_UNAVAILABLE: {exc}"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="mistral:7b")
    parser.add_argument("--challenge", choices=sorted(CHALLENGES), default="atom")
    parser.add_argument("--prompt", default="")
    args = parser.parse_args()

    prompt = args.prompt or CHALLENGES[args.challenge]
    response = call_ollama(args.model, prompt)
    result = "review" if response.startswith("OLLAMA_UNAVAILABLE") else "pass"
    event = append_event(args.model, args.challenge, result, response)
    print(json.dumps(event, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

