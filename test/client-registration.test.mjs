import test from 'node:test'
import assert from 'node:assert/strict'

const reactStub = {
  useState: (initial) => [initial, () => {}],
  useEffect: () => {},
  useRef: (initial) => ({ current: initial }),
  createElement: () => null,
  Fragment: {}
}

test('client bundle registers itself through the module loader', async () => {
  const loaded = []
  globalThis.window = {
    __ModuleLoader__: { load: (spec) => loaded.push(spec) },
    matchMedia: () => ({ matches: false })
  }
  await import('../client.js')

  assert.equal(loaded.length, 1)
  const spec = loaded[0]
  assert.equal(spec.id, 'dsh-tick-rail', 'module id must equal the package name')
  assert.equal(typeof spec.factory, 'function')

  const moduleExports = spec.factory((name) => {
    assert.equal(name, 'react', 'only platform-seeded modules may be required')
    return reactStub
  })
  assert.deepEqual(moduleExports.inject, ['slots', 'locale'])
  assert.equal(typeof moduleExports.apply, 'function')
})

test('apply wires locale dictionaries and the shell.overlay slot', async () => {
  const loaded = []
  globalThis.window = {
    __ModuleLoader__: { load: (spec) => loaded.push(spec) },
    matchMedia: () => ({ matches: false })
  }
  globalThis.document = { querySelector: () => ({}) }
  // A query string forces a fresh module instance despite the ESM cache.
  await import(`${new URL('../client.js', import.meta.url).href}?apply-test`)
  assert.equal(loaded.length, 1)
  const moduleExports = loaded[0].factory(() => reactStub)

  const effectLabels = []
  const localeCalls = []
  const slotInjections = []
  const slotRegistrations = []
  const ctx = {
    effect: (callback, label) => {
      effectLabels.push(label)
      callback()
    },
    locale: {
      register: (ns, dicts) => localeCalls.push({ ns, languages: Object.keys(dicts).sort() }),
      bind: (ns) => (key) => `${ns}.${key}`
    },
    slots: {
      inject: (name, callback) => {
        slotInjections.push(name)
        callback()
      },
      register: (options, component) => {
        slotRegistrations.push({ options, component })
      }
    }
  }

  moduleExports.apply(ctx)

  assert.deepEqual(localeCalls, [{ ns: 'tickRail', languages: ['en', 'zh'] }])
  assert.deepEqual(slotInjections, ['shell.overlay'])
  assert.equal(slotRegistrations.length, 1)
  const { options, component } = slotRegistrations[0]
  assert.equal(options.name, 'shell.overlay')
  assert.equal(options.id, 'dsh-tick-rail')
  assert.equal(typeof options.inject, 'function')
  assert.equal(typeof options.inject().t, 'function')
  assert.equal(typeof component, 'function')
  assert.ok(effectLabels.some((label) => label.includes('dsh-tick-rail')))
})
