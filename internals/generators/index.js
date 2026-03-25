/**
 * generator/index.js
 *
 * Registers component and container generators with plop.
 * Run with:  npm run generate
 */

const { execSync } = require('child_process')
const path = require('path')
const componentGenerator = require('./component/index.js')
const containerGenerator = require('./container/index.js')

module.exports = (plop) => {
  plop.setGenerator('component', componentGenerator)
  plop.setGenerator('container', containerGenerator)

  // Helper: resolve 'components/X' vs 'containers/X'
  plop.addHelper('directory', (comp) => {
    try {
      require('fs').accessSync(
        path.join(__dirname, `../../src/renderer/src/containers/${comp}`)
      )
      return `containers/${comp}`
    } catch (e) {
      return `components/${comp}`
    }
  })

  plop.addHelper('curly', (object, open) => (open ? '{' : '}'))

  // Custom action: run prettier on the generated folder
  plop.setActionType('prettify', (answers, config) => {
    const folderPath = path.join(
      __dirname,
      '/../../src/renderer/src/',
      config.path,
      plop.getHelper('properCase')(answers.name),
      '**/*.{ts,tsx}'
    )
    try {
      execSync(`npx prettier --write "${folderPath}"`)
      return folderPath
    } catch (err) {
      // Non-fatal: file still generated, just not formatted
      console.warn('prettier could not format files:', err.message)
      return folderPath
    }
  })
}
