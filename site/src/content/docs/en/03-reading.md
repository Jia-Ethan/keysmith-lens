---
title: Reading the page
lede: What the overview, rule tracking, request composition, segments and flags each answer.
group: Using Lens
order: 3
page: reading
---

## Layers

Every piece of text in a request belongs to one layer:

| Layer | What it is |
| --- | --- |
| system | System prompt, `instructions`, `developer` messages, and messages with role system |
| user | User messages, including reminders the agent itself inserts there |
| assistant | Earlier replies from the model |
| tool call | Tool calls the model made |
| tool result | What tools returned |
| tool schema | The tool list sent with the request |

Color only tells layers apart; every cell also names its layer.

## Overview

One row per run, one column per rule. A cell is the layer where the rule **first** arrived; a ring means it never appeared in any agent request. On the right: the request count and the number of serious flags (never delivered, dropped). Click a row to replay it.

## Rule tracking

One row per rule file, one column per request. See where a rule starts, where it drops, and whether it comes back. A striped cell is partly present; `×2` means the rule appears in two places in that request. Faded columns are side requests.

## What the model was sent

Each request is a bar, its length in proportion to its characters, split by layer, with thin ticks where rule text sits. Hover for each layer's size and share.

## Piece by piece

The selected request split into segments, in request order: the layer, where the segment sits in the request JSON (for example `messages[3].content[0]`), and its size. "new" means the text was not in the previous agent request. Open a segment for its raw text, rule lines highlighted.

## Links

The address follows you as `lens.html#run=<name>&step=<n>`; copy it to reopen the same run and request. `?lang=zh|en` switches language and `?theme=light|dark` the theme.
