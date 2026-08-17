# dsh-tick-rail

A tick-rail conversation navigator for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI.

为 DeepSeek Harness Web 界面提供的会话刻度线导航条。

## What it does · 功能

A slim rail of tick marks appears beside the conversation — one tick per message (long ticks for your messages, short ticks for assistant replies), so the rhythm of the whole conversation is visible at a glance.

- **Peak-falloff highlight** — the lit tick is the longest and the surrounding ticks taper off evenly, forming a peak that follows your mouse as it moves along the rail. When the mouse leaves, the peak settles on your current reading position and tracks it while you scroll.
- **Hover preview** — a floating card next to the rail shows a snippet of the message under the peak.
- **Click to jump** — click anywhere on the rail to smooth-scroll the conversation to that message.
- The rail hides itself in short conversations (fewer than 5 messages) and renders nothing when no conversation is open.

在会话旁边显示一列细小的刻度线——每条消息一格(你的消息是长刻度,助手回复是短刻度),一眼看清整段对话的问答节奏。

- **峰值衰减高亮**:点亮位置的刻度最长,两侧刻度均匀递减,形成一座跟随鼠标移动的"山峰";鼠标移开后,峰顶回落到当前阅读位置,并随滚动同步。
- **悬停预览**:刻度旁弹出浮层卡片,显示峰顶对应消息的摘要。
- **点击跳转**:点击刻度区任意位置,会话平滑滚动到对应消息。
- 少于 5 条消息时自动隐藏;没有打开会话时不渲染任何内容。

## Install · 安装

```sh
dsh plugin add github:caisiyang123/dsh-tick-rail
```

Then restart `dsh web`. Works in the browser UI and inside DSH Desktop. The package is plain JavaScript with no build step, so the GitHub install needs no build authorization.

安装后重启 `dsh web` 生效,浏览器界面和 DSH Desktop 内均可使用。包为纯 JavaScript、无构建步骤,从 GitHub 安装无需构建授权。

## How it works · 实现说明

Pure web-client plugin — the host half is empty. The client module mounts into the official `shell.overlay` slot, anchors ticks to the conversation's stable `data-chat-flow-*` DOM markers, and follows theme tokens (`--dsw-alias-*`), so light and dark modes both work with no configuration.

纯 Web 客户端插件,host 侧为空实现。客户端模块挂载在官方 `shell.overlay` 插槽,通过会话 DOM 的稳定 `data-chat-flow-*` 标记定位消息,样式全部使用 `--dsw-alias-*` 主题变量,亮暗色模式开箱即用。

## License

MIT
