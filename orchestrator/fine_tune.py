#!/usr/bin/env python3
"""Generate free-tier fine-tuning scaffold text.

This does not claim browser fine-tuning and does not start paid compute.
"""

from __future__ import annotations

import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def build_scaffold(model: str) -> str:
    return f"""# Free-Tier Fine-Tune Scaffold

base_model: {model}
method: qlora
runtime: free_colab_or_local
dataset:
  format: jsonl
  fields:
    - prompt
    - completion
training:
  max_steps: 100
  learning_rate: 2.0e-4
  lora_rank: 8
  lora_alpha: 16
export:
  adapter_only: true

## Colab Notebook Cells

1. Install free-tier dependencies.
2. Mount or upload a small JSONL dataset.
3. Load the base model where license and hardware allow.
4. Train a small QLoRA adapter.
5. Export adapter artifacts.

No paid compute is required by this scaffold.
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", default="mistral:7b")
    parser.add_argument("--out", default="fine_tune_scaffold.md")
    args = parser.parse_args()

    output = ROOT / args.out
    output.write_text(build_scaffold(args.model), encoding="utf-8")
    print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

