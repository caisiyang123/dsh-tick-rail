import test from 'node:test'
import assert from 'node:assert/strict'

const reactStub = {
  useState: (initial) => [initial, () => {}],
  useEffect: () => {},
  useRef: (initial) => ({ current: initial }),
  createElement: () => null,
  Fragment: {}
}

const loaded = []
globalThis.window = {
  __ModuleLoader__: { load: (spec) => loaded.push(spec) },
  matchMedia: () => ({ matches: false })
}
await import(`${new URL('../client.js', import.meta.url).href}?geometry-test`)
const geometry = loaded[0].factory(() => reactStub).geometry

async function loadGeometry() {
  return geometry
}

test('resting widths alternate long and short', async () => {
  const g = await loadGeometry()
  assert.equal(g.restingWidth(0), g.BASE_LONG)
  assert.equal(g.restingWidth(1), g.BASE_SHORT)
  assert.equal(g.restingWidth(2), g.BASE_LONG)
  assert.ok(g.BASE_LONG > g.BASE_SHORT)
})

test('at rest (no hover center) ticks sit at their resting width', async () => {
  const g = await loadGeometry()
  for (let i = 0; i < 6; i += 1) {
    assert.equal(g.tickWidth(i, null), g.restingWidth(i))
  }
})

test('the peak tick gains the full boost and falloff is linear and symmetric', async () => {
  const g = await loadGeometry()
  assert.equal(g.tickWidth(3, 3), g.restingWidth(3) + g.PEAK)
  assert.equal(g.falloffBoost(0), 1)
  const half = g.falloffBoost(g.RADIUS / 2)
  assert.ok(Math.abs(half - 0.5) < 1e-9)
  assert.equal(g.falloffBoost(1), g.falloffBoost(1))
  assert.equal(g.falloffBoost(g.RADIUS), 0)
  assert.equal(g.falloffBoost(g.RADIUS + 5), 0)
})

test('ticks beyond the falloff radius keep their resting width while hovering', async () => {
  const g = await loadGeometry()
  const center = 2
  const farIndex = center + Math.ceil(g.RADIUS) + 1
  assert.equal(g.tickWidth(farIndex, center), g.restingWidth(farIndex))
})
