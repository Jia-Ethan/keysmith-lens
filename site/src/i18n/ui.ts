export const LANGS = ["zh", "en"] as const;
export type Lang = (typeof LANGS)[number];

/** Rich headline: plain text, `em` (italic in English, accent in Chinese), `brush` (highlighter). */
export type Seg = { t: string; em?: boolean; brush?: boolean };

const zh = {
  htmlLang: "zh-CN",
  ogLocale: "zh_CN",
  langName: "中文",
  meta: {
    siteName: "Keysmith Lens",
    title: "Keysmith Lens — 看模型实际收到了什么",
    description:
      "Keysmith Lens 回放 AI 编程 Agent 的运行记录：每一步发给模型的请求里，AGENTS.md、CLAUDE.md、系统提示有没有送到、放在哪一层、什么时候没了。本机运行，开源免费。",
  },
  nav: {
    skip: "跳到正文",
    product: "产品",
    download: "开始使用",
    changelog: "更新日志",
    docs: "文档",
    docsIndex: "文档",
    help: "帮助",
    community: "社区",
    github: "GitHub",
    discussions: "问题反馈",
    linuxdo: "LINUX DO",
    telegram: "Telegram 交流群",
    getHelp: "获取帮助",
    cta: "开始使用 Keysmith Lens",
    ctaShort: "开始使用",
    menu: "菜单",
    theme: "主题",
    themeLight: "浅色",
    themeDark: "深色",
    themeToggle: "切换浅色 / 深色",
    language: "语言",
    stars: "GitHub 星标",
  },
  hero: {
    kicker: "Keysmith Lens，AI 编程 Agent 的运行回放",
    title: [
      { t: "你写的规则，" },
      { t: "模型真的收到了吗？", em: true },
      { t: "打开", brush: true },
      { t: "看看。", em: true },
    ] as Seg[],
    allDownloads: "开始使用",
  },
  dl: {
    mac: "开始使用",
    win: "开始使用",
    any: "开始使用",
    hintMac: "Python 3.9+ / 无依赖",
    hintWin: "Python 3.9+ / 无依赖",
  },
  film: {
    label: "产品短片",
    pause: "暂停",
    play: "播放",
    chapters: [
      [{ t: "每条规则，" }, { t: "送到了没有。", em: true }],
      [{ t: "一步一步，" }, { t: "看它什么时候出现。", em: true }],
      [{ t: "压缩之后，" }, { t: "看它什么时候没了。", em: true }],
      [{ t: "落到原文，" }, { t: "看它在哪一行。", em: true }],
    ] as Seg[][],
  },
  tour: {
    heading: "Keysmith Lens 功能导览",
    pause: "暂停",
    play: "播放",
    fullscreen: "全屏",
    items: [
      {
        id: "overview",
        title: "一张表看完所有运行",
        body: "一行一个运行，一列一条规则。格子的颜色是规则第一次出现的那一层，空心框是从来没送到。点一行就进入回放。",
      },
      {
        id: "tracking",
        title: "规则每一步在不在",
        body: "规则 × 请求的追踪表。晚到、中途消失、再读一次又回来，都在同一张表里。",
      },
      {
        id: "composition",
        title: "模型收到的，按比例画出来",
        body: "每次请求画成一条长条，系统提示、对话、工具结果、工具定义各占多少一眼看清，细竖线标出规则文字的位置。",
      },
      {
        id: "segments",
        title: "落到原文的每一行",
        body: "请求拆成一段一段，标出比上一步新增的部分。点开就是原文，规则行高亮。",
      },
      {
        id: "flags",
        title: "自动标出异常",
        body: "从未送达、晚到、消失、回来、只送了一部分、重复出现，都会单独列出来，不用自己翻请求。",
      },
      {
        id: "compare",
        title: "换一个 Agent 再看",
        body: "同一个项目、同一套规则，不同的 Agent 会放在不同的层。左边切换运行，直接对照。",
      },
      {
        id: "record",
        title: "本机录制，一条命令",
        body: "keysmith-lens record 在本机起一个转发代理，把 Agent 的模型请求存下来。请求头不落盘，密钥不会写进文件。",
      },
      {
        id: "share",
        title: "一个 HTML 文件",
        body: "生成的是一个独立的 HTML 文件，不需要服务器。链接可以直接指到某个运行的某一步。",
      },
    ],
  },
  belt: {
    heading: "GitHub 上的 Keysmith 系列",
  },
  principles: {
    title: [{ t: "只看，" }, { t: "不改。", em: true }] as Seg[],
    items: [
      {
        title: "只读",
        body: "Lens 只读运行记录，不改你的项目、不改 Agent 的配置，也不会往规则文件里埋标记。",
      },
      {
        title: "按内容比对",
        body: "规则有没有送到，是拿规则文件的原文去请求里找出来的。找到几行、在哪一段，都能点开核对。",
      },
      {
        title: "不出本机",
        body: "录制和生成都在本机完成，没有账号、没有上传、没有统计或遥测。",
      },
      {
        title: "不存密钥",
        body: "录制只保存请求的方法、路径和正文，请求头一律不写盘。生成的 HTML 含请求原文，分享前请先脱敏。",
      },
    ],
    more: "工作原理详见文档",
  },
  cards: {
    title: [{ t: "三种请求格式，" }, { t: "覆盖主流的编程 Agent。", em: true }] as Seg[],
    platforms: "已验证",
    source: "项目主页",
    filesLabel: "会读的规则文件",
    more: "各 Agent 怎么录制",
    agents: {
      claude: {
        who: "Anthropic Messages（/v1/messages）",
        yes: [
          "把 ANTHROPIC_BASE_URL 设为本机代理地址即可录制",
          "系统提示、system-reminder、附在工具结果后面的规则分开显示",
          "压缩上下文之后的请求同样录下，规则消失会被标出",
        ],
        no: ["只录经过代理的 HTTP 请求，不读 Claude Code 自己的会话记录"],
        files: ["CLAUDE.md", "AGENTS.md", "--append-system-prompt"],
      },
      codex: {
        who: "OpenAI Responses（/v1/responses）",
        yes: [
          "在 config.toml 里加一个 provider，base_url 指向本机代理",
          "instructions 和 developer 消息都算系统层",
          "函数调用与输出分别显示为工具调用和工具结果",
        ],
        no: ["只录经过这个 provider 的请求"],
        files: ["AGENTS.md", "model_instructions_file"],
      },
      opencode: {
        who: "OpenAI Responses（/v1/responses）",
        yes: [
          "OpenCode：在 opencode.json 的 provider 里设置 baseURL",
          "Pi：在 ~/.pi/agent/models.json 里设置 baseUrl",
          "全局、项目、追加的系统提示分开显示",
        ],
        no: ["规则文件名不在默认列表里时，用 --rule 指定"],
        files: ["AGENTS.md", "APPEND_SYSTEM.md", "instructions"],
      },
      openhands: {
        who: "Responses 或 Chat Completions",
        yes: [
          "在 LLM 设置里把 base_url 指向本机代理",
          "标题生成这类不带工具的请求淡色显示，不算规则消失",
          "skills 的 frontmatter 不算规则正文",
        ],
        no: ["较早的版本走 /v1/chat/completions，同样支持"],
        files: ["AGENTS.md", "skills/*.md"],
      },
    },
  },
  footer: {
    blurb:
      "Keysmith Lens 回放 AI 编程 Agent 的运行记录，看每一步发给模型的请求里，你写的规则有没有送到、放在哪一层、什么时候没了。",
    product: "产品",
    tour: "产品导览",
    extensions: "抓包格式",
    resources: "资源",
    releases: "全部版本",
    source: "源码",
    keysmith: "Keysmith 系列",
    community: "社区",
    rights: "开源，按 MIT 许可证授权。",
    license: "许可",
    privacy: "隐私",
    notices: "第三方声明",
  },
  download: {
    title: "开始使用",
    h1: [{ t: "Keysmith Lens，" }, { t: "三条命令跑起来", em: true }] as Seg[],
    lead: "一个 Python 包，没有第三方依赖。先用示例数据看一遍，再录你自己的 Agent。",
    noteLead: "不用注册，也不用登录。",
    note: "所有东西都在本机：录制的请求存在你指定的目录，生成的是一个 HTML 文件。",
    tourLink: "看看产品导览",
    pick: "选择方式",
    macTitle: "git clone",
    winTitle: "下载 ZIP",
    intelTitle: "pip",
    linuxTitle: "Homebrew",
    notYet: "暂不提供",
    macSpec: "需要 Python 3.9+",
    winSpec: "需要 Python 3.9+",
    other: "其他",
    allReleases: "全部版本",
    insideTitle: "装好之后有什么",
    inside: [
      {
        title: "record",
        body: "在本机起一个转发代理。把 Agent 的 API 地址指向它，每次模型请求都会存成一个 JSON 文件，响应照常流回 Agent。",
      },
      {
        title: "build",
        body: "读一个或多个运行目录，按内容比对规则文件，生成一个独立的 HTML 文件。",
      },
      {
        title: "示例数据",
        body: "examples/make_demo.py 生成五个虚构的运行：规则晚到、压缩后消失、从未送达、跨 Agent 对照、全部正常。",
      },
    ],
    firstOpen: [
      {
        label: "第一步 / 先看示例",
        body: "git clone https://github.com/Jia-Ethan/keysmith-lens.git\ncd keysmith-lens\npython3 examples/make_demo.py examples/demo\nPYTHONPATH=. python3 -m keysmith_lens build examples/demo -o out/lens.html\nopen out/lens.html",
      },
      {
        label: "第二步 / 录自己的 Agent",
        body: "# 终端 1：起本机代理，--rule 指定要检查的规则文件\nPYTHONPATH=. python3 -m keysmith_lens record runs/first \\\n  --upstream https://api.anthropic.com --rule ./AGENTS.md\n\n# 终端 2：把 Agent 的 API 地址指向代理，照常使用，结束后回终端 1 按 Ctrl-C\nANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude",
      },
      {
        label: "第三步 / 生成并打开",
        body: "PYTHONPATH=. python3 -m keysmith_lens build runs -o out/lens.html\nopen out/lens.html   # 含请求原文，只在本机打开；要分享先脱敏",
      },
    ],
    signNote: "Lens 只在本机监听 127.0.0.1，不会把请求发到除了你指定的 upstream 以外的任何地方。",
    agentTitle: "复制给智能体安装",
    agentPrompt:
      "请先阅读 https://github.com/Jia-Ethan/keysmith-lens 的 README，再在本机克隆仓库。用 python3 examples/make_demo.py examples/demo 生成示例数据，用 PYTHONPATH=. python3 -m keysmith_lens build examples/demo -o out/lens.html 生成页面并告诉我路径。不要安装任何第三方依赖；如需录制，只在 127.0.0.1 上运行 record，不要把 API key 写进任何文件。",
    copy: "复制",
    copied: "已复制",
  },
  changelog: {
    title: "更新日志",
    lead: "每一条是一个版本，写着和上一版相比改了什么。",
    latest: "开始使用",
    stable: "版本",
    version: "版本",
    more: (n: number) => `还有 ${n} 条`,
    less: "收起",
    onGithub: "在 GitHub 上查看",
    downloads: "下载",
    langNote: "",
  },
  help: {
    title: "帮助",
    contents: "目录",
  },
  docs: {
    title: "Keysmith Lens 文档",
    search: "搜索文档",
    chapter: "第",
    chapterSuffix: "章",
    onThisPage: "本页内容",
    prev: "上一章",
    next: "下一章",
    edit: "文档有误或看不懂？到 GitHub 上告诉我们",
    noResults: "没有找到",
  },
  notFound: {
    title: "这个页面不存在。",
    body: "链接可能过期了，或者地址里有错字。可以从这里继续：",
    home: "首页",
  },
  common: {
    newWindow: "（在新窗口打开）",
    stars: (n: string) => `${n} 颗星`,
  },
};

