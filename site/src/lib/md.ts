// A small Markdown renderer for release notes and help answers. It covers what
// those texts use: paragraphs, "- " lists nested by indentation, **bold**,
// `code` and [links](url). Everything else is escaped, so text such as
// `<user_query>` shows up literally.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function inline(md: string): string {
  const codes: string[] = [];
  let s = md.replace(/`([^`]+)`/g, (_, c: string) => {
    codes.push(`<code>${esc(c)}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, url: string) => {
    const external = /^https?:/.test(url);
    return `<a href="${url}"${external ? ' target="_blank" rel="noopener"' : ""}>${text}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => codes[Number(i)]);
}

type Node = { text: string; children: Node[] };

function parseList(lines: string[]): Node[] {
  const root: Node[] = [];
  const stack: { indent: number; nodes: Node[] }[] = [{ indent: -1, nodes: root }];
  let last: Node | null = null;
  for (const raw of lines) {
    const m = raw.match(/^(\s*)- (.*)$/);
    if (!m) {
      if (last && raw.trim()) last.text += " " + raw.trim();
      continue;
    }
    const indent = m[1].length;
    const node: Node = { text: m[2], children: [] };
    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    if (last && indent > stack[stack.length - 1].indent && stack[stack.length - 1].nodes.includes(last) && indent > 0) {
      stack.push({ indent, nodes: last.children });
    }
    stack[stack.length - 1].nodes.push(node);
    last = node;
  }
  return root;
}

function renderList(nodes: Node[]): string {
  return `<ul>${nodes.map((n) => `<li>${inline(n.text)}${n.children.length ? renderList(n.children) : ""}</li>`).join("")}</ul>`;
}

/** One list item that may carry nested "  - " lines. */
export function item(md: string): string {
  const [first, ...rest] = md.split("\n");
  const subs = rest.filter((l) => l.trim());
  return inline(first) + (subs.length ? renderList(parseList(subs.map((l) => l.replace(/^ {2}/, "")))) : "");
}

/** Paragraphs separated by blank lines; a run of "- " lines becomes a list. */
export function block(md: string): string {
  return md
    .trim()
    .split(/\n\s*\n/)
    .map((chunk) => (/^\s*- /.test(chunk) ? renderList(parseList(chunk.split("\n"))) : `<p>${inline(chunk.replace(/\n/g, " "))}</p>`))
    .join("");
}
