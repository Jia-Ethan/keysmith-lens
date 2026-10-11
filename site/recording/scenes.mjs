// Storyboards for the tour clips and the hero film. Each scene drives the real
// Lens viewer over the made-up demo runs; selectors are the viewer's own
// data-testids. `start` is the hash the page opens at (#run=<name>&step=<n>).

/** Overview: hover across the matrix, then open a run. */
const overview = {
  id: "overview",
  async run(r) {
    await r.wait(700);
    await r.moveTo('[data-testid="ov-late-rules"] td.cell', 700);
    await r.wait(500);
    await r.moveTo('[data-testid="ov-missing-rule"] td.cell.absent', 800);
    await r.wait(1200);
    await r.moveTo('[data-testid="ov-system-prompt-rules"] td.cell', 800);
    await r.wait(1000);
    await r.click('[data-testid="ov-compaction"] th', { move: 800, after: 1600 });
  },
};

/** Tracking: walk the requests of the compaction run. */
const tracking = {
  id: "tracking",
  start: "run=compaction&step=1",
  async run(r) {
    await r.wait(700);
    for (let i = 2; i <= 6; i++) await r.click(`[data-testid="cell-payments-${i}"]`, { move: 450, after: 650 });
    await r.moveTo('[data-testid="cell-payments-4"]', 600);
    await r.wait(1400);
  },
};

/** Composition: the request bars, hover a layer and a rule tick. */
const composition = {
  id: "composition",
  start: "run=late-rules&step=3",
  async run(r) {
    await r.scroll(null, 260, 700);
    await r.wait(500);
    await r.moveTo('[data-testid="composition"] .bar > div', 700);
    await r.wait(900);
    await r.moveTo('[data-testid="composition"] .bar .tick', 700);
    await r.wait(1100);
    await r.click('[data-testid="req-3"]', { move: 700, after: 900 });
    await r.moveTo('[data-testid="composition"] .row:nth-last-child(2) .bar .tick', 700);
    await r.wait(1200);
  },
};

/** Segments: open a request and read the highlighted rule. */
const segments = {
  id: "segments",
  start: "run=late-rules&step=3",
  async run(r) {
    await r.scroll(null, 560, 900);
    await r.wait(400);
    await r.click('[data-testid="segments"] details:has(.chip.rule) summary', { move: 800, after: 900 });
    await r.scroll(null, 220, 700);
    await r.wait(1600);
  },
};

/** Flags: the run with a rule that never arrived. */
const flags = {
  id: "flags",
  start: "run=missing-rule&step=1",
  async run(r) {
    await r.wait(800);
    await r.moveTo('[data-testid="notes"] .note:last-child', 800);
    await r.wait(1000);
    await r.moveTo('[data-testid="cell-team-2"]', 800);
    await r.wait(1200);
    await r.click('[data-testid="nav-compaction"]', { move: 800, after: 1600 });
  },
};

/** Compare: the same project through a different agent. */
const compare = {
  id: "compare",
  start: "run=late-rules&step=1",
  async run(r) {
    await r.wait(700);
    await r.click('[data-testid="nav-system-prompt-rules"]', { move: 800, after: 1400 });
    await r.click('[data-testid="nav-late-rules"]', { move: 700, after: 1300 });
    await r.click('[data-testid="nav-system-prompt-rules"]', { move: 700, after: 900 });
    await r.moveTo('[data-testid="cell-project-1"]', 700);
    await r.wait(1200);
  },
};

/** Record: filter the list down and open a run (the CLI side is on the page). */
const record = {
  id: "record",
  async run(r) {
    await r.wait(500);
    await r.click('[data-testid="filter"]', { move: 700, after: 200 });
    await r.type("rule", { cps: 10 });
    await r.wait(900);
    await r.click('[data-testid="nav-missing-rule"]', { move: 700, after: 1400 });
  },
};

/** Share: deep links and the light/dark switch. */
const share = {
  id: "share",
  start: "run=compaction&step=4",
  async run(r) {
    await r.wait(900);
    await r.click('[data-testid="theme"]', { move: 900, after: 1100 });
    await r.click('[data-testid="theme"]', { move: 200, after: 900 });
    await r.click('[data-testid="nav-overview"]', { move: 900, after: 1300 });
  },
};

/** Hero film: a calmer cut through the four ideas, at 1920x1080. */
const film = {
  id: "film",
  viewport: { width: 1600, height: 900 },
  scale: 1.2,
  async run(r) {
    r.mark(0);
    await r.wait(900);
    await r.moveTo('[data-testid="ov-missing-rule"] td.cell.absent', 900);
    await r.wait(1200);
    await r.click('[data-testid="ov-late-rules"] th', { move: 900, after: 1200 });
    r.mark(1);
    for (let i = 2; i <= 3; i++) await r.click(`[data-testid="cell-payments-${i}"]`, { move: 600, after: 900 });
    await r.click('[data-testid="nav-compaction"]', { move: 900, after: 1100 });
    r.mark(2);
    for (let i = 3; i <= 6; i++) await r.click(`[data-testid="cell-payments-${i}"]`, { move: 500, after: 800 });
    r.mark(3);
    await r.scroll(null, 520, 900);
    await r.click('[data-testid="segments"] details:has(.chip.rule) summary', { move: 900, after: 900 });
    await r.scroll(null, 200, 700);
    await r.wait(1600);
  },
};

export const SCENES = [overview, tracking, composition, segments, flags, compare, record, share, film];