type Dict = typeof zh;

const en: Dict = {
  htmlLang: "en",
  ogLocale: "en_US",
  langName: "English",
  meta: {
    siteName: "Keysmith Lens",
    title: "Keysmith Lens — see what the model was actually sent",
    description:
      "Keysmith Lens replays coding-agent runs: in every request to the model, did your AGENTS.md, CLAUDE.md and system prompts arrive, in which layer, and when did they drop? Runs locally. Open source.",
  },
  nav: {
    skip: "Skip to content",
    product: "Product",
    download: "Get started",
    changelog: "Changelog",
    docs: "Docs",
    docsIndex: "Documentation",
    help: "Help",
    community: "Community",
    github: "GitHub",
    discussions: "Issues",
    linuxdo: "LINUX DO",
    telegram: "Telegram group",
    getHelp: "Get help",
    cta: "Get started with Keysmith Lens",
    ctaShort: "Get started",
    menu: "Menu",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeToggle: "Switch between light and dark",
    language: "Language",
    stars: "GitHub stars",
  },
  hero: {
    kicker: "Keysmith Lens, replays for your coding agents",
    title: [
      { t: "You wrote the rules. " },
      { t: "Did the model get them? ", em: true },
      { t: "Look", em: true, brush: true },
      { t: " and see.", em: true },
    ],
    allDownloads: "Get started",
  },
  dl: {
    mac: "Get started",
    win: "Get started",
    any: "Get started",
    hintMac: "Python 3.9+ / no dependencies",
    hintWin: "Python 3.9+ / no dependencies",
  },
  film: {
    label: "Product film",
    pause: "Pause",
    play: "Play",
    chapters: [
      [{ t: "Every rule: " }, { t: "did it arrive?", em: true }],
      [{ t: "Step by step: " }, { t: "when did it show up?", em: true }],
      [{ t: "After compaction: " }, { t: "when did it go?", em: true }],
      [{ t: "Down to the text: " }, { t: "which line is it?", em: true }],
    ],
  },
  tour: {
    heading: "A tour of Keysmith Lens",
    pause: "Pause",
    play: "Play",
    fullscreen: "Full screen",
    items: [
      {
        id: "overview",
        title: "Every run on one table",
        body: "One row per run, one column per rule. A cell's color is the layer where the rule first arrived; a ring means it never did. Click a row to replay it.",
      },
      {
        id: "tracking",
        title: "Each rule, request by request",
        body: "A rule × request grid. Late arrivals, rules that drop mid-run, rules that come back on a later read: all in one place.",
      },
      {
        id: "composition",
        title: "What the model got, to scale",
        body: "Each request is a bar: how much is system prompt, conversation, tool output and tool definitions, with thin ticks where the rule text sits.",
      },
      {
        id: "segments",
        title: "Down to every line",
        body: "Each request split into segments, with what's new since the last one marked. Open one for the raw text, rule lines highlighted.",
      },
      {
        id: "flags",
        title: "Problems, flagged for you",
        body: "Never delivered, late, dropped, back again, partly there, duplicated: each one listed, without reading through requests yourself.",
      },
      {
        id: "compare",
        title: "Try another agent",
        body: "Same project, same rules: different agents put them in different layers. Switch runs on the left and compare.",
      },
      {
        id: "record",
        title: "Record locally, one command",
        body: "keysmith-lens record runs a forwarding proxy on your machine and saves the agent's model requests. Headers are never written, so keys stay off disk.",
      },
      {
        id: "share",
        title: "One HTML file",
        body: "The output is a single self-contained HTML file, no server needed. Links can point straight at a run and request.",
      },
    ],
  },
  belt: {
    heading: "The Keysmith family on GitHub",
  },
  principles: {
    title: [{ t: "It looks. " }, { t: "It doesn't touch.", em: true }],
    items: [
      {
        title: "Read-only",
        body: "Lens only reads run folders. It doesn't change your project or your agent's settings, and it never plants markers in your rule files.",
      },
      {
        title: "Matched by content",
        body: "Whether a rule arrived is found by searching the request for the rule file's own text. How many lines, in which segment: open it and check.",
      },
      {
        title: "Stays on your computer",
        body: "Recording and building happen on your machine. No account, no upload, no analytics or telemetry.",
      },
      {
        title: "No keys on disk",
        body: "Recording saves the method, path and body only; headers are never written. The HTML embeds request text, so redact before you share it.",
      },
    ],
    more: "How it works, in the docs",
  },
  cards: {
    title: [{ t: "Three request formats, " }, { t: "covering the main coding agents.", em: true }],
    platforms: "Tested",
    source: "Project home",
    filesLabel: "Rule files it reads",
    more: "How to record each agent",
    agents: {
      claude: {
        who: "Anthropic Messages (/v1/messages)",
        yes: [
          "Set ANTHROPIC_BASE_URL to the local proxy to record",
          "System prompt, system reminders and rules attached to tool results are shown apart",
          "Requests after context compaction are recorded too, and dropped rules are flagged",
        ],
        no: ["Records HTTP requests through the proxy only; it does not read Claude Code's own session files"],
        files: ["CLAUDE.md", "AGENTS.md", "--append-system-prompt"],
      },
      codex: {
        who: "OpenAI Responses (/v1/responses)",
        yes: [
          "Add a provider in config.toml whose base_url is the local proxy",
          "instructions and developer messages count as the system layer",
          "Function calls and outputs show as tool calls and tool results",
        ],
        no: ["Only requests through that provider are recorded"],
        files: ["AGENTS.md", "model_instructions_file"],
      },
      opencode: {
        who: "OpenAI Responses (/v1/responses)",
        yes: [
          "OpenCode: set baseURL on the provider in opencode.json",
          "Pi: set baseUrl in ~/.pi/agent/models.json",
          "Global, project and appended system prompts are shown apart",
        ],
        no: ["Pass rule files with other names using --rule"],
        files: ["AGENTS.md", "APPEND_SYSTEM.md", "instructions"],
      },
      openhands: {
        who: "Responses or Chat Completions",
        yes: [
          "Point base_url in the LLM settings at the local proxy",
          "Requests without tools, such as title generation, are faded and never count as a drop",
          "Skill frontmatter is not counted as rule text",
        ],
        no: ["Older versions use /v1/chat/completions, also supported"],
        files: ["AGENTS.md", "skills/*.md"],
      },
    },
  },
  footer: {
    blurb:
      "Keysmith Lens replays coding-agent runs: in each request to the model, did your rules arrive, in which layer, and when did they drop?",
    product: "Product",
    tour: "Product tour",
    extensions: "Capture format",
    resources: "Resources",
    releases: "All releases",
    source: "Source",
    keysmith: "Keysmith family",
    community: "Community",
    rights: "Open source under the MIT License.",
    license: "License",
    privacy: "Privacy",
    notices: "Third-party notices",
  },
  download: {
    title: "Get started",
    h1: [{ t: "Keysmith Lens, " }, { t: "running in three commands", em: true }],
    lead: "A Python package with no dependencies. Look at the demo runs first, then record your own agent.",
    noteLead: "No sign-up, no login.",
    note: "Everything stays local: recorded requests go to a folder you choose, and the output is one HTML file.",
    tourLink: "Take the product tour",
    pick: "Choose a way",
    macTitle: "git clone",
    winTitle: "Download ZIP",
    intelTitle: "pip",
    linuxTitle: "Homebrew",
    notYet: "Not yet",
    macSpec: "Needs Python 3.9+",
    winSpec: "Needs Python 3.9+",
    other: "Other",
    allReleases: "All releases",
    insideTitle: "What you get",
    inside: [
      {
        title: "record",
        body: "Runs a forwarding proxy on your machine. Point the agent's API address at it and each model request is saved as a JSON file; responses stream back to the agent as usual.",
      },
      {
        title: "build",
        body: "Reads one or more run folders, matches rule files by content and writes one self-contained HTML file.",
      },
      {
        title: "Demo runs",
        body: "examples/make_demo.py writes five made-up runs: a late rule, a rule dropped by compaction, one never delivered, two agents side by side, and a clean run.",
      },
    ],
    firstOpen: [
      {
        label: "Step 1 / Try the demo",
        body: "git clone https://github.com/Jia-Ethan/keysmith-lens.git\ncd keysmith-lens\npython3 examples/make_demo.py examples/demo\nPYTHONPATH=. python3 -m keysmith_lens build examples/demo -o out/lens.html\nopen out/lens.html",
      },
      {
        label: "Step 2 / Record your agent",
        body: "# terminal 1: the local proxy; --rule names the rule files to check\nPYTHONPATH=. python3 -m keysmith_lens record runs/first \\\n  --upstream https://api.anthropic.com --rule ./AGENTS.md\n\n# terminal 2: point the agent at the proxy, use it as usual, then Ctrl-C in terminal 1\nANTHROPIC_BASE_URL=http://127.0.0.1:8787 claude",
      },
      {
        label: "Step 3 / Build and open",
        body: "PYTHONPATH=. python3 -m keysmith_lens build runs -o out/lens.html\nopen out/lens.html   # embeds request text: keep it local, redact before sharing",
      },
    ],
    signNote: "Lens listens on 127.0.0.1 only and sends requests nowhere except the upstream you name.",
    agentTitle: "Copy for an agent to set up",
    agentPrompt:
      "Read the README at https://github.com/Jia-Ethan/keysmith-lens, then clone the repository locally. Generate the demo runs with python3 examples/make_demo.py examples/demo, build the page with PYTHONPATH=. python3 -m keysmith_lens build examples/demo -o out/lens.html, and tell me the path. Do not install any third-party dependencies. If recording, run record on 127.0.0.1 only and never write an API key to a file.",
    copy: "Copy",
    copied: "Copied",
  },
  changelog: {
    title: "Changelog",
    lead: "Each entry is a release and what changed since the one before.",
    latest: "Get started",
    stable: "Releases",
    version: "Version",
    more: (n: number) => `${n} more`,
    less: "Show less",
    onGithub: "View on GitHub",
    downloads: "Downloads",
    langNote: "Release notes are written in Chinese and English.",
  },
  help: {
    title: "Help",
    contents: "Contents",
  },
  docs: {
    title: "Keysmith Lens documentation",
    search: "Search the docs",
    chapter: "Chapter",
    chapterSuffix: "",
    onThisPage: "On this page",
    prev: "Previous",
    next: "Next",
    edit: "Something wrong or unclear? Tell us on GitHub",
    noResults: "Nothing found",
  },
  notFound: {
    title: "This page doesn't exist.",
    body: "The link may be out of date, or the address has a typo. Carry on from here:",
    home: "Home",
  },
  common: {
    newWindow: "(opens in a new window)",
    stars: (n: string) => `${n} stars`,
  },
};

export const ui: Record<Lang, Dict> = { zh, en };

export function t(lang: Lang): Dict {
  return ui[lang];
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Site path for a page in a language; `path` has no language prefix ("/download/"). */
export function href(lang: Lang, path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${lang === "zh" ? "" : "/en"}${p}`;
}

/** The same page in the other language. */
export function swapLang(pathname: string, to: Lang): string {
  const rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) || "/" : pathname;
  const bare = rel.replace(/^\/en(?=\/|$)/, "") || "/";
  return href(to, bare);
}

export function asset(path: string): string {
  return `${BASE}/${path.replace(/^\//, "")}`;
}
