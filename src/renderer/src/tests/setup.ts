import '@testing-library/jest-dom'

// jsdom doesn't implement ResizeObserver. Components that use it (e.g. the
// ProjectsTable virtualizer) crash on mount without this stub.
class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
;(globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver
