import '@testing-library/jest-dom'

<<<<<<< HEAD
// jsdom doesn't implement ResizeObserver. Components that use it (e.g. the
// ProjectsTable virtualizer) crash on mount without this stub.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
;(globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver
=======
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
>>>>>>> develop
