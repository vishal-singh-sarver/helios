import '@testing-library/jest-dom'

// jsdom doesn't ship ResizeObserver. useVirtualRows (and any future hook
// that observes element size) needs it on import; install a no-op stub
// globally so component tests that render those hooks don't crash.
if (typeof globalThis.ResizeObserver === 'undefined') {
  ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
}

// utils/api imports utils/session at load time, which reads localStorage.
// Node's experimental webstorage is picked up without a valid file path in
// some vitest 4 pools, shadowing jsdom's Storage and breaking getItem.
// Force a real in-memory Storage implementation before any module loads.
{
  const store = new Map<string, string>()
  const memoryStorage: Storage = {
    get length() {
      return store.size
    },
    key: (i) => Array.from(store.keys())[i] ?? null,
    getItem: (k) => (store.has(k) ? store.get(k)! : null),
    setItem: (k, v) => {
      store.set(k, String(v))
    },
    removeItem: (k) => {
      store.delete(k)
    },
    clear: () => {
      store.clear()
    }
  }
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    configurable: true,
    writable: true
  })
}
