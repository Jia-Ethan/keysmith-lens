---
title: 快速上手
lede: 克隆、生成示例数据、打开页面，两分钟看完 Lens 能做什么。
group: 开始
order: 1
page: quickstart
---

## 需要什么

Python 3.9 或更高版本，macOS、Linux、Windows 都可以。没有第三方依赖，不需要 `pip install`。

## 先看示例

```sh
git clone https://github.com/Jia-Ethan/keysmith-lens.git
cd keysmith-lens
python3 examples/make_demo.py examples/demo
PYTHONPATH=. python3 -m keysmith_lens build examples/demo -o out/lens.html
open out/lens.html
```

Windows 上把最后一行换成 `start out\lens.html`，`PYTHONPATH=.` 换成 `set PYTHONPATH=.` 单独一行。

示例里有五个虚构的运行，都是同一个小项目「checkout 服务」：

| 运行 | 演示什么 |
| --- | --- |
| `all-rules-upfront` | 三条规则一开始就送到，一直都在 |
| `late-rules` | `payments/` 目录的规则要等 Agent 读到那个目录才出现 |
| `compaction` | 压缩上下文之后 `payments` 规则消失，再读一次才回来 |
| `missing-rule` | 配置了团队规则文件，但从来没有送到模型 |
| `system-prompt-rules` | 换一个 Agent：规则放进系统提示，最后有一次生成标题的旁支请求 |

## 接下来

- 录你自己的 Agent：[录制](/docs/record/)
- 看懂每个画面：[读懂页面](/docs/reading/)
