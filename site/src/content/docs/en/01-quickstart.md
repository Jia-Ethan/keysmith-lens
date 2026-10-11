---
title: Quick start
lede: Clone, make the demo runs, open the page. Two minutes to see what Lens does.
group: Getting started
order: 1
page: quickstart
---

## What you need

Python 3.9 or later, on macOS, Linux or Windows. No dependencies, no `pip install`.

## Try the demo

```sh
git clone https://github.com/Jia-Ethan/keysmith-lens.git
cd keysmith-lens
python3 examples/make_demo.py examples/demo
PYTHONPATH=. python3 -m keysmith_lens build examples/demo -o out/lens.html
open out/lens.html
```

On Windows, use `start out\lens.html` for the last line, and `set PYTHONPATH=.` on its own line.

The demo has five made-up runs of one small project, a checkout service:

| Run | Shows |
| --- | --- |
| `all-rules-upfront` | Three rules sent from the start and kept |
| `late-rules` | The `payments/` rule only arrives once the agent reads that folder |
| `compaction` | After context compaction the `payments` rule is gone until a later read |
| `missing-rule` | A team rule file is configured but never reaches the model |
| `system-prompt-rules` | Another agent: rules go in the system prompt, and a title request at the end |

## Next

- Record your own agent: [Recording](/en/docs/record/)
- Learn the page: [Reading the page](/en/docs/reading/)
