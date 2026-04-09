#!/usr/bin/env node
/**
 * Electron builder after-pack hook
 * 
 * Ensures backend binary and other packaged executables have proper
 * permissions after macOS packaging. This is critical for .pkg installer
 * and DMG builds, as file permissions can be lost during archiving.
 * 
 * Runs after electron-builder creates the app bundle but before creating
 * the final DMG/PKG/etc.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

async function afterPack(context) {
  // Only run on macOS
  if (context.electronPlatformName !== 'darwin') {
    return
  }

  const appPath = context.appOutDir
  const resourcesPath = path.join(appPath, 'Helios.app', 'Contents', 'Resources')
  const backendDir = path.join(resourcesPath, 'backend')
  const backendBinary = path.join(backendDir, 'heliosgui_backend')

  console.log(`[afterPack] Checking backend binary permissions...`)
  console.log(`[afterPack] Backend binary path: ${backendBinary}`)

  if (!fs.existsSync(backendBinary)) {
    console.warn(`[afterPack] Backend binary not found at ${backendBinary}`)
    return
  }

  try {
    // Ensure binary is executable
    fs.chmodSync(backendBinary, 0o755)
    console.log(`[afterPack] Set executable permissions on backend binary`)

    // Verify the binary is actually executable
    try {
      fs.accessSync(backendBinary, fs.constants.X_OK)
      console.log(`[afterPack] Backend binary verified as executable`)
    } catch {
      throw new Error(`Backend binary is not executable after chmod`)
    }

    // On macOS, also ensure it's not quarantined (removes com.apple.quarantine xattr)
    // This is needed for apps distributed outside App Store
    try {
      execSync(`xattr -d com.apple.quarantine "${backendBinary}" 2>/dev/null || true`, {
        stdio: 'ignore'
      })
      console.log(`[afterPack] Removed quarantine attribute from backend binary`)
    } catch {
      // Ignore errors; xattr removal is best-effort
    }
  } catch (error) {
    console.error(`[afterPack] Failed to fix backend binary permissions: ${error.message}`)
    throw error
  }
}

module.exports = { afterPack }
