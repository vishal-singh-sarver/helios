/**
 * App-level smoke tests.
 *
 * Run with:
 *   npm run build        # required first
 *   npm run e2e
 *
 * The wdio-electron-service launches the built Electron binary, then each
 * `browser.*` call drives the live app window via ChromeDriver.
 */

describe('App launch', () => {
  it('opens the main window', async () => {
    // getTitle() reads the <title> tag of the currently focused window
    const title = await browser.getTitle()
    expect(title).toBe('Electron App')
  })

  it('renders the React root element', async () => {
    const root = await $('#root')
    await expect(root).toExist()
  })

  it('mounts React content inside #root', async () => {
    // React replaces the empty div — at least one child must exist
    const root = await $('#root')
    const children = await root.$$('*')
    expect(children.length).toBeGreaterThan(0)
  })
})

describe('Context bridge (window.api)', () => {
  it('exposes window.api to the renderer', async () => {
    const hasApi = await browser.execute(() => typeof window.api !== 'undefined')
    expect(hasApi).toBe(true)
  })

  it('exposes expected api methods', async () => {
    const methods = await browser.execute(() =>
      Object.keys(window.api as Record<string, unknown>)
    )
    expect(methods).toEqual(
      expect.arrayContaining([
        'openFile',
        'saveFile',
        'readFile',
        'writeFile',
        'getBackendStatus',
        'startBackend',
        'stopBackend',
      ])
    )
  })
})

describe('Electron app metadata', () => {
  it('returns an app name via the Electron API', async () => {
    const name = await browser.electron.app('getName')
    expect(typeof name).toBe('string')
    expect((name as string).length).toBeGreaterThan(0)
  })

  it('returns a semver version string', async () => {
    const version = await browser.electron.app('getVersion')
    expect(version).toMatch(/^\d+\.\d+\.\d+/)
  })
})

describe('BrowserWindow', () => {
  it('starts in a visible, non-minimised state', async () => {
    const isVisible = await browser.electron.browserWindow('isVisible')
    expect(isVisible).toBe(true)
  })

  it('has a positive width and height', async () => {
    const bounds = (await browser.electron.browserWindow('getBounds')) as {
      width: number
      height: number
    }
    expect(bounds.width).toBeGreaterThan(0)
    expect(bounds.height).toBeGreaterThan(0)
  })
})
