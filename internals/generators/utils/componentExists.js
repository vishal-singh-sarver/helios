const fs = require('fs')
const path = require('path')

/**
 * Checks whether the given component/container name already exists
 * in the components or containers directories.
 */
module.exports = function componentExists(name) {
  const componentsPath = path.join(
    __dirname,
    '../../src/renderer/src/components'
  )
  const containersPath = path.join(
    __dirname,
    '../../src/renderer/src/containers'
  )

  const components = fs.existsSync(componentsPath) ? fs.readdirSync(componentsPath) : []
  const containers = fs.existsSync(containersPath) ? fs.readdirSync(containersPath) : []

  return [...components, ...containers].includes(name)
}
