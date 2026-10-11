import type { Lang } from "../i18n/ui";

export type Qa = { q: string; a: string };
export type HelpSection = { id: string; title: string; items: Qa[] };

// Answers are short Markdown: paragraphs, "- " lists, **bold**, `code`, [links](/docs/...).
export const HELP: Record<Lang, HelpSection[]> = {
  zh: [
    {
      id: "quick",
      title: "快速解答",
      items: [
        {
          q: "Keysmith Lens 是做什么的？",
          a: "回放 AI 编程 Agent 的运行记录：每一步发给模型的请求里，你写的 AGENTS.md、CLAUDE.md、系统提示有没有送到、放在哪一层、什么时候没了。",
        },
        {
          q: "和 Keysmith Switch 是什么关系？",
          a: "都是 Keysmith 系列。[Switch](https://keysmithswitch.com/) 负责管理和部署提示词；Lens 负责检查它们有没有真正送到模型。两个可以单独使用。",
        },
        {
          q: "收费吗？",
          a: "不收费，按 MIT 许可证开源，没有账号。",
        },
        {
          q: "需要装什么？",
          a: "只要 Python 3.9 或更高版本，没有第三方依赖。见[快速上手](/docs/quickstart/)。",
        },
        {
          q: "支持哪些 Agent？",
          a: "能自定义 API 地址的都可以。已经验证过的有 Claude Code、Codex、OpenCode、Pi 和 OpenHands，见[各 Agent 的录制方式](/docs/agents/)。",
        },
      ],
    },
    {
      id: "record",
      title: "录制",
      items: [
        {
          q: "录制会保存我的 API key 吗？",
          a: "不会。录制只保存请求的方法、路径和正文，请求头一律不写盘。见[数据与隐私](/docs/privacy/)。",
        },
        {
          q: "录制会拖慢 Agent 吗？",
          a: "请求经过本机多转发一次，响应边收边转，流式输出不受影响。",
        },
        {
          q: "Agent 用账号登录，没有 API key，能录吗？",
          a: "要看这个 Agent 在账号登录时是否允许自定义 API 地址。很多 Agent 只在使用 API key 时才走自定义地址。",
        },
        {
          q: "Agent 跑在 Docker 里怎么办？",
          a: "代理只监听 `127.0.0.1`。让容器和代理共用网络（例如 `docker run --network host`），或者把代理也放进容器。",
        },
        {
          q: "我已经有自己抓的请求了，能直接用吗？",
          a: "可以。整理成 `captures/NNN-*.json`，每个文件里放 `path` 和 `body_parsed` 两个字段即可，格式见 GitHub 上的 `docs/capture-format.md`。",
        },
      ],
    },
    {
      id: "reading",
      title: "看结果",
      items: [
        {
          q: "规则显示「部分送达」是什么意思？",
          a: "规则文件里有一些行在请求里找到了，另一些没有。常见原因是 Agent 改写、截断了规则，或者把它拆到了不同位置。点开那次请求的原文核对。",
        },
        {
          q: "为什么有一列是淡色的？",
          a: "那是旁支请求，例如生成会话标题。它不带工具定义，不参与「晚到」「消失」的判断。",
        },
        {
          q: "为什么我的规则文件没出现在表里？",
          a: "可能文件名不在默认列表里，或者每一行都太短（少于 20 个字符）。录制时用 `--rule` 指定这个文件。",
        },
        {
          q: "生成的 HTML 可以发给别人吗？",
          a: "它包含请求原文，可能有文件内容、路径或私人信息。分享前先对运行目录脱敏，再重新生成。",
        },
      ],
    },
  ],
  en: [
    {
      id: "quick",
      title: "Quick answers",
      items: [
        {
          q: "What does Keysmith Lens do?",
          a: "It replays coding-agent runs: in each request sent to the model, did your AGENTS.md, CLAUDE.md and system prompts arrive, in which layer, and when did they drop?",
        },
        {
          q: "How does it relate to Keysmith Switch?",
          a: "Both are part of the Keysmith family. [Switch](https://keysmithswitch.com/en/) manages and deploys prompts; Lens checks whether they actually reach the model. Each works on its own.",
        },
        {
          q: "Does it cost anything?",
          a: "No. It's open source under the MIT License, with no account.",
        },
        {
          q: "What do I need to install?",
          a: "Just Python 3.9 or later; there are no dependencies. See [Quick start](/en/docs/quickstart/).",
        },
        {
          q: "Which agents does it support?",
          a: "Any agent whose API address you can set. Tested with Claude Code, Codex, OpenCode, Pi and OpenHands; see [Recording each agent](/en/docs/agents/).",
        },
      ],
    },
    {
      id: "record",
      title: "Recording",
      items: [
        {
          q: "Does recording save my API key?",
          a: "No. Recording saves each request's method, path and body; headers are never written. See [Data and privacy](/en/docs/privacy/).",
        },
        {
          q: "Does recording slow the agent down?",
          a: "Requests take one extra local hop, and responses are passed on as they arrive, so streaming is unaffected.",
        },
        {
          q: "My agent signs in with an account, not an API key. Can I record it?",
          a: "Only if the agent lets you set a custom API address when signed in. Many agents use a custom address only with an API key.",
        },
        {
          q: "What if the agent runs in Docker?",
          a: "The proxy listens on `127.0.0.1` only. Share the network with the proxy (for example `docker run --network host`) or run the proxy inside the container.",
        },
        {
          q: "I already have captured requests. Can I use them?",
          a: "Yes. Arrange them as `captures/NNN-*.json`, each with `path` and `body_parsed` fields; the format is in `docs/capture-format.md` on GitHub.",
        },
      ],
    },
    {
      id: "reading",
      title: "Reading results",
      items: [
        {
          q: "What does \"partly delivered\" mean?",
          a: "Some lines of the rule file were found in the request and others were not. Usually the agent rewrote or truncated the rule, or split it up. Open that request's raw text to check.",
        },
        {
          q: "Why is one column faded?",
          a: "It's a side request, such as title generation. It carries no tool definitions and is left out when deciding \"late\" and \"dropped\".",
        },
        {
          q: "Why doesn't my rule file show up?",
          a: "Its name may not be on the default list, or all its lines are short (under 20 characters). Name it with `--rule` when recording.",
        },
        {
          q: "Can I send the HTML to someone?",
          a: "It contains request text, which may include file contents, paths or private details. Redact the runs first, then build again.",
        },
      ],
    },
  ],
};
