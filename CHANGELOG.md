# Changelog

## 0.1.0

Initial release.

- Tick rail beside the conversation: one tick per message, long ticks for user messages, short ticks for assistant replies.
- Peak-falloff highlight: the lit tick is longest, neighbors taper off evenly over a ~4-tick radius, and the peak follows the mouse continuously; it settles on the current reading position when the mouse leaves and tracks scrolling.
- Hover preview card with a snippet of the message under the peak.
- Click to jump with an animated scroll (falls back to an instant jump when the page is hidden, when `prefers-reduced-motion` is set, or when the host freezes `requestAnimationFrame`).
- Keyboard support: the rail is focusable; arrow keys move the peak, Enter/Space jumps, Escape dismisses.
- Auto-hides for conversations with fewer than 5 messages and when no conversation is open.
- Verified end-to-end against `dsh 0.1.0-rc.6` (tarball install, module boot in `dsh web`, live interaction checks).
