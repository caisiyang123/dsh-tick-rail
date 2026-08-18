window.__ModuleLoader__.load({
  id: 'dsh-tick-rail',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' })
    const React = require('react')

    const NS = 'tickRail'
    const en = {
      user: 'You',
      steering: 'Steering note',
      assistant: 'Assistant',
      rail: 'Conversation tick rail'
    }
    const zh = {
      user: '你',
      steering: '补充指令',
      assistant: '助手回复',
      rail: '会话刻度导航'
    }

    // Only the user's own turns get ticks; assistant output is skipped so the
    // rail reads as an index of your questions.
    const SHOWN_KINDS = { user: 'user', steering: 'steering' }
    const MIN_TICKS = 3
    // Resting lengths alternate purely for looks, recreating the original
    // long-short rhythm the rail had when assistant replies held short ticks.
    const BASE_LONG = 14
    const BASE_SHORT = 9
    const PEAK = 16
    const RADIUS = 4.2
    const RAIL_WIDTH = 44
    const PREVIEW_WIDTH = 300
    const PREVIEW_CHARS = 180
    const OWN_ATTRIBUTE = 'data-dsh-tick-rail'

    const css = `
      .dshTickRail{position:fixed;z-index:60;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:6px;width:${RAIL_WIDTH}px;pointer-events:auto;cursor:pointer}
      .dshTickRailHit{padding:2.5px 10px 2.5px 0;margin:-2.5px 0}
      .dshTickRailTick{height:2.5px;border-radius:2px;background:var(--dsw-alias-label-tertiary,var(--dsw-alias-label-secondary,#8a8a8a));transition:width .12s ease-out,opacity .12s ease-out,background .12s ease-out}
      .dshTickRailTickActive{background:var(--dsw-alias-label-primary,#1f1f1f)}
      .dshTickRail:focus-visible{outline:1px solid var(--dsw-alias-border-l2,#bbb);outline-offset:4px;border-radius:6px}
      .dshTickRailPreview{position:fixed;z-index:61;width:${PREVIEW_WIDTH}px;box-sizing:border-box;pointer-events:none;background:var(--dsw-alias-bg-overlay,var(--dsw-alias-bg-layer-1,#fff));border:1px solid var(--dsw-alias-border-l2,#e2e2e2);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12),0 2px 6px rgba(0,0,0,.08);padding:12px 14px}
      .dshTickRailPreviewTitle{font-size:13px;font-weight:600;line-height:20px;color:var(--dsw-alias-label-primary,#1f1f1f);margin:0 0 5px}
      .dshTickRailPreviewBody{font-size:13px;line-height:1.65;color:var(--dsw-alias-label-secondary,#5c5c5c);margin:0;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
      @media (prefers-reduced-motion:reduce){.dshTickRailTick{transition:none}}
    `

    function installStyles() {
      if (document.querySelector('style[data-plugin-css="dsh-tick-rail"]')) return
      const style = document.createElement('style')
      style.dataset.plugin = 'dsh-tick-rail'
      style.dataset.pluginCss = 'dsh-tick-rail'
      style.textContent = css
      document.head.appendChild(style)
    }

    function insideOwnUi(node) {
      const el = node instanceof Element ? node : node && node.parentElement
      return Boolean(el && typeof el.closest === 'function' && el.closest(`[${OWN_ATTRIBUTE}]`))
    }

    function collect() {
      const scrollEl = document.querySelector('[data-conversation-scroll]')
      const flowEl = document.querySelector('[data-chat-flow]')
      if (!scrollEl || !flowEl || !scrollEl.contains(flowEl)) return { scrollEl: null, items: [] }
      const items = []
      for (const el of flowEl.querySelectorAll('[data-chat-flow-kind]')) {
        const kind = SHOWN_KINDS[el.getAttribute('data-chat-flow-kind')]
        if (!kind) continue
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
        if (!text) continue
        items.push({
          el,
          kind,
          key: el.getAttribute('data-chat-flow-key') || `i${items.length}`,
          text: text.slice(0, PREVIEW_CHARS + 40)
        })
      }
      return { scrollEl, items }
    }

    // Hand-rolled animation: native smooth scrolling is disabled in some
    // embedded hosts (scrollIntoView/scrollTo with behavior "smooth" do not
    // move at all there), so the jump animates via requestAnimationFrame.
    function smoothScrollTo(scrollEl, targetTop) {
      const start = scrollEl.scrollTop
      const delta = targetTop - start
      if (Math.abs(delta) < 1) return
      if (
        document.visibilityState === 'hidden' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        scrollEl.scrollTop = targetTop
        return
      }
      const duration = 260
      const startedAt = performance.now()
      let settled = false
      const step = (now) => {
        if (settled) return
        const progress = Math.min(1, (now - startedAt) / duration)
        const eased = 1 - (1 - progress) ** 3
        scrollEl.scrollTop = start + delta * eased
        if (progress < 1) requestAnimationFrame(step)
        else settled = true
      }
      requestAnimationFrame(step)
      // Embedded webviews can freeze requestAnimationFrame even while the
      // page reports itself visible; land the jump instantly in that case.
      setTimeout(() => {
        if (scrollEl.scrollTop === start && !settled) {
          settled = true
          scrollEl.scrollTop = targetTop
        }
      }, 120)
    }

    function activeIndex(scrollEl, items) {
      if (!items.length) return 0
      const anchor = scrollEl.getBoundingClientRect().top + scrollEl.clientHeight / 3
      let active = 0
      for (let i = 0; i < items.length; i += 1) {
        if (items[i].el.getBoundingClientRect().top <= anchor) active = i
      }
      return active
    }

    function TickRail({ t }) {
      const [snapshot, setSnapshot] = React.useState({ scrollEl: null, items: [] })
      const [rect, setRect] = React.useState(null)
      const [active, setActive] = React.useState(0)
      const [hover, setHover] = React.useState(null)
      const railRef = React.useRef(null)
      const snapshotRef = React.useRef(snapshot)
      snapshotRef.current = snapshot
      const activeRef = React.useRef(active)
      activeRef.current = active
      const hoverRef = React.useRef(hover)
      hoverRef.current = hover

      React.useEffect(() => {
        let disposed = false
        let rescanTimer
        let deadlineTimer

        const measure = (source) => {
          if (!source.scrollEl || !source.scrollEl.isConnected) {
            setRect(null)
            return
          }
          const box = source.scrollEl.getBoundingClientRect()
          setRect((prev) =>
            prev && prev.left === box.left && prev.top === box.top && prev.height === box.height
              ? prev
              : { left: box.left, top: box.top, height: box.height }
          )
          setActive(activeIndex(source.scrollEl, source.items))
        }

        const rescan = () => {
          if (disposed) return
          const next = collect()
          setSnapshot((current) => {
            const same =
              current.scrollEl === next.scrollEl &&
              current.items.length === next.items.length &&
              current.items.every((item, i) => item.el === next.items[i].el && item.text === next.items[i].text)
            return same ? current : next
          })
          measure(next)
        }

        const runRescan = () => {
          clearTimeout(rescanTimer)
          clearTimeout(deadlineTimer)
          deadlineTimer = undefined
          rescan()
        }

        // Debounced, but with a hard deadline so a stream of app mutations
        // (dialog transitions, streaming output) cannot starve the rescan.
        const scheduleRescan = () => {
          clearTimeout(rescanTimer)
          rescanTimer = setTimeout(runRescan, 200)
          if (deadlineTimer === undefined) deadlineTimer = setTimeout(runRescan, 900)
        }

        const observer = new MutationObserver((records) => {
          for (const record of records) {
            if (insideOwnUi(record.target)) continue
            scheduleRescan()
            return
          }
        })
        observer.observe(document.body, { childList: true, subtree: true, characterData: true })
        window.addEventListener('resize', scheduleRescan)
        rescan()

        return () => {
          disposed = true
          clearTimeout(rescanTimer)
          clearTimeout(deadlineTimer)
          observer.disconnect()
          window.removeEventListener('resize', scheduleRescan)
        }
      }, [])

      React.useEffect(() => {
        const { scrollEl, items } = snapshot
        if (!scrollEl) return undefined
        const onScroll = () => setActive(activeIndex(scrollEl, items))
        scrollEl.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => scrollEl.removeEventListener('scroll', onScroll)
      }, [snapshot])

      const items = snapshot.items
      const visible = Boolean(rect) && items.length >= MIN_TICKS

      // Native listeners instead of React synthetic handlers: the rail lives in
      // the shell overlay layer, where the host's delegated click events proved
      // unreliable, while events bound directly to the element always arrive.
      React.useEffect(() => {
        if (!visible) return undefined
        const rail = railRef.current
        if (!rail) return undefined

        const centerFromMouse = (clientY) => {
          const count = snapshotRef.current.items.length
          const hits = rail.children
          if (count < 2 || hits.length < 2) return 0
          const first = hits[0].getBoundingClientRect()
          const last = hits[hits.length - 1].getBoundingClientRect()
          const start = first.top + first.height / 2
          const span = last.top + last.height / 2 - start
          const ratio = span > 0 ? (clientY - start) / span : 0
          return Math.max(0, Math.min(1, ratio)) * (count - 1)
        }

        const jumpTo = (index) => {
          const { scrollEl, items: list } = snapshotRef.current
          const item = list[index]
          if (!item || !scrollEl) return
          const targetTop =
            item.el.getBoundingClientRect().top - scrollEl.getBoundingClientRect().top + scrollEl.scrollTop - 8
          smoothScrollTo(scrollEl, Math.max(0, targetTop))
        }

        const onMove = (event) => {
          setHover({ center: centerFromMouse(event.clientY), y: event.clientY })
        }
        const onLeave = () => setHover(null)
        const onClick = (event) => {
          jumpTo(Math.round(centerFromMouse(event.clientY)))
        }
        const onKey = (event) => {
          const count = snapshotRef.current.items.length
          if (!count) return
          const current = hoverRef.current ? Math.round(hoverRef.current.center) : activeRef.current
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const next = Math.max(0, Math.min(count - 1, current + (event.key === 'ArrowDown' ? 1 : -1)))
            const hit = rail.children[next]
            const box = hit && hit.getBoundingClientRect()
            setHover({ center: next, y: box ? box.top + box.height / 2 : 0 })
          } else if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            jumpTo(current)
          } else if (event.key === 'Escape') {
            setHover(null)
          }
        }
        const onBlur = () => setHover(null)

        rail.addEventListener('mousemove', onMove, { passive: true })
        rail.addEventListener('mouseleave', onLeave, { passive: true })
        rail.addEventListener('click', onClick)
        rail.addEventListener('keydown', onKey)
        rail.addEventListener('blur', onBlur)
        return () => {
          rail.removeEventListener('mousemove', onMove)
          rail.removeEventListener('mouseleave', onLeave)
          rail.removeEventListener('click', onClick)
          rail.removeEventListener('keydown', onKey)
          rail.removeEventListener('blur', onBlur)
          setHover(null)
        }
      }, [visible])

      const children = []
      if (visible) {
        // The peak only exists while the pointer (or keyboard focus) is on the
        // rail; at rest every tick returns to its own message-scaled length.
        const hoverCenter = hover ? hover.center : null
        const ticks = items.map((item, i) => {
          const boost = hoverCenter === null ? 0 : Math.max(0, 1 - Math.abs(i - hoverCenter) / RADIUS)
          const width = (i % 2 === 0 ? BASE_LONG : BASE_SHORT) + PEAK * boost
          const isPeak = hoverCenter !== null && Math.abs(i - hoverCenter) < 0.5
          return React.createElement(
            'div',
            { key: item.key, className: 'dshTickRailHit' },
            React.createElement('div', {
              className: isPeak ? 'dshTickRailTick dshTickRailTickActive' : 'dshTickRailTick',
              style: {
                width: `${width}px`,
                opacity: hoverCenter === null ? '0.6' : (0.45 + 0.55 * boost).toFixed(2)
              }
            })
          )
        })

        children.push(
          React.createElement(
            'div',
            {
              key: 'rail',
              ref: railRef,
              className: 'dshTickRail',
              role: 'navigation',
              tabIndex: 0,
              'aria-label': t('rail'),
              style: { left: `${rect.left + 8}px`, top: `${rect.top + 8}px`, height: `${rect.height - 16}px` }
            },
            ticks
          )
        )

        if (hover) {
          const item = items[Math.min(items.length - 1, Math.max(0, Math.round(hover.center)))]
          if (item) {
            const top = Math.max(8, Math.min(hover.y - 24, window.innerHeight - 140))
            children.push(
              React.createElement(
                'div',
                {
                  key: 'preview',
                  className: 'dshTickRailPreview',
                  style: { left: `${rect.left + 8 + RAIL_WIDTH + 6}px`, top: `${top}px` }
                },
                React.createElement('p', { className: 'dshTickRailPreviewTitle' }, t(item.kind)),
                React.createElement('p', { className: 'dshTickRailPreviewBody' }, item.text.slice(0, PREVIEW_CHARS))
              )
            )
          }
        }
      }

      return React.createElement('div', { [OWN_ATTRIBUTE]: '', style: { display: 'contents' } }, children)
    }

    const inject = ['slots', 'locale']
    function apply(ctx) {
      installStyles()
      ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-tick-rail: copy dictionaries')
      const t = ctx.locale.bind(NS)
      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'dsh-tick-rail',
            order: 50,
            inject: () => ({ t })
          },
          TickRail
        )
      )
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  }
})
