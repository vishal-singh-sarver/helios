#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const RESOURCES_DIR = path.join(__dirname, '..', 'resources', 'backend')

const BACKENDS = {
  mac: {
    source: '/Users/navyug/PyHelios/Helios-UI/heliosgui-desktop/src-tauri/resources/heliosgui_backend',
    dest: path.join(RESOURCES_DIR, 'mac', 'heliosgui_backend'),
    required: true
  },
  win: {
    source: null,
    dest: path.join(RESOURCES_DIR, 'win', 'heliosgui_backend.exe'),
    required: false,
    note: 'Windows backend not yet available. Set a valid executable source path when ready.'
  },
  linux: {
    source: null,
    dest: path.join(RESOURCES_DIR, 'linux', 'heliosgui_backend'),
    required: false,
    note: 'Linux backend not yet available. Set a valid executable source path when ready.'
  }
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  }
}

function removePathIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true })
  }
}

function setExecutableRecursive(targetPath) {
  const stats = fs.statSync(targetPath)

  if (stats.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      setExecutableRecursive(path.join(targetPath, entry))
    }
    return
  }

  if (process.platform !== 'win32') {
    fs.chmodSync(targetPath, 0o755)
  }
}

function copyBackend(platform, config) {
  const { source, dest, required, note } = config

  if (!source) {
    if (required) {
      throw new Error(`Backend for ${platform} is required but source is not configured`)
    }
    console.log(`Skipping ${platform}: ${note}`)
    return
  }

  if (!fs.existsSync(source)) {
    if (required) {
      throw new Error(`Backend source not found for ${platform}: ${source}`)
    }
    console.warn(`Skipping ${platform}: source not found: ${source}`)
    return
  }

  ensureDir(path.dirname(dest))
  removePathIfExists(dest)

  const sourceStats = fs.statSync(source)

  try {
    if (sourceStats.isDirectory()) {
      fs.cpSync(source, dest, { recursive: true })
      setExecutableRecursive(dest)
      console.log(`Synced ${platform} directory: ${dest}`)
    } else {
      fs.copyFileSync(source, dest)
      if (platform !== 'win') {
        fs.chmodSync(dest, 0o755)
      }
      const stats = fs.statSync(dest)
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
      console.log(`Synced ${platform} file: ${dest} (${sizeMB} MB)`)
    }
  } catch (error) {
    if (required) {
      throw error
    }
    console.warn(`Failed to sync ${platform}: ${error.message}`)
  }
}

function main() {
  console.log('Syncing backend executables...\n')

  ensureDir(RESOURCES_DIR)

  for (const [platform, config] of Object.entries(BACKENDS)) {
    copyBackend(platform, config)
  }

  console.log('\nBackend sync complete.')
  console.log(`Resources prepared in: ${RESOURCES_DIR}`)
}

try {
  main()
} catch (error) {
  console.error(`\nError: ${error.message}`)
  process.exit(1)
}
