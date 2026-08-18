# dsh-tick-rail

A tick-rail conversation navigator for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI.

为 DeepSeek Harness Web 界面提供的会话刻度线导航条。

## What it does · 功能

A slim rail of tick marks appears beside the conversation — one tick per message you sent (your prompts and steering notes; assistant replies are skipped), so the rail reads as an index of your questions.

- **Peak-falloff highlight** — the lit tick is the longest and the surrounding ticks taper off evenly, forming a peak that follows your mouse as it moves along the rail. When the mouse leaves, the rail returns to its resting profile: an alternating long-short rhythm of ticks.
- **Hover preview** — a floating card next to the rail shows a snippet of the message under the peak.
- **Click to jump** — click anywhere on the rail to smooth-scroll the conversation to that message.
- **Keyboard friendly** — the rail is focusable: arrow keys move the peak, Enter or Space jumps, Escape dismisses the preview.
- The rail hides itself in short conversations (fewer than 3 of your messages) and renders nothing when no conversation is open.

在会话旁边显示一列细小的刻度线——你发的每条消息一格(提问和补充指令;助手回复不占刻度),整条导航就是你的提问索引。

- **峰值衰减高亮**:点亮位置的刻度最长,两侧刻度均匀递减,形成一座跟随鼠标移动的"山峰";鼠标移开后恢复静止形态——长短交替、富有节奏感的刻度列。
- **悬停预览**:刻度旁弹出浮层卡片,显示峰顶对应消息的摘要。
- **点击跳转**:点击刻度区任意位置,会话平滑滚动到对应消息。
- **键盘可用**:导航条可聚焦,方向键移动峰值,Enter/空格跳转,Esc 收起预览。
- 你的消息少于 3 条时自动隐藏;没有打开会话时不渲染任何内容。

## Install · 安装

Download the `.tgz` from the [latest release](https://github.com/caisiyang123/dsh-tick-rail/releases/latest), then:

从 [最新 Release](https://github.com/caisiyang123/dsh-tick-rail/releases/latest) 下载 `.tgz`,然后:

```sh
dsh plugin add ./dsh-tick-rail-<version>.tgz
```

Then restart `dsh web`. Works in the browser UI and inside DSH Desktop.

安装后重启 `dsh web` 生效,浏览器界面和 DSH Desktop 内均可使用。

<details>
<summary>Installing straight from GitHub · 直接从 GitHub 安装</summary>

`dsh plugin add github:caisiyang123/dsh-tick-rail` also works, but pnpm gates every git-hosted dependency behind build authorization even though this package has no build step. If the install stops with an `allowBuilds` error, add the exact key pnpm printed to `pnpm-workspace.yaml` in your profile directory, then re-run the command.

`dsh plugin add github:caisiyang123/dsh-tick-rail` 也可以用,但 pnpm 会对一切 git 来源的依赖要求构建授权(即使本包并无构建步骤)。如果安装因 `allowBuilds` 报错中断,把 pnpm 输出中给出的键加进 profile 目录的 `pnpm-workspace.yaml`,再重跑一次即可。

</details>

## How it works · 实现说明

Pure web-client plugin — the host half is empty. The client module mounts into the official `shell.overlay` slot, anchors ticks to the conversation's stable `data-chat-flow-*` DOM markers, and follows theme tokens (`--dsw-alias-*`), so light and dark modes both work with no configuration.

纯 Web 客户端插件,host 侧为空实现。客户端模块挂载在官方 `shell.overlay` 插槽,通过会话 DOM 的稳定 `data-chat-flow-*` 标记定位消息,样式全部使用 `--dsw-alias-*` 主题变量,亮暗色模式开箱即用。

## License

MIT
