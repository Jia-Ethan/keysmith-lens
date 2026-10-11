---
title: 工作原理
lede: 规则怎么找、怎么比对，旁支请求和「新增」怎么判断。
group: 参考
order: 5
page: how-it-works
---

## 找规则文件

运行目录里有 `fixtures.json` 时，以其中 `entries` 列出的文件为准；`path` 是 Agent 读取它的位置，Lens 按最长的路径后缀在运行目录里找到副本。用 `record --rule` 录制时会自动写好这个文件。

没有 `fixtures.json` 时，运行目录里这些文件名都算规则：`AGENTS.md`、`AGENTS.override.md`、`CLAUDE.md`、`CLAUDE.local.md`、`GEMINI.md`、`APPEND_SYSTEM.md`、`SYSTEM.md`、`.cursorrules`、`.windsurfrules`，以及 `*.mdc`。

## 按内容比对

不需要在规则里埋标记。每个规则文件按行切开，去掉 YAML frontmatter；20 个字符以上、而且不和其他规则文件重复的行，拿去请求里找（空白会先统一）。

- 全部找到：送达
- 找到一部分：部分送达
- 一行都没有：不在

所以同一条规则如果被 Agent 改写过（截断、换行、套模板），会显示为部分送达，点开原文可以核对。

## 旁支请求

如果一个运行里的 Agent 请求都带工具定义，那么不带工具定义的请求（例如生成会话标题）算旁支请求：淡色显示，不参与「晚到」「消失」的判断。

## 新增

一段文字如果没有原样出现在上一次 Agent 请求里，就标为「新增」。

## 哪些运行会被读取

- 有 `captures/` 的目录是一个运行；其他目录会往下找运行。
- 名字以 `_` 开头的目录会跳过（草稿运行）。
- 目录里有 `<运行>-redacted` 脱敏副本时，只读脱敏副本。
